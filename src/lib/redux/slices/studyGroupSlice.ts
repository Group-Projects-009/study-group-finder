import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StudyGroup {
  _id: string;
  name: string;
  title?: string;
  subject: string;
  description: string;
  location: string;
  city?: string;
  date?: string;
  time?: string;
  meetingTimes: string[];
  maxMembers: number;
  creator: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  members: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface StudyGroupState {
  studyGroups: StudyGroup[];
  currentGroup: StudyGroup | null;
  myGroups: StudyGroup[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StudyGroupState = {
  studyGroups: [],
  currentGroup: null,
  myGroups: [],
  isLoading: false,
  error: null,
};

export const studyGroupSlice = createSlice({
  name: 'studyGroups',
  initialState,
  reducers: {
    setStudyGroups: (state, action: PayloadAction<StudyGroup[]>) => {
      state.studyGroups = action.payload;
    },
    setCurrentGroup: (state, action: PayloadAction<StudyGroup | null>) => {
      state.currentGroup = action.payload;
    },
    setMyGroups: (state, action: PayloadAction<StudyGroup[]>) => {
      state.myGroups = action.payload;
    },
    addGroup: (state, action: PayloadAction<StudyGroup>) => {
      state.studyGroups.push(action.payload);
      state.myGroups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<StudyGroup>) => {
      const index = state.studyGroups.findIndex(
        group => group._id === action.payload._id
      );
      if (index !== -1) {
        state.studyGroups[index] = action.payload;
      }
      
      const myGroupIndex = state.myGroups.findIndex(
        group => group._id === action.payload._id
      );
      if (myGroupIndex !== -1) {
        state.myGroups[myGroupIndex] = action.payload;
      }
      
      if (state.currentGroup && state.currentGroup._id === action.payload._id) {
        state.currentGroup = action.payload;
      }
    },
    joinGroup: (state, action: PayloadAction<{ groupId: string, user: StudyGroup['members'][0] }>) => {
      const { groupId, user } = action.payload;
      
      const group = state.studyGroups.find(g => g._id === groupId);
      if (group && !group.members.some(m => m._id === user._id)) {
        group.members.push(user);
      }
      
      if (state.currentGroup && state.currentGroup._id === groupId) {
        state.currentGroup.members.push(user);
      }
      
      const groupToAdd = state.studyGroups.find(g => g._id === groupId);
      if (groupToAdd && !state.myGroups.some(g => g._id === groupId)) {
        state.myGroups.push(groupToAdd);
      }
    },
    leaveGroup: (state, action: PayloadAction<{ groupId: string, userId: string }>) => {
      const { groupId, userId } = action.payload;
      
      // Remove member from studyGroups
      const group = state.studyGroups.find(g => g._id === groupId);
      if (group) {
        group.members = group.members.filter(m => m._id !== userId);
      }
      
      // Remove member from currentGroup
      if (state.currentGroup && state.currentGroup._id === groupId) {
        state.currentGroup.members = state.currentGroup.members.filter(m => m._id !== userId);
      }
      
      // Remove group from myGroups
      state.myGroups = state.myGroups.filter(g => g._id !== groupId);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStudyGroups,
  setCurrentGroup,
  setMyGroups,
  addGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
  setLoading,
  setError,
} = studyGroupSlice.actions;

export default studyGroupSlice.reducer; 