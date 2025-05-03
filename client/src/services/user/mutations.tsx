  import { loginData, registerData, verifyEmailData } from "../../types/user";
  import { login, logoutUser, register, verifyEmail } from "./api";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import axios from "axios";
  import Notify from "../../lib/notify";
  import { toast } from "../../hooks/use-toast"

  export function useRegister() {
      return useMutation({
        mutationFn: (data: registerData) => register(data),
        onMutate: () => {
          //("onMutate");
        },
        onError: (error) => {
          let errorMessage = ""
          if (axios.isAxiosError(error)) {
            console.error("onError", error?.response?.data?.message);
            Notify("error", error?.response?.data?.message);
            errorMessage+=error?.response?.data?.message
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
        },
        onSuccess: (response) => {
          //("onSuccess");
          if (response) {
            Notify("success", response?.data?.message);
            toast({
              title: "Confirmation",
              description: "Confirm the Email",
          });
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
        onSuccess: (response) => {
          //("onSuccess");
          if (response && response.data) {
            // Store auth data in localStorage
            const userData = response.data.data.user;
            const token = response.data.data.user.id; // Extract access token
            
            
            // Make sure we have user data and token before proceeding
            if (userData && token) {
              // Store auth data in localStorage
              localStorage.setItem("authData", JSON.stringify({ token }));
              localStorage.setItem("userId", userData.id);
              
              // Show success notification
              Notify("success", response?.data?.message || "Login successful");
              toast({
                title: "Signup Completed",
                description: "Email is confirmed now Login",
            });
            alert("Email Verification and Registration is Complete ,now Proceed to Login")
              // Redirect to dashboard (use Next.js router for better navigation if possible)
              window.location.href = "/";
            } else {
              console.error("Login response missing user data or token:", response.data);
              Notify("error", "Login successful but user data incomplete. Please try again.");
            }
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
    }
    
    export function   useLogin() {
      return useMutation({
        mutationFn: (data: loginData) => login(data),
        
        onMutate: () => {
          //("onMutate");
        },
        
        onError: (error) => {
          let errorMessage =""
          if (axios.isAxiosError(error)) {
            console.error("onError", error?.response);
            Notify("error", error?.response?.data?.message);
            errorMessage+=error?.response?.data?.message
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
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