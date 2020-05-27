import axios from 'axios';

import config from 'api/config';

class RoomService {
  constructor() {
    this.axios = axios.create({
      baseURL: `${config.http.baseURL}/rooms/`,
      timeout: 5000,
      headers: {},
    });
  }

  async createNewRoom() {
    const room = await this.axios.post('');
    return room;
  }

  async getRoom(id) {
    if (!id) throw Error('Invalid room ID');
    const room = await this.axios.get(id);
    return room;
  }
}

export default () => new RoomService();
