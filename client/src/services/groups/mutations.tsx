import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup, deleteGroup, getGroup } from "./api";
import axios from "axios";
import Notify from "@/lib/notify";
import { DummyDataType, Group } from "@/types/group";



export const useDeleteGroup = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (groupId: number) => deleteGroup(groupId),
      onSuccess: (_, groupId) => {        
        // Optimistic update - immediately remove from UI
        queryClient.setQueryData<DummyDataType>(["groups"], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            Data: oldData.Data.filter(group => group.id !== groupId)
          };
        });
        
        // With Supabase, we might need to wait a bit for the deletion to propagate
        setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        }, 500);
      },
      onError: (error) => {
        console.error("onError: Rolling back UI update");
        
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message);
        }
      },
    });
  };

  export const useCreateGroup = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (name: string) => createGroup(name), // Pass only `name`
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        }, 500);
      },
      onError: (error) => {
        console.error("onError: Rolling back UI update");
  
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message);
        }
      },
    });
  };
  ;