import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import Emitter from 'lib/emitter';

class SyncManager extends Emitter {
  streams = {};

  profiles = {};

  constructor(roomId) {
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

    webrtcProvider.on('peers', info => {
      console.log(info);
      const added = Array.from(info.added);
      const removed = Array.from(info.removed);

      removed.forEach(peerId => {
        delete this.profiles[peerId];
        this.emit('profiles', this.profiles);
        delete this.streams[peerId];
      });

      added.forEach(peerId => {
        const peerConn = this.getPeerById(peerId);
        if (peerConn) {
          // exchange user profile data
          peerConn.peer.on('data', data => {
            let dataJson = null;
            try {
              dataJson = JSON.parse(data.toString());
            } catch (err) {
              return;
            }
            const { type, profileData } = dataJson;
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
          peerConn.peer.on('stream', stream => {
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
      this.emit('peers');
    });

    webrtcProvider.on('synced', info => {
      console.log('synced', info);
      this.checkPeerId();
      this.emit('ready', { peerId: this.peerId });
    });
  }

  checkPeerId() {
    if (!this.peerId) {
      this.peerId = this.webrtcProvider.room.peerId;
      if (this.peerId) {
        this.emit('peerId', this.peerId);
      }
    }
  }

  getWebrtcConns() {
    return this.webrtcProvider?.room?.webrtcConns;
  }

  getPeers() {
    return Array.from(this.getWebrtcConns()?.values() || []);
  }

  getPeerById(id) {
    return this.getWebrtcConns()?.get(id) || null;
  }

  getPeerIds() {
    try {
      return Array.from(this.getWebrtcConns()?.keys() || []);
    } catch (err) {
      console.warn('getPeerList error:', err);
    }
    return [];
  }

  getStream(peerId) {
    try {
      return this.streams[peerId];
    } catch (err) {
      console.warn('getStream error:', err);
    }
    return null;
  }

  getUserMedia() {
    return new Promise((resolve, reject) => {
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
    }).then(stream => {
      this.setStream(stream);
      return stream;
    });
  }

  releaseUserMedia() {
    this.stream.getTracks().map(track => track.stop());
    this.stream = null;
  }

  toggleLocalAudio() {
    const { audio } = this.streamData;
    audio.enabled = !audio.enabled;
  }

  toggleLocalVideo() {
    const { video } = this.streamData;
    video.enabled = !video.enabled;
  }

  setStream(stream) {
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

  setProfile(profile) {
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

export function setupSync(roomId) {
  return new SyncManager(roomId);
}

export default SyncManager;
