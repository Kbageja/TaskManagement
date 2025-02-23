 // Importing types from Axios
import { baseapi } from "@/Api"; // Import the base API instance
import { loginData, registerData, verifyEmailData } from "@/types/user";

export const getUser = () => {
    return baseapi.get("/auth/isLoggedIn");
  };
export const logoutUser = () => {
    return baseapi.get("/auth/logout");
  };
export const register = (data: registerData) => {
    return baseapi.post("/auth/signup", data);
  };
export const login = (data: loginData) => {
    return baseapi.post("/auth/login", data);
  };
export const verifyEmail = (data: verifyEmailData) => {
    return baseapi.post("/auth/verifyEmail", data);
  };  
