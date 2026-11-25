import { CENTRAL_SCHEMES } from './centralSchemes.js';
import { RAJASTHAN_SCHEMES } from './rajasthanSchemes.js';
import { CENTRAL_EXTRA_RAW } from './centralSchemesExtra.js';
import { CENTRAL_EXTRA2_RAW } from './centralSchemesExtra2.js';
import { RAJASTHAN_EXTRA_RAW } from './rajasthanSchemesExtra.js';
import { RAJASTHAN_EXTRA2_RAW } from './rajasthanSchemesExtra2.js';

const DEFAULT_DOCS = {
    hi: ['आधार कार्ड', 'जन आधार / राशन कार्ड', 'बैंक पासबुक'],
    en: ['Aadhaar Card', 'Jan Aadhaar / Ration Card', 'Bank Passbook'],
};

/**
 * Hydrates compact tuple entries:
 * [id, type, nameHi, nameEn, benefitAmountAnnual, benefitHi, benefitEn, reasonHi, reasonEn, url, iconKey, tags]
 */
function hydrateSchemes(rawList, level) {
    const out = {};
    for (const item of rawList) {
        const [
            id,
            type,
            nameHi,
            nameEn,
            benefitAmountAnnual,
            benefitHi,
            benefitEn,
            reasonHi,
            reasonEn,
            url,
            iconKey,
            tags,
        ] = item;
        out[id] = {
            id,
            type,
            level,
            nameHi,
            nameEn,
            benefitAmountAnnual,
            benefitDisplay: { hi: benefitHi, en: benefitEn },
            reason: { hi: reasonHi, en: reasonEn },
            docs: DEFAULT_DOCS,
            url,
            iconKey,
            tags,
        };
    }
    return out;
}

const ALL_CENTRAL = {
    ...CENTRAL_SCHEMES,
    ...hydrateSchemes(CENTRAL_EXTRA_RAW, 'central'),
    ...hydrateSchemes(CENTRAL_EXTRA2_RAW, 'central'),
};

const ALL_RAJASTHAN = {
    ...RAJASTHAN_SCHEMES,
    ...hydrateSchemes(RAJASTHAN_EXTRA_RAW, 'state'),
    ...hydrateSchemes(RAJASTHAN_EXTRA2_RAW, 'state'),
};

/**
 * Unified Catalog of Verified Central & Rajasthan Government Welfare Schemes
 */
export const SCHEMES_DB = {
    ...ALL_CENTRAL,
    ...ALL_RAJASTHAN,
};

export const SCHEMES_LIST = Object.values(SCHEMES_DB);
export const CENTRAL_SCHEMES_COUNT = Object.keys(ALL_CENTRAL).length;
export const RAJASTHAN_SCHEMES_COUNT = Object.keys(ALL_RAJASTHAN).length;
export const TOTAL_SCHEMES_COUNT = SCHEMES_LIST.length;

/**
 * Matches relevant schemes dynamically from extracted OCR text or persona tags.
 */
export function matchSchemesByTags(tags = []) {
    const tagSet = new Set(tags);
    const matched = SCHEMES_LIST.filter((scheme) =>
        scheme.tags?.some((t) => tagSet.has(t))
    );
    return matched.map((s) => s.id);
}
