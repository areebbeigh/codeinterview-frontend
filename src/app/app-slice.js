import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    username: null,
  },
  reducers: {
    setUsername(state, action) {
      return {
        ...state,
        username: action.payload,
      };
    },
  },
});

export const { setUsername } = appSlice.actions;
export default appSlice.reducer;
