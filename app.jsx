import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { runRealOCR, parseDocumentText, matchSchemesFromProfile } from './src/ocr.js';
import { SCHEMES_DB } from './src/data/schemes.js';

// ═══════════════════════════════════════════════════════════════
// CLEAN VECTOR ICON SYSTEM (Zero Emojis)
// ═══════════════════════════════════════════════════════════════
const ICONS = {
    Camera: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
        </svg>
    ),
    Mic: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
    ),
    Volume2: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
    ),
    Lock: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||15} height={p.size||15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),
    ArrowRight: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
    ),
    ArrowLeft: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
    ),
    Check: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    CheckCircle: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
        </svg>
    ),
    User: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    MapPin: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
    ),
    Clipboard: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        </svg>
    ),
    Wheat: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.4 1.7-4.6-2.7.1-4.2.9-4.9 2z"/>
        </svg>
    ),
    UserHeart: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <circle cx="10" cy="8" r="5"/><path d="M2 21a8 8 0 0 1 13.292-6"/><path d="M19 14c1.49-1.46 3-1.04 3 .55 0 1.25-1.55 2.45-3 3.45-1.45-1-3-2.2-3-3.45 0-1.59 1.51-2.01 3-.55z"/>
        </svg>
    ),
    GraduationCap: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
        </svg>
    ),
    Fence: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5L4 3z"/><path d="M12 3l-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5l-2-2z"/><path d="M20 3l-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5l-2-2z"/><path d="M2 8h20"/><path d="M2 16h20"/>
        </svg>
    ),
    Building: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    ),
    Family: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    HandHeart: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M19 14c1.49-1.46 3-1.04 3 .55 0 1.25-1.55 2.45-3 3.45-1.45-1-3-2.2-3-3.45 0-1.59 1.51-2.01 3-.55z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.85.85 2.23.85 3.08 0l1.92-1.92"/><path d="M2 13.5V17a3 3 0 0 0 3 3h4.5a3 3 0 0 0 2.12-.88l5.88-5.88a2.17 2.17 0 0 0-3.07-3.08l-3.9 3.9"/>
        </svg>
    ),
    Hospital: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>
        </svg>
    ),
    Flame: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
    ),
    ExternalLink: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        </svg>
    ),
    Share2: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
        </svg>
    ),
    X: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
    ),
    Edit3: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||15} height={p.size||15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
        </svg>
    ),
    Home: (p) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
    ),
};

// ═══════════════════════════════════════════════════════════════
// SIMPLE, LOW-LITERACY FRIENDLY COPY
// ═══════════════════════════════════════════════════════════════
const STRINGS = {
    hi: {
        appName: 'योजनासेतु',
        safeBadge: '100% सुरक्षित',
        back: 'पीछे',
        stepOf: 'कदम {n} / 3',
        heroTitleP1: 'अपनी',
        heroTitleAccent: 'योजनाएं जानें।',
        heroSubtitle: 'एक तरीका चुनें:',
        scanTitle: 'फोटो डालें',
        scanHint: 'राशन या आधार कार्ड',
        voiceTitle: 'जानकारी भरें',
        voiceHint: 'कुछ आसान सवाल',
        trySample: 'उदाहरण से देखें:',
        demoFarmer: 'किसान',
        demoWidow: 'महिला / विधवा',
        demoStudent: 'छात्र',
        scanHeader: 'कागज़ की फोटो चुनें',
        scanPrompt: 'यहाँ टैप करके फोटो लें',
        scanCta: 'फोटो चुनें',
        scanAnalyze: 'जांच शुरू करें',
        scanning: 'जांच हो रही है...',
        scanStep1: 'फोटो पढ़ी जा रही है',
        scanStep2: 'आपकी जानकारी तैयार हो रही है',
        scanStep3: 'सरकारी योजनाएं खोजी जा रही हैं',
        privacyNote: 'आपकी फोटो सिर्फ आपके फोन में रहती है।',
        profileHeader: 'अपनी जानकारी जांचें',
        profileSub: 'सब सही है तो आगे बढ़ें',
        edit: 'सुधारें',
        save: 'सहेजें',
        seeSchemes: 'मेरी योजनाएं देखें',
        name: 'नाम',
        age: 'उम्र (साल में)',
        location: 'गाँव / शहर',
        category: 'वर्ग',
        work: 'काम / ज़मीन',
        totalBenefit: 'आपको मिल सकते हैं',
        perYear: '/ साल',
        schemesFound: 'योजनाएं मिलीं',
        filterEducation: 'शिक्षा व युवा',
        filterCash: 'नकद व रोज़गार',
        filterHealth: 'स्वास्थ्य व बीमा',
        filterEssentials: 'आवास व अन्य',
        viewMore: 'और योजनाएं देखें',
        showingOf: 'दिखाई जा रही हैं:',
        applyBtn: 'आवेदन करें',
        docsNeeded: 'ये 3 कागज़ लगेंगे:',
        openPortal: 'सरकारी वेबसाइट खोलें',
        shareWhatsApp: 'किसी और को WhatsApp पर जानकारी भेजें',
        startNew: 'नई जांच शुरू करें',
        listenBtn: 'सुनें',
        tapMic: 'बोलने के लिए माइक दबाएं',
        orTapAnswer: 'या नीचे सही विकल्प चुनें:',
        voiceReady: 'आपकी जानकारी मिल गई!',
    },
    en: {
        appName: 'YojanaSetu',
        safeBadge: '100% Private',
        back: 'Back',
        stepOf: 'Step {n} of 3',
        heroTitleP1: 'Find your',
        heroTitleAccent: 'schemes.',
        heroSubtitle: 'Choose one option:',
        scanTitle: 'Upload Photo',
        scanHint: 'Ration or Aadhaar card',
        voiceTitle: 'Enter Info',
        voiceHint: 'A few simple questions',
        trySample: 'Try a sample:',
        demoFarmer: 'Farmer',
        demoWidow: 'Widow / Woman',
        demoStudent: 'Student',
        scanHeader: 'Take a Photo of Your Card',
        scanPrompt: 'Tap here to take or choose photo',
        scanCta: 'Choose Photo',
        scanAnalyze: 'Check My Schemes',
        scanning: 'Checking your document...',
        scanStep1: 'Reading photo on your phone',
        scanStep2: 'Preparing your profile',
        scanStep3: 'Finding matching schemes',
        privacyNote: 'Your photo never leaves your phone.',
        profileHeader: 'Check Your Details',
        profileSub: 'Confirm if everything looks right',
        edit: 'Edit',
        save: 'Save',
        seeSchemes: 'See My Schemes',
        name: 'Name',
        age: 'Age (Years)',
        location: 'Village / City',
        category: 'Category',
        work: 'Work / Land',
        totalBenefit: 'Total Annual Benefit',
        perYear: '/ year',
        schemesFound: 'Schemes Found',
        filterEducation: 'Education & Youth',
        filterCash: 'Cash & Jobs',
        filterHealth: 'Health & Care',
        filterEssentials: 'Housing & Other',
        viewMore: 'View More Schemes',
        showingOf: 'Showing:',
        applyBtn: 'How to Apply',
        docsNeeded: 'Documents you will need:',
        openPortal: 'Open Official Website',
        shareWhatsApp: 'Share Scheme Info on WhatsApp',
        startNew: 'Start New Check',
        listenBtn: 'Listen',
        tapMic: 'Tap mic to speak',
        orTapAnswer: 'Or tap an answer below:',
        voiceReady: 'All done! Your schemes are ready.',
    }
};

// ═══════════════════════════════════════════════════════════════
// PERSONA PROFILES & SCHEMES DATA
// ═══════════════════════════════════════════════════════════════
const PERSONAS = {
    farmer: {
        name: { hi: 'रामलाल मीणा', en: 'Ramlal Meena' },
        age: '46',
        location: { hi: 'आबूरोड, सिरोही, राजस्थान', en: 'Abu Road, Sirohi, Rajasthan' },
        category: { hi: 'BPL / जनजाति / ग्रामीण', en: 'BPL / Tribal / Rural' },
        work: { hi: '1.4 हेक्टेयर / सीमांत किसान', en: '1.4 Hectares / Small Farmer' },
        schemeIds: ['pmkisan', 'tarbandi', 'pmfby', 'kcc', 'pmkusum', 'pmawas', 'ayushman', 'pmsym'],
    },
    widow: {
        name: { hi: 'सुशीला देवी', en: 'Sushila Devi' },
        age: '38',
        location: { hi: 'आबूरोड, सिरोही, राजस्थान', en: 'Abu Road, Sirohi, Rajasthan' },
        category: { hi: 'BPL / OBC / विधवा महिला', en: 'BPL / OBC / Rural Widow' },
        work: { hi: 'दैनिक मज़दूर / भूमिहीन', en: 'Daily Wage Labour / Landless' },
        schemeIds: ['widow_pension', 'palanhar', 'ujjwala', 'pmawas', 'ayushman', 'pmmvy', 'pmsym', 'mudra'],
    },
    student: {
        name: { hi: 'प्रिया कुमारी', en: 'Priya Kumari' },
        age: '19',
        location: { hi: 'जयपुर ग्रामीण, राजस्थान', en: 'Jaipur Rural, Rajasthan' },
        category: { hi: 'BPL / SC / छात्रा', en: 'BPL / SC / Student' },
        work: { hi: '12वीं कक्षा / कॉलेज प्रवेश', en: '12th Pass / College Entry' },
        schemeIds: ['nsp', 'scholarship', 'pmkvy', 'palanhar', 'ayushman', 'sukanya'],
    },
};

const VOICE_STEPS = [
    {
        q: { hi: 'आप क्या काम करते हैं?', en: 'What work do you do?' },
        options: {
            hi: ['खेती / किसान', 'दैनिक मज़दूरी', 'पढ़ाई / छात्र'],
            en: ['Farmer / Agriculture', 'Daily Wage Labour', 'Student'],
        },
        personaMap: ['farmer', 'widow', 'student'],
    },
    {
        q: { hi: 'क्या आपके पास राशन कार्ड या जन आधार है?', en: 'Do you have a Ration Card or Jan Aadhaar?' },
        options: {
            hi: ['हाँ, मेरे पास है', 'नहीं / बनवाना है'],
            en: ['Yes, I have it', 'No / Need one'],
        },
    },
    {
        q: { hi: 'क्या घर में कोई बच्चे स्कूल जाते हैं?', en: 'Do any children in your home go to school?' },
        options: {
            hi: ['हाँ, जाते हैं', 'नहीं'],
            en: ['Yes, they do', 'No'],
        },
    },
];

// ═══════════════════════════════════════════════════════════════
// ANIMATED COUNTER HOOK
// ═══════════════════════════════════════════════════════════════
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return value;
}

// ═══════════════════════════════════════════════════════════════
// RETRO-EDITORIAL HEADER WITH STEP PROGRESS
// ═══════════════════════════════════════════════════════════════
function Header({ lang, setLang, stepNumber, onBack, onHome }) {
    const t = STRINGS[lang];
    const isHome = stepNumber === 0;

    return (
        <header className="sticky top-0 z-40 bg-[#FFFFEB]/95 backdrop-blur-md border-b border-[#E4E4D0]">
            <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
                {/* Left: Back or Brand */}
                {!isHome ? (
                    <button onClick={onBack} className="btn-retro btn-white py-2 px-3.5 text-xs">
                        <ICONS.ArrowLeft size={15} />
                        <span>{t.back}</span>
                    </button>
                ) : (
                    <button onClick={onHome} className="flex items-center gap-2.5 text-left group">
                        <div className="w-8 h-8 rounded-lg bg-[#0041CA] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] flex items-center justify-center text-white font-extrabold text-sm group-hover:scale-105 transition-transform">
                            य
                        </div>
                        <span className="font-sans font-extrabold text-lg text-[#1A1A1A] tracking-tight">{t.appName}</span>
                    </button>
                )}

                {/* Center: Step Indicator or Safe Pill */}
                {!isHome ? (
                    <div className="flex flex-col items-center gap-1.5 min-w-[110px]">
                        <span className="font-mono text-xs font-bold text-[#4A4A43]">
                            {t.stepOf.replace('{n}', String(stepNumber))}
                        </span>
                        <div className="flex items-center gap-1.5 w-24">
                            {[1, 2, 3].map(n => (
                                <div key={n} className={`h-2 flex-1 rounded-full border border-[#1A1A1A] transition-colors ${n <= stepNumber ? 'bg-[#0041CA]' : 'bg-white'}`} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-[#34D399]/30 border border-[#1A1A1A] shadow-[1.5px_1.5px_0_#1A1A1A] px-3 py-1 rounded-full">
                        <ICONS.Lock size={13} />
                        <span>{t.safeBadge}</span>
                    </div>
                )}

                {/* Right: Language Toggle */}
                <button onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
                    className="btn-retro btn-white py-1.5 px-3.5 text-xs shadow-[2px_2px_0_#1A1A1A]">
                    <span className={lang === 'hi' ? 'text-[#0041CA] font-black' : 'text-[#8C8C80]'}>हिंदी</span>
                    <span className="text-[#C9C9B8]">/</span>
                    <span className={lang === 'en' ? 'text-[#0041CA] font-black' : 'text-[#8C8C80]'}>EN</span>
                </button>
            </div>
        </header>
    );
}

// ═══════════════════════════════════════════════════════════════
// STEP 0: HOME (2 CLEAR CHOICES, RETRO-EDITORIAL STYLE)
// ═══════════════════════════════════════════════════════════════
function LandingScreen({ lang, onScan, onVoice }) {
    const t = STRINGS[lang];

    return (
        <div className="step-enter min-h-[calc(100vh-64px)] px-4 py-8 sm:py-12 max-w-2xl mx-auto flex flex-col items-center justify-center">
            {/* Clean Minimal Title */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-[#1A1A1A] tracking-tight leading-[1.15] mb-2">
                    <span>{t.heroTitleP1}</span>{' '}
                    <em className="font-serif italic font-normal text-[#0041CA] underline decoration-[#FFA946] decoration-4 underline-offset-4">
                        {t.heroTitleAccent}
                    </em>
                </h1>
                <p className="text-sm sm:text-base text-[#4A4A43] font-medium font-body">
                    {t.heroSubtitle}
                </p>
            </div>

            {/* 2 Clean Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {/* Option 1: Upload Photo */}
                <button type="button" onClick={onScan}
                    className="group bg-[#0041CA] hover:bg-[#0033A3] text-white border-2 border-[#1A1A1A] shadow-[5px_5px_0_#1A1A1A] hover:shadow-[7px_7px_0_#1A1A1A] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1A1A1A] rounded-3xl p-6 sm:p-7 text-left transition-all flex flex-col justify-between min-h-[175px]">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFA946] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                        <ICONS.Camera size={28} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{t.scanTitle}</h2>
                            <ICONS.ArrowRight size={22} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-xs sm:text-sm text-white/85 font-body">
                            {t.scanHint}
                        </p>
                    </div>
                </button>

                {/* Option 2: Enter Info Manually */}
                <button type="button" onClick={onVoice}
                    className="group bg-[#F0D7FF] hover:bg-[#e8c6fc] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[5px_5px_0_#1A1A1A] hover:shadow-[7px_7px_0_#1A1A1A] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1A1A1A] rounded-3xl p-6 sm:p-7 text-left transition-all flex flex-col justify-between min-h-[175px]">
                    <div className="w-14 h-14 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                        <ICONS.Edit3 size={26} className="text-[#0041CA]" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{t.voiceTitle}</h2>
                            <ICONS.ArrowRight size={22} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-xs sm:text-sm text-[#4A4A43] font-body">
                            {t.voiceHint}
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1A: DOCUMENT SCANNER
// ═══════════════════════════════════════════════════════════════
function ScanScreen({ lang, onDone }) {
    const t = STRINGS[lang];
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileError, setFileError] = useState('');
    const inputRef = useRef(null);
    const cancelledRef = useRef(false);

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    useEffect(() => {
        cancelledRef.current = false;
        return () => {
            cancelledRef.current = true;
        };
    }, []);

    const selectDocument = () => inputRef.current?.click();

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setFileError(lang === 'hi' ? 'कृपया सही फोटो चुनें।' : 'Please choose a valid image.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setFileError(lang === 'hi' ? 'फोटो 10 MB से छोटी होनी चाहिए।' : 'Image must be smaller than 10 MB.');
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFileError('');
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const startScan = async () => {
        if (!selectedFile) return;
        setFileError('');
        setStep(1);
        setProgress(5);
        try {
            const rawText = await runRealOCR(selectedFile, ({ stage, progress: pct }) => {
                if (cancelledRef.current) return;
                setStep(stage);
                setProgress(Math.max(5, pct));
            });
            if (cancelledRef.current) return;
            const parsed = parseDocumentText(rawText, lang);
            onDone(parsed);
        } catch {
            if (cancelledRef.current) return;
            setStep(0);
            setProgress(0);
            setFileError(lang === 'hi' ? 'फोटो पढ़ने में समस्या आई। कृपया साफ फोटो चुनें।' : 'Could not read image. Please try a clearer photo.');
        }
    };

    const scanSteps = [t.scanStep1, t.scanStep2, t.scanStep3];

    return (
        <div className="step-enter min-h-[calc(100vh-64px)] px-4 py-8 max-w-md mx-auto flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] p-6 sm:p-8">
                <h2 className="text-xl font-extrabold text-[#1A1A1A] text-center mb-5">
                    {step === 0 ? t.scanHeader : t.scanning}
                </h2>

                {step === 0 ? (
                    <>
                        <input ref={inputRef} onChange={handleFile} accept="image/*" capture="environment" type="file" className="sr-only" />
                        <button type="button" onClick={selectDocument}
                            className="w-full h-64 rounded-2xl border-2 border-dashed border-[#1A1A1A] hover:border-[#0041CA] bg-[#FFFFEB] flex flex-col items-center justify-center relative overflow-hidden transition-colors mb-5">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Document preview" className="w-full h-full object-contain p-3" />
                            ) : (
                                <div className="flex flex-col items-center text-center px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[#F0D7FF] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] text-[#1A1A1A] flex items-center justify-center mb-3">
                                        <ICONS.Camera size={28} />
                                    </div>
                                    <span className="text-sm font-bold text-[#1A1A1A]">{t.scanPrompt}</span>
                                </div>
                            )}
                        </button>

                        {fileError && <p className="text-xs text-red-600 text-center font-bold mb-3">{fileError}</p>}

                        <button onClick={previewUrl ? startScan : selectDocument}
                            className="btn-retro btn-blue w-full py-3.5 text-sm sm:text-base">
                            <span>{previewUrl ? t.scanAnalyze : t.scanCta}</span>
                            <ICONS.ArrowRight size={18} />
                        </button>
                    </>
                ) : (
                    <div className="space-y-5">
                        <div className="w-full h-44 rounded-2xl bg-[#FFFFEB] border-2 border-[#1A1A1A] relative overflow-hidden flex items-center justify-center">
                            {previewUrl && (
                                <img src={previewUrl} alt="Scanning document" className="w-full h-full object-contain p-2 opacity-60" />
                            )}
                            <div className="scan-beam absolute left-0 right-0 h-1 bg-[#0041CA] shadow-[0_0_12px_2px_#0041CA]" />
                            <span className="absolute bottom-2 right-3 font-mono text-xs font-extrabold bg-white border border-[#1A1A1A] px-2 py-0.5 rounded-full">
                                {progress}%
                            </span>
                        </div>

                        <div className="space-y-3">
                            {scanSteps.map((label, i) => {
                                const num = i + 1;
                                const done = step > num;
                                const active = step === num;
                                return (
                                    <div key={i} className={`flex items-center gap-3 text-sm transition-opacity ${step >= num ? 'opacity-100' : 'opacity-35'}`}>
                                        <div className={`w-6 h-6 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 text-xs font-bold ${
                                            done ? 'bg-[#34D399] text-[#1A1A1A]' : active ? 'bg-[#FFA946] text-[#1A1A1A] animate-pulse' : 'bg-[#FFFFEB] text-[#8C8C80]'
                                        }`}>
                                            {done ? <ICONS.Check size={13} /> : num}
                                        </div>
                                        <span className="font-bold text-[#1A1A1A]">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-5 pt-4 border-t border-[#E4E4D0] flex items-center justify-center gap-1.5 text-xs font-medium text-[#4A4A43]">
                    <ICONS.Lock size={13} className="text-[#034F46]" />
                    <span>{t.privacyNote}</span>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1B: 3-STEP MANUAL INFO ENTRY (NAME/ADDRESS -> AGE/WORK -> DOCS)
// ═══════════════════════════════════════════════════════════════
const AGE_GROUPS = [
    { id: 'under18', age: '15', hi: '18 से कम', en: 'Under 18' },
    { id: '18to35', age: '25', hi: '18 - 35 साल', en: '18 - 35 Years' },
    { id: '36to59', age: '45', hi: '36 - 59 साल', en: '36 - 59 Years' },
    { id: '60plus', age: '65', hi: '60+ साल (वरिष्ठ)', en: '60+ Years (Senior)' },
];

const PROFESSIONS = [
    { id: 'farmer', hi: 'किसान / खेती', en: 'Farmer / Agriculture' },
    { id: 'worker', hi: 'मज़दूर / श्रमिक', en: 'Daily Wage Worker' },
    { id: 'student', hi: 'छात्र / पढ़ाई', en: 'Student / Education' },
    { id: 'business', hi: 'दुकान / व्यापार', en: 'Small Business / Shop' },
    { id: 'homemaker', hi: 'गृहणी / महिला', en: 'Homemaker / Woman' },
];

const DOCUMENT_OPTIONS = [
    { id: 'aadhaar', hi: 'आधार कार्ड', en: 'Aadhaar Card', tagText: 'Aadhaar' },
    { id: 'janaadhaar', hi: 'जन आधार (राजस्थान)', en: 'Jan Aadhaar (Rajasthan)', tagText: 'Jan Aadhaar Rajasthan' },
    { id: 'bpl', hi: 'राशन कार्ड / BPL', en: 'Ration Card / BPL', tagText: 'BPL Ration Card' },
    { id: 'land', hi: 'ज़मीन / खसरा कागज़', en: 'Land / Khasra Paper', tagText: 'Khasra Farmer Land' },
    { id: 'sc', hi: 'SC प्रमाण पत्र', en: 'SC Certificate', tagText: 'SC' },
    { id: 'st', hi: 'ST प्रमाण पत्र', en: 'ST Certificate', tagText: 'ST' },
    { id: 'obc', hi: 'OBC प्रमाण पत्र', en: 'OBC Certificate', tagText: 'OBC' },
    { id: 'ews', hi: 'EWS प्रमाण पत्र', en: 'EWS Certificate', tagText: 'EWS' },
    { id: 'widow', hi: 'विधवा / एकल नारी', en: 'Widow / Single Woman', tagText: 'Widow' },
    { id: 'disabled', hi: 'दिव्यांग कार्ड', en: 'Divyang Card', tagText: 'Divyang Disabled' },
];

function ManualEntryScreen({ lang, onDone }) {
    const t = STRINGS[lang];
    const [subStep, setSubStep] = useState(1); // 1 | 2 | 3
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [profession, setProfession] = useState('');
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [error, setError] = useState('');

    const toggleDoc = (id) => {
        setError('');
        setSelectedDocs(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        if (subStep === 1) {
            if (!name.trim() || !address.trim()) {
                setError(lang === 'hi' ? 'कृपया अपना नाम और पता दोनों भरें।' : 'Please enter both your name and address.');
                return;
            }
            setError('');
            setSubStep(2);
            return;
        }
        if (subStep === 2) {
            if (!ageGroup || !profession) {
                setError(lang === 'hi' ? 'कृपया उम्र वर्ग और काम दोनों चुनें।' : 'Please choose both your age group and profession.');
                return;
            }
            setError('');
            setSubStep(3);
            return;
        }
        if (subStep === 3) {
            if (selectedDocs.length === 0) {
                setError(lang === 'hi' ? 'कृपया कम से कम एक दस्तावेज़ चुनें।' : 'Please choose at least one document you have.');
                return;
            }
            const ageObj = AGE_GROUPS.find(a => a.id === ageGroup);
            const profObj = PROFESSIONS.find(p => p.id === profession);
            const docObjs = DOCUMENT_OPTIONS.filter(d => selectedDocs.includes(d.id));

            const profile = {
                name: name.trim(),
                age: ageObj?.age || '25',
                location: address.trim(),
                category: docObjs.map(d => d[lang]).join(' / '),
                work: profObj ? profObj[lang] : '',
            };
            const docKeywords = docObjs.map(d => d.tagText).join(' ');
            onDone(profile, docKeywords);
        }
    };

    return (
        <div className="step-enter min-h-[calc(100vh-64px)] px-4 py-8 max-w-md mx-auto flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] p-6 sm:p-8">
                {/* Sub-step Indicator */}
                <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs font-bold bg-[#F0D7FF] border border-[#1A1A1A] px-3 py-1 rounded-full text-[#1A1A1A]">
                        {lang === 'hi' ? `कदम ${subStep} / 3` : `Step ${subStep} of 3`}
                    </span>
                    {subStep > 1 && (
                        <button
                            type="button"
                            onClick={() => { setError(''); setSubStep(s => s - 1); }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#0041CA] hover:underline"
                        >
                            <ICONS.ArrowLeft size={14} />
                            <span>{t.back}</span>
                        </button>
                    )}
                </div>

                {/* STEP 1: Name & Address */}
                {subStep === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-extrabold text-[#1A1A1A]">
                            {lang === 'hi' ? 'अपना नाम और पता लिखें' : 'Enter Your Name & Address'}
                        </h2>
                        <div>
                            <label className="block font-mono text-[11px] font-bold text-[#4A4A43] uppercase mb-1.5">
                                {t.name}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => { setError(''); setName(e.target.value); }}
                                placeholder={lang === 'hi' ? 'जैसे: रामलाल मीणा' : 'e.g. Ramlal Meena'}
                                className="w-full text-sm font-bold text-[#1A1A1A] placeholder:text-[#8C8C80] placeholder:font-normal bg-[#FFFFEB] border-2 border-[#1A1A1A] focus:border-[#0041CA] rounded-xl px-3.5 py-2.5 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-[11px] font-bold text-[#4A4A43] uppercase mb-1.5">
                                {t.location}
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => { setError(''); setAddress(e.target.value); }}
                                placeholder={lang === 'hi' ? 'जैसे: सिरोही, राजस्थान' : 'e.g. Sirohi, Rajasthan'}
                                className="w-full text-sm font-bold text-[#1A1A1A] placeholder:text-[#8C8C80] placeholder:font-normal bg-[#FFFFEB] border-2 border-[#1A1A1A] focus:border-[#0041CA] rounded-xl px-3.5 py-2.5 outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: Age Group & Profession */}
                {subStep === 2 && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-lg font-extrabold text-[#1A1A1A] mb-2.5">
                                {lang === 'hi' ? '1. अपनी उम्र चुनें' : '1. Choose Age Group'}
                            </h2>
                            <div className="grid grid-cols-2 gap-2.5">
                                {AGE_GROUPS.map((ag) => (
                                    <button
                                        key={ag.id}
                                        type="button"
                                        onClick={() => { setError(''); setAgeGroup(ag.id); }}
                                        className={`py-2.5 px-3 rounded-xl border-2 border-[#1A1A1A] text-xs font-extrabold transition-all text-center ${
                                            ageGroup === ag.id
                                                ? 'bg-[#0041CA] text-white shadow-[2px_2px_0_#1A1A1A]'
                                                : 'bg-[#FFFFEB] hover:bg-[#F0D7FF] text-[#1A1A1A]'
                                        }`}
                                    >
                                        {ag[lang]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-extrabold text-[#1A1A1A] mb-2.5">
                                {lang === 'hi' ? '2. अपना काम चुनें' : '2. Choose Profession'}
                            </h2>
                            <div className="grid grid-cols-1 gap-2">
                                {PROFESSIONS.map((prof) => (
                                    <button
                                        key={prof.id}
                                        type="button"
                                        onClick={() => { setError(''); setProfession(prof.id); }}
                                        className={`py-2.5 px-4 rounded-xl border-2 border-[#1A1A1A] text-sm font-bold transition-all flex items-center justify-between ${
                                            profession === prof.id
                                                ? 'bg-[#0041CA] text-white shadow-[2px_2px_0_#1A1A1A]'
                                                : 'bg-[#FFFFEB] hover:bg-[#F0D7FF] text-[#1A1A1A]'
                                        }`}
                                    >
                                        <span>{prof[lang]}</span>
                                        {profession === prof.id && <ICONS.Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Choose Documents You Have */}
                {subStep === 3 && (
                    <div>
                        <h2 className="text-xl font-extrabold text-[#1A1A1A] mb-1">
                            {lang === 'hi' ? 'आपके पास कौन से कागज़ हैं?' : 'Which documents do you have?'}
                        </h2>
                        <p className="text-xs text-[#4A4A43] mb-4">
                            {lang === 'hi' ? 'जो कागज़ हैं उन्हें चुनें (एक या अधिक)' : 'Select all that apply'}
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {DOCUMENT_OPTIONS.map((doc) => {
                                const active = selectedDocs.includes(doc.id);
                                return (
                                    <button
                                        key={doc.id}
                                        type="button"
                                        onClick={() => toggleDoc(doc.id)}
                                        className={`p-2.5 rounded-xl border-2 border-[#1A1A1A] text-xs font-bold transition-all flex items-center justify-between gap-1.5 text-left ${
                                            active
                                                ? 'bg-[#34D399] text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]'
                                                : 'bg-[#FFFFEB] hover:bg-[#F0D7FF] text-[#1A1A1A]'
                                        }`}
                                    >
                                        <span>{doc[lang]}</span>
                                        {active && <ICONS.Check size={14} className="shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {error && (
                    <p role="alert" className="text-xs font-bold text-red-600 text-center mt-4">{error}</p>
                )}

                <button
                    type="button"
                    onClick={handleNext}
                    className="btn-retro btn-blue w-full py-3.5 text-sm sm:text-base mt-6"
                >
                    <span>
                        {subStep < 3
                            ? (lang === 'hi' ? 'आगे बढ़ें' : 'Next')
                            : t.seeSchemes}
                    </span>
                    <ICONS.ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: SIMPLE PROFILE CONFIRMATION
// ═══════════════════════════════════════════════════════════════
function ProfileScreen({ lang, persona, ocrResult, profileEdits, onSaveProfile, onUnlock }) {
    const t = STRINGS[lang];
    const p = PERSONAS[persona];
    const [editing, setEditing] = useState(false);
    const [showRawText, setShowRawText] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const baseProfile = ocrResult ? ocrResult.profile : {
        name: p.name[lang],
        age: p.age,
        location: p.location[lang],
        category: p.category[lang],
        work: p.work[lang],
    };

    const currentValues = useMemo(() => ({
        name: (profileEdits?.name ?? baseProfile.name) || '',
        age: (profileEdits?.age ?? baseProfile.age) || '',
        location: (profileEdits?.location ?? baseProfile.location) || '',
        category: (profileEdits?.category ?? baseProfile.category) || '',
        work: (profileEdits?.work ?? baseProfile.work) || '',
    }), [profileEdits, baseProfile.name, baseProfile.age, baseProfile.location, baseProfile.category, baseProfile.work]);

    const [draft, setDraft] = useState(currentValues);

    useEffect(() => {
        setDraft(currentValues);
    }, [currentValues]);

    const getTrimmedDraft = () => ({
        name: draft.name.trim(),
        age: draft.age.trim(),
        location: draft.location.trim(),
        category: draft.category.trim(),
        work: draft.work.trim(),
    });

    const hasMissingFields = !draft.name.trim() || !draft.age.trim() || !draft.location.trim() || !draft.category.trim() || !draft.work.trim();

    const handleToggleEdit = () => {
        if (editing) {
            const trimmed = getTrimmedDraft();
            if (!trimmed.name || !trimmed.age || !trimmed.location || !trimmed.category || !trimmed.work) {
                setErrorMsg(lang === 'hi' ? 'कृपया सभी खाली जानकारी भरें।' : 'Please fill in all missing details.');
                return;
            }
            setErrorMsg('');
            onSaveProfile(trimmed);
            setEditing(false);
        } else {
            setDraft(currentValues);
            setErrorMsg('');
            setEditing(true);
        }
    };

    const handleContinue = () => {
        const trimmed = getTrimmedDraft();
        if (!trimmed.name || !trimmed.age || !trimmed.location || !trimmed.category || !trimmed.work) {
            setErrorMsg(lang === 'hi' ? 'आगे बढ़ने से पहले कृपया सभी खाली जानकारी भरें।' : 'Please fill in all missing details before continuing.');
            return;
        }
        setErrorMsg('');
        onSaveProfile(trimmed);
        setEditing(false);
        onUnlock();
    };

    const quickChoices = {
        category: lang === 'hi'
            ? ['BPL / गरीब परिवार', 'SC / ST', 'OBC', 'सामान्य / EWS', 'विधवा / एकल महिला']
            : ['BPL', 'SC / ST', 'OBC', 'General / EWS', 'Widow / Single Woman'],
        work: lang === 'hi'
            ? ['किसान / खेती', 'मज़दूर / श्रमिक', 'छात्र / पढ़ाई', 'दुकान / व्यापार', 'गृहणी']
            : ['Farmer', 'Daily Wage Worker', 'Student', 'Small Business', 'Homemaker'],
    };

    const placeholders = {
        name: lang === 'hi' ? 'अपना पूरा नाम लिखें' : 'Enter your full name',
        age: lang === 'hi' ? 'अपनी उम्र लिखें (जैसे: 22)' : 'Enter your age (e.g. 22)',
        location: lang === 'hi' ? 'गाँव / शहर व राज्य लिखें (जैसे: जयपुर, राजस्थान)' : 'Village / City & State (e.g. Jaipur, Rajasthan)',
        category: lang === 'hi' ? 'अपना वर्ग चुनें या लिखें' : 'Select or type category',
        work: lang === 'hi' ? 'अपना काम चुनें या लिखें' : 'Select or type work',
    };

    const rows = [
        { key: 'name', label: t.name, value: currentValues.name, icon: <ICONS.User size={18} /> },
        { key: 'age', label: t.age, value: currentValues.age, icon: <ICONS.UserHeart size={18} /> },
        { key: 'location', label: t.location, value: currentValues.location, icon: <ICONS.MapPin size={18} /> },
        { key: 'category', label: t.category, value: currentValues.category, icon: <ICONS.Clipboard size={18} /> },
        { key: 'work', label: t.work, value: currentValues.work, icon: <ICONS.Wheat size={18} /> },
    ];

    return (
        <div className="step-enter min-h-[calc(100vh-64px)] px-4 py-8 max-w-md mx-auto flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                    <div className="flex-1 bg-[#FFA946]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#34D399]" />
                </div>

                <div className="flex items-start justify-between gap-2 mb-6 mt-1">
                    <div>
                        <h2 className="text-xl font-extrabold text-[#1A1A1A]">{t.profileHeader}</h2>
                        <p className="text-xs text-[#4A4A43] mt-0.5">
                            {hasMissingFields
                                ? (lang === 'hi' ? 'जो जानकारी नहीं मिली, कृपया उसे भरें' : 'Please fill in the missing details below')
                                : t.profileSub}
                        </p>
                    </div>
                    <button type="button" onClick={handleToggleEdit}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A1A] bg-[#F6F6E0] hover:bg-[#FFA946] border border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] px-3 py-1.5 rounded-full transition-colors shrink-0">
                        <ICONS.Edit3 size={13} />
                        <span>{editing ? t.save : t.edit}</span>
                    </button>
                </div>

                <div className="space-y-3 mb-5">
                    {rows.map((r) => {
                        const isOriginallyMissing = !baseProfile[r.key]?.trim() && !profileEdits?.[r.key]?.trim();
                        const showInput = editing || isOriginallyMissing || !r.value.trim();
                        const isEmptyNow = !draft[r.key].trim();

                        return (
                            <div key={r.key} className={`p-3.5 rounded-2xl border ${isEmptyNow ? 'bg-[#FFF7E6] border-2 border-[#FFA946]' : 'bg-[#FFFFEB] border-[#1A1A1A]'}`}>
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-[#1A1A1A] shadow-[1.5px_1.5px_0_#1A1A1A] flex items-center justify-center text-[#1A1A1A] shrink-0">
                                        {r.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-[10px] font-bold text-[#8C8C80] uppercase">{r.label}</span>
                                            {ocrResult && !isOriginallyMissing && !showInput && (
                                                <span className="text-[10px] font-bold text-[#034F46] bg-[#34D399]/30 border border-[#1A1A1A] rounded-full px-2 py-0.5">
                                                    {lang === 'hi' ? 'फोटो से मिला' : 'From Photo'}
                                                </span>
                                            )}
                                            {isEmptyNow && (
                                                <span className="text-[10px] font-bold text-[#B45309]">
                                                    {lang === 'hi' ? 'भरना ज़रूरी है' : 'Required'}
                                                </span>
                                            )}
                                        </div>
                                        {showInput ? (
                                            <input
                                                type={r.key === 'age' ? 'number' : 'text'}
                                                inputMode={r.key === 'age' ? 'numeric' : undefined}
                                                min={r.key === 'age' ? 1 : undefined}
                                                max={r.key === 'age' ? 115 : undefined}
                                                value={draft[r.key]}
                                                placeholder={placeholders[r.key]}
                                                onChange={(e) => {
                                                    setErrorMsg('');
                                                    setDraft(prev => ({ ...prev, [r.key]: e.target.value }));
                                                }}
                                                className="w-full text-sm font-bold text-[#1A1A1A] placeholder:text-[#8C8C80] placeholder:font-normal bg-white border-2 border-[#0041CA] rounded-lg px-2.5 py-1.5 mt-1 outline-none"
                                            />
                                        ) : (
                                            <div className="text-sm font-bold text-[#1A1A1A] break-words mt-0.5">{r.value}</div>
                                        )}
                                    </div>
                                </div>

                                {showInput && quickChoices[r.key] && (
                                    <div className="flex flex-wrap gap-1.5 mt-2.5 pl-13">
                                        {quickChoices[r.key].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setErrorMsg('');
                                                    setDraft(prev => ({ ...prev, [r.key]: opt }));
                                                }}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#1A1A1A] transition-colors ${
                                                    draft[r.key] === opt
                                                        ? 'bg-[#0041CA] text-white'
                                                        : 'bg-white hover:bg-[#F0D7FF] text-[#1A1A1A]'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {ocrResult && (
                    <div className="mb-4">
                        {!ocrResult.hasReadableText && (
                            <p className="text-xs font-bold text-amber-700 bg-[#FFF3D6] border border-[#1A1A1A] rounded-xl px-3 py-2 mb-2 text-center">
                                {lang === 'hi' ? 'फोटो में साफ अक्षर नहीं मिले — कृपया नीचे अपनी जानकारी भरें।' : 'No clear text found in photo — please enter your details above.'}
                            </p>
                        )}
                        {ocrResult.rawText && (
                            <div className="text-center">
                                <button type="button" onClick={() => setShowRawText(s => !s)}
                                    className="text-[11px] font-mono font-bold text-[#0041CA] underline">
                                    {showRawText
                                        ? (lang === 'hi' ? 'पढ़ा गया टेक्स्ट छुपाएं' : 'Hide extracted OCR text')
                                        : (lang === 'hi' ? 'फोटो से पढ़ा गया टेक्स्ट देखें' : 'View extracted OCR text')}
                                </button>
                                {showRawText && (
                                    <pre className="mt-2 p-3 rounded-xl bg-[#FFFFEB] border border-[#1A1A1A] text-[11px] text-left text-[#4A4A43] whitespace-pre-wrap max-h-32 overflow-y-auto font-mono">
                                        {ocrResult.rawText}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {errorMsg && (
                    <p role="alert" className="text-xs font-bold text-red-600 text-center mb-4">{errorMsg}</p>
                )}

                <button type="button" onClick={handleContinue} className="btn-retro btn-blue w-full py-4 text-sm sm:text-base">
                    <span>{t.seeSchemes}</span>
                    <ICONS.ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: CLEAN ENTITLEMENT RESULTS & ACTION MODAL
// ═══════════════════════════════════════════════════════════════
function getSchemeSubcategory(scheme) {
    const tags = scheme.tags || [];
    if (scheme.type === 'health' || tags.includes('health')) return 'health';
    if (tags.some(t => ['student', 'school', 'youth', 'child', 'skill', 'sports', 'science', 'education'].includes(t))) return 'education';
    if (tags.some(t => ['farmer', 'agriculture', 'dairy', 'worker', 'artisan', 'business', 'startup', 'senior', 'widow', 'bpl', 'shg'].includes(t))) return 'cash';
    return 'essentials';
}

function DashboardScreen({ lang, persona, ocrResult, profileEdits, onStartOver }) {
    const t = STRINGS[lang];
    const p = PERSONAS[persona];
    const [activeCategory, setActiveCategory] = useState('education');
    const [visibleCount, setVisibleCount] = useState(10);
    const [modalScheme, setModalScheme] = useState(null);
    const closeBtnRef = useRef(null);

    useEffect(() => {
        if (!modalScheme) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setModalScheme(null);
        };
        document.addEventListener('keydown', onKeyDown);
        closeBtnRef.current?.focus();
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [modalScheme]);

    const matchedSchemes = useMemo(() => {
        const ids = (ocrResult || profileEdits)
            ? matchSchemesFromProfile(profileEdits || ocrResult?.profile || {}, ocrResult?.rawText || '')
            : p.schemeIds;
        return ids.map(id => SCHEMES_DB[id]).filter(Boolean);
    }, [ocrResult, profileEdits, p.schemeIds]);

    const categorized = useMemo(() => {
        const groups = { education: [], cash: [], health: [], essentials: [] };
        for (const s of matchedSchemes) {
            groups[getSchemeSubcategory(s)].push(s);
        }
        return groups;
    }, [matchedSchemes]);

    const tabs = useMemo(() => [
        { key: 'education', label: t.filterEducation, count: categorized.education.length },
        { key: 'cash', label: t.filterCash, count: categorized.cash.length },
        { key: 'health', label: t.filterHealth, count: categorized.health.length },
        { key: 'essentials', label: t.filterEssentials, count: categorized.essentials.length },
    ].filter(tab => tab.count > 0), [categorized, t.filterEducation, t.filterCash, t.filterHealth, t.filterEssentials]);

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some(tab => tab.key === activeCategory)) {
            setActiveCategory(tabs[0].key);
            setVisibleCount(10);
        }
    }, [tabs, activeCategory]);

    const currentCategorySchemes = useMemo(
        () => categorized[activeCategory] || [],
        [categorized, activeCategory]
    );
    const visibleSchemes = useMemo(
        () => currentCategorySchemes.slice(0, visibleCount),
        [currentCategorySchemes, visibleCount]
    );
    const remainingCount = Math.max(0, currentCategorySchemes.length - visibleSchemes.length);

    const totalAnnual = useMemo(() =>
        matchedSchemes.reduce((sum, s) => sum + s.benefitAmountAnnual, 0),
    [matchedSchemes]);

    const animatedTotal = useCountUp(totalAnnual, 1000);

    return (
        <div className="step-enter min-h-[calc(100vh-64px)] px-4 py-8 pb-16 max-w-3xl mx-auto">
            {/* Hero Summary Banner */}
            <div className="bg-white border-2 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] rounded-3xl p-6 sm:p-8 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-[#4A4A43] uppercase">{t.totalBenefit}</span>
                    <span className="text-xs font-extrabold bg-[#34D399] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1.5px_1.5px_0_#1A1A1A] px-3 py-1 rounded-full">
                        {matchedSchemes.length} {t.schemesFound}
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif italic text-5xl sm:text-6xl text-[#1A1A1A] tracking-tight tabular-nums">
                        ₹{animatedTotal.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-[#8C8C80]">{t.perYear}</span>
                </div>
            </div>

            {/* 4 Subcategory Tabs (No "All" Tab, No Horizontal Scroll) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 mb-4">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => { setActiveCategory(tab.key); setVisibleCount(10); }}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#1A1A1A] transition-all flex items-center justify-between sm:justify-start gap-1.5 ${
                            activeCategory === tab.key
                                ? 'bg-[#0041CA] text-white shadow-[2px_2px_0_#1A1A1A]'
                                : 'bg-white text-[#1A1A1A] hover:bg-[#F6F6E0]'
                        }`}>
                        <span className="truncate">{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                            activeCategory === tab.key ? 'bg-white/20 text-white' : 'bg-[#F0D7FF] text-[#1A1A1A]'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="text-xs font-mono font-bold text-[#4A4A43] mb-4">
                {t.showingOf} {visibleSchemes.length} / {currentCategorySchemes.length}
            </div>

            {/* Clean Scheme Cards Grid (10 per page) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {visibleSchemes.map((scheme) => {
                    const SchemeIcon = ICONS[scheme.iconKey] || ICONS.Clipboard;
                    return (
                        <div key={scheme.id} className="pr-card justify-between">
                            <div>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#F0D7FF] border border-[#1A1A1A] shadow-[1.5px_1.5px_0_#1A1A1A] text-[#1A1A1A] flex items-center justify-center shrink-0">
                                        <SchemeIcon size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-extrabold text-[#1A1A1A] text-base leading-snug">
                                            {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
                                        </h3>
                                        <div className="font-serif italic text-lg text-[#0041CA] mt-0.5">
                                            {scheme.benefitDisplay[lang]}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-[#4A4A43] leading-relaxed mb-4 font-body">
                                    {scheme.reason[lang]}
                                </p>
                            </div>

                            <button onClick={() => setModalScheme(scheme)}
                                className="btn-retro btn-white w-full py-2.5 text-xs">
                                <span>{t.applyBtn}</span>
                                <ICONS.ArrowRight size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* View More Button (+10 per click) */}
            {remainingCount > 0 && (
                <div className="text-center mb-8">
                    <button type="button" onClick={() => setVisibleCount(c => c + 10)}
                        className="btn-retro btn-white text-sm py-3 px-7">
                        <span>{t.viewMore} (+{Math.min(10, remainingCount)})</span>
                    </button>
                </div>
            )}

            {/* Start New Search */}
            <div className="text-center">
                <button onClick={onStartOver} className="btn-retro btn-lav text-sm py-3 px-7">
                    <ICONS.Home size={16} />
                    <span>{t.startNew}</span>
                </button>
            </div>

            {/* Focused Application Modal (portaled to body so page transform never shifts fixed centering) */}
            {modalScheme && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
                    <div className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm" onClick={() => setModalScheme(null)} />
                    <div className="relative bg-[#FFFFEB] border-2 border-[#1A1A1A] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-[7px_7px_0_#1A1A1A] modal-enter z-10" role="dialog" aria-modal="true">
                        <button ref={closeBtnRef} onClick={() => setModalScheme(null)} aria-label="Close"
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] hover:bg-[#FFA946] flex items-center justify-center text-[#1A1A1A]">
                            <ICONS.X size={15} />
                        </button>

                        <h3 className="font-extrabold text-lg text-[#1A1A1A] pr-8 mb-1">
                            {lang === 'hi' ? modalScheme.nameHi : modalScheme.nameEn}
                        </h3>
                        <div className="font-serif italic text-xl text-[#0041CA] mb-5">
                            {modalScheme.benefitDisplay[lang]}
                        </div>

                        <div className="bg-white border-2 border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] rounded-2xl p-4 mb-5">
                            <p className="font-mono text-[11px] font-bold text-[#8C8C80] uppercase mb-2.5">{t.docsNeeded}</p>
                            <div className="space-y-2">
                                {modalScheme.docs[lang].map((doc, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                                        <span className="w-5 h-5 rounded-full bg-[#34D399] border border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center shrink-0">
                                            <ICONS.Check size={12} />
                                        </span>
                                        <span>{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <a href={modalScheme.url} target="_blank" rel="noopener noreferrer"
                                className="btn-retro btn-blue w-full py-3.5 text-sm">
                                <span>{t.openPortal}</span>
                                <ICONS.ExternalLink size={15} />
                            </a>

                            <button
                                type="button"
                                onClick={() => {
                                    const name = lang === 'hi' ? modalScheme.nameHi : modalScheme.nameEn;
                                    const intro = lang === 'hi'
                                        ? `योजना की जानकारी — ${name}: ${modalScheme.benefitDisplay.hi}\nआवेदन पोर्टल: ${modalScheme.url}`
                                        : `Scheme Info — ${name}: ${modalScheme.benefitDisplay.en}\nOfficial Portal: ${modalScheme.url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(intro)}`, '_blank');
                                }}
                                className="btn-retro btn-white w-full py-3 text-sm text-[#034F46]">
                                <ICONS.Share2 size={15} />
                                <span>{t.shareWhatsApp}</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// APP ROUTER (STEP-BY-STEP FLOW)
// ═══════════════════════════════════════════════════════════════
function App() {
    const [screen, setScreen] = useState('landing'); // landing | scan | voice | profile | dashboard
    const [lang, setLang] = useState(() => {
        try {
            const saved = localStorage.getItem('yojanasetu_lang');
            return saved === 'en' || saved === 'hi' ? saved : 'hi';
        } catch {
            return 'hi';
        }
    });
    const [persona, setPersona] = useState('farmer');
    const [entryMode, setEntryMode] = useState('scan'); // scan | manual
    const [ocrResult, setOcrResult] = useState(null);
    const [profileEdits, setProfileEdits] = useState(null);

    useEffect(() => {
        document.documentElement.lang = lang;
        try {
            localStorage.setItem('yojanasetu_lang', lang);
        } catch (e) {
            void e;
        }
    }, [lang]);

    const stepMap = {
        landing: 0,
        scan: 1,
        voice: 1,
        profile: 2,
        dashboard: 3,
    };

    const handleBack = useCallback(() => {
        const backMap = {
            scan: 'landing',
            voice: 'landing',
            profile: 'landing',
            dashboard: entryMode === 'manual' ? 'voice' : 'profile',
        };
        setScreen(backMap[screen] || 'landing');
    }, [screen, entryMode]);

    return (
        <div className="min-h-screen bg-[#FFFFEB] text-[#1A1A1A]">
            <Header
                lang={lang}
                setLang={setLang}
                stepNumber={stepMap[screen]}
                onBack={handleBack}
                onHome={() => setScreen('landing')}
            />

            <main>
                {screen === 'landing' && (
                    <LandingScreen
                        lang={lang}
                        onScan={() => { setEntryMode('scan'); setOcrResult(null); setProfileEdits(null); setScreen('scan'); }}
                        onVoice={() => { setEntryMode('manual'); setOcrResult(null); setProfileEdits(null); setScreen('voice'); }}
                    />
                )}
                {screen === 'scan' && (
                    <ScanScreen
                        lang={lang}
                        onDone={(parsed) => {
                            setOcrResult(parsed || null);
                            setProfileEdits(null);
                            setScreen('profile');
                        }}
                    />
                )}
                {screen === 'voice' && (
                    <ManualEntryScreen
                        lang={lang}
                        onDone={(manualProfile, docKeywords) => {
                            setOcrResult({ rawText: docKeywords || '', hasReadableText: true, profile: manualProfile, schemeIds: [] });
                            setProfileEdits(manualProfile);
                            setScreen('dashboard');
                        }}
                    />
                )}
                {screen === 'profile' && (
                    <ProfileScreen
                        lang={lang}
                        persona={persona}
                        ocrResult={ocrResult}
                        profileEdits={profileEdits}
                        onSaveProfile={setProfileEdits}
                        onUnlock={() => setScreen('dashboard')}
                    />
                )}
                {screen === 'dashboard' && (
                    <DashboardScreen
                        lang={lang}
                        persona={persona}
                        ocrResult={ocrResult}
                        profileEdits={profileEdits}
                        onStartOver={() => { setOcrResult(null); setProfileEdits(null); setScreen('landing'); }}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
