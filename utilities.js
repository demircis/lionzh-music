const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration);

module.exports = {
    secondsToHHMMSS(seconds) {
        var milliseconds = parseInt(seconds) * 1000;
        return dayjs.duration(milliseconds).format('HH:mm:ss').replace(/^00:/, '');
    }
}