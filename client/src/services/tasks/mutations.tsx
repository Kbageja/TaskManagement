import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Notify from "../../lib/notify";
import { Tasks, UpdatedTask } from "../../types/tasks";
import { createTask, updateTask } from "./api";




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
        console.error("onError: Rolling back UI update");
  
        if (axios.isAxiosError(error)) {
          Notify("error", error?.response?.data?.message);
        }
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
      console.error("onError: Rolling back UI update");

      if (axios.isAxiosError(error)) {
        Notify("error", error?.response?.data?.message);
      }
    },
  });
};