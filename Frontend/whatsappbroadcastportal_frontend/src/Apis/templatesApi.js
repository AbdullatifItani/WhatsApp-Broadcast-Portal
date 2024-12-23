import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const templatesApi = createApi({
    reducerPath: "templatesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5295/api/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.append("Authorization", "Bearer " + token);
            }
            return headers;
        },
    }),
    tagTypes: ["Templates"],
    endpoints: (builder) => ({

        getTemplates: builder.query({
            query: () => ({
                url: "templates/fetch-all-templates",
            }),
            providesTags: ["Templates"],
        }),

        getTemplateById: builder.query({
            query: (contentSid) => `templates/fetch-template?contentSid=${contentSid}`,
            providesTags: ["Templates"],
        }),

        createTemplate: builder.mutation({
            query: (data) => ({
                url: "templates/create-template",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Templates"],
        }),

        deleteTemplate: builder.mutation({
            query: (contentSid) => ({
                url: `templates/delete-template?contentSid=${contentSid}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Templates"],
        }),

        approveTemplate: builder.mutation({
            query: (contentSid) => ({
                url: `templates/approve-template?contentSid=${contentSid}`,
                method: "POST",
            }),
            invalidatesTags: ["Templates"],
        }),

        approveTemplateStatus: builder.query({
            query: (contentSid) => `templates/approve-template-status?contentSid=${contentSid}`,
            providesTags: ["Templates"],
        }),

        fetchContentAndApprovals: builder.query({
            query: () => `templates/fetch-content-and-approvals`,
            providesTags: ["Templates"],
        }),

    }),
});

export const {
    useGetTemplatesQuery,
    useGetTemplateByIdQuery,
    useCreateTemplateMutation,
    useDeleteTemplateMutation,
    useApproveTemplateMutation,
    useApproveTemplateStatusQuery,
    useFetchContentAndApprovalsQuery,
} = templatesApi;
export default templatesApi;
