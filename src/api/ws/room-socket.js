import ReconnectingWebsocket from 'reconnecting-websocket';

import config from 'api/config';
import EventEmitter from 'lib/emitter';
import LANGUAGE_CODES from 'constants/languages';

class RoomSocket extends EventEmitter {
  constructor(roomId, username) {
    super();
    const url = `${config.ws.baseURL}/rooms/${roomId}?username=${username}`;
    this.ws = new ReconnectingWebsocket(url);
    window.ws = this.ws;
    this.ws.onopen = this.emit('open');

    this.ws.onmessage = message => {
      const data = JSON.parse(message.data);
      console.log(message, data);
      if (data.type === 'event') {
        this.emit(data.event, data.data);
      }
    };
  }

  // Helpers

  sendJson(jsonData) {
    this.ws.send(JSON.stringify(jsonData));
  }

  // Commands

  sendRun({ language, code, stdin }) {
    this.sendJson({
      command: 'run',
      language: LANGUAGE_CODES[language],
      code,
      stdin,
    });
  }

  sendMessage(msg) {
    this.sendJson({
      command: 'send-message',
      message: msg,
    });
  }

  sendJoinCall() {
    this.sendJson({
      command: 'join-call',
    });
  }

  sendLeaveCall() {
    this.sendJson({
      command: 'leave-call',
    });
  }
}

export default (roomId, username) => new RoomSocket(roomId, username);
