import { useQuery } from "@tanstack/react-query";
import { getUserAllTasks, getUserTrends } from "./api";
import { TaskUserData, TrendsData } from "@/types/tasks";

export const useTasks = (queryParams?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  priority?: string;
}) => {
  return useQuery<TaskUserData, Error>({
    queryKey: ['tasks', queryParams || {}], // Ensures refetching when filters change
    queryFn: () => getUserAllTasks(queryParams || {}), // Pass empty object if no filters
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useTrends = (queryParams?: { userId?: string }) => {
  console.log('useTrends called with:', queryParams);

  const result = useQuery<TrendsData, Error>({
    queryKey: ['trends', queryParams || {}],
    queryFn: () => {
      console.log('queryFn executing with:', queryParams);
      return getUserTrends(queryParams || {});
    },
    staleTime: 10*60*1000,
    gcTime: 10*60*1000,
  });
  
  console.log('useQuery result:', result.status, result.data, result.error);
  return result;
};