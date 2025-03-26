import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AcceptInvite, checkInvite, createGroup, deleteGroup, deleteSubUser, GenerateInvite, getGroup } from "./api";
import axios from "axios";
import Notify from "@/lib/notify";
import { useRouter } from "next/navigation";
import { DummyDataType, Group } from "@/types/group";
import { redirect } from "next/navigation";



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
export const useDeleteSubUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ groupId, parentId, subUserId }: { groupId: number; parentId: string; subUserId: string }) => 
        deleteSubUser(groupId, parentId, subUserId),
        
      onSuccess: (_, variables) => {
        // Invalidate queries to refetch the data
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      },
      
      onError: (error) => {
        console.error("Error deleting sub-user:", error);
        
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message || "Failed to delete user");
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
export const useAcceptInvite = () => {  
  const router = useRouter(); // Initialize Next.js router
    return useMutation({
      mutationFn: (InviteToken: string) => AcceptInvite(InviteToken), // Pass only `InviteToken`
      onSuccess: () => {
        console.log("success accepted Invite");
        router.push("/dashboard"); // Redirect to Dashboard after success  
      },
      onError: (error) => {
        console.error('onError: Rolling back UI update');
  
        if (axios.isAxiosError(error)) {
          Notify('error', error?.response?.data?.message);
        }
      },
    });
  }; 
  
  export const useGenerateInvite = () => {  
    return useMutation({
      mutationFn: ({ GroupId, inviterId }: { GroupId: string; inviterId: string }) =>
        GenerateInvite(GroupId, inviterId),
      onSuccess: (data) => {
        return data;
      },
      onError: (error) => {
        console.error('onError: Rolling back UI update');
  
        if (axios.isAxiosError(error)) {
          Notify('error', error?.response?.data?.message);
        }
      },
    });
  };