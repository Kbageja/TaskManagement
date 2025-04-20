import axios from "axios";
const baseApi = process.env.NEXT_PUBLIC_BASE_API; // ✅ correct way
console.log(baseApi);
export const baseapi = axios.create({
  baseURL: baseApi,
  withCredentials: true, // Include cookies in all requests
});
