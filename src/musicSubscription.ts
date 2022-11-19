import {
  createAudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  VoiceConnectionDisconnectReason,
  VoiceConnection,
  AudioPlayer,
} from "@discordjs/voice";
import RequestedTrack from "./requestedTrack";

const DEBUG = true;

const waitTimeout = 15e3;

export default class MusicSubscription {
  voiceConnection: VoiceConnection;
  audioPlayer: AudioPlayer;
  queue: RequestedTrack[];
  queueLock: boolean = false;
  nextTrack: RequestedTrack | null = null;

  constructor(voiceConnection: VoiceConnection) {
    this.voiceConnection = voiceConnection;
    this.voiceConnection.on("stateChange", async (oldState, newState) => {
      DEBUG &&
        console.log(
          `Connection transitioned from ${oldState.status} to ${newState.status}`
        );
      if (newState.status == VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason == VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Connecting,
              waitTimeout
            );
          } catch {
            this.voiceConnection.destroy();
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
          setTimeout(() => {},
          (this.voiceConnection.rejoinAttempts + 1) * waitTimeout);
          this.voiceConnection.rejoin();
        } else {
          this.voiceConnection.destroy();
        }
      } else if (
        newState.status == VoiceConnectionStatus.Signalling ||
        newState.status == VoiceConnectionStatus.Connecting
      ) {
        try {
          await entersState(
            this.voiceConnection,
            VoiceConnectionStatus.Ready,
            waitTimeout
          );
        } catch {
          if (
            this.voiceConnection.state.status != VoiceConnectionStatus.Destroyed
          )
            this.voiceConnection.destroy();
        }
      } else if (newState.status == VoiceConnectionStatus.Destroyed) {
        this.stop();
      }
    });

    this.audioPlayer = createAudioPlayer();
    this.audioPlayer.on("stateChange", (oldState, newState) => {
      DEBUG &&
        console.log(
          `Audio player transitioned from ${oldState.status} to ${newState.status}`
        );
      if (
        oldState.status != AudioPlayerStatus.Idle &&
        newState.status == AudioPlayerStatus.Idle
      ) {
        this.processQueue();
      }
    });
    this.audioPlayer.on("error", (error) => {
      console.error(error);
    });

    this.voiceConnection.subscribe(this.audioPlayer);
    this.queue = [];
  }

  async enqueue(track: RequestedTrack) {
    const pos = this.queue.push(track);
    await this.processQueue();
    return pos;
  }

  pauseTrack() {
    this.audioPlayer.pause();
  }

  resumeTrack() {
    this.audioPlayer.unpause();
  }

  async skipTrack() {
    this.audioPlayer.stop(true);
  }

  stop() {
    this.queueLock = true;
    this.queue = [];
    this.audioPlayer.stop(true);
  }

  async processQueue() {
    this.nextTrack = this.queue.length != 0 ? this.queue[0] : null;

    if (
      this.queueLock ||
      this.audioPlayer.state.status != AudioPlayerStatus.Idle ||
      this.queue.length == 0
    ) {
      return;
    }

    this.queueLock = true;

    const track = this.queue.shift();
    try {
      const resource = await track?.createAudioResource();
      if (resource) {
        this.audioPlayer.play(resource);
      }
      this.queueLock = false;
    } catch (error) {
      console.error(error);
      this.queueLock = false;
      await this.processQueue();
    }
  }
}
