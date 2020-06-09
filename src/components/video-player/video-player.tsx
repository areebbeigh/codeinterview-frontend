/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons';

import './video-player.css';

function connectVideoToStream(
  video: HTMLVideoElement,
  stream: MediaStream
) {
  // eslint-disable-next-line no-param-reassign
  if (stream) video.srcObject = stream;
}

interface Props {
  stream: MediaStream;
  width: any;
  className: string;
  onClick?: (
    event: React.MouseEvent<HTMLVideoElement, MouseEvent>
  ) => void;
  showControls: Boolean;
  name: string;
}

function Player({
  stream,
  width,
  className,
  onClick,
  showControls,
  name,
}: Props): React.ReactElement {
  const [isMuted, setMuted] = useState<Boolean>(false);
  const videoRef: React.RefObject<
    HTMLVideoElement
  > = React.createRef();

  useEffect(() => {
    if (videoRef.current)
      connectVideoToStream(videoRef.current, stream);
  }, [stream]);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setMuted(!isMuted);
    }
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
}

export default Player;
