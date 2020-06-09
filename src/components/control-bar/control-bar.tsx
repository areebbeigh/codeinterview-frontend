import React from 'react';

import './control-bar.css';

interface Props {
  children: React.ReactNode;
}

function controlBar({ children }: Props): React.ReactElement {
  return <div className="control-bar-container">{children}</div>;
}

export default controlBar;
