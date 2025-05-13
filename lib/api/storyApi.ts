import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { StoryEntry, TipTapContent } from "@/types/story";

interface ApiResponse {
  message: string;
  [key: string]: unknown;
}

interface StoryResponse extends ApiResponse {
  storyId?: string;
  story?: StoryEntry;
}

interface RootState {
  storyApi: {
    queries: {
      [key: string]: {
        data?: StoryEntry[];
      };
    };
  };
}

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

    createStory: builder.mutation<StoryResponse, FormData>({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Story"],
    }),

    updateStory: builder.mutation<
      StoryResponse,
      { id: string; formData: FormData; content: TipTapContent }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      async onQueryStarted(
        { id, content },
        { dispatch, queryFulfilled, getState }
      ) {
        // Get current cache data
        const state = getState() as RootState;
        const stories =
          state.storyApi.queries["getAllStories(undefined)"]?.data;

        if (stories) {
          // Apply optimistic update to getAllStories cache
          const optimisticPatch = dispatch(
            storyApi.util.updateQueryData(
              "getAllStories",
              undefined,
              (draft) => {
                const storyIndex = draft.findIndex((story) => story._id === id);
                if (storyIndex !== -1) {
                  draft[storyIndex].content = content;
                }
              }
            )
          );

          // Also update the single story cache if it exists
          const singleStoryPatch = dispatch(
            storyApi.util.updateQueryData("getStoryById", id, (draft) => {
              draft.content = content;
            })
          );

          try {
            await queryFulfilled;
          } catch {
            // If the mutation fails, undo the optimistic update
            optimisticPatch.undo();
            singleStoryPatch.undo();
          }
        }
      },
      invalidatesTags: (result, error, { id }) => [
        "Story",
        { type: "Story", id },
      ],
    }),

    deleteStory: builder.mutation<ApiResponse, string>({
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
