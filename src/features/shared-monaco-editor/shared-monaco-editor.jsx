/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import MonacoEditor from 'react-monaco-editor';
import { MonacoBinding } from 'y-monaco';
import EditorDropdown from 'components/editor-dropdown/editor-dropdown';

import LANG_CONFIG from 'constants/languages';
import langService from 'api/http/lang-service';
import loadingIcon from 'assets/svg/editor-loading.svg';
import setDefaultTheme from './theme-utils';
import defaultConfig from './default-config';

import './shared-monaco-editor.css';

const mapStateToProps = state => ({
  globalSettings: state.editor.globalSettings,
});

class SharedMonacoEditor extends React.Component {
  constructor(props) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.changeTab = this.changeTab.bind(this);

    this.langService = langService();
    this.editor = null;
    this.data = {
      code: {
        model: null,
        state: null,
        binding: null,
      },
      input: {
        model: null,
        state: null,
        binding: null,
      },
    };
    this.state = {
      currentTab: 'code',
      language: 'none',
    };
  }

  componentDidMount() {
    this.langService
      .getLanguages()
      .then(languages => {
        this.languages = languages;
      })
      .finally(() => {
        const {
          language,
          sharedEditorDidMount,
          loadTemplate,
        } = this.props;
        this.setState({
          language,
          loadTemplate,
        });
        sharedEditorDidMount(this);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    const { language, loadTemplate } = this.state;
    const { data } = this;
    const { model } = data.code;
    if (prevState.language !== language && loadTemplate) {
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: this.languages[LANG_CONFIG[language]].template,
            forceMoveMarkers: true,
          },
        ],
        () => null
      );
    }
  }

  componentWillUnmount() {
    const { sharedEditorDidMount } = this.props;
    sharedEditorDidMount(undefined);
  }

  editorDidMount(editor, monaco) {
    setDefaultTheme(monaco); // TODO: add multi-theme support
    this.editor = editor;
    const { language, currentTab } = this.state;
    const { doc, webrtcProvider } = window.sync;

    // create editor tabs with y-bindings
    const yCode = doc.getText('code');
    const yInput = doc.getText('input');
    this.data.code.model = monaco.editor.createModel(
      'hello',
      language
    );
    this.data.input.model = monaco.editor.createModel('input');
    this.data.code.binding = new MonacoBinding(
      yCode,
      this.data.code.model,
      new Set([editor]),
      webrtcProvider.awareness
    );
    this.data.code.binding = new MonacoBinding(
      yInput,
      this.data.input.model,
      new Set([editor]),
      webrtcProvider.awareness
    );
    this.changeTab(currentTab);

    const ySharedState = doc.getMap('editor-state');
    ySharedState.observe(() => {
      // sync lang change in dropdown without template update
      // eslint-disable-next-line no-shadow
      const { language } = this.state;
      const newLang = ySharedState.get('editor-language');
      if (language !== newLang) {
        this.setState({
          language: newLang,
          loadTemplate: false,
        });
      }
    });
  }

  handleLanguageChange(e, newLang) {
    this.changeLang(newLang);
  }

  changeLang(newLang, loadTemplate = true) {
    const { doc } = window.sync;
    const ySharedState = doc.getMap('editor-state');
    ySharedState.set('editor-language', newLang);
    this.setState({ language: newLang, loadTemplate });
  }

  changeTab(tab) {
    const { editor } = this;
    const { currentTab } = this.state;
    this.data[currentTab].state = editor.saveViewState();
    editor.setModel(this.data[tab].model);
    editor.restoreViewState(this.data[tab].state);
    this.setState({
      currentTab: tab,
    });
    editor.focus();
  }

  render() {
    const { language, currentTab } = this.state;
    const { className, showDropdown, globalSettings } = this.props;
    const editorOptions = {
      ...defaultConfig,
      theme: globalSettings.theme,
    };
    const editorLanguages = Object.keys(LANG_CONFIG);
    editorLanguages.sort();

    return (
      <div className={className}>
        {!language && (
          <div className="loading-screen">
            <div className="loading-content">
              <img
                src={loadingIcon}
                className="loading-icon"
                alt="loading-editor"
              />
              <p>Warming up editor...</p>
            </div>
          </div>
        )}
        <div className="shared-editor-container">
          <Row className="shared-editor-header align-items-center">
            <div className="tab-area">
              <span
                onClick={() => this.changeTab('code')}
                className={`tab ${
                  currentTab === 'code' ? 'active' : ''
                }`}
              >
                Code
              </span>
              <span
                onClick={() => this.changeTab('input')}
                className={`tab ${
                  currentTab === 'input' ? 'active' : ''
                }`}
              >
                Standard Input
              </span>
            </div>
            {showDropdown && (
              <Col className="d-flex">
                <EditorDropdown
                  defaultItem={language}
                  handler={this.handleLanguageChange}
                  items={editorLanguages}
                />
              </Col>
            )}
          </Row>
          <MonacoEditor
            height=""
            onChange={this.handleCodeChange}
            language={language}
            options={editorOptions}
            editorDidMount={this.editorDidMount}
          />
        </div>
      </div>
    );
  }
}

SharedMonacoEditor.defaultProps = {
  language: 'python',
  sharedEditorDidMount: () => null,
  loadTemplate: true,
  className: '',
  showDropdown: false,
  globalSettings: {},
};

SharedMonacoEditor.propTypes = {
  language: PropTypes.string,
  sharedEditorDidMount: PropTypes.func,
  loadTemplate: PropTypes.bool,
  className: PropTypes.string,
  showDropdown: PropTypes.bool,
  globalSettings: PropTypes.shape({
    theme: PropTypes.string,
  }),
};

export default connect(mapStateToProps)(SharedMonacoEditor);
