import { baseapi } from "@/Api"; // Import the base API instance
import { Tasks } from "@/types/tasks";

export const createTask = async (task: Tasks) => {
    const response = await baseapi.post(`/tasks/createTasks`, task); // Sending the entire task object in the body
    return response.data;
};