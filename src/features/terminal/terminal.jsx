import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import LogRenderer from './log-renderer';

import 'xterm/css/xterm.css';
import './terminal.css';

const xtermRef = React.createRef();
const inputRef = React.createRef();
const logRenderer = new LogRenderer({
  showTimestamps: false,
});
const addons = {
  fitAddon: new FitAddon(),
};
let xterm = null;
let prevLogs = [];

const Terminal = ({
  logs,
  profiles,
  options,
  onInput,
  className,
  name,
}) => {
  // Terminal helpers

  const clear = () => {
    // https://github.com/xtermjs/xterm.js/issues/950
    // When run initially at mount stage, xterm.clear() doesn't work since all the
    // content could still be in the write buffer and not rendered. xterm.reset()
    // doesn't seem to work either.
    xterm.write('\x1b[H\x1b[2J');
  };

  const writeEntry = log => {
    const lines = logRenderer.render(log);
    lines.forEach(line => {
      xterm.writeln(line);
    });
  };

  const writeLogs = (update = false) => {
    if (!update) clear();
    logs.forEach(log => {
      // TODO: this check is inefficient. Maintain a hashmap instead.
      if (!update || prevLogs.indexOf(log) === -1) writeEntry(log);
    });
  };

  useEffect(() => {
    window.addEventListener('resize', () => addons.fitAddon.fit());
    xterm = new Xterm({
      convertEol: true,
      fontFamily: `'Fira Mono', monospace`,
      fontSize: 15,
      rendererType: 'dom', // default is canvas
      lineHeight: 1,
      theme: {
        background: '#151515',
      },
      ...options,
    });
    xterm.loadAddon(addons.fitAddon);
    xterm.open(xtermRef.current);
    xterm.inputBuffer = [];
    addons.fitAddon.fit();

    // Accept user input (chat)
    inputRef.current.addEventListener('keydown', e => {
      if (e.keyCode === 13) {
        if (onInput) onInput(inputRef.current.value);
        inputRef.current.value = '';
      }
    });
  }, []);

  useEffect(() => {
    logRenderer.profiles = profiles;
    writeLogs(true);
    prevLogs = logs;
  }, [logs, profiles]);

  return (
    <div className={className}>
      <div className="terminal-container align-items-center">
        <Row className="terminal-header align-items-center">
          <div className="tab-area">
            <span className="tab active">{name}</span>
          </div>
        </Row>
        <div className="xterm-container" ref={xtermRef} />
        <input
          ref={inputRef}
          className="terminal-input"
          placeholder="Type something..."
        />
      </div>
    </div>
  );
};

Terminal.defaultProps = {
  profiles: [],
  options: {},
  onInput: () => {},
  className: '',
  name: 'Log Terminal',
};
Terminal.propTypes = {
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  options: PropTypes.shape({}),
  onInput: PropTypes.func,
  logs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
};

export default Terminal;
