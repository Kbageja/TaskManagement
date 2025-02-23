import axios from "axios";

export const baseapi = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // Include cookies in all requests
});
