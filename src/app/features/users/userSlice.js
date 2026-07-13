import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers } from "./usersThunk";

function normalizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.name ?? null,
    jobTitle: user.user_metadata?.job_title ?? user.jobTitle ?? null,
    emailVerified: user.user_metadata?.email_verified ?? user.emailVerified ?? null,
    phone: user.phone ?? null,
    createdAt: user.created_at ?? user.createdAt ?? null,
    lastSignIn: user.last_sign_in_at ?? user.lastSignIn ?? null,
  };
}

const initialState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,

  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    setUser: (state, action) => {
      state.user = normalizeUser(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        state.user = normalizeUser(action.payload);
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAccessToken, setUser } = usersSlice.actions;

export default usersSlice.reducer;
