import translatePersianLibraryName from './translations/fa.js';

// Call only for built-in media library entries, never names in an opened project.
const translateLibraryName = (library, name, locale) => {
    if (!['sprites', 'backdrops', 'sounds'].includes(library) ||
        (locale || '').toLowerCase().split('-')[0] !== 'fa') return name;
    return translatePersianLibraryName(library, name);
};

export default translateLibraryName;
