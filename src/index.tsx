import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Room from 'pages/room/room';
import Home from 'pages/home/home';
import * as serviceWorker from './service-worker';
import App from './app/App';

import 'react-toastify/dist/ReactToastify.min.css';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import './index.css';

ReactDOM.render(
  <Router>
    <App>
      <Switch>
        <Route path="/room/:roomId" component={Room} />
        <Route path="/" component={Home} />
      </Switch>
    </App>
  </Router>,
  document.getElementById('root')
);

serviceWorker.unregister();
