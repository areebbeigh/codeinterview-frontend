import { createSlice } from '@reduxjs/toolkit';

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    globalSettings: {
      theme: 'vs-dark',
    },
  },
});

export default editorSlice.reducer;
