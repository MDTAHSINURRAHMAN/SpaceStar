import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Review } from "@/types/reviews";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getAllReviews: builder.query<Review[], { q?: string; product?: string; customer?: string; rating?: string } | void>({
      query: (params) => {
        if (!params) return "/api/reviews";
        
        // Build the query string with all provided parameters
        const queryParams = new URLSearchParams();
        
        if (params.q) queryParams.append("q", params.q);
        if (params.product) queryParams.append("product", params.product);
        if (params.customer) queryParams.append("customer", params.customer);
        if (params.rating) queryParams.append("rating", params.rating);
        
        const queryString = queryParams.toString();
        return queryString ? `/api/reviews?${queryString}` : "/api/reviews";
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((review) => ({
                type: "Review" as const,
                id: review._id,
              })),
              { type: "Review", id: "LIST" },
            ]
          : [{ type: "Review", id: "LIST" }],
    }),
    getReviewById: builder.query<Review, string>({
      query: (id) => `/api/reviews/${id}`,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),
    getReviewsByProductId: builder.query<Review[], string>({
      query: (productId) => `/api/reviews/product/${productId}`,
      providesTags: () => ["Review"],
    }),
    createReview: builder.mutation<any, FormData>({
        query: (formData) => ({
          url: "/api/reviews",
          method: "POST",
          body: formData,
        }),
        invalidatesTags: () => ["Review"],
      }),
    updateReview: builder.mutation<Review, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/reviews/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: () => ["Review"],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/reviews/${id}`,
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