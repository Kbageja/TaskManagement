import { useQuery } from "@tanstack/react-query";
import { getUser, getUserProfile } from "./api";
import { UserProfile } from "../../types/user";


export function useAuthentication() {
    return useQuery({
      queryKey: ["isAuthenticated"],
      queryFn: () => getUser(),
      staleTime: 0,
      gcTime: 0,
    });
  }

  // export function useLogout() {
  //   return useQuery({
  //     queryKey: ["isAuthenticated"],
  //     queryFn: logoutUser,
  //     staleTime: 0,
  //     gcTime: 0,
  //   });
  // }

  export const useUserProfile = (queryParams?: { userId?: string }) => {
    console.log('useTrends called with:', queryParams);
  
    const result = useQuery<UserProfile, Error>({
      queryKey: ['UserProfile', queryParams || {}],
      queryFn: () => {
        return getUserProfile(queryParams || {});
      },
      staleTime: 10*60*1000,
      gcTime: 10*60*1000,
    });
    return result;
  };
  