import { baseapi } from "@/Api"; // Import the base API instance
import { AnalysisData, PeaksData, Tasks, TaskUserData, TrendsData, UpdatedTask } from "@/types/tasks";

export const createTask = async (task: Tasks) => {
    const response = await baseapi.post(`/tasks/createTasks`, task); // Sending the entire task object in the body
    return response.data;
};

export const updateTask = async (task: UpdatedTask) => {
    const response = await baseapi.put(`/tasks/updateTask`, task); // Sending the entire task object in the body
    return response.data;
};

export const getUserAllTasks = async (queryParams: {
    startDate?: string;
    endDate?: string;
    status?: string;
    priority?: string;
}): Promise<TaskUserData>  => {
    const response = await baseapi.get(`/tasks/getUserAllTasks`, {
        params: queryParams, // Sends as req.query in backend
    });
    return response.data;
};

export const getUserTrends = async (queryParams: { userId?: string }): Promise<TrendsData> => {
    const { userId } = queryParams;
  
    // If no userId is provided, throw or handle accordingly
    if (!userId) {
      console.log("No userId provided to getUserTrends");
      return {
        collectiveTrends: {},
        groupWiseTrends: {},
      };
    }
  
    const url = `/tasks/getTrends/${userId}`;
  
    // Log the request
    console.log("Making request to:", url);
  
    const response = await baseapi.get(url);
  
    // Log the response
    console.log("Full response:", response);
  
    if (typeof response.data === 'string') {
      console.error("Received string response instead of TrendsData object:", response.data);
      return {
        collectiveTrends: {},
        groupWiseTrends: {},
      };
    }
  
    return response.data;
  };
export const getPeakHrs = async (queryParams: { userId?: string }): Promise<PeaksData> => {
    const { userId } = queryParams;
  
    // If no userId is provided, throw or handle accordingly
    if (!userId) {
      console.log("No userId provided to getUserTrends");
      return {
        collectivePeakHours: {},
        groupWisePeakHours: {},
      };
    }
  
    const url = `/tasks/getPeakHrs/${userId}`;
  
    // Log the request
    console.log("Making request to:", url);
  
    const response = await baseapi.get(url);
  
    // Log the response
    console.log("Full response:", response);
  
    if (typeof response.data === 'string') {
      console.error("Received string response instead of TrendsData object:", response.data);
      return {
        collectivePeakHours: {},
        groupWisePeakHours: {},
      };
    }
  
    return response.data;
  };  
export const getAnalysis = async (queryParams: { userId?: string }): Promise<AnalysisData> => {
    const { userId } = queryParams;
  
    // If no userId is provided, throw or handle accordingly
    if (!userId) {
      console.log("No userId provided to getUserTrends");
      return {
        collectiveStats: {},
      };
    }
    const url = `/tasks/getUserAnalysis/${userId}`;
    // Log the request
    console.log("Making request to:", url);
    const response = await baseapi.get(url);
    // Log the response
    console.log("Full response:", response);
    if (typeof response.data === 'string') {
      console.error("Received string response instead of TrendsData object:", response.data);
      return {
        collectiveStats: {},
      };
    }
    return response.data;
  };  

  

