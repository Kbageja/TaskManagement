import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Notify from "@/lib/notify";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { Tasks } from "@/types/tasks";
import { createTask } from "./api";




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