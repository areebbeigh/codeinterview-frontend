/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons';

import './video-player.css';

function connectVideoToStream(video, stream) {
  // eslint-disable-next-line no-param-reassign
  if (stream) video.srcObject = stream;
}

const Player = ({
  stream,
  width,
  className,
  onClick,
  showControls,
  name,
}) => {
  const [isMuted, setMuted] = useState(false);
  const videoRef = React.createRef();

  useEffect(() => {
    connectVideoToStream(videoRef.current, stream);
  }, [stream]);

  const toggleAudio = () => {
    videoRef.current.muted = !isMuted;
    setMuted(!isMuted);
  };

  if (stream) {
    return (
      <div className="video-container">
        <video
          autoPlay
          className={className}
          onClick={onClick}
          style={{ width }}
          ref={videoRef}
        />
        {showControls && (
          <div className="controls p-1 pr-2">
            <FontAwesomeIcon
              icon={isMuted ? faMicrophoneSlash : faMicrophone}
              onClick={toggleAudio}
              className="icon"
            />
            <span className="name">{name}</span>
          </div>
        )}
      </div>
    );
  }
  return <div className="video-placeholder" />;
};

Player.defaultProps = {
  stream: null,
  width: '100%',
  className: '',
  onClick: () => null,
  showControls: false,
  name: '',
};
Player.propTypes = {
  stream: PropTypes.shape({}),
  width: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  showControls: PropTypes.bool,
  name: PropTypes.string,
};

export default Player;
