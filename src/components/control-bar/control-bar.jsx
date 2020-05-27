import React from 'react';
import PropTypes from 'prop-types';

import './control-bar.css';

const controlBar = ({ children }) => {
  return <div className="control-bar-container">{children}</div>;
};

controlBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default controlBar;
