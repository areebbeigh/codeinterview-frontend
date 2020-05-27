/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
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

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.toggleAudio = this.toggleAudio.bind(this);
    this.videoRef = React.createRef();
    this.state = {
      muted: false,
      video: true,
    };
  }

  componentDidMount() {
    const { stream } = this.props;
    connectVideoToStream(this.videoRef.current, stream);
  }

  componentDidUpdate(prevProps) {
    const { stream } = this.props;
    if (stream !== prevProps.stream) {
      connectVideoToStream(this.videoRef.current, stream);
    }
  }

  toggleAudio() {
    const { muted } = this.state;
    this.videoRef.current.muted = !muted;
    this.setState({ muted: !muted });
  }

  render() {
    const {
      stream,
      width,
      className,
      onClick,
      showControls,
      name,
    } = this.props;
    const { muted, video } = this.state;
    if (stream) {
      return (
        <div className="video-container">
          <video
            autoPlay
            className={className}
            onClick={onClick}
            style={{ width }}
            ref={this.videoRef}
          />
          {showControls && (
            <div className="controls p-1 pr-2">
              <FontAwesomeIcon
                icon={muted ? faMicrophoneSlash : faMicrophone}
                onClick={this.toggleAudio}
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
}

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
