import { baseapi } from "@/Api"; // Import the base API instance
import { Tasks, UpdatedTask } from "@/types/tasks";

export const createTask = async (task: Tasks) => {
    const response = await baseapi.post(`/tasks/createTasks`, task); // Sending the entire task object in the body
    return response.data;
};

export const updateTask = async (task: UpdatedTask) => {
    const response = await baseapi.put(`/tasks/updateTask`, task); // Sending the entire task object in the body
    return response.data;
};