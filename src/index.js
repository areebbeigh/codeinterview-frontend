import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Room from 'pages/room/room';
import * as serviceWorker from './service-worker';
import App from './app/App';
import store from './app/store';

import 'overlayscrollbars/css/OverlayScrollbars.css';
import './index.css';

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <Switch>
        <Route path="/room/:roomId" component={Room} />
        <Route path="/" component={App} />
      </Switch>
    </Provider>
  </Router>,
  document.getElementById('root')
);

serviceWorker.unregister();
