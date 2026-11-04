import {BLOCKS_CUSTOM, Theme} from './index.js';

const STORAGE_KEY = 'tw:theme';

/**
 * @returns {Theme} default theme
 */
const defaultTheme = () => Theme.light;

/**
 * @returns {function} no-op cleanup; the default does not follow system theme
 */
const onSystemPreferenceChange = () => () => {};

/**
 * @returns {Theme} the theme
 */
const detectTheme = () => {
    const defaults = defaultTheme();

    try {
        const local = localStorage.getItem(STORAGE_KEY);

        // Migrate legacy preferences
        if (local === 'dark') {
            return Theme.dark;
        }
        if (local === 'light') {
            return Theme.light;
        }

        const parsed = JSON.parse(local);
        // Any invalid values in storage will be handled by Theme itself
        return new Theme(
            parsed.accent || defaults.accent,
            parsed.gui || defaults.gui,
            parsed.blocks || defaults.blocks
        );
    } catch (e) {
        // ignore
    }

    return defaults;
};

/**
 * @param {Theme} theme the theme
 */
const persistTheme = theme => {
    const defaults = defaultTheme();
    const nonDefaultSettings = {};

    if (theme.accent !== defaults.accent) {
        nonDefaultSettings.accent = theme.accent;
    }
    if (theme.gui !== defaults.gui) {
        nonDefaultSettings.gui = theme.gui;
    }
    // custom blocks are managed by addon at runtime, don't save here
    if (theme.blocks !== defaults.blocks && theme.blocks !== BLOCKS_CUSTOM) {
        nonDefaultSettings.blocks = theme.blocks;
    }

    if (Object.keys(nonDefaultSettings).length === 0) {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // ignore
        }
    } else {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nonDefaultSettings));
        } catch (e) {
            // ignore
        }
    }
};

export {
    onSystemPreferenceChange,
    detectTheme,
    persistTheme
};
