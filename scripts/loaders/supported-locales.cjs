const codes = require('../../src/lib/supported-locale-codes.json');

module.exports = function (source) {
    const json = source.replace(/^[\s\S]*?export default\s*/, '').replace(/;\s*$/, '');
    let messages;
    try {
        messages = JSON.parse(json);
    } catch (error) {
        throw new Error(`Cannot filter locale dictionary ${this.resourcePath}: ${error.message}`);
    }
    const selected = {};
    for (const locale of codes) {
        if (Object.prototype.hasOwnProperty.call(messages, locale)) selected[locale] = messages[locale];
    }
    return `export default ${JSON.stringify(selected)};`;
};
