  import { loginData, registerData, verifyEmailData } from "../../types/user";
  import { login, logoutUser, register, verifyEmail } from "./api";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import axios from "axios";
  import Notify from "../../lib/notify";

  export function useRegister() {
      return useMutation({
        mutationFn: (data: registerData) => register(data),
        onMutate: () => {
          //("onMutate");
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            console.error("onError", error?.response?.data?.message);
            Notify("error", error?.response?.data?.message);
          }
        },
        onSuccess: (response) => {
          //("onSuccess");
          if (response) {
            Notify("success", response?.data?.message);
            window.location.href = "/verifyemail";
          }
        },
        onSettled: () => {
          //("on setteled");
        },
      });
    }

    export function useVerifyEmail() {
      return useMutation({
        mutationFn: (data: verifyEmailData) => verifyEmail(data),
        onMutate: () => {
          //("onMutate");
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            console.error("onError", error?.response?.data?.message);
            Notify("error", error?.response?.data?.message);
          }
        },
        onSuccess: (response) => {
          //("onSuccess");
          if (response) {
            Notify("success", response?.data?.message);
            window.location.href = "/dashboard";
          }
        },
        onSettled: () => {
          //("on setteled");
        },
      });
    }

    export function useLogout() {
      const queryClient = useQueryClient();
    
      return useMutation({
        mutationFn: logoutUser, // Function to perform logout
        onSuccess: () => {
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
          //("onMutate");
        },
        
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            console.error("onError", error?.response);
            Notify("error", error?.response?.data?.message);
          }
        },
        
        onSuccess: (response) => {
          //("onSuccess", response);
          
          if (response && response.data) {
            // Store auth data in localStorage
            const userData = response.data.data.user;
            const token = response.data.data.session?.access_token; // Extract access token
            
            
            // Make sure we have user data and token before proceeding
            if (userData && token) {
              // Store auth data in localStorage
              localStorage.setItem("authData", JSON.stringify({ token }));
              localStorage.setItem("userId", userData.id);
              
              // Show success notification
              Notify("success", response?.data?.message || "Login successful");
              
              // Redirect to dashboard (use Next.js router for better navigation if possible)
              window.location.href = "/dashboard";
            } else {
              console.error("Login response missing user data or token:", response.data);
              Notify("error", "Login successful but user data incomplete. Please try again.");
            }
          }
        },
        
        onSettled: () => {
          //("on settled");
        },
      });
    }