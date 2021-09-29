var prefix = '>';

module.exports = {
    setPrefix(newPrefix) {
        prefix = newPrefix;
    },
    getPrefix() {
        return prefix;
    }
}