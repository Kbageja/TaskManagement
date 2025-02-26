import { useQuery } from "@tanstack/react-query";
import { getUser, logoutUser } from "./api";


export function getAuthentication() {
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