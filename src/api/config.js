let baseURL = 'codeinterview-backend.herokuapp.com';
if (process.env.NODE_ENV === 'development') {
  baseURL = 'localhost:8000';
}

export default {
  http: {
    baseURL: `http://${baseURL}/api`,
  },
  ws: {
    baseURL: `ws://${baseURL}/ws`,
  },
};
