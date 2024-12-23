import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const contactsApi = createApi({
    reducerPath: "contactsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5295/api/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            /*if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }*/
            //return headers;
            token && headers.append("Authorization", "Bearer " + token);
        },
    }),
    tagTypes: ["Contacts"],
    endpoints: (builder) => ({

        getContacts: builder.query({
            query: ({ userId, searchString, address, pageNumber, pageSize, sortBy, sortOrder }) => ({
                url: "contacts",
                params: {
                    ...(userId && { userId }),
                    ...(searchString && { searchString }),
                    ...(address && { address }),
                    ...(pageSize && { pageSize }),
                    ...(pageNumber && { pageNumber }),
                    ...(sortBy && { sortBy }),
                    ...(sortOrder && { sortOrder }),
                },
            }),
            transformResponse(apiResponse, meta) {
                return {
                  apiResponse,
                  totalRecords: meta.response.headers.get("X-Pagination"),
                };
              },
            providesTags: ["Contacts"],
        }),

        getContactById: builder.query({
            query: (id) => `contacts/${id}`,
            providesTags: ["Contacts"],
        }),

        getAllContacts: builder.query({
            //query: (userId) => `contacts/allcontacts/${userId}`,
            query: (userId) => `contacts/allcontacts?userId=${userId}`,
            providesTags: ["Contacts"],
        }),

        createContact: builder.mutation({
            query: (data) => ({
                url: "contacts",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Contacts"],
        }),

        updateContact: builder.mutation({
            query: ({ id, data }) => ({
                url: `contacts/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Contacts"],
        }),

        deleteContact: builder.mutation({
            query: (id) => ({
                url: `contacts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Contacts"],
        }),

        importContacts: builder.mutation({
            query: (data) => ({
                url: "contacts/import",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Contacts"],
        }),
        
    }),
});

export const {
    useGetContactsQuery,
    useGetContactByIdQuery,
    useGetAllContactsQuery,
    useCreateContactMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
    useImportContactsMutation,
} = contactsApi;

export default contactsApi;
