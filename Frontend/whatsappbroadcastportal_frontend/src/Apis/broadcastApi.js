import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const broadcastApi = createApi({
    reducerPath: "broadcastApi",
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
    tagTypes: ["Broadcast"],
    endpoints: (builder) => ({

        sendMessage: builder.mutation({
            query: (messageData) => ({
                url: "messagebroadcast/send",
                method: "POST",
                body: messageData,
            }),
            invalidatesTags: ["Broadcast"],
        }),

        validateSettings: builder.mutation({
            query: (validateData) => ({
              url: "messagebroadcast/validate",
              method: "POST",
              body: validateData,
            }),
            invalidatesTags: ["Broadcast"],
          }),

        sendMessageTemplate: builder.mutation({
            query: (messageData) => ({
                url: "messagebroadcast/send-twilio",
                method: "POST",
                body: messageData,
            }),
            invalidatesTags: ["Broadcast"],
        }),
        
    }),
});

export const { useSendMessageMutation, useValidateSettingsMutation, useSendMessageTemplateMutation } = broadcastApi;
export default broadcastApi;
