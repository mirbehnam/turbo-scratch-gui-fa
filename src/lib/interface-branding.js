const names = {fa: 'اسکرچ فارسی', ar: 'سكراتش الفارسي', en: 'Scratch Farsi'};

export const rebrandInterfaceMessages = (messages, locale) => {
    const result = {};
    for (const [id, value] of Object.entries(messages)) {
        result[id] = value.replace(/https?:\/\/[^\s<>"']+|\b(?:TurboWarp|Turboarp)\b/g,
            match => (match.startsWith('http') ? match : names[locale] || names.en));
    }
    return result;
};
