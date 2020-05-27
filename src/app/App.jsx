import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';

import placeHolderImg from 'assets/images/placeholder.png';
import store from './store';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <>
      <Provider store={store}>{children}</Provider>
      <ToastContainer
        autoClose={5000}
        transition={Zoom}
        limit={3}
        newestOnTop
        hideProgressBar
      />
      {pathname !== '/' && (
        <div className="placeholder-container">
          <img src={placeHolderImg} id="placeholder-img" />
          <p>Hi there.</p>
        </div>
      )}
    </>
  );
};

App.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
