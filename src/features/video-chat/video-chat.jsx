import React from 'react';
import { Row } from 'react-bootstrap';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExpandAlt,
  faCompressAlt,
  faWindowMinimize,
  faWindowMaximize,
} from '@fortawesome/free-solid-svg-icons';

import Player from 'components/video-player/video-player';

import './video-chat.css';

function getName(peerId) {
  const { sync } = window;
  if (peerId in sync.profiles) {
    return sync.profiles[peerId].username;
  }
  return '';
}

class VideoChat extends React.Component {
  constructor(props) {
    super(props);
    this.updatePeers = this.updatePeers.bind(this);
    this.addStream = this.addStream.bind(this);
    this.setPeerId = this.setPeerId.bind(this);
    this.getMediaStream = this.getMediaStream.bind(this);

    this.state = {
      peerId: window.sync?.peerId || null,
      streams: window.sync?.streams || {},
      localStream: null,
      focusStream: null,
      focusId: null,
      ui: {
        compressed: false,
        minimized: false,
      },
    };
  }

  componentDidMount() {
    const { sync } = window;
    sync.on('ready', this.updatePeers);
    sync.on('peers', this.updatePeers);
    sync.on('stream', ({ peerId, stream }) => {
      this.addStream({ peerId, stream });
      this.setState({ focusStream: stream, focusId: peerId });
    });
    sync.on('peerId', this.setPeerId);
    this.getMediaStream();
  }

  componentWillUnmount() {
    try {
      window.sync.releaseUserMedia();
    } catch (err) {
      console.warn('error while releasing user stream', err);
    }
  }

  // Media stream helpers

  getMediaStream() {
    window.sync
      .getUserMedia()
      .then(stream => {
        this.setState({
          // don't want our audio echo
          localStream: new MediaStream(stream.getVideoTracks()),
        });
      })
      .catch(console.warn);
  }

  // Connection listeners

  setPeerId(peerId) {
    this.setState({ peerId });
  }

  addStream({ peerId, stream }) {
    const { streams } = this.state;
    this.setState({
      streams: {
        ...streams,
        [peerId]: stream,
      },
    });
  }

  updatePeers() {
    this.setState({
      streams: window.sync.streams,
    });
  }

  render() {
    const { streams, localStream, peerId, ui, focusId } = this.state;
    // eslint-disable-next-line react/destructuring-assignment
    const focusStream = this.state.focusStream || localStream;

    if (ui.minimized && !ui.compressed)
      this.setState({ ui: { ...ui, compressed: true } });

    if (peerId) streams[peerId] = localStream;

    return (
      <div
        className={`video-chat-window
        ${(ui.compressed && 'compressed') || ''}
        ${(ui.minimized && 'minimized') || ''}`}
      >
        <div className="title-bar align-right">
          <FontAwesomeIcon
            icon={ui.compressed ? faExpandAlt : faCompressAlt}
            pull="right"
            className="mr-1"
            onClick={() => {
              this.setState({
                ui: {
                  ...ui,
                  compressed: !ui.compressed,
                  minimized: false,
                },
              });
            }}
          />
          <FontAwesomeIcon
            icon={ui.minimized ? faWindowMaximize : faWindowMinimize}
            pull="right"
            // className="mr-1"
            size="xs"
            onClick={() => {
              this.setState({
                ui: { ...ui, minimized: !ui.minimized },
              });
            }}
          />
        </div>
        <div className="video-chat-container">
          <OverlayScrollbarsComponent
            options={{
              autoUpdate: true,
              resize: ui.compressed ? 'vertical' : 'both',
              scrollbars: { autoHide: 'leave' },
              className: 'os-theme-light',
            }}
          >
            <Row className="focus-stream-row d-flex justify-content-center">
              <Player
                className="focus-stream"
                showControls={focusStream !== localStream}
                stream={focusStream}
                name={getName(focusId)}
              />
            </Row>
            <Row
              className="peer-stream-row d-flex justify-content-center"
              noGutters
            >
              {Object.keys(streams).map(id => {
                if (focusStream === streams[id]) return '';
                return (
                  <Player
                    key={id}
                    showControls={streams[id] !== localStream}
                    width=""
                    className="peer-stream"
                    stream={streams[id]}
                    name={getName(id)}
                    onClick={() => {
                      this.setState({
                        focusStream: streams[id],
                        focusId: id,
                      });
                    }}
                  />
                );
              })}
            </Row>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    );
  }
}

export default VideoChat;
