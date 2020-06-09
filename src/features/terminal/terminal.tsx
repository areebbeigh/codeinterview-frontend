import React, { useEffect, useRef } from 'react';
import { Row } from 'react-bootstrap';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import LogRenderer from './log-renderer';

import 'xterm/css/xterm.css';
import './terminal.css';

const logRenderer: LogRenderer = new LogRenderer({
  showTimestamps: false,
  profiles: [],
});
const addons = {
  fitAddon: new FitAddon(),
};
let xterm: Xterm;
let prevLogs: any[] = [];

interface Props {
  logs: any[];
  profiles: Profile[];
  options: {};
  onInput: (data: string) => void;
  className: string;
  name: string;
}

function Terminal({
  logs,
  profiles,
  options,
  onInput,
  className,
  name,
}: Props): React.ReactElement {
  const xtermRef: React.RefObject<HTMLDivElement> = useRef(null);
  const inputRef: React.RefObject<HTMLInputElement> = useRef(null);

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
    if (xtermRef.current) xterm.open(xtermRef.current);
    addons.fitAddon.fit();

    // Accept user input (chat)
    if (inputRef && inputRef.current) {
      inputRef.current.addEventListener('keydown', e => {
        if (e.keyCode === 13) {
          if (onInput) onInput(inputRef?.current?.value || '');
          if (inputRef && inputRef.current)
            inputRef.current.value = '';
        }
      });
    }
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
}

export default Terminal;
