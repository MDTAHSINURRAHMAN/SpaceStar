import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { StoryEntry } from "@/types/story";

export const storyApi = createApi({
  reducerPath: "storyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/story`,
    credentials: "include",
  }),
  tagTypes: ["Story"],
  endpoints: (builder) => ({
    getAllStories: builder.query<StoryEntry[], void>({
      query: () => "/",
      providesTags: ["Story"],
    }),

    getStoryById: builder.query<StoryEntry, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Story", id }],
    }),

    createStory: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Story"],
    }),

    updateStory: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Story",
        { type: "Story", id },
      ],
    }),

    deleteStory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Story"],
    }),
  }),
});

export const {
  useGetAllStoriesQuery,
  useGetStoryByIdQuery,
  useCreateStoryMutation,
  useUpdateStoryMutation,
  useDeleteStoryMutation,
} = storyApi;
