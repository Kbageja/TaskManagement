 // Importing types from Axios
import { baseapi } from "../../Api"; // Import the base API instance
import { loginData, registerData, UserProfile, verifyEmailData } from "../../types/user";

export const getUser = () => {
    return baseapi.get("/auth/isLoggedIn", {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  };
export const logoutUser = () => {
    return baseapi.post("/auth/logout");
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
  
  export const getUserProfile = async (queryParams: { userId?: string }): Promise<UserProfile> => {
    const { userId } = queryParams;
  
    if (!userId) {
      return {
        name: "",
        email: "",
        groups: [],
      };
    }
  
    const url = `/user/getUserProfile/${userId}`;
  
    try {
      const response = await baseapi.get<UserProfile>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        name: "",
        email: "",
        groups: [],
      };
    }
  };
  
  