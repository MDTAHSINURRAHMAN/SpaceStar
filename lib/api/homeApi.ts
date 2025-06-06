import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TextEntry } from "@/types/home";

interface CreateUpdateTextPayload {
  text: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  twitter: string;
}

export const homeApi = createApi({
  reducerPath: "homeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api/home", // ✅ FIXED
    credentials: "include",
  }),
  tagTypes: ["Texts"],
  endpoints: (builder) => ({
    getAllTexts: builder.query<TextEntry[], void>({
      query: () => "/",
      providesTags: ["Texts"],
    }),
    getTextById: builder.query<TextEntry, string>({
      query: (id) => `/texts/${id}`,
      providesTags: (result, error, id) => [{ type: "Texts", id }],
    }),
    createText: builder.mutation<TextEntry, CreateUpdateTextPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Texts"],
    }),
    updateText: builder.mutation<
      TextEntry,
      { id: string } & CreateUpdateTextPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Texts",
        { type: "Texts", id },
      ],
    }),
    deleteText: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Texts"],
    }),
  }),
});

export const {
  useGetAllTextsQuery,
  useGetTextByIdQuery,
  useCreateTextMutation,
  useUpdateTextMutation,
  useDeleteTextMutation,
} = homeApi;
