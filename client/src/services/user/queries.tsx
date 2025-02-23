import { useQuery } from "@tanstack/react-query";
import { getUser, logoutUser } from "./api";


export function getAuthentication() {
    return useQuery({
      queryKey: ["isAuthenticated"],
      queryFn: () => getUser(),
      staleTime: Infinity,
      gcTime: 10 * 60 * 1000,
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