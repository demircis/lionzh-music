const events = require('events');

var prefix = '>';
const em = new events.EventEmitter();

module.exports = {
    eventEmitter: em,
    setPrefix(newPrefix) {
        prefix = newPrefix;
        em.emit('updatePrefix', newPrefix);
    },
    getPrefix() {
        return prefix;
    }
}