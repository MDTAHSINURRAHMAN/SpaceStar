import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PrivacyEntry, TipTapContent } from "@/types/privacy";

interface ApiResponse {
  message: string;
  [key: string]: unknown;
}

interface PrivacyResponse extends ApiResponse {
  privacyId?: string;
  privacy?: PrivacyEntry;
}

interface RootState {
  privacyApi: {
    queries: {
      [key: string]: {
        data?: PrivacyEntry[];
      };
    };
  };
}

export const privacyApi = createApi({
  reducerPath: "privacyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/privacy`,
    credentials: "include",
  }),
  tagTypes: ["Privacy"],
  endpoints: (builder) => ({
    getAllPrivacies: builder.query<PrivacyEntry[], void>({
      query: () => "/",
      providesTags: ["Privacy"],
    }),

    getPrivacyById: builder.query<PrivacyEntry, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Privacy", id }],
    }),

    createPrivacy: builder.mutation<PrivacyResponse, FormData>({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Privacy"],
    }),

    updatePrivacy: builder.mutation<
      PrivacyResponse,
      { id: string; formData: FormData; content: TipTapContent }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      async onQueryStarted(
        { id, content, formData },
        { dispatch, queryFulfilled, getState }
      ) {
        // Get current cache data
        const state = getState() as RootState;
        const privacies =
          state.privacyApi.queries["getAllPrivacies(undefined)"]?.data;

        // Check if image is being updated
        const hasNewImage = formData.has("image");

        if (privacies) {
          // Apply optimistic update to getAllPrivacies cache
          const optimisticPatch = dispatch(
            privacyApi.util.updateQueryData(
              "getAllPrivacies",
              undefined,
              (draft) => {
                const privacyIndex = draft.findIndex(
                  (privacy) => privacy._id === id
                );
                if (privacyIndex !== -1) {
                  // Only update the content immediately, image will update after server response
                  draft[privacyIndex].content = content;
                }
              }
            )
          );

          // Also update the single privacy cache if it exists
          const singlePrivacyPatch = dispatch(
            privacyApi.util.updateQueryData("getPrivacyById", id, (draft) => {
              draft.content = content;
            })
          );

          try {
            // Wait for the actual response
            const result = await queryFulfilled;

            // If we have a new image and server returned updated privacy data
            if (hasNewImage && result.data.privacy) {
              // Update the cache with the new image URL
              dispatch(
                privacyApi.util.updateQueryData(
                  "getAllPrivacies",
                  undefined,
                  (draft) => {
                    const privacyIndex = draft.findIndex(
                      (privacy) => privacy._id === id
                    );
                    if (privacyIndex !== -1 && result.data.privacy) {
                      draft[privacyIndex].image = result.data.privacy.image;
                    }
                  }
                )
              );

              // Update single privacy cache with new image if it exists
              dispatch(
                privacyApi.util.updateQueryData(
                  "getPrivacyById",
                  id,
                  (draft) => {
                    if (result.data.privacy) {
                      draft.image = result.data.privacy.image;
                    }
                  }
                )
              );
            }
          } catch {
            // If the mutation fails, undo the optimistic update
            optimisticPatch.undo();
            singlePrivacyPatch.undo();
          }
        }
      },
      invalidatesTags: (result, error, { id }) => [
        "Privacy",
        { type: "Privacy", id },
      ],
    }),

    deletePrivacy: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Privacy"],
    }),
  }),
});

export const {
  useGetAllPrivaciesQuery,
  useGetPrivacyByIdQuery,
  useCreatePrivacyMutation,
  useUpdatePrivacyMutation,
  useDeletePrivacyMutation,
} = privacyApi;
