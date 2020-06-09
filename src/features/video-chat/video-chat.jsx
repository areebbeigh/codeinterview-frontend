import React, { useState, useEffect } from 'react';
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

const VideoChat = () => {
  const [myPeerId, setMyPeerId] = useState(
    window.sync?.peerId || null
  );
  const [streams, setStreams] = useState(window.sync?.streams || {});
  const [localStream, setLocalStream] = useState(null);
  const [focusStream, setFocusStream] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [uiCompressed, setUiCompressed] = useState(false);
  const [uiMinimized, setUiMinimized] = useState(false);

  // Media stream helper

  const getMediaStream = () => {
    window.sync
      .getUserMedia()
      .then(stream => {
        // don't want our audio echo
        setLocalStream(new MediaStream(stream.getVideoTracks()));
      })
      .catch(console.warn);
  };

  // Sync listeners

  const addStream = ({ peerId, stream }) => {
    setStreams({
      ...streams,
      [peerId]: stream,
    });
  };

  const updatePeers = () => {
    setStreams(window.sync.streams);
  };

  useEffect(() => {
    const { sync } = window;
    // sync object event listeners
    sync.on('ready', updatePeers);
    sync.on('peers', updatePeers);
    sync.on('stream', ({ peerId, stream }) => {
      addStream({ peerId, stream });
      setFocusStream(stream);
      setFocusId(peerId);
    });
    sync.on('peerId', setMyPeerId);
    // get user media
    getMediaStream();

    return () => {
      try {
        window.sync.releaseUserMedia();
      } catch (err) {
        console.warn('error while releasing user stream', err);
      }
    };
  }, []);

  if (uiMinimized && !uiCompressed) setUiCompressed(true);
  if (myPeerId) streams[myPeerId] = localStream;

  return (
    <div
      className={`video-chat-window
        ${(uiCompressed && 'compressed') || ''}
        ${(uiMinimized && 'minimized') || ''}`}
    >
      <div className="title-bar align-right">
        <FontAwesomeIcon
          icon={uiCompressed ? faExpandAlt : faCompressAlt}
          pull="right"
          className="mr-1"
          onClick={() => {
            setUiCompressed(!uiCompressed);
            setUiMinimized(false);
          }}
        />
        <FontAwesomeIcon
          icon={uiMinimized ? faWindowMaximize : faWindowMinimize}
          pull="right"
          size="xs"
          onClick={() => {
            setUiMinimized(!uiMinimized);
          }}
        />
      </div>
      <div className="video-chat-container">
        <OverlayScrollbarsComponent
          options={{
            autoUpdate: true,
            resize: uiCompressed ? 'vertical' : 'both',
            scrollbars: { autoHide: 'leave' },
            className: 'os-theme-light',
          }}
        >
          <Row className="focus-stream-row d-flex justify-content-center">
            <Player
              className="focus-stream"
              showControls={
                focusStream === null
                  ? false
                  : focusStream !== localStream
              }
              stream={focusStream || localStream}
              name={getName(focusId)}
            />
          </Row>
          <Row
            className="peer-stream-row d-flex justify-content-center"
            noGutters
          >
            {Object.keys(streams).map(id => {
              if (
                focusStream === streams[id] ||
                (!focusStream && streams[id] === localStream)
              )
                return '';
              return (
                <Player
                  key={id}
                  showControls={streams[id] !== localStream}
                  width=""
                  className="peer-stream"
                  stream={streams[id]}
                  name={getName(id)}
                  onClick={() => {
                    setFocusStream(streams[id]);
                    setFocusId(id);
                  }}
                />
              );
            })}
          </Row>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
};

export default VideoChat;
