import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const settingsApi = createApi({
    reducerPath: "settingsApi",
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
    tagTypes: ["Settings"],
    endpoints: (builder) => ({

        getSettings: builder.query({
            query: (id) => `settings/${id}`,
            providesTags: ["Settings"],
        }),

        updateSettings: builder.mutation({
            query: ({ id, data }) => ({
                url: `settings/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Settings"],
        }),

    }),
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} = settingsApi;

export default settingsApi;
