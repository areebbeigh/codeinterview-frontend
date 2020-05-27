import { configureStore } from '@reduxjs/toolkit';
import videoReducer from 'features/video-slice';
import editorReducer from 'features/editor-slice';

export default configureStore({
  reducer: {
    video: videoReducer,
    editor: editorReducer,
  },
});
