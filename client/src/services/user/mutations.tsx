import { loginData, registerData, verifyEmailData } from "@/types/user";
import { login, logoutUser, register, verifyEmail } from "./api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Notify from "@/lib/notify";

export function useRegister() {
    return useMutation({
      mutationFn: (data: registerData) => register(data),
      onMutate: () => {
        console.log("onMutate");
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          console.error("onError", error?.response?.data?.message);
          Notify("error", error?.response?.data?.message);
        }
      },
      onSuccess: (response) => {
        console.log("onSuccess");
        if (response) {
          Notify("success", response?.data?.message);
          window.location.href = "/verifyemail";
        }
      },
      onSettled: () => {
        console.log("on setteled");
      },
    });
  }

  export function useVerifyEmail() {
    return useMutation({
      mutationFn: (data: verifyEmailData) => verifyEmail(data),
      onMutate: () => {
        console.log("onMutate");
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          console.error("onError", error?.response?.data?.message);
          Notify("error", error?.response?.data?.message);
        }
      },
      onSuccess: (response) => {
        console.log("onSuccess");
        if (response) {
          Notify("success", response?.data?.message);
          window.location.href = "/dashboard";
        }
      },
      onSettled: () => {
        console.log("on setteled");
      },
    });
  }

  export function useLogout() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: logoutUser, // Function to perform logout
      onSuccess: () => {
        // Invalidate the 'isAuthenticated' query correctly
        queryClient.removeQueries({ queryKey: ["isAuthenticated"] });
      },
      onError: (error) => {
        console.error("Logout failed:", error);
      },
    });
  }
  export function useLogin() {
    return useMutation({
      mutationFn: (data: loginData) => login(data),
      onMutate: () => {
        console.log("onMutate");
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          console.error("onError", error?.response);
          Notify("error", error?.response?.data?.message);
        }
      },
      onSuccess: (response) => {
        console.log("onSuccess");
        if (response) {
          Notify("success", response?.data?.message);
          window.location.href = "/dashboard";
        }
      },
      onSettled: () => {
        console.log("on setteled");
      },
    });
  }