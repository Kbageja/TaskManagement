import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AcceptInvite, createGroup, deleteGroup, deleteSubUser, GenerateInvite } from "./api";
import axios from "axios";
import Notify from "../../lib/notify";
import { useRouter } from "next/navigation";
import { DummyDataType } from "../../types/group";
import { toast } from "../../hooks/use-toast"




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
        queryClient.invalidateQueries({ queryKey: ["groupsLevelWise"] });
        }, 500);

        toast({
          title: "Success",
          description: "Group deleted successfully",
      });
      },
      onError: (error) => {
        console.error("onError: Rolling back UI update");
        
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message);
        }
        toast({
          title: "Error",
          description: "Failed to delete group",
          variant: "destructive",
      });
      },
    });
  };
export const useDeleteSubUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ groupId, parentId, subUserId }: { groupId: number; parentId: string; subUserId: string }) => 
        deleteSubUser(groupId, parentId, subUserId),
        
      onSuccess: () => {
        // Invalidate queries to refetch the data
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        toast({
          title: "Success",
          description: "User deleted successfully",
      });
      },
      
      onError: (error) => {
        console.error("Error deleting sub-user:", error);
        
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message || "Failed to delete user");
        }
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
      });
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
          queryClient.invalidateQueries({ queryKey: ["groupsLevelWise"] });
        }, 500);
        toast({
          title: "Success",
          description: "Group created successfully",
      });
      },
      onError: (error) => {
        console.error("onError: Rolling back UI update");
  
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message);
        }
        toast({
          title: "Error",
          description: "Failed to create group",
          variant: "destructive",
      });
      },
    });
  };
export const useAcceptInvite = () => {  
  const router = useRouter(); // Initialize Next.js router
    return useMutation({
      mutationFn: (InviteToken: string) => AcceptInvite(InviteToken), // Pass only `InviteToken`
      onSuccess: () => {
        //("success accepted Invite");
        router.push("/dashboard"); // Redirect to Dashboard after success  
      },
      onError: (error) => {
        console.error(error, "error");
      
        let errorMessage = "Something went wrong";
      
        // Check if it's an Axios error and has a response message
        if (axios.isAxiosError(error)) {
          errorMessage = error?.response?.data?.message || errorMessage;
          Notify('error', errorMessage);
        }
      
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
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