import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const accountApi = createApi({
    reducerPath: "accountApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5295/api/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Account"],
    endpoints: (builder) => ({

        login: builder.mutation({
            query: (credentials) => ({
                url: "account/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["Account"],
        }),

        register: builder.mutation({
            query: (userData) => ({
                url: "account/register",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["Account"],
        }),

    }),
});

export const { useLoginMutation, useRegisterMutation } = accountApi;

export default accountApi;
