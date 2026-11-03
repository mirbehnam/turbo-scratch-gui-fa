const codes = require('../../src/lib/supported-locale-codes.json');

module.exports = function (source) {
    const retained = new Set();
    const result = source.replace(/\r\n/g, '\n').replace(
        /Blockly\.ScratchMsgs\.locales\["([^"]+)"\] =\s*\{[\s\S]*?\n\};/g,
        (assignment, locale) => {
            if (!codes.includes(locale)) return '';
            retained.add(locale);
            return assignment;
        }
    );
    if (codes.some(locale => !retained.has(locale))) {
        throw new Error(
            `Scratch Blocks translations could not be restricted to ${codes.join(', ')}: ${this.resourcePath}`
        );
    }
    return result;
};
