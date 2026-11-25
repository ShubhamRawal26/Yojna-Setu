import Tesseract from 'tesseract.js';
import { SCHEMES_LIST } from './data/schemes.js';

const HEADER_NOISE = /^(government of india|unique identification|authority of india|uidai|भारत सरकार|मेरा आधार|आधार|aadhaar|jan aadhaar|ration card|marksheet|board of secondary|income certificate|date of birth|dob|year of birth|yob|male|female|address|पता|पुरुष|महिला|help@uidai|www\.uidai)$/i;

/**
 * Preprocesses a photo on an offscreen canvas (smart upscale/downscale + grayscale + auto-contrast stretch)
 * so Tesseract can accurately read smartphone photos of physical ID cards across all browsers.
 */
async function preprocessImage(file) {
    try {
        const bitmap = await createImageBitmap(file);
        const minDim = 1200;
        const maxDim = 2000;
        let { width, height } = bitmap;
        const longest = Math.max(width, height);
        if (longest < minDim) {
            const scale = minDim / longest;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        } else if (longest > maxDim) {
            const scale = maxDim / longest;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return file;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close?.();

        // Pixel-level grayscale + 2%-98% percentile contrast stretch (works even when ctx.filter is unsupported)
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const hist = new Uint32Array(256);
        const totalPixels = width * height;

        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            hist[gray] += 1;
        }

        let low = 0;
        let high = 255;
        let count = 0;
        const lowCut = totalPixels * 0.02;
        const highCut = totalPixels * 0.98;
        for (let v = 0; v < 256; v++) {
            count += hist[v];
            if (count >= lowCut) { low = v; break; }
        }
        count = 0;
        for (let v = 255; v >= 0; v--) {
            count += hist[255 - v];
            if (count >= totalPixels - highCut) { high = v; break; }
        }

        const span = Math.max(20, high - low);
        for (let i = 0; i < data.length; i += 4) {
            let norm = Math.round(((data[i] - low) * 255) / span);
            if (norm < 0) norm = 0;
            else if (norm > 255) norm = 255;
            data[i] = norm;
            data[i + 1] = norm;
            data[i + 2] = norm;
        }
        ctx.putImageData(imgData, 0, 0);

        return await new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob || file), 'image/png');
        });
    } catch {
        return file;
    }
}

function recognizeWithTimeout(input, langs, logger, timeoutMs = 60000) {
    return Promise.race([
        Tesseract.recognize(input, langs, { logger }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('OCR_TIMEOUT')), timeoutMs)),
    ]);
}

/**
 * Runs real-time client-side OCR on an uploaded image File using Tesseract.js.
 * Preprocesses image for contrast/size, attempts English+Hindi, and falls back to English.
 */
export async function runRealOCR(file, onProgress) {
    const logger = (m) => {
        if (!onProgress) return;
        const status = (m.status || '').toLowerCase();
        const pct = typeof m.progress === 'number' ? m.progress : 0;
        if (status.includes('loading')) {
            onProgress({ stage: 1, progress: Math.max(8, Math.round(pct * 40)) });
        } else if (status.includes('initializing')) {
            onProgress({ stage: 2, progress: 40 + Math.round(pct * 20) });
        } else if (status.includes('recognizing')) {
            onProgress({ stage: 3, progress: 60 + Math.round(pct * 39) });
        }
    };

    const processedInput = await preprocessImage(file);

    try {
        const result = await recognizeWithTimeout(processedInput, 'eng+hin', logger, 60000);
        return result?.data?.text || '';
    } catch {
        const fallback = await recognizeWithTimeout(processedInput, 'eng', logger, 40000);
        return fallback?.data?.text || '';
    }
}

function computeAgeFromYear(year, month = 1, day = 1) {
    const now = new Date();
    const curYear = now.getFullYear();
    if (year < 1910 || year > curYear) return '';
    let age = curYear - year;
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    if (curMonth < month || (curMonth === month && curDay < day)) {
        age -= 1;
    }
    return age >= 1 && age <= 115 ? String(age) : '';
}

function extractAge(text) {
    // 1. Explicit Age / आयु / उम्र
    const ageMatch = text.match(/(?:Age|आयु|उम्र)[ \t]*[:\-–]?[ \t]*(\d{1,3})\b/i);
    if (ageMatch?.[1]) {
        const n = parseInt(ageMatch[1], 10);
        if (n >= 1 && n <= 115) return String(n);
    }

    // 2. DOB / जन्म तिथि (DD/MM/YYYY or DD-MM-YYYY)
    const dobMatch = text.match(/(?:DOB|D\.O\.B\.?|Date of Birth|Birth Date|जन्म\s*तिथि|जन्म)[ \t]*[:\-–]?[ \t]*(\d{1,2})[/\-.](\d{1,2})[/\-.]((?:19|20)\d{2})/i);
    if (dobMatch) {
        const computed = computeAgeFromYear(parseInt(dobMatch[3], 10), parseInt(dobMatch[2], 10), parseInt(dobMatch[1], 10));
        if (computed) return computed;
    }

    // 3. YOB / Year of Birth
    const yobMatch = text.match(/(?:YOB|Year of Birth|जन्म\s*वर्ष)[ \t]*[:\-–]?[ \t]*((?:19|20)\d{2})/i);
    if (yobMatch?.[1]) {
        const computed = computeAgeFromYear(parseInt(yobMatch[1], 10));
        if (computed) return computed;
    }

    // 4. Standalone DD/MM/YYYY date (common on Aadhaar when "DOB" label is noisy)
    const anyDateMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-]((?:19|20)\d{2})\b/);
    if (anyDateMatch) {
        const computed = computeAgeFromYear(parseInt(anyDateMatch[3], 10), parseInt(anyDateMatch[2], 10), parseInt(anyDateMatch[1], 10));
        if (computed) return computed;
    }

    return '';
}

/**
 * Parses real OCR text from Indian documents (Aadhaar, Jan Aadhaar, Ration Card, Land Record, Marksheet)
 * into structured profile fields and dynamically matches eligible welfare schemes.
 */
export function parseDocumentText(rawText, lang) {
    const text = (rawText || '').trim();
    const lines = text
        .split(/\r?\n/)
        .map(l => l.replace(/[|_~`]+/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(l => l.length >= 2);

    const lower = text.toLowerCase();
    const hasReadableText = text.replace(/\s+/g, '').length >= 4;

    // 1. Extract Name (using horizontal whitespace [ \t] so we don't bleed across newlines)
    let name = '';
    const nameMatch = text.match(/(?:Name|नाम|Applicant|Beneficiary|Holder)[ \t]*[:\-–]?[ \t]*([\p{L}\p{M}. ]{3,45})/iu);
    if (nameMatch?.[1]) {
        const candidate = nameMatch[1].trim();
        if (candidate.length >= 3 && !HEADER_NOISE.test(candidate)) {
            name = candidate;
        }
    }
    if (!name) {
        // Check if "Name:" / "नाम:" is alone on a line and value is on the next line
        const nameLabelIdx = lines.findIndex(l => /^(?:Name|नाम|Applicant|Holder)\s*[:\-–]?$/i.test(l));
        if (nameLabelIdx >= 0 && lines[nameLabelIdx + 1]) {
            const nextClean = lines[nameLabelIdx + 1].replace(/[^\p{L}\p{M}. ]/gu, '').trim();
            if (nextClean.length >= 3 && !HEADER_NOISE.test(nextClean)) name = nextClean;
        }
    }
    if (!name) {
        // Look for line right before S/O, D/O, W/O, C/O, DOB, YOB
        const relIdx = lines.findIndex(l => /\b(s\/o|d\/o|w\/o|c\/o|dob|yob|date of birth|year of birth|जन्म)\b/i.test(l));
        if (relIdx > 0) {
            const prevClean = lines[relIdx - 1].replace(/[^\p{L}\p{M}. ]/gu, '').trim();
            if (prevClean.length >= 3 && !HEADER_NOISE.test(prevClean)) {
                name = prevClean;
            }
        }
    }
    if (!name) {
        // Fallback: first clean 2-4 word alphabetic/Devanagari line that isn't a card header
        const candidate = lines.find(l => {
            const clean = l.replace(/[^\p{L}\p{M} ]/gu, '').trim();
            const words = clean.split(/\s+/).filter(Boolean);
            return words.length >= 2 && words.length <= 4 && !HEADER_NOISE.test(clean) && !/\d{4}/.test(l);
        });
        if (candidate) {
            name = candidate.replace(/[^\p{L}\p{M}. ]/gu, '').trim();
        }
    }

    // 2. Extract Location / Address (supports multi-line Address blocks)
    let location = '';
    const addrInline = text.match(/(?:Address|पता|Village|ग्राम|City|शहर|District|जिला|Tehsil|तहसील)[ \t]*[:\-–]?[ \t]*([^\n]{3,70})/i);
    if (addrInline?.[1]) {
        location = addrInline[1].trim();
    }
    if (!location) {
        // Multi-line Address: label on one line, address on following 1-3 lines
        const addrIdx = lines.findIndex(l => /^(?:Address|पता)\s*[:\-–]?$/i.test(l));
        if (addrIdx >= 0) {
            const addrParts = [];
            for (let i = addrIdx + 1; i < Math.min(lines.length, addrIdx + 4); i++) {
                if (/^(?:dob|mobile|phone|aadhaar|pin|vid|\d{4}\s+\d{4})/i.test(lines[i])) break;
                addrParts.push(lines[i]);
                if (/\b[1-9][0-9]{5}\b/.test(lines[i])) break;
            }
            if (addrParts.length > 0) location = addrParts.join(', ');
        }
    }
    if (!location) {
        const pinIdx = lines.findIndex(l => /\b[1-9][0-9]{5}\b/.test(l));
        if (pinIdx >= 0) {
            location = pinIdx > 0 && lines[pinIdx].length < 15
                ? `${lines[pinIdx - 1]}, ${lines[pinIdx]}`
                : lines[pinIdx];
        }
    }
    if (!location) {
        const stateMatch = text.match(/\b(Rajasthan|Sirohi|Jaipur|Udaipur|Jodhpur|Kota|Ajmer|Delhi|Mumbai|Pune|Lucknow|Patna|Bhopal|Indore|Gujarat|Maharashtra|Uttar Pradesh|Madhya Pradesh|Bihar|Haryana|Punjab|राजस्थान|जयपुर|सिरोही|दिल्ली)\b/i);
        if (stateMatch?.[1]) location = stateMatch[1];
    }

    // 3. Extract Category & Document Type
    const categoryTags = [];
    if (/\bbpl\b|below poverty|बीपीएल/i.test(text)) categoryTags.push('BPL');
    if (/\baay\b|antyodaya|अंत्योदय/i.test(text)) categoryTags.push('Antyodaya');
    if (/\bapl\b|एपीएल/i.test(text)) categoryTags.push('APL');
    if (/\bsc\b|scheduled caste|अनुसूचित जाति/i.test(text)) categoryTags.push('SC');
    if (/\bst\b|scheduled tribe|जनजाति|अनुसूचित जनजाति/i.test(text)) categoryTags.push('ST');
    if (/\bobc\b|अन्य पिछड़ा/i.test(text)) categoryTags.push('OBC');
    if (/\bews\b|आर्थिक पिछड़ा/i.test(text)) categoryTags.push('EWS');
    if (/\bwidow\b|विधवा/i.test(text)) categoryTags.push(lang === 'hi' ? 'विधवा महिला' : 'Widow');
    if (/jan\s*aadhaar|जन\s*आधार/i.test(text)) categoryTags.push(lang === 'hi' ? 'जन आधार' : 'Jan Aadhaar');
    else if (/ration|राशन/i.test(text)) categoryTags.push(lang === 'hi' ? 'राशन कार्ड' : 'Ration Card');
    else if (/aadhaar|आधार|uidai|\b\d{4}\s+\d{4}\s+\d{4}\b/i.test(text)) categoryTags.push(lang === 'hi' ? 'आधार कार्ड' : 'Aadhaar');

    const category = categoryTags.length > 0 ? categoryTags.slice(0, 3).join(' / ') : '';

    // 4. Extract Work / Landholding (only if actually detected)
    let work = '';
    const landMatch = text.match(/(\d+(?:\.\d+)?)\s*(hectare|ha|bigha|acre|हेक्टेयर|बीघा|एकड़)/i);
    if (landMatch) {
        work = `${landMatch[1]} ${landMatch[2]} / ${lang === 'hi' ? 'किसान' : 'Farmer'}`;
    } else if (/farmer|kisan|किसान|khasra|khatauni|खसरा|खतौनी|agriculture|कृषि/i.test(text)) {
        work = lang === 'hi' ? 'किसान / कृषि' : 'Farmer / Agriculture';
    } else if (/student|marksheet|12th|10th|college|university|school|बोर्ड|मार्कशीट|छात्र|छात्रा/i.test(text)) {
        work = lang === 'hi' ? 'छात्र / पढ़ाई' : 'Student / Education';
    } else if (/labour|worker|मज़दूर|श्रमिक|daily wage/i.test(text)) {
        work = lang === 'hi' ? 'श्रमिक / मज़दूर' : 'Daily Wage Worker';
    } else if (/widow|विधवा/i.test(text)) {
        work = lang === 'hi' ? 'गृहणी / एकल महिला' : 'Homemaker / Single Woman';
    }

    const age = extractAge(text);

    const profile = {
        name: name || '',
        age: age || '',
        location: location || '',
        category: category || '',
        work: work || '',
    };

    const schemeIds = matchSchemesFromProfile(profile, text);

    return {
        rawText: text,
        hasReadableText,
        profile,
        schemeIds,
    };
}

/**
 * Strictly matches relevant schemes from confirmed user profile + optional raw OCR text.
 * Excludes mismatched demographic/occupation schemes and ranks by specificity.
 */
export function matchSchemesFromProfile(profile = {}, rawText = '') {
    const combined = `${profile.name || ''} ${profile.location || ''} ${profile.category || ''} ${profile.work || ''} ${rawText || ''}`.toLowerCase();

    const specificTags = new Set();
    const ageNum = parseInt(String(profile.age || '').replace(/[^\d]/g, ''), 10);

    const isFarmer = /farmer|kisan|किसान|khasra|khatauni|खसरा|खतौनी|hectare|bigha|acre|हेक्टेयर|बीघा|एकड़|agriculture|कृषि|खेती|dairy|पशुपालक/i.test(combined);
    const isStudent = /student|marksheet|12th|10th|college|university|school|बोर्ड|मार्कशीट|छात्र|छात्रा|scholarship|पढ़ाई/i.test(combined);
    const isWorker = /labour|worker|artisan|vendor|मज़दूर|श्रमिक|कारीगर|ठेला|दैनिक|निर्माण/i.test(combined);
    const isBusiness = /business|shop|udyam|vyapar|व्यापार|दुकान|उद्यम|startup/i.test(combined);

    if (isFarmer) specificTags.add('farmer').add('agriculture').add('dairy').add('rural');
    if (isStudent) specificTags.add('student').add('school').add('youth');
    if (isWorker) specificTags.add('worker').add('artisan');
    if (isBusiness) specificTags.add('business').add('startup').add('youth');

    const isWidow = /widow|विधवा|एकल/i.test(combined);
    const isFemale = isWidow || /\bfemale\b|महिला|devi|देवी|कुमारी|kumari|mother|pregnant|गर्भवती|बालिका|girl|छात्रा/i.test(combined);
    if (isWidow) specificTags.add('widow').add('woman');
    else if (isFemale) specificTags.add('woman').add('girl');

    const isSenior = (!Number.isNaN(ageNum) && ageNum >= 60) || /senior|pension|वरिष्ठ|बुजुर्ग|वृद्ध/i.test(combined);
    const isYouth = !Number.isNaN(ageNum) && ageNum >= 18 && ageNum <= 35;
    const isChild = !Number.isNaN(ageNum) && ageNum > 0 && ageNum < 18;
    if (isSenior) specificTags.add('senior');
    if (isYouth) specificTags.add('youth');
    if (isChild) specificTags.add('child').add('school');

    const isBpl = /bpl|below poverty|बीपीएल|ration|राशन|antyodaya|अंत्योदय|गरीब/i.test(combined);
    const isSc = /\bsc\b|scheduled caste|अनुसूचित जाति/i.test(combined);
    const isSt = /\bst\b|scheduled tribe|जनजाति|आदिवासी/i.test(combined);
    const isObc = /\bobc\b|अन्य पिछड़ा/i.test(combined);
    const isEws = /\bews\b|general|सामान्य|आर्थिक पिछड़ा/i.test(combined);
    const isMinority = /minority|अल्पसंख्यक|muslim|sikh|jain|christian/i.test(combined);
    const isDisabled = /disabled|divyang|handicap|दिव्यांग|विकलांग/i.test(combined);

    if (isBpl) specificTags.add('bpl').add('housing');
    if (isSc) specificTags.add('sc');
    if (isSt) specificTags.add('st');
    if (isObc) specificTags.add('obc');
    if (isEws) specificTags.add('ews');
    if (isMinority) specificTags.add('minority');
    if (isDisabled) specificTags.add('disabled');

    if (/rural|village|ग्रामीण|गाँव|गांव/i.test(combined)) specificTags.add('rural');
    if (/urban|city|शहर|नगर/i.test(combined)) specificTags.add('urban');

    // Fallback if user entered very minimal info so they still see core universal schemes
    if (specificTags.size === 0) {
        specificTags.add('citizen').add('family');
    }

    const rajasthanRegex = /rajasthan|sirohi|jaipur|udaipur|jodhpur|kota|ajmer|bikaner|alwar|bharatpur|sikar|pali|barmer|nagaur|churu|jhunjhunu|bhilwara|chittorgarh|banswara|dungarpur|tonk|bundi|jhalawar|baran|dausa|karauli|sawai madhopur|hanumangarh|ganganagar|pratapgarh|rajsamand|jalore|jaisalmer|jan\s*aadhaar|राजस्थान|जयपुर|सिरोही|उदयपुर|जोधपुर|कोटा|अजमेर|बीकानेर/i;
    const otherStateRegex = /\b(maharashtra|gujarat|uttar pradesh|madhya pradesh|bihar|punjab|haryana|delhi|karnataka|tamil nadu|kerala|west bengal|odisha|assam)\b/i;
    const hasLocation = Boolean((profile.location || '').trim());
    const isOtherNonRajState = hasLocation && otherStateRegex.test(combined) && !rajasthanRegex.test(combined);

    const exclusiveCasteTags = new Set(['sc', 'st', 'obc', 'minority']);
    const scored = [];

    for (const scheme of SCHEMES_LIST) {
        if (isOtherNonRajState && scheme.level === 'state') continue;

        const stags = scheme.tags || [];
        // Strict exclusions for demographic/role mismatches
        if (!isSenior && stags.includes('senior') && !stags.some(t => ['student', 'youth', 'farmer', 'worker'].includes(t) && specificTags.has(t))) continue;
        if (!isWidow && stags.includes('widow') && !isFemale) continue;
        if (!isFemale && (stags.includes('woman') || stags.includes('girl') || stags.includes('pregnant')) && !stags.some(t => ['farmer', 'student', 'worker'].includes(t) && specificTags.has(t))) continue;
        if (!isFarmer && (stags.includes('farmer') || stags.includes('agriculture') || stags.includes('dairy')) && !stags.some(t => ['student', 'youth', 'worker', 'business'].includes(t) && specificTags.has(t))) continue;
        if (!isDisabled && stags.includes('disabled')) continue;
        if (!isChild && stags.includes('orphan')) continue;

        // If scheme is strictly for a reserved/minority group the user does not belong to, exclude it
        const schemeExclusive = stags.filter(t => exclusiveCasteTags.has(t));
        if (schemeExclusive.length > 0 && !schemeExclusive.some(t => specificTags.has(t))) continue;

        // Count direct matches against user's specific tags
        let score = 0;
        for (const t of stags) {
            if (specificTags.has(t)) score += 1;
        }
        // Always include core universal health/citizen schemes with lower priority only if they match health or general need
        if (score === 0) continue;

        // Boost schemes matching primary occupation/role
        if (isStudent && stags.includes('student')) score += 3;
        if (isFarmer && stags.includes('farmer')) score += 3;
        if (isWorker && stags.includes('worker')) score += 3;
        if (isBusiness && stags.includes('business')) score += 3;
        if (isWidow && stags.includes('widow')) score += 3;
        if (isSenior && stags.includes('senior')) score += 3;
        if (isEws && stags.includes('ews')) score += 2;
        if (isBpl && stags.includes('bpl')) score += 2;

        scored.push({ id: scheme.id, score, benefit: scheme.benefitAmountAnnual || 0 });
    }

    scored.sort((a, b) => b.score - a.score || b.benefit - a.benefit);
    return scored.map(item => item.id);
}
