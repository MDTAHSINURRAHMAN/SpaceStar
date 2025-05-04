import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Order } from "@/types/orders";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getAllOrders: builder.query<Order[], void>({
      query: () => "/api/orders",
      providesTags: (result) =>
        result
          ? [
              ...result.map((order) => ({
                type: "Order" as const,
                id: order._id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/api/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (order) => ({
        url: "/api/orders",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrder: builder.mutation<Order, { id: string; order: Partial<Order> }>(
      {
        query: ({ id, order }) => ({
          url: `/api/orders/${id}`,
          method: "PUT",
          body: order,
        }),
        invalidatesTags: [{ type: "Order", id: "LIST" }],
      }
    ),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
