import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StudyGroup } from './studyGroupSlice';

export const studyGroupApi = createApi({
  reducerPath: 'studyGroupApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['StudyGroup', 'MyGroups'],
  endpoints: (builder) => ({
    // Get all study groups
    getStudyGroups: builder.query<StudyGroup[], void>({
      query: () => '/study-groups',
      providesTags: ['StudyGroup'],
    }),
    
    // Get specific study group by ID
    getStudyGroup: builder.query<StudyGroup, string>({
      query: (id) => `/study-groups/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'StudyGroup', id }],
    }),
    
    // Get user's study groups
    getMyStudyGroups: builder.query<StudyGroup[], void>({
      query: () => '/study-groups/my-groups',
      providesTags: ['MyGroups'],
    }),
    
    // Create new study group
    createStudyGroup: builder.mutation<StudyGroup, Partial<StudyGroup>>({
      query: (body) => ({
        url: '/study-groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StudyGroup', 'MyGroups'],
    }),
    
    // Update study group
    updateStudyGroup: builder.mutation<StudyGroup, { id: string; body: Partial<StudyGroup> }>({
      query: ({ id, body }) => ({
        url: `/study-groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'StudyGroup', id },
        'MyGroups',
      ],
    }),
    
    // Delete study group
    deleteStudyGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/study-groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudyGroup', 'MyGroups'],
    }),
    
    // Join study group
    joinStudyGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/study-groups/${id}/join`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'StudyGroup', id },
        'MyGroups',
      ],
    }),
    
    // Leave study group
    leaveStudyGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/study-groups/${id}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'StudyGroup', id },
        'MyGroups',
      ],
    }),
    
    // Get messages for a study group
    getMessages: builder.query<any[], string>({
      query: (groupId) => `messages/${groupId}`,
    }),
    
    // Send message in a study group
    sendMessage: builder.mutation<any, { groupId: string; content: string }>({
      query: ({ groupId, content }) => ({
        url: `messages/${groupId}`,
        method: 'POST',
        body: { content },
      }),
    }),
  }),
});

export const {
  useGetStudyGroupsQuery,
  useGetStudyGroupQuery,
  useGetMyStudyGroupsQuery,
  useCreateStudyGroupMutation,
  useUpdateStudyGroupMutation,
  useDeleteStudyGroupMutation,
  useJoinStudyGroupMutation,
  useLeaveStudyGroupMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} = studyGroupApi; 