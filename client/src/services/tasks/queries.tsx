import { useQuery } from "@tanstack/react-query";
import { getAnalysis, getPeakHrs, getUserAllTasks, getUserTrends } from "./api";
import { AnalysisData, PeaksData, TaskUserData, TrendsData } from "@/types/tasks";

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

export const usePeakHrs = (queryParams?: { userId?: string }) => {
  console.log('useTrends called with:', queryParams);

  const result = useQuery<PeaksData, Error>({
    queryKey: ['PeakHrs', queryParams || {}],
    queryFn: () => {
      return getPeakHrs(queryParams || {});
    },
    staleTime: 10*60*1000,
    gcTime: 10*60*1000,
  });
  return result;
};

export const useAnalysis = (queryParams?: { userId?: string }) => {
  console.log('useTrends called with:', queryParams);

  const result = useQuery<AnalysisData, Error>({
    queryKey: ['Analysis', queryParams || {}],
    queryFn: () => {
      return getAnalysis(queryParams || {});
    },
    staleTime: 10*60*1000,
    gcTime: 10*60*1000,
  });
  return result;
};