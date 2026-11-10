import { baseApi } from "@/features/app/baseApi";
import type {
  CreateGoalInput,
  DeleteGoalResponse,
  GoalResponse,
  SavingsGoal,
  UpdateGoalInput,
} from "./types";

export const goalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    goals: builder.query<SavingsGoal[], void>({
      query: () => "/goals",
      providesTags: ["Goal"],
    }),
    createGoal: builder.mutation<GoalResponse, CreateGoalInput>({
      query: (body) => ({
        url: "/goals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goal"],
    }),
    updateGoal: builder.mutation<GoalResponse, UpdateGoalInput>({
      query: ({ id, ...body }) => ({
        url: `/goals/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Goal"],
    }),
    deleteGoal: builder.mutation<DeleteGoalResponse, number>({
      query: (id) => ({
        url: `/goals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Goal"],
    }),
  }),
});

export const {
  useGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
} = goalApi;
