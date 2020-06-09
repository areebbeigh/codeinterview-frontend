import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import Emitter from 'lib/emitter';

interface ISyncManager {
  streams: { [peerId: string]: MediaStream };
  streamData: {
    video: MediaStreamTrack;
    audio: MediaStreamTrack;
  };
  stream: MediaStream;
  peerId: string;
  profiles: { [peerId: string]: Profile };
  profile: Profile;
  doc: Y.Doc;
  webrtcProvider: typeof WebrtcProvider;
  checkPeerId(): void;
  getWebrtcConns(): any[];
  getPeers(): any[];
  getPeerById(peerId: string): any;
  getPeerIds(): string[];
  getStream(peerId: string): MediaStream | null;
  getUserMedia(): Promise<MediaStream>;
  getWebrtcConns(): any[];
  releaseUserMedia(): void;
  setProfile(profile: Profile): void;
  setStream(stream: MediaStream): void;
  toggleLocalAudio(): void;
  toggleLocalVideo(): void;
}

class SyncManager extends Emitter implements ISyncManager {
  streams: { [peerId: string]: MediaStream } = {};

  streamData: {
    video: MediaStreamTrack;
    audio: MediaStreamTrack;
  };

  stream: MediaStream;

  peerId: string;

  profiles: { [peerId: string]: Profile } = {};

  profile: Profile;

  doc: Y.Doc;

  webrtcProvider: typeof WebrtcProvider;

  constructor(roomId: string) {
    super();
    this.doc = new Y.Doc();
    const webrtcProvider = new WebrtcProvider(
      `codeinterview-${roomId}`,
      this.doc,
      {
        // don't use broadcast connections between browser windows.
        // https://github.com/yjs/y-webrtc/issues/10
        filterBcConns: false,
        maxConns: Number.POSITIVE_INFINITY,
      }
    );
    this.webrtcProvider = webrtcProvider;

    webrtcProvider.on('peers', (info: any) => {
      console.log(info);
      const added = Array.from(info.added);
      const removed = Array.from(info.removed);

      removed.forEach((peerId: string) => {
        delete this.profiles[peerId];
        this.emit('profiles', this.profiles);
        delete this.streams[peerId];
      });

      added.forEach((peerId: string) => {
        const peerConn = this.getPeerById(peerId);
        if (peerConn) {
          // exchange user profile data
          peerConn.peer.on('data', (data: any) => {
            let dataJson: any;
            try {
              dataJson = JSON.parse(data.toString());
            } catch (err) {
              return;
            }
            const {
              type,
              profileData,
            }: { type: string; profileData: Profile } = dataJson;
            if (type === 'profile-data') {
              this.profiles[peerId] = {
                ...profileData,
                peerId,
              };
              this.emit('profiles', this.profiles);
            }
          });
          // send newly connected peer our profile
          peerConn.peer.on('connect', () => {
            peerConn.peer.send(
              JSON.stringify({
                type: 'profile-data',
                profileData: this.profile,
              })
            );
          });
          // exchange stream data
          if (this.stream) {
            peerConn.peer.addStream(this.stream);
          }
          // receive peer streams
          peerConn.peer.on('stream', (stream: MediaStream) => {
            console.log('got peer stream', peerId, stream);
            this.streams[peerId] = stream;
            this.emit('stream', { peerId, stream });
          });
        } else {
          console.warn(
            'Peer added but cannot find connection object',
            peerId,
            info
          );
        }
      });

      this.checkPeerId();
      this.emit('peers', {});
    });

    webrtcProvider.on('synced', info => {
      console.log('synced', info);
      this.checkPeerId();
      this.emit('ready', { peerId: this.peerId });
    });
  }

  checkPeerId(): void {
    if (!this.peerId) {
      this.peerId = this.webrtcProvider.room.peerId;
      if (this.peerId) {
        this.emit('peerId', this.peerId);
      }
    }
  }

  getWebrtcConns(): any {
    return this.webrtcProvider?.room?.webrtcConns;
  }

  getPeers(): any[] {
    return Array.from(this.getWebrtcConns()?.values() || []);
  }

  getPeerById(id: string): any {
    return this.getWebrtcConns()?.get(id) || null;
  }

  getPeerIds(): string[] {
    try {
      return Array.from(this.getWebrtcConns()?.keys() || []);
    } catch (err) {
      console.warn('getPeerList error:', err);
    }
    return [];
  }

  getStream(peerId: string): MediaStream | null {
    try {
      return this.streams[peerId];
    } catch (err) {
      console.warn('getStream error:', err);
    }
    return null;
  }

  getUserMedia(): Promise<MediaStream> {
    return new Promise(
      (resolve: (stream: MediaStream) => void, reject) => {
        const options = {
          audio: true,
          video: {
            facingMode: 'user',
            video: {
              width: { ideal: 640 },
              height: { ideal: 360 },
            },
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: {
              min: 1,
              ideal: 15,
            },
          },
        };
        try {
          navigator.mediaDevices
            .getUserMedia(options)
            .then(resolve)
            .catch(reject);
        } catch (err) {
          reject(err);
        }
      }
    ).then(stream => {
      this.setStream(stream);
      return stream;
    });
  }

  releaseUserMedia(): void {
    this.stream.getTracks().map(track => track.stop());
    this.stream = null!;
  }

  toggleLocalAudio(): void {
    const { audio } = this.streamData;
    audio.enabled = !audio.enabled;
  }

  toggleLocalVideo(): void {
    const { video } = this.streamData;
    video.enabled = !video.enabled;
  }

  setStream(stream: MediaStream): void {
    this.stream = stream;
    this.streamData = {
      audio: stream.getAudioTracks()[0],
      video: stream.getVideoTracks()[0],
    };
    const peerConns = this.getPeers();
    peerConns.forEach(conn => {
      conn.peer.addStream(stream);
    });
  }

  setProfile(profile: Profile): void {
    this.profile = profile;
    this.on('peerId', peerId => {
      this.profiles[peerId] = profile;
    });
    const peerConns = this.getPeers();
    peerConns.forEach(conn => {
      conn.peer.send(
        JSON.stringify({
          type: 'profile-data',
          profile,
        })
      );
    });
    this.emit('profiles', this.profiles);
  }
}

export function setupSync(roomId: string): SyncManager {
  return new SyncManager(roomId);
}

export default SyncManager;
