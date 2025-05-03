import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Notify from "../../lib/notify";
import { Tasks, UpdatedTask } from "../../types/tasks";
import { createTask, updateTask } from "./api";
import { toast } from "../../hooks/use-toast"



export const useSubmitTask = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (task: Tasks) => createTask(task), // Pass only `name`
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        }, 500);

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

  
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: UpdatedTask) => updateTask(task), // Pass only `name`
    onSuccess: () => {
      //("Success Task Updated")
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }, 500);
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