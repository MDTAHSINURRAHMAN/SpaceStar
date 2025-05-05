import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginRequest, LoginResponse } from "../../types/login";

export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query<LoginResponse["user"], void>({
      query: () => ({
        url: "/auth/me",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery, // 👈 export this for use in RequireAuth
} = loginApi;
