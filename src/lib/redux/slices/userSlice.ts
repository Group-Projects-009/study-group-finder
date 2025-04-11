import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface ProfileUpdateData {
  name: string;
  bio?: string;
  location?: string;
  education?: string;
  major?: string;
  interests?: string[];
  availability?: string[];
}

interface UserState {
  currentUser: {
    id: string;
    name: string;
    email: string;
    image: string;
    bio?: string;
    location?: string;
    education?: string;
    major?: string;
    interests?: string[];
    availability?: string[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Create async thunk for profile update
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: ProfileUpdateData, { rejectWithValue }) => {
    try {
      console.log('Sending profile update request:', profileData);
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        return rejectWithValue(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      console.log('Profile update successful:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error in updateProfile thunk:', error);
      return rejectWithValue('An error occurred while updating your profile');
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['currentUser']>) => {
      console.log('Setting user in Redux store:', action.payload);
      state.currentUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('Updating Redux store with new user data:', action.payload);
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload,
          };
        } else {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update profile';
      });
  },
});

export const { setUser, setLoading, setError, clearUser } = userSlice.actions;
export default userSlice.reducer; 