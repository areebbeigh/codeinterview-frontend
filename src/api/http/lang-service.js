import axios from 'axios';

import config from 'api/config';

class LangService {
  constructor() {
    this.axios = axios.create({
      baseURL: `${config.http.baseURL}/languages/`,
      timeout: 5000,
      headers: {},
    });
  }

  async getLanguages() {
    const languages = await this.axios.get();
    const rv = {};
    languages.data.forEach(lang => {
      rv[lang.code] = lang;
    });
    return rv;
  }
}

export default () => new LangService();
