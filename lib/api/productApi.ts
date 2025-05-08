import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Product } from "@/types/product";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Product", "Category"],
  endpoints: (builder) => ({
    getAllProducts: builder.query<
      Product[],
      { search?: string; category?: string } | void
    >({
      query: (params) => {
        if (!params) return "/api/products";
        const query = new URLSearchParams(params).toString();
        return `/api/products?${query}`;
      },
      providesTags: ["Product"],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: "/api/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<
      Product,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    uploadChartImage: builder.mutation<
      { chartImage: string },
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/api/products/${id}/chart-image`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    getAllCategories: builder.query<string[], void>({
      query: () => "/api/products/categories",
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadChartImageMutation,
  useGetAllCategoriesQuery,
} = productApi;
