import { useQuery } from "@tanstack/react-query";
import { checkInvite, getGroup, getGroupLevel } from "./api";
import { DummyDataType, GroupLevelData } from "@/types/group";



export const getGroups = () => {
  return useQuery<DummyDataType, Error>({
    queryKey: ['groups'],
    queryFn: getGroup,
    staleTime: 10*60*1000,  // Always consider data stale
    gcTime:10*60*1000,
  });
};

export const getGroupsLevelWise = () => {
  return useQuery<GroupLevelData, Error>({
    queryKey: ['groupsLevelWise'],
    queryFn: getGroupLevel,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });
};
export const useCheckInvite = (InviteToken: string) => {
  return useQuery({
    queryKey: ['checkInvite', InviteToken], // Unique query key (still required for React Query)
    queryFn: () => checkInvite(InviteToken), // Call the query function
    enabled: !!InviteToken, // Only run the query if `InviteToken` is provided
    gcTime: 0, // Disable caching
    staleTime: 0, // Ensure the data is always considered stale
  });
};