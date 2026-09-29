const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ═══════════════════════════════════════════════════════════════
// LUCIDE ICON COMPONENT (SVG inline since we don't have lucide-react)
// ═══════════════════════════════════════════════════════════════
const ICONS = {
    Camera: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
    Mic: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
    FileText: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>,
    CheckCircle2: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
    ShieldCheck: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>,
    ArrowRight: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    RefreshCw: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
    AlertCircle: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
    Award: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>,
    Landmark: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    TrendingUp: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    ChevronDown: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="m6 9 6 6 6-6"/></svg>,
    ChevronUp: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="m18 15-6-6-6 6"/></svg>,
    Share2: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>,
    ExternalLink: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,
    X: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    Home: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
    ArrowLeft: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
    Lock: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Edit3: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>,
    Users: (p) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};


// ═══════════════════════════════════════════════════════════════
// i18n STRINGS
// ═══════════════════════════════════════════════════════════════
const STRINGS = {
    hi: {
        logoName: 'योजनासेतु',
        tagline: 'Scan. Discover. Empower.',
        headline: 'एक फोटो, एक मिनट, आपके सारे सरकारी हक',
        subtext: 'अपना एक दस्तावेज़ (जन आधार, राशन कार्ड, या ज़मीन रिकॉर्ड) स्कैन करें या हिंदी में बात करें — 60 सेकंड में सभी योजनाएं, 100% गोपनीय।',
        scanBtn: 'दस्तावेज़ स्कैन करें',
        voiceBtn: 'बोलकर पता करें',
        tryDemo: 'सैंपल डेमो से आज़माएं',
        demoA: 'सीमांत किसान (राशन कार्ड — सिरोही)',
        demoB: 'ग्रामीण महिला प्रधान / विधवा (जन आधार — आबूरोड)',
        demoC: 'प्रथम पीढ़ी कॉलेज छात्र (12वीं मार्कशीट)',
        schemesIndexed: 'योजनाएं अनुक्रमित',
        unclaimedBenefits: 'करोड़ अदावी लाभ',
        scanning: 'आपका दस्तावेज़ पढ़ रहे हैं...',
        scanStep1: 'क्लाइंट-साइड इमेज बाइनराइज़ेशन और नॉइज़ रिडक्शन...',
        scanStep2: 'WebAssembly OCR से डेमोग्राफ़िक मार्कर निकाल रहे हैं...',
        scanStep3: 'राजस्थान 4,000+ गज़ट में डिटर्मिनिस्टिक रूल मैचिंग...',
        privacyBadge: '🔒 100% ब्राउज़र सैंडबॉक्स में चला। कोई ID सर्वर पर नहीं गया।',
        profileTitle: 'निकाली गई जानकारी — सत्यापित करें',
        profileSubtext: 'आपके दस्तावेज़ से ऑटो-पार्स की गई जानकारी',
        editBtn: 'बदलें / सुधारें',
        saveBtn: 'बदलाव सहेजें',
        unlockBtn: 'मेरे हक खोलें',
        schemesFound: 'योजनाएं मिलीं',
        resultsTitle: 'हक डैशबोर्ड',
        totalEntitlement: 'कुल वार्षिक अनुमानित लाभ',
        perYear: '/ वर्ष',
        missingLine: 'आप ₹{amount}/माह खो रहे हैं क्योंकि ये फॉर्म कभी जमा नहीं किए गए।',
        benefit: 'लाभ राशि',
        whyQualify: 'आप क्यों पात्र हैं',
        docsNeeded: 'ज़रूरी दस्तावेज़',
        applyDigilocker: 'DigiLocker / SSO से आवेदन',
        shareWhatsApp: 'WhatsApp पर भेजें',
        badges: { dbt: 'DBT', state: 'राज्य प्राथमिकता', central: 'केंद्रीय योजना', health: 'स्वास्थ्य बीमा', onetime: 'एक-बार अनुदान' },
        voiceTitle: 'सेतु साथी',
        voiceSubtext: 'माइक दबाएं और अपनी जानकारी बताएं — हिंदी/मारवाड़ी में',
        back: 'वापस',
        startOver: 'फिर से शुरू करें',
        name: 'नाम',
        age: 'आयु / लिंग',
        category: 'वर्ग / सामाजिक स्तर',
        land: 'भूमि / व्यवसाय',
        maskedId: 'जन आधार (मास्क्ड)',
        location: 'स्थान',
        privacyFull: '100% क्लाइंट-साइड प्राइवेसी / कोई ID सर्वर पर स्टोर नहीं',
        preChecked: '(प्री-चेक्ड — आपकी प्रोफ़ाइल से)',
        digilockerModal: 'प्रोडक्शन में DigiLocker SSO से जुड़ेगा',
        showResults: 'डैशबोर्ड पर जाएं',
    },
    en: {
        logoName: 'YojanaSetu',
        tagline: 'Scan. Discover. Empower.',
        headline: 'One Photo. 60 Seconds. All Your Entitlements.',
        subtext: 'Scan one document (Jan Aadhaar, Ration Card, or Land Record) or speak in Hindi — discover all schemes in 60 seconds, 100% client-side privacy.',
        scanBtn: 'Scan Your Document',
        voiceBtn: 'Speak with Setu Saathi',
        tryDemo: 'Try with Sample Documents',
        demoA: 'Smallholder Farmer (Ration Card — Sirohi)',
        demoB: 'Rural Female Head / Widow (Jan Aadhaar — Abu Road)',
        demoC: 'First-Gen College Student (12th Marksheet)',
        schemesIndexed: 'Schemes Indexed',
        unclaimedBenefits: 'Cr Unclaimed Benefits',
        scanning: 'Reading your document...',
        scanStep1: 'Client-side image binarization & noise reduction...',
        scanStep2: 'Extracting demographic markers via WebAssembly OCR...',
        scanStep3: 'Deterministic rule matching across 4,000+ Rajasthan gazettes...',
        privacyBadge: '🔒 Executed 100% in Browser Sandbox. No ID transmitted to server.',
        profileTitle: 'Extracted Profile — Verify',
        profileSubtext: 'Auto-parsed from your scanned document',
        editBtn: 'Edit / Correct Details',
        saveBtn: 'Save Changes',
        unlockBtn: 'Unlock My Entitlements',
        schemesFound: 'Schemes Found',
        resultsTitle: 'Haq Dashboard',
        totalEntitlement: 'Total Annual Entitlement Identified',
        perYear: '/ year',
        missingLine: 'You are currently missing ₹{amount}/month because these forms were never submitted.',
        benefit: 'Benefit Amount',
        whyQualify: 'Why you qualify',
        docsNeeded: 'Required Documents',
        applyDigilocker: 'Apply via DigiLocker / SSO',
        shareWhatsApp: 'Share via WhatsApp',
        badges: { dbt: 'DBT', state: 'State Priority', central: 'Central Scheme', health: 'Health Cover', onetime: 'One-Time Grant' },
        voiceTitle: 'Setu Saathi',
        voiceSubtext: 'Press the mic and share your details — in Hindi or Marwari',
        back: 'Back',
        startOver: 'Start Over',
        name: 'Name',
        age: 'Age / Gender',
        category: 'Category / Social Tier',
        land: 'Landholding / Profession',
        maskedId: 'Jan Aadhaar (Masked)',
        location: 'Location',
        privacyFull: '100% Client-Side Privacy / Zero ID Server Storage',
        preChecked: '(Pre-checked from your profile)',
        digilockerModal: 'Connects to DigiLocker SSO in production',
        showResults: 'Go to Dashboard',
    }
};


// ═══════════════════════════════════════════════════════════════
// DEMO PERSONA PROFILES
// ═══════════════════════════════════════════════════════════════
const PERSONAS = {
    farmer: {
        name: { hi: 'रामलाल मीणा', en: 'Ramlal Meena' },
        ageGender: { hi: '46 / पुरुष', en: '46 / Male' },
        category: { hi: 'BPL / जनजाति / ग्रामीण (आबूरोड, सिरोही)', en: 'BPL / Tribal / Rural (Abu Road, Sirohi)' },
        landOccupation: { hi: '1.4 हेक्टेयर / सीमांत किसान', en: '1.4 Hectares / Smallholder Farmer' },
        maskedId: 'XXXX-XXXX-8912',
        location: { hi: 'आबूरोड, सिरोही, राजस्थान', en: 'Abu Road, Sirohi, Rajasthan' },
        schemeIds: ['pmkisan', 'palanhar', 'tarbandi', 'ayushman', 'pmawas', 'scholarship'],
    },
    widow: {
        name: { hi: 'सुशीला देवी', en: 'Sushila Devi' },
        ageGender: { hi: '38 / महिला', en: '38 / Female' },
        category: { hi: 'BPL / OBC / ग्रामीण विधवा (आबूरोड)', en: 'BPL / OBC / Rural Widow (Abu Road)' },
        landOccupation: { hi: 'भूमिहीन / दैनिक मज़दूर', en: 'Landless / Daily Wage Labour' },
        maskedId: 'XXXX-XXXX-4501',
        location: { hi: 'आबूरोड, सिरोही, राजस्थान', en: 'Abu Road, Sirohi, Rajasthan' },
        schemeIds: ['palanhar', 'ayushman', 'pmawas', 'widow_pension', 'ujjwala', 'scholarship'],
    },
    student: {
        name: { hi: 'प्रिया कुमारी', en: 'Priya Kumari' },
        ageGender: { hi: '18 / महिला', en: '18 / Female' },
        category: { hi: 'BPL / SC / ग्रामीण (जयपुर)', en: 'BPL / SC / Rural (Jaipur)' },
        landOccupation: { hi: '— / 12वीं कक्षा (प्रथम पीढ़ी)', en: '— / 12th Grade (First Generation)' },
        maskedId: 'XXXX-XXXX-7723',
        location: { hi: 'जयपुर ग्रामीण, राजस्थान', en: 'Jaipur Rural, Rajasthan' },
        schemeIds: ['scholarship', 'ayushman', 'pmawas', 'palanhar'],
    },
};


// ═══════════════════════════════════════════════════════════════
// SCHEME DATA FIXTURES (6+ Real Schemes)
// ═══════════════════════════════════════════════════════════════
const SCHEMES_DB = {
    pmkisan: {
        id: 'pmkisan',
        nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
        nameEn: 'PM-Kisan Samman Nidhi',
        benefitAmountAnnual: 6000,
        benefitDisplay: { hi: '₹6,000 / वर्ष (3 किस्तों में)', en: '₹6,000/yr (in 3 installments)' },
        category: 'central',
        badgeKeys: ['dbt', 'central'],
        eligibilityCriteria: { hi: 'क्योंकि आप 2 हेक्टेयर से कम भूमि वाले सीमांत किसान हैं', en: 'Small farmer holding < 2 hectares of cultivable land' },
        requiredDocs: { hi: ['आधार कार्ड', 'खसरा/खतौनी', 'बैंक पासबुक'], en: ['Aadhaar Card', 'Khasra/Khatauni', 'Bank Passbook'] },
        directApplyUrl: 'https://pmkisan.gov.in/',
        icon: '🌾',
        color: 'from-emerald-500 to-emerald-700',
        match: 98,
    },
    palanhar: {
        id: 'palanhar',
        nameHi: 'राजस्थान पालनहार योजना',
        nameEn: 'Rajasthan Palanhar Yojana',
        benefitAmountAnnual: 18000,
        benefitDisplay: { hi: '₹18,000 / वर्ष (₹1,500/माह)', en: '₹18,000/yr (₹1,500/month)' },
        category: 'state',
        badgeKeys: ['state'],
        eligibilityCriteria: { hi: 'ग्रामीण वर्ग के आश्रित बच्चों के लिए पात्र', en: 'Eligible dependent children in rural category' },
        requiredDocs: { hi: ['जन आधार कार्ड', 'जाति प्रमाण पत्र', 'विद्यालय प्रमाण पत्र', 'बैंक खाता'], en: ['Jan Aadhaar Card', 'Caste Certificate', 'School Certificate', 'Bank Account'] },
        directApplyUrl: 'https://sje.rajasthan.gov.in/schemes/Palanhar.html',
        icon: '👨‍👧‍👦',
        color: 'from-pink-500 to-pink-700',
        match: 92,
    },
    tarbandi: {
        id: 'tarbandi',
        nameHi: 'राजस्थान तारबंदी सब्सिडी योजना',
        nameEn: 'Rajasthan Tarbandi Subsidy',
        benefitAmountAnnual: 48000,
        benefitDisplay: { hi: '₹48,000 तक (एक-बार अनुदान)', en: 'Up to ₹48,000 (One-time grant)' },
        category: 'state',
        badgeKeys: ['state', 'onetime'],
        eligibilityCriteria: { hi: 'सीमांत कृषकों के लिए फेंसिंग सहायता — 1.5 हेक्टेयर से कम भूमि', en: 'Fencing assistance for marginal cultivators with < 1.5 hectares' },
        requiredDocs: { hi: ['खसरा/खतौनी', 'आधार कार्ड', 'बैंक पासबुक', 'भूमि का नक्शा'], en: ['Khasra/Khatauni', 'Aadhaar Card', 'Bank Passbook', 'Land Map'] },
        directApplyUrl: 'https://rajkisan.rajasthan.gov.in/',
        icon: '🏗️',
        color: 'from-amber-500 to-amber-700',
        match: 88,
    },
    ayushman: {
        id: 'ayushman',
        nameHi: 'आयुष्मान भारत / मुख्यमंत्री आयुष्मान आरोग्य',
        nameEn: 'Ayushman Bharat / Mukhyamantri Ayushman Arogya',
        benefitAmountAnnual: 0,
        benefitDisplay: { hi: '₹25 लाख स्वास्थ्य कवर / परिवार / वर्ष', en: '₹25 Lakh Health Coverage / family / year' },
        category: 'central',
        badgeKeys: ['central', 'health'],
        eligibilityCriteria: { hi: 'NFSA राशन कार्ड धारक / BPL परिवार', en: 'Enrolled NFSA ration card holder / BPL family' },
        requiredDocs: { hi: ['राशन कार्ड', 'आधार कार्ड', 'जन आधार कार्ड'], en: ['Ration Card', 'Aadhaar Card', 'Jan Aadhaar Card'] },
        directApplyUrl: 'https://pmjay.gov.in/',
        icon: '🏥',
        color: 'from-blue-500 to-blue-700',
        match: 95,
    },
    pmawas: {
        id: 'pmawas',
        nameHi: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
        nameEn: 'PM Awas Yojana (Gramin)',
        benefitAmountAnnual: 130000,
        benefitDisplay: { hi: '₹1,30,000 (मैदानी) / ₹1,50,000 (पहाड़ी)', en: '₹1,30,000 (plains) / ₹1,50,000 (hilly)' },
        category: 'central',
        badgeKeys: ['central', 'dbt', 'onetime'],
        eligibilityCriteria: { hi: 'ग्रामीण BPL परिवार — पक्का मकान नहीं है', en: 'Rural BPL family without a pucca house' },
        requiredDocs: { hi: ['आधार कार्ड', 'BPL सूची', 'भूमि दस्तावेज़', 'फोटो', 'बैंक पासबुक'], en: ['Aadhaar Card', 'BPL List', 'Land Documents', 'Photo', 'Bank Passbook'] },
        directApplyUrl: 'https://pmayg.nic.in/',
        icon: '🏠',
        color: 'from-orange-500 to-orange-700',
        match: 90,
    },
    scholarship: {
        id: 'scholarship',
        nameHi: 'मुख्यमंत्री उच्च शिक्षा छात्रवृत्ति योजना',
        nameEn: 'CM Higher Education Scholarship (Rajasthan)',
        benefitAmountAnnual: 5000,
        benefitDisplay: { hi: '₹5,000 / वर्ष (10 माह)', en: '₹5,000/yr (10 months)' },
        category: 'state',
        badgeKeys: ['state', 'dbt'],
        eligibilityCriteria: { hi: 'राजस्थान बोर्ड 12वीं में न्यूनतम 60% अंक, परिवार आय ₹2.5 लाख से कम', en: 'Min 60% in Rajasthan Board 12th, family income < ₹2.5 lakh' },
        requiredDocs: { hi: ['12वीं मार्कशीट', 'जन आधार कार्ड', 'आय प्रमाण पत्र', 'बैंक खाता', 'फीस रसीद'], en: ['12th Marksheet', 'Jan Aadhaar Card', 'Income Certificate', 'Bank Account', 'Fee Receipt'] },
        directApplyUrl: 'https://hte.rajasthan.gov.in/',
        icon: '🎓',
        color: 'from-violet-500 to-violet-700',
        match: 85,
    },
    widow_pension: {
        id: 'widow_pension',
        nameHi: 'राजस्थान विधवा पेंशन योजना',
        nameEn: 'Rajasthan Widow Pension Scheme',
        benefitAmountAnnual: 18000,
        benefitDisplay: { hi: '₹1,500 / माह', en: '₹1,500/month' },
        category: 'state',
        badgeKeys: ['state', 'dbt'],
        eligibilityCriteria: { hi: '18+ आयु विधवा महिला, परिवार आय ₹48,000 से कम', en: 'Widow aged 18+, family income < ₹48,000' },
        requiredDocs: { hi: ['पति का मृत्यु प्रमाण पत्र', 'आधार कार्ड', 'जन आधार', 'बैंक पासबुक', 'आय प्रमाण पत्र'], en: ['Husband Death Certificate', 'Aadhaar Card', 'Jan Aadhaar', 'Bank Passbook', 'Income Certificate'] },
        directApplyUrl: 'https://ssp.rajasthan.gov.in/',
        icon: '🤲',
        color: 'from-rose-500 to-rose-700',
        match: 96,
    },
    ujjwala: {
        id: 'ujjwala',
        nameHi: 'प्रधानमंत्री उज्ज्वला योजना 2.0',
        nameEn: 'PM Ujjwala Yojana 2.0',
        benefitAmountAnnual: 0,
        benefitDisplay: { hi: 'मुफ्त LPG कनेक्शन + पहली रीफिल', en: 'Free LPG Connection + First Refill' },
        category: 'central',
        badgeKeys: ['central', 'onetime'],
        eligibilityCriteria: { hi: 'BPL परिवार की महिला प्रमुख — LPG कनेक्शन नहीं है', en: 'Female head of BPL family — no existing LPG connection' },
        requiredDocs: { hi: ['आधार कार्ड', 'BPL राशन कार्ड', 'बैंक पासबुक', 'पासपोर्ट फोटो'], en: ['Aadhaar Card', 'BPL Ration Card', 'Bank Passbook', 'Passport Photo'] },
        directApplyUrl: 'https://www.pmujjwalayojana.com/',
        icon: '🔥',
        color: 'from-cyan-500 to-cyan-700',
        match: 93,
    },
};


// ═══════════════════════════════════════════════════════════════
// VOICE Q&A SEQUENCE
// ═══════════════════════════════════════════════════════════════
const VOICE_QA = [
    {
        q: { hi: 'नमस्ते रामलाल जी! आपकी उम्र कितनी है और आपके पास कितनी ज़मीन है?', en: 'Namaste Ramlal ji! What is your age and how much land do you have?' },
        a: { hi: 'मेरी उम्र 46 साल है और आबूरोड में 3 बीघा ज़मीन है।', en: 'I am 46 years old and I have 3 bigha land in Abu Road.' },
    },
    {
        q: { hi: 'आपके परिवार में कितने सदस्य हैं? और क्या आपके बच्चे स्कूल जाते हैं?', en: 'How many family members do you have? Do your children go to school?' },
        a: { hi: 'परिवार में 5 सदस्य हैं, दो बच्चे स्कूल जाते हैं।', en: 'We are 5 family members, two children go to school.' },
    },
    {
        q: { hi: 'क्या आपके पास राशन कार्ड है? BPL या APL?', en: 'Do you have a ration card? BPL or APL?' },
        a: { hi: 'हाँ, BPL राशन कार्ड है।', en: 'Yes, I have a BPL ration card.' },
    },
    {
        q: { hi: 'बधाई हो! 🎉 आपकी प्रोफ़ाइल के अनुसार आप पीएम-किसान, तारबंदी योजना, और आयुष्मान भारत के सीधे पात्र हैं। कुल लाभ: ₹54,000+ प्रति वर्ष।', en: 'Congratulations! 🎉 Based on your profile, you directly qualify for PM-Kisan, Tarbandi Yojana, and Ayushman Bharat. Total benefit: ₹54,000+/year.' },
        a: null,
    },
];


// ═══════════════════════════════════════════════════════════════
// UTILITY: Animated Counter
// ═══════════════════════════════════════════════════════════════
function useCountUp(target, duration = 2000, enabled = true) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!enabled) return;
        let start = 0;
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, enabled]);
    return value;
}


// ═══════════════════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════════════════
function Confetti({ show }) {
    if (!show) return null;
    const colors = ['#FF9933', '#1E3A5F', '#046A38', '#FFD700', '#FF6B6B', '#4ECDC4', '#FFF'];
    const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
    })), []);
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {pieces.map(p => (
                <div key={p.id} className="confetti-piece"
                    style={{
                        left: `${p.left}%`,
                        width: p.shape === 'circle' ? p.size : p.size * 0.6,
                        height: p.size,
                        borderRadius: p.shape === 'circle' ? '50%' : '2px',
                        background: p.color,
                        animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
                    }} />
            ))}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// ANIMATED CHECKMARK
// ═══════════════════════════════════════════════════════════════
function AnimatedCheckmark() {
    return (
        <div className="flex justify-center my-5">
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="32" fill="none" stroke="#15803D" strokeWidth="3"
                    strokeDasharray="230" style={{ animation: 'checkCircle 0.6s ease forwards' }} />
                <path d="M22 38 L30 46 L50 24" fill="none" stroke="#15803D" strokeWidth="4"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="50" style={{ animation: 'checkDraw 0.4s ease 0.5s forwards', strokeDashoffset: 50 }} />
            </svg>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
             style={{ animation: 'fadeIn 0.25s ease forwards' }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 z-10"
                 style={{ animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-navy transition-colors">
                    <ICONS.X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════
function Navbar({ lang, setLang, showBack, onBack }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-navy/5 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Left: Back or Logo */}
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button onClick={onBack} className="flex items-center gap-1 text-navy/60 hover:text-saffron transition-colors text-sm font-medium mr-2">
                            <ICONS.ArrowLeft size={16} />
                            <span className="hidden sm:inline">{STRINGS[lang].back}</span>
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        {/* Ashoka Emblem motif */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-navyLight flex items-center justify-center shadow-md">
                            <ICONS.Landmark size={14} className="text-white" />
                        </div>
                        <div>
                            <span className="font-extrabold text-navy text-sm tracking-tight">{STRINGS[lang].logoName}</span>
                            <span className="text-[10px] text-saffron font-semibold tracking-widest ml-1 hidden sm:inline">योजना सेतु</span>
                        </div>
                    </div>
                </div>

                {/* Center: Partnership badges */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-[9px] text-navy/30 font-medium bg-navy/5 px-2 py-0.5 rounded-full">iStart Rajasthan</span>
                    <span className="text-[9px] text-navy/30 font-medium bg-navy/5 px-2 py-0.5 rounded-full">Viksit Bharat</span>
                </div>

                {/* Right: Language toggle */}
                <button onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
                    className="flex items-center gap-1.5 bg-cream border border-navy/8 rounded-full px-3 py-1.5 hover:border-saffron/40 transition-all duration-300 text-xs font-bold">
                    <span className={`transition-all duration-300 ${lang === 'hi' ? 'text-saffron' : 'text-navy/30'}`}>हि</span>
                    <div className="w-8 h-4 bg-navy/10 rounded-full relative">
                        <div className={`absolute top-0.5 w-3 h-3 bg-saffron rounded-full transition-all duration-300 shadow ${lang === 'hi' ? 'left-0.5' : 'left-[18px]'}`} />
                    </div>
                    <span className={`transition-all duration-300 ${lang === 'en' ? 'text-navy' : 'text-navy/30'}`}>EN</span>
                </button>
            </div>
        </nav>
    );
}


// ═══════════════════════════════════════════════════════════════
// PRIVACY BADGE
// ═══════════════════════════════════════════════════════════════
function PrivacyBadge({ lang }) {
    return (
        <div className="flex items-center gap-2 bg-forest/5 border border-forest/10 rounded-full px-4 py-2 text-xs text-forest font-medium">
            <ICONS.ShieldCheck size={14} className="text-forest shrink-0" />
            <span>{STRINGS[lang].privacyFull}</span>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// FLOATING SETU SAATHI BUTTON
// ═══════════════════════════════════════════════════════════════
function FloatingVoiceBtn({ onClick, lang }) {
    return (
        <button onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-saffron to-saffronDark text-white shadow-xl shadow-saffron/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group"
            title={lang === 'hi' ? 'सेतु साथी से बात करें' : 'Talk to Setu Saathi'}>
            <ICONS.Mic size={22} />
            <div className="absolute inset-0 rounded-full border-2 border-saffron/50 pulse-ring" />
        </button>
    );
}


// ═══════════════════════════════════════════════════════════════
// STATE 1: HERO / LANDING
// ═══════════════════════════════════════════════════════════════
function LandingScreen({ lang, onScan, onVoice, onDemo }) {
    const t = STRINGS[lang];
    const schemeCount = useCountUp(4000, 2200);
    const croreCount = useCountUp(40000, 2500);

    return (
        <div className="screen-enter min-h-screen flex flex-col items-center px-4 pt-20 pb-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-14 left-0 w-full h-80 bg-gradient-to-b from-navy/[0.03] to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-saffron/[0.04] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-navy/[0.04] blur-3xl pointer-events-none" />

            {/* Emblem + Branding */}
            <div className="relative mb-6 mt-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-navy to-navyDark flex items-center justify-center shadow-2xl shadow-navy/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <ICONS.Landmark size={32} className="text-white" />
                </div>
                <div className="absolute -inset-4 rounded-2xl border-2 border-dashed border-saffron/20 animate-spin" style={{ animationDuration: '25s' }} />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-forest flex items-center justify-center">
                    <ICONS.CheckCircle2 size={12} className="text-white" />
                </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy text-center leading-tight mb-3 max-w-2xl">
                {t.headline}
            </h1>
            <p className="text-sm sm:text-base text-navy/50 text-center max-w-lg mb-6 leading-relaxed px-2">
                {t.subtext}
            </p>

            {/* Value Counter Banner */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-navy/[0.04] rounded-full px-5 py-2.5">
                    <ICONS.FileText size={16} className="text-saffron" />
                    <span className="text-lg font-black text-navy" style={{ animation: 'tickerGlow 2s ease infinite' }}>
                        {schemeCount.toLocaleString()}+
                    </span>
                    <span className="text-xs text-navy/50 font-medium">{t.schemesIndexed}</span>
                </div>
                <div className="flex items-center gap-2 bg-saffron/[0.06] rounded-full px-5 py-2.5">
                    <ICONS.TrendingUp size={16} className="text-forest" />
                    <span className="text-lg font-black text-navy" style={{ animation: 'tickerGlow 2s ease 0.5s infinite' }}>
                        ₹{croreCount.toLocaleString()}+
                    </span>
                    <span className="text-xs text-navy/50 font-medium">{t.unclaimedBenefits}</span>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col gap-3 w-full max-w-sm mb-8">
                <button onClick={onScan}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-saffron to-saffronDark text-white font-bold text-base py-4 px-6 rounded-2xl shadow-xl shadow-saffron/25 hover:shadow-2xl hover:shadow-saffron/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative overflow-hidden group">
                    <ICONS.Camera size={20} />
                    <span className="relative z-10">{t.scanBtn}</span>
                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </button>
                <button onClick={onVoice}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-navy/10 text-navy font-semibold text-base py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:border-saffron/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                    <ICONS.Mic size={20} className="text-saffron" />
                    <span>{t.voiceBtn}</span>
                </button>
            </div>

            {/* Quick-Demo Strip */}
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-3 justify-center">
                    <div className="h-px w-8 bg-navy/10" />
                    <span className="text-[11px] font-bold text-navy/30 tracking-wider uppercase">{t.tryDemo}</span>
                    <div className="h-px w-8 bg-navy/10" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {[
                        { key: 'farmer', label: t.demoA, icon: '🌾' },
                        { key: 'widow', label: t.demoB, icon: '👩' },
                        { key: 'student', label: t.demoC, icon: '🎓' },
                    ].map(d => (
                        <button key={d.key} onClick={() => onDemo(d.key)}
                            className="flex-1 flex items-center gap-2 bg-white border border-navy/8 rounded-xl px-3 py-2.5 text-left hover:border-saffron/40 hover:shadow-md transition-all duration-200 group">
                            <span className="text-lg">{d.icon}</span>
                            <span className="text-[11px] text-navy/60 font-medium leading-tight group-hover:text-navy transition-colors">{d.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Privacy Badge */}
            <div className="mt-8">
                <PrivacyBadge lang={lang} />
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// STATE 2: SIMULATED CAMERA SCANNER
// ═══════════════════════════════════════════════════════════════
function ScanScreen({ lang, onDone }) {
    const t = STRINGS[lang];
    const [step, setStep] = useState(0); // 0=viewfinder, 1=step1, 2=step2, 3=step3

    const startScan = () => {
        setStep(1);
        setTimeout(() => setStep(2), 900);
        setTimeout(() => setStep(3), 1800);
        setTimeout(() => onDone(), 2700);
    };

    const stepLabels = [t.scanStep1, t.scanStep2, t.scanStep3];

    return (
        <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12">
            {step === 0 ? (
                <div className="flex flex-col items-center w-full max-w-sm" style={{ animation: 'cardPop 0.5s ease both' }}>
                    {/* Viewfinder Frame */}
                    <div onClick={startScan}
                        className="w-full aspect-[3/4] bg-gradient-to-b from-navy/[0.03] to-navy/[0.06] rounded-3xl border-2 border-dashed border-navy/15 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group hover:border-saffron/50 transition-all duration-300 mb-6">
                        {/* Corner marks */}
                        {[['top-3 left-3', 'border-t-[3px] border-l-[3px] rounded-tl-lg'],
                          ['top-3 right-3', 'border-t-[3px] border-r-[3px] rounded-tr-lg'],
                          ['bottom-3 left-3', 'border-b-[3px] border-l-[3px] rounded-bl-lg'],
                          ['bottom-3 right-3', 'border-b-[3px] border-r-[3px] rounded-br-lg']
                        ].map(([pos, cls], i) => (
                            <div key={i} className={`absolute ${pos} w-10 h-10 ${cls} border-saffron`} />
                        ))}

                        {/* Fake document preview */}
                        <div className="w-40 h-56 bg-white rounded-xl shadow-lg p-3 mb-4 relative group-hover:scale-105 transition-transform duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-navy/10" />
                                <div className="flex-1 space-y-1"><div className="h-2 bg-navy/10 rounded w-full" /><div className="h-2 bg-navy/8 rounded w-3/4" /></div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <div className="w-12 h-14 bg-navy/8 rounded-lg" />
                                <div className="flex-1 space-y-1.5"><div className="h-2 bg-navy/8 rounded" /><div className="h-2 bg-navy/6 rounded w-4/5" /><div className="h-2 bg-navy/6 rounded w-3/5" /><div className="h-2 bg-navy/6 rounded w-2/3" /></div>
                            </div>
                            <div className="mt-3 space-y-1"><div className="h-2 bg-navy/6 rounded" /><div className="h-2 bg-saffron/15 rounded w-3/4" /></div>
                        </div>

                        <p className="text-navy/50 text-sm font-medium text-center px-6">
                            {lang === 'hi' ? 'दस्तावेज़ को फ्रेम में रखें और टैप करें' : 'Place document in frame and tap'}
                        </p>
                        <p className="text-navy/30 text-[11px] mt-1.5">
                            {lang === 'hi' ? 'जन आधार, राशन कार्ड, खसरा...' : 'Jan Aadhaar, Ration Card, Khasra...'}
                        </p>
                    </div>

                    <button onClick={startScan}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-navy to-navyLight text-white font-bold py-4 rounded-2xl shadow-xl shadow-navy/20 hover:shadow-2xl transition-all duration-300 text-base">
                        <ICONS.Camera size={20} />
                        {lang === 'hi' ? 'फोटो लें / अपलोड करें' : 'Capture / Upload'}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center" style={{ animation: 'cardPop 0.4s ease both' }}>
                    {/* Scanning Animation */}
                    <div className="w-64 sm:w-72 h-80 bg-white rounded-2xl shadow-2xl relative overflow-hidden mb-8 border border-navy/5">
                        {/* Fake doc skeleton */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded bg-navy/10" />
                                <div className="h-4 bg-navy/10 rounded w-2/3" />
                            </div>
                            <div className="h-3 bg-navy/6 rounded w-full" />
                            <div className="h-3 bg-navy/6 rounded w-5/6" />
                            <div className="flex gap-3 mt-3">
                                <div className="w-16 h-20 bg-navy/8 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-2.5 bg-navy/6 rounded" />
                                    <div className="h-2.5 bg-navy/6 rounded w-3/4" />
                                    <div className="h-2.5 bg-navy/6 rounded w-1/2" />
                                    <div className="h-2.5 bg-navy/6 rounded w-2/3" />
                                </div>
                            </div>
                            <div className="h-3 bg-navy/5 rounded w-full mt-3" />
                            <div className="h-3 bg-navy/5 rounded w-2/3" />
                            <div className="h-7 bg-saffron/10 rounded mt-3" />
                        </div>
                        {/* Laser scan line */}
                        <div className="scan-laser absolute left-0 w-full h-0.5 shadow-[0_0_15px_3px_rgba(255,153,51,0.6)]" style={{ background: 'linear-gradient(90deg, transparent, #FF9933, transparent)' }} />
                    </div>

                    {/* Multi-step progress */}
                    <div className="w-72 sm:w-80">
                        {stepLabels.map((label, i) => {
                            const stepNum = i + 1;
                            const active = step >= stepNum;
                            const current = step === stepNum;
                            return (
                                <div key={i} className={`flex items-start gap-3 mb-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-500 ${active ? (current ? 'bg-saffron' : 'bg-forest') : 'bg-navy/20'}`}>
                                        {active && !current ? (
                                            <ICONS.CheckCircle2 size={14} className="text-white" />
                                        ) : current ? (
                                            <ICONS.RefreshCw size={12} className="text-white animate-spin" />
                                        ) : (
                                            <span className="text-[10px] text-white font-bold">{stepNum}</span>
                                        )}
                                    </div>
                                    <p className={`text-xs leading-relaxed font-medium ${current ? 'text-navy' : 'text-navy/50'}`}>{label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress bar */}
                    <div className="w-72 sm:w-80 h-1.5 bg-navy/10 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-gradient-to-r from-saffron to-forest rounded-full" style={{ animation: 'progressFill 2.5s ease-in-out forwards' }} />
                    </div>

                    {/* Privacy badge inline */}
                    <div className="mt-6 text-center">
                        <p className="text-[11px] text-forest font-medium flex items-center gap-1.5 justify-center">
                            <ICONS.Lock size={12} />
                            {t.privacyBadge}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// STATE 3: EXTRACTED PROFILE VERIFICATION
// ═══════════════════════════════════════════════════════════════
function ProfileScreen({ lang, persona, onUnlock }) {
    const t = STRINGS[lang];
    const p = PERSONAS[persona];
    const [editing, setEditing] = useState(false);
    const matchedSchemes = p.schemeIds.filter(id => SCHEMES_DB[id]);

    const fields = [
        { label: t.name, value: p.name[lang], icon: <ICONS.Users size={16} className="text-navy/50" /> },
        { label: t.age, value: p.ageGender[lang], icon: '🎂' },
        { label: t.category, value: p.category[lang], icon: '📋' },
        { label: t.land, value: p.landOccupation[lang], icon: '🌾' },
        { label: t.maskedId, value: p.maskedId, icon: <ICONS.ShieldCheck size={16} className="text-forest" /> },
        { label: t.location, value: p.location[lang], icon: '📍' },
    ];

    return (
        <div className="screen-enter min-h-screen flex flex-col items-center px-4 pt-20 pb-12">
            <AnimatedCheckmark />

            <h2 className="text-xl sm:text-2xl font-bold text-navy mb-1 text-center">{t.profileTitle}</h2>
            <p className="text-navy/40 text-sm mb-6 text-center">{t.profileSubtext}</p>

            {/* Profile Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-navy/5 border border-navy/5 p-5 sm:p-6 mb-5 relative overflow-hidden">
                {/* Tricolor accent strip */}
                <div className="absolute top-0 left-0 right-0 h-1 flex">
                    <div className="flex-1 bg-saffron" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-forest" />
                </div>

                <div className="space-y-3.5 mt-1">
                    {fields.map((f, i) => (
                        <div key={i} className="flex items-center gap-3" style={{ animation: `cardPop 0.4s ease ${i * 0.07}s both` }}>
                            <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-base shrink-0">
                                {typeof f.icon === 'string' ? f.icon : f.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-navy/35 font-semibold uppercase tracking-wider">{f.label}</div>
                                {editing ? (
                                    <input className="w-full text-sm font-semibold text-navy border-b border-saffron/30 bg-transparent outline-none py-0.5 focus:border-saffron transition-colors" defaultValue={f.value} />
                                ) : (
                                    <div className="text-sm font-semibold text-navy">{f.value}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md space-y-3">
                <button onClick={() => setEditing(!editing)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-navy/8 text-navy/60 font-semibold hover:border-saffron/40 hover:text-saffron transition-all duration-300 text-sm">
                    <ICONS.Edit3 size={14} />
                    {editing ? t.saveBtn : t.editBtn}
                </button>
                <button onClick={onUnlock}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-saffron to-saffronDark text-white font-bold py-4 rounded-2xl shadow-xl shadow-saffron/25 hover:shadow-2xl hover:shadow-saffron/40 hover:-translate-y-0.5 transition-all duration-300 text-base relative overflow-hidden group">
                    <span className="relative z-10">{t.unlockBtn} ({matchedSchemes.length} {t.schemesFound}) →</span>
                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </button>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// SCHEME CARD (Expandable)
// ═══════════════════════════════════════════════════════════════
function SchemeCard({ scheme, lang, index, onApply }) {
    const t = STRINGS[lang];
    const [expanded, setExpanded] = useState(false);
    const s = scheme;
    const name = lang === 'hi' ? s.nameHi : s.nameEn;
    const benefit = s.benefitDisplay[lang];
    const reason = s.eligibilityCriteria[lang];
    const docs = s.requiredDocs[lang];

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-navy/5 border border-navy/5 overflow-hidden relative group hover:shadow-xl transition-all duration-300"
             style={{ animation: `cardPop 0.5s ease ${index * 0.1}s both` }}>
            {/* Top accent */}
            <div className={`h-1.5 bg-gradient-to-r ${s.color}`} />

            <div className="p-4 sm:p-5">
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-2xl mt-0.5">{s.icon}</span>
                        <div className="min-w-0">
                            <h3 className="font-bold text-navy text-sm sm:text-base leading-tight">{name}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {s.badgeKeys.map(bk => (
                                    <span key={bk} className="text-[9px] font-bold uppercase tracking-wider bg-navy/[0.04] text-navy/45 px-2 py-0.5 rounded-full">
                                        {t.badges[bk]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={`shrink-0 ml-2 w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                        <span className="text-white text-[10px] font-black">{s.match}%</span>
                    </div>
                </div>

                {/* Benefit */}
                <div className="bg-cream rounded-xl p-3 mb-3">
                    <div className="text-[10px] text-navy/35 font-semibold uppercase tracking-wider mb-0.5">{t.benefit}</div>
                    <div className="text-sm font-bold text-navy">{benefit}</div>
                </div>

                {/* Why you qualify */}
                <div className="flex items-start gap-2 mb-3">
                    <ICONS.CheckCircle2 size={14} className="text-forest shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] text-navy/35 font-semibold uppercase tracking-wider mb-0.5">{t.whyQualify}</div>
                        <p className="text-xs text-navy/60 leading-relaxed">{reason}</p>
                    </div>
                </div>

                {/* Expandable Documents Checklist */}
                <button onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-navy/[0.03] rounded-xl text-xs font-semibold text-navy/50 hover:bg-navy/[0.06] transition-colors mb-3">
                    <span>{t.docsNeeded} ({docs.length})</span>
                    {expanded ? <ICONS.ChevronUp size={14} /> : <ICONS.ChevronDown size={14} />}
                </button>

                {expanded && (
                    <div className="mb-3 pl-1" style={{ animation: 'cardPop 0.3s ease both' }}>
                        <p className="text-[10px] text-forest/60 mb-2 italic">{t.preChecked}</p>
                        {docs.map((doc, di) => (
                            <div key={di} className="flex items-center gap-2 py-1">
                                <div className="w-4 h-4 rounded border-2 border-forest bg-forest/10 flex items-center justify-center">
                                    <ICONS.CheckCircle2 size={10} className="text-forest" />
                                </div>
                                <span className="text-xs text-navy/60">{doc}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button onClick={() => onApply(s)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-navy text-white font-semibold text-xs hover:bg-navyLight transition-colors">
                        <ICONS.ExternalLink size={12} />
                        {t.applyDigilocker}
                    </button>
                    <button
                        onClick={() => {
                            const text = `${name}: ${benefit}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors shrink-0"
                        title={t.shareWhatsApp}>
                        <ICONS.Share2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// STATE 4: ENTITLEMENTS DASHBOARD ("Haq Dashboard")
// ═══════════════════════════════════════════════════════════════
function DashboardScreen({ lang, persona, onStartOver }) {
    const t = STRINGS[lang];
    const p = PERSONAS[persona];
    const [showConfetti, setShowConfetti] = useState(true);
    const [modalScheme, setModalScheme] = useState(null);

    const matchedSchemes = useMemo(() => p.schemeIds.map(id => SCHEMES_DB[id]).filter(Boolean), [persona]);

    const totalAnnual = useMemo(() =>
        matchedSchemes.reduce((sum, s) => sum + s.benefitAmountAnnual, 0),
    [matchedSchemes]);

    const animatedTotal = useCountUp(totalAnnual, 2000);
    const monthlyMissing = Math.round(totalAnnual / 12);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="screen-enter min-h-screen px-4 pt-20 pb-12 relative">
            <Confetti show={showConfetti} />

            <div className="max-w-2xl mx-auto">
                {/* Celebration Banner */}
                <div className="bg-gradient-to-br from-navy to-navyDark rounded-3xl p-5 sm:p-7 mb-6 relative overflow-hidden shadow-2xl shadow-navy/30"
                     style={{ animation: 'cardPop 0.6s ease both' }}>
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-saffron/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-forest/10 blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <ICONS.Award size={18} className="text-saffron" />
                            <span className="text-saffron text-xs font-bold uppercase tracking-wider">
                                {matchedSchemes.length} {t.schemesFound}!
                            </span>
                        </div>
                        <p className="text-white/60 text-xs mb-1">{t.totalEntitlement}</p>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl sm:text-4xl font-black text-white">₹{animatedTotal.toLocaleString()}</span>
                            <span className="text-white/50 text-sm font-medium">{t.perYear}</span>
                        </div>
                        {totalAnnual > 0 && (
                            <div className="bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
                                <p className="text-saffronLight text-xs font-medium flex items-center gap-1.5">
                                    <ICONS.AlertCircle size={13} />
                                    {t.missingLine.replace('{amount}', monthlyMissing.toLocaleString())}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scheme Cards Grid */}
                <div className="space-y-4 pb-6">
                    {matchedSchemes.map((s, i) => (
                        <SchemeCard key={s.id} scheme={s} lang={lang} index={i} onApply={setModalScheme} />
                    ))}
                </div>

                {/* Start Over */}
                <div className="text-center pb-8">
                    <button onClick={onStartOver}
                        className="inline-flex items-center gap-2 bg-white border-2 border-navy/8 text-navy font-semibold py-3 px-8 rounded-2xl hover:border-saffron/40 hover:text-saffron transition-all duration-300">
                        <ICONS.Home size={16} />
                        {t.startOver}
                    </button>
                </div>
            </div>

            {/* DigiLocker Modal */}
            <Modal open={!!modalScheme} onClose={() => setModalScheme(null)}>
                {modalScheme && (
                    <div className="text-center pt-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-navyLight flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <ICONS.ExternalLink size={24} className="text-white" />
                        </div>
                        <h3 className="font-bold text-navy text-lg mb-2">
                            {lang === 'hi' ? modalScheme.nameHi : modalScheme.nameEn}
                        </h3>
                        <p className="text-navy/50 text-sm mb-4">{t.digilockerModal}</p>
                        <div className="bg-cream rounded-xl p-4 mb-4 text-left">
                            <p className="text-[10px] text-navy/35 font-semibold uppercase tracking-wider mb-2">{t.docsNeeded}</p>
                            {modalScheme.requiredDocs[lang].map((doc, i) => (
                                <div key={i} className="flex items-center gap-2 py-1">
                                    <ICONS.CheckCircle2 size={12} className="text-forest" />
                                    <span className="text-xs text-navy/60">{doc}</span>
                                </div>
                            ))}
                        </div>
                        <a href={modalScheme.directApplyUrl} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 bg-gradient-to-r from-saffron to-saffronDark text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm">
                            <ICONS.ExternalLink size={14} />
                            {lang === 'hi' ? 'आधिकारिक पोर्टल खोलें' : 'Open Official Portal'}
                        </a>
                    </div>
                )}
            </Modal>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// STATE 5: VOICE MODE ("Setu Saathi")
// ═══════════════════════════════════════════════════════════════
function VoiceScreen({ lang, onDone }) {
    const t = STRINGS[lang];
    const [qaIndex, setQaIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [listening, setListening] = useState(false);
    const [showWave, setShowWave] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMessages([{ sender: 'bot', text: VOICE_QA[0].q[lang], id: Date.now() }]);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const handleMicClick = () => {
        if (listening) return;
        const currentQA = VOICE_QA[qaIndex];
        if (!currentQA || !currentQA.a) return;

        setListening(true);
        setShowWave(true);

        setTimeout(() => {
            setListening(false);
            setShowWave(false);
            setMessages(prev => [...prev, { sender: 'user', text: currentQA.a[lang], id: Date.now() }]);

            const nextIndex = qaIndex + 1;
            setQaIndex(nextIndex);

            setTimeout(() => {
                if (nextIndex < VOICE_QA.length) {
                    setMessages(prev => [...prev, { sender: 'bot', text: VOICE_QA[nextIndex].q[lang], id: Date.now() + 1 }]);
                    if (!VOICE_QA[nextIndex].a) {
                        // Final bot message — show button to dashboard
                    }
                }
            }, 500);
        }, 1800);
    };

    const isConversationDone = qaIndex >= VOICE_QA.length - 1 && messages.length >= VOICE_QA.length + (VOICE_QA.length - 1);

    return (
        <div className="screen-enter min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="text-center pt-20 pb-3 px-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffronDark flex items-center justify-center shadow-md">
                        <ICONS.Mic size={14} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-navy">{t.voiceTitle}</h2>
                </div>
                <p className="text-navy/40 text-xs">{t.voiceSubtext}</p>
            </div>

            {/* Chat area */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 pb-44 scrollbar-hide">
                <div className="max-w-md mx-auto space-y-3 pt-2">
                    {messages.map((msg) => (
                        <div key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            style={{ animation: 'cardPop 0.3s ease both' }}>
                            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                                msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-saffron to-saffronDark text-white rounded-br-md shadow-md'
                                    : 'bg-white border border-navy/8 text-navy shadow-sm rounded-bl-md'
                            }`}>
                                {msg.sender === 'bot' && (
                                    <span className="text-[10px] font-bold text-saffron block mb-1">🤖 Setu Saathi</span>
                                )}
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {listening && (
                        <div className="flex justify-end" style={{ animation: 'cardPop 0.3s ease both' }}>
                            <div className="bg-saffron/20 rounded-2xl rounded-br-md px-4 py-3">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(j => (
                                        <div key={j} className="w-2 h-2 bg-saffron/60 rounded-full"
                                            style={{ animation: `typingDot 1s ease ${j * 0.15}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Go to dashboard button */}
                    {isConversationDone && (
                        <div className="flex justify-center pt-4" style={{ animation: 'cardPop 0.5s ease both' }}>
                            <button onClick={onDone}
                                className="flex items-center gap-2 bg-gradient-to-r from-forest to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm">
                                <ICONS.ArrowRight size={16} />
                                {t.showResults}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mic button area */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-cream via-cream to-transparent pt-10 pb-8 flex flex-col items-center z-30">
                {/* Waveform */}
                {showWave && (
                    <div className="flex items-center justify-center gap-0.5 mb-4 h-8">
                        {Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className="w-[3px] bg-saffron rounded-full"
                                style={{
                                    height: '6px',
                                    animation: `wave 0.7s ease ${i * 0.04}s infinite`,
                                    maxHeight: '32px',
                                }} />
                        ))}
                    </div>
                )}

                <button onClick={handleMicClick}
                    disabled={listening || (qaIndex >= VOICE_QA.length - 1 && !VOICE_QA[qaIndex]?.a)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                        listening
                            ? 'bg-red-500 text-white shadow-red-500/30'
                            : qaIndex >= VOICE_QA.length
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-br from-saffron to-saffronDark text-white shadow-saffron/30 hover:scale-110 active:scale-95'
                    }`}
                    style={listening ? { animation: 'micPulse 1s ease infinite' } : {}}>
                    <ICONS.Mic size={24} />
                </button>
                <p className="text-[11px] text-navy/35 mt-2 font-medium">
                    {listening
                        ? (lang === 'hi' ? '🎙️ सुन रहे हैं...' : '🎙️ Listening...')
                        : (lang === 'hi' ? 'माइक दबाकर बोलें' : 'Press mic to speak')}
                </p>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// APP (State Machine Router)
// ═══════════════════════════════════════════════════════════════
function App() {
    const [screen, setScreen] = useState('landing'); // landing | scan | profile | dashboard | voice
    const [lang, setLang] = useState('hi');
    const [persona, setPersona] = useState('farmer');
    const [animKey, setAnimKey] = useState(0);

    const navigate = useCallback((target, newPersona) => {
        if (newPersona) setPersona(newPersona);
        setAnimKey(k => k + 1);
        setTimeout(() => setScreen(target), 40);
    }, []);

    const showBack = screen !== 'landing';
    const handleBack = useCallback(() => {
        const backMap = {
            scan: 'landing',
            profile: 'landing',
            dashboard: 'profile',
            voice: 'landing',
        };
        navigate(backMap[screen] || 'landing');
    }, [screen, navigate]);

    return (
        <div className="min-h-screen bg-cream relative overflow-x-hidden">
            <Navbar lang={lang} setLang={setLang} showBack={showBack} onBack={handleBack} />

            <div key={animKey}>
                {screen === 'landing' && (
                    <LandingScreen
                        lang={lang}
                        onScan={() => navigate('scan')}
                        onVoice={() => navigate('voice')}
                        onDemo={(key) => { setPersona(key); navigate('scan', key); }}
                    />
                )}
                {screen === 'scan' && (
                    <ScanScreen
                        lang={lang}
                        onDone={() => navigate('profile')}
                    />
                )}
                {screen === 'profile' && (
                    <ProfileScreen
                        lang={lang}
                        persona={persona}
                        onUnlock={() => navigate('dashboard')}
                    />
                )}
                {screen === 'dashboard' && (
                    <DashboardScreen
                        lang={lang}
                        persona={persona}
                        onStartOver={() => navigate('landing')}
                    />
                )}
                {screen === 'voice' && (
                    <VoiceScreen
                        lang={lang}
                        onDone={() => navigate('dashboard', 'farmer')}
                    />
                )}
            </div>

            {/* Floating Setu Saathi button (visible on non-voice screens) */}
            {screen !== 'voice' && (
                <FloatingVoiceBtn onClick={() => navigate('voice')} lang={lang} />
            )}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);