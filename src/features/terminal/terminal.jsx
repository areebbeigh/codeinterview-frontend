import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import LogRenderer from './log-renderer';

import 'xterm/css/xterm.css';
import './terminal.css';

class Terminal extends React.Component {
  constructor(props) {
    super(props);
    const { profiles } = this.props;
    this.$xtermRef = React.createRef();
    this.$inputRef = React.createRef();
    this.logRenderer = new LogRenderer({
      showTimestamps: false,
      profiles,
    });
    this.addons = {
      fitAddon: new FitAddon(),
    };
  }

  componentDidMount() {
    const { options } = this.props;
    window.addEventListener('resize', () =>
      this.addons.fitAddon.fit()
    );
    this.xterm = new Xterm({
      convertEol: true,
      fontFamily: `'Fira Mono', monospace`,
      fontSize: 15,
      rendererType: 'dom', // default is canvas
      lineHeight: 1,
      theme: {
        background: '#151515',
        // foreground: '#6c757d',
      },
      ...options,
    });
    this.xterm.loadAddon(this.addons.fitAddon);
    this.xterm.open(this.$xtermRef.current);
    this.xterm.inputBuffer = [];
    this.addons.fitAddon.fit();

    // Accept user input (chat)
    this.$inputRef.current.addEventListener('keydown', e => {
      if (e.keyCode === 13) {
        const { onInput } = this.props;
        if (onInput) onInput(this.$inputRef.current.value);
        this.$inputRef.current.value = '';
      }
    });

    this.writeLogs();
  }

  componentDidUpdate(prevProps) {
    const { logs, profiles } = this.props;
    if (logs !== prevProps.logs || profiles !== prevProps.profiles) {
      this.logRenderer.profiles = profiles;
      this.writeLogs(prevProps.logs, true);
    }
  }

  // Terminal helpers

  clear() {
    // https://github.com/xtermjs/xterm.js/issues/950
    // When run initially at mount stage, xterm.clear() doesn't work since all the
    // content could still be in the write buffer and not rendered. xterm.reset()
    // doesn't seem to work either.
    this.xterm.write('\x1b[H\x1b[2J');
  }

  clearLastLine() {
    // https://stackoverflow.com/questions/56828930/how-to-remove-the-last-line-in-xterm-js
    this.xterm.write('\x1b[2K\r');
  }

  prompt() {
    this.xterm.write('$ ');
  }

  writeLogs(prevLogs = null, update = false) {
    const { logs } = this.props;
    if (!update) this.clear();
    logs.forEach(log => {
      if (!update || prevLogs.indexOf(log) === -1)
        this.writeEntry(log);
    });
  }

  writeEntry(log) {
    const lines = this.logRenderer.render(log);
    lines.forEach(line => {
      this.xterm.writeln(line);
    });
  }

  render() {
    const { className, name } = this.props;
    return (
      <div className={className}>
        <div className="terminal-container align-items-center">
          <Row className="terminal-header align-items-center">
            <div className="tab-area">
              <span className="tab active">{name}</span>
            </div>
          </Row>
          <div className="xterm-container" ref={this.$xtermRef} />
          <input
            ref={this.$inputRef}
            className="terminal-input"
            placeholder="Type something..."
          />
        </div>
      </div>
    );
  }
}

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
