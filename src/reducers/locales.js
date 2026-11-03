import {addLocaleData} from 'react-intl';

import locales, {localeData, isRtl, pickSupportedMessages, messageOverrides} from '../lib/supported-locales';
import allEditorMessages from '@turbowarp/scratch-l10n/locales/editor-msgs';
import addAdditionalTranslations from '../lib/tw-translations/index.js';

import {LANGUAGE_KEY} from '../lib/detect-locale.js';

const editorMessages = pickSupportedMessages(allEditorMessages);
addAdditionalTranslations(editorMessages);
Object.keys(editorMessages).forEach(locale => Object.assign(editorMessages[locale], messageOverrides[locale]));
addLocaleData(localeData);

const UPDATE_LOCALES = 'scratch-gui/locales/UPDATE_LOCALES';
const SELECT_LOCALE = 'scratch-gui/locales/SELECT_LOCALE';

const initialState = {
    isRtl: true,
    locale: 'fa',
    messagesByLocale: editorMessages,
    messages: editorMessages.fa
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SELECT_LOCALE:
        if (!Object.prototype.hasOwnProperty.call(locales, action.locale) ||
            !Object.prototype.hasOwnProperty.call(state.messagesByLocale, action.locale)) return state;
        return Object.assign({}, state, {
            isRtl: isRtl(action.locale),
            locale: action.locale,
            messagesByLocale: state.messagesByLocale,
            messages: state.messagesByLocale[action.locale]
        });
    case UPDATE_LOCALES:
        return Object.assign({}, state, {
            isRtl: state.isRtl,
            locale: state.locale,
            messagesByLocale: {...state.messagesByLocale, ...pickSupportedMessages(action.messagesByLocale)},
            messages: action.messagesByLocale[state.locale] || state.messages
        });
    default:
        return state;
    }
};

const selectLocale = function (locale) {
    // tw: store language in localStorage
    try {
        if (Object.prototype.hasOwnProperty.call(locales, locale)) localStorage.setItem(LANGUAGE_KEY, locale);
    } catch (e) { /* ignore */ }
    return {
        type: SELECT_LOCALE,
        locale: locale
    };
};

const setLocales = function (localesMessages) {
    return {
        type: UPDATE_LOCALES,
        messagesByLocale: localesMessages
    };
};
const initLocale = function (currentState, locale) {
    if (Object.prototype.hasOwnProperty.call(locales, locale) &&
        Object.prototype.hasOwnProperty.call(currentState.messagesByLocale, locale)) {
        return Object.assign(
            {},
            currentState,
            {
                isRtl: isRtl(locale),
                locale: locale,
                messagesByLocale: currentState.messagesByLocale,
                messages: currentState.messagesByLocale[locale]
            }
        );
    }
    // don't change locale if it's not in the current messages
    return currentState;
};
export {
    reducer as default,
    initialState as localesInitialState,
    initLocale,
    selectLocale,
    setLocales
};
