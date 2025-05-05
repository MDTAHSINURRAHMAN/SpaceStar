import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Review } from "@/types/reviews";
export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    credentials: "include",
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getAllReviews: builder.query<Review[], void>({
      query: () => "/reviews",
      providesTags: ["Review"],
    }),
    getReviewById: builder.query<Review, string>({
      query: (id) => `/reviews/${id}`,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),
    getReviewsByProductId: builder.query<Review[], string>({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: () => ["Review"],
    }),
    createReview: builder.mutation<any, FormData>({
        query: (formData) => ({
          url: "/reviews",
          method: "POST",
          body: formData,
        }),
        invalidatesTags: () => ["Review"],
      }),
    updateReview: builder.mutation<Review, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/reviews/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: () => ["Review"],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useGetReviewByIdQuery,
  useGetReviewsByProductIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
