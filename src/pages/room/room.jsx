import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Dialog from 'react-bootstrap-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';
import {
  faCircle,
  faMicrophone,
  faVideo,
  faMicrophoneSlash,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';

import ControlBar from 'components/control-bar/control-bar';
import SharedMonacoEditor from 'features/shared-monaco-editor/shared-monaco-editor';
import VideoChat from 'features/video-chat/video-chat';
import Terminal from 'features/terminal/terminal';
import roomService from 'api/http/room-service';
import roomSocket from 'api/ws/room-socket';
import colors from 'constants/colors';
import { setupSync } from 'sync-manager';

import './room.css';

function isMicOn() {
  return window?.sync.streamData?.audio?.enabled;
}

function isCamOn() {
  return window?.sync.streamData?.video?.enabled;
}

function displayWelcomeToast(name) {
  toast.dark(
    `Welcome to CodeInterview, ${name}! Share this room's URL to let others join in.`
  );
}

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.handleCallBtn = this.handleCallBtn.bind(this);
    this.handleRunBtn = this.handleRunBtn.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.codeEditorRef = React.createRef();
    this.inputEditorRef = React.createRef();

    this.roomService = roomService();
    this.state = {
      videoChat: false,
      roomId: null,
      username: null,
      syncSetup: false,
      profile: {},
      profiles: [],
      logs: [{ content: 'Welcome to CodeInterview!' }],
    };
  }

  async componentDidMount() {
    const { props } = this;
    const { roomId } = props.match.params;
    try {
      // confirm this room exists
      const room = await this.roomService.getRoom(roomId);
      this.setState({
        roomId,
        alone: room.data.participants === 0,
      });
    } catch (err) {
      toast.error(
        `Could not fetch room data. Are you sure this room exists? [${err.message}]`,
        { autoClose: false }
      );
    }
  }

  componentDidUpdate() {
    const { username, roomId, profile, profiles } = this.state;
    // ask for username
    if (!username) {
      this.dialog.show({
        body: `Let's get you a nickname.`,
        prompt: Dialog.TextPrompt({
          placeholder: 'e.g Deku',
          initialValue: '',
          required: true,
        }),
        actions: [
          Dialog.OKAction(dialog => {
            const username = dialog.value;
            const userProfile = {
              username,
              color: colors.userColors[0],
            };
            this.setState({
              username,
              profile: userProfile,
              profiles: [...profiles, userProfile],
            });
            displayWelcomeToast(username);
          }),
        ],
        // prevents dialog from closing on clicking outside
        onHide: () => null,
      });
    }
    // setup websocket and webrtc connections
    if (roomId && username && !window.sync) {
      // websocket
      this.roomSocket = roomSocket(roomId, username);
      this.bindSocketListeners();
      // webrtc
      window.sync = setupSync(roomId);
      window.sync.setProfile(profile);
      this.bindConnListeners();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ syncSetup: true });
    }
  }

  // Button event handlers

  handleCallBtn() {
    const { videoChat } = this.state;
    this.setState({
      videoChat: !videoChat,
    });
    if (!videoChat) this.roomSocket.sendJoinCall();
    else this.roomSocket.sendLeaveCall();
  }

  handleRunBtn() {
    const { language } = this.codeEditorRef.state;
    const { code, input } = this.codeEditorRef.data;
    this.roomSocket.sendRun({
      code: code.model.getValue(),
      language,
      stdin: input.model.getValue(),
    });
  }

  // Room socket helpers

  sendMessage(msg) {
    this.roomSocket.sendMessage(msg);
  }

  bindSocketListeners() {
    this.roomSocket.on('logs', entries => {
      const { logs } = this.state;
      this.setState({
        logs: [...logs, ...entries],
      });
    });
    this.roomSocket.on('new-entry', entry => {
      const { logs } = this.state;
      this.setState({
        logs: [...logs, entry],
      });
    });
    this.roomSocket.on('error', data => {
      toast.error(`An internal error occured: ${data}`);
    });
  }

  // WebRTC helpers

  bindConnListeners() {
    window.sync.on('profiles', profiles => {
      let i = 0;
      Object.values(profiles).forEach(peerProfile => {
        const color = colors.userColors[i % colors.userColors.length];
        // eslint-disable-next-line no-param-reassign
        peerProfile.color = color;
        i += 1;
      });
      this.setState({
        profiles: Object.values(profiles),
      });
    });
  }

  render() {
    const {
      videoChat,
      roomId,
      username,
      syncSetup,
      logs,
      profiles,
      alone,
    } = this.state;
    // haven't confirmed room exists yet
    if (!roomId) return '';

    // wait for user to input name
    if (!username) {
      return (
        <>
          <Dialog
            ref={el => {
              this.dialog = el;
            }}
          />
        </>
      );
    }

    // wait for webrtc connection to setup
    if (!syncSetup) return '';

    // actual IDE
    return (
      <div className="room-container">
        {videoChat && <VideoChat />}
        <Container fluid>
          <Row>
            <Col xs={12} md={6} className="editor-col">
              <SharedMonacoEditor
                sharedEditorDidMount={ref => {
                  this.codeEditorRef = ref;
                }}
                id="code-editor"
                name="Code editor"
                language="python"
                className="code-editor"
                showDropdown
                loadTemplate={alone}
              />
            </Col>
            <Col xs={12} md={6} className="editor-col">
              <Terminal
                className="output-terminal"
                name="Room Log"
                profiles={profiles}
                logs={logs}
                onInput={this.sendMessage}
              />
            </Col>
          </Row>
          <Row className="control-bar">
            <Col>
              <ControlBar>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Button
                      onClick={this.handleRunBtn}
                      variant="success"
                      size="sm"
                    >
                      Run
                    </Button>
                  </Col>
                  <Col md={6}>
                    <OverlayScrollbarsComponent
                      options={{
                        autoUpdate: true,
                        scrollbars: { autoHide: 'leave' },
                        overflowBehavior: {
                          x: 'scroll',
                          y: 'hidden',
                        },
                      }}
                    >
                      {profiles.map((profile, idx) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={idx}
                          className="user-item p-2 d-inline"
                        >
                          <FontAwesomeIcon
                            className="mr-1"
                            icon={faCircle}
                            size="sm"
                            color={profile.color}
                          />
                          <span style={{ color: profile.color }}>
                            {profile.username}
                          </span>
                        </div>
                      ))}
                    </OverlayScrollbarsComponent>
                  </Col>
                  <Col md={4} className="d-flex justify-content-end">
                    {videoChat && (
                      <div className="media-controls mr-3 align-self-center">
                        <FontAwesomeIcon
                          className="mr-3 icon"
                          size="lg"
                          icon={
                            isMicOn()
                              ? faMicrophone
                              : faMicrophoneSlash
                          }
                          onClick={() => {
                            window.sync.toggleLocalAudio();
                            this.forceUpdate();
                          }}
                        />
                        <FontAwesomeIcon
                          size="lg"
                          icon={isCamOn() ? faVideo : faVideoSlash}
                          onClick={() => {
                            window.sync.toggleLocalVideo();
                            this.forceUpdate();
                          }}
                        />
                      </div>
                    )}
                    <Button
                      variant={videoChat ? 'danger' : 'primary'}
                      size="sm"
                      onClick={this.handleCallBtn}
                    >
                      {videoChat ? 'Stop Call' : 'Start Call'}
                    </Button>
                  </Col>
                </Row>
              </ControlBar>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Room.defaultProps = {};
Room.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      roomId: PropTypes.string,
    }),
  }).isRequired,
};

export default Room;
