/**
 * @fileoverview
 * Resolve an explicit language choice or the Persian application default.
 */

import queryString from 'query-string';

// tw: read language from localStorage
export const LANGUAGE_KEY = 'tw:language';

/**
 * Prefer a supported URL language, then a saved choice, then Persian.
 * @param {Array.string} supportedLocales An array of supported locale codes.
 * @return {string} the preferred locale
 */
const detectLocale = supportedLocales => {
    const queryParams = queryString.parse(location.search);
    const requested = [].concat(queryParams.locale, queryParams.lang).filter(Boolean);
    if (requested.length) {
        const locale = requested[0].toLowerCase();
        if (supportedLocales.includes(locale)) return locale;
    }
    // tw: read language from localStorage
    try {
        const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
        if (storedLanguage && supportedLocales.includes(storedLanguage)) {
            return storedLanguage;
        }
    } catch (e) { /* ignore */ }

    return 'fa';
};

export {
    detectLocale
};
