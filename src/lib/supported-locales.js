import arData from '@turbowarp/scratch-l10n/src/locale-data/ar.js';
import enData from '@turbowarp/scratch-l10n/src/locale-data/en.js';
import faData from '@turbowarp/scratch-l10n/src/locale-data/fa.js';
import codes from './supported-locale-codes.json';
import settingsMessages from './tw-translations/custom-settings.json';
import packagerMessages from './tw-translations/packager.json';

const locales = {ar: {name: 'العربية'}, en: {name: 'English'}, fa: {name: 'فارسی'}};
const localeData = [].concat(arData, enData, faData);
const localeMap = {};
const isRtl = locale => locale === 'ar' || locale === 'fa';
const pickSupportedMessages = messages => codes.reduce((selected, locale) => {
    if (Object.prototype.hasOwnProperty.call(messages, locale)) selected[locale] = messages[locale];
    return selected;
}, {});
const messageOverrides = {
    ar: {
        ...settingsMessages.ar,
        ...packagerMessages.ar,
        'tw.menuBar.advanced': 'متقدم',
        'gui.menuBar.language': 'اللغة',
        'gui.aria.languageMenu': 'اختيار اللغة',
        'gui.defaultProject.meow': 'مواء'
    },
    en: {},
    fa: {
        ...settingsMessages.fa,
        ...packagerMessages.fa,
        'tw.menuBar.advanced': 'پیشرفته',
        'gui.menuBar.language': 'زبان',
        'gui.aria.languageMenu': 'انتخاب زبان',
        'gui.defaultProject.meow': 'میو'
    }
};

export {locales as default, localeData, localeMap, isRtl, pickSupportedMessages, messageOverrides};
