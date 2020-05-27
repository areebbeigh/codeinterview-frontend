import { createSlice } from '@reduxjs/toolkit';

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    inCall: false,
  },
  reducers: {
    setInCall(state, action) {
      return {
        ...state,
        inCall: action.payload,
      };
    },
  },
});

export const { setInCall } = videoSlice.actions;
export default videoSlice.reducer;
