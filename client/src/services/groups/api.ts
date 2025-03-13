import { baseapi } from "@/Api"; // Import the base API instance
import { DummyDataType } from "@/types/group";

export const getGroup = async (): Promise<DummyDataType> => {
  const timestamp = new Date().getTime();
  const response = await baseapi.get<DummyDataType>(`/user/getAllGroups?t=${timestamp}`);
  return response.data;
};

  export const deleteGroup = async (groupId: number) => {
    const response = await baseapi.delete(`/user/deleteGroup/${groupId}`);
    return response.data; // Return the resolved data
};
 
export const createGroup = async (name: string) => {
  const response = await baseapi.post(`/user/createGroup`, { name }); // Correctly sending name in body
  return response.data;
};



  