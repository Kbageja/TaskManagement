import { useQuery } from "@tanstack/react-query";
import { getGroup } from "./api";
import { DummyDataType } from "@/types/group";



export const getGroups = () => {
  return useQuery<DummyDataType, Error>({
    queryKey: ['groups'],
    queryFn: getGroup,
    staleTime: 0,  // Always consider data stale
    refetchOnMount: 'always',  // Always refetch when component mounts
    refetchOnWindowFocus: true  // Refetch when window regains focus
  });
};