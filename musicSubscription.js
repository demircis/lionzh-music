const { createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = class MusicSubscription {
    voiceConnection;
    audioPlayer;

    constructor(voiceConnection) {
        this.voiceConnection = voiceConnection;
        this.voiceConnection.on('stateChange', (oldState, newState) => {
            console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
        });
        
        this.audioPlayer = createAudioPlayer();
        this.voiceConnection.subscribe(this.audioPlayer);
        this.audioPlayer.on('error', error => {
            console.error(error.stack);
        });
        this.audioPlayer.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => setTimeout(() => this.voiceConnection.destroy(), BOT_TIMEOUT));
    }

    playTrack(audioResource) {
        this.audioPlayer.play(audioResource);
    }

}
