import { baseapi } from "@/Api"; // Import the base API instance
import { DummyDataType, GroupLevelData } from "@/types/group";

export const getGroup = async (): Promise<DummyDataType> => {
  const timestamp = new Date().getTime();
  const response = await baseapi.get<DummyDataType>(`/user/getAllGroups?t=${timestamp}`);
  return response.data;
};
export const getGroupLevel = async (): Promise<GroupLevelData> => {
  const timestamp = new Date().getTime();
  const response = await baseapi.get<GroupLevelData>(`/user/getGroupLevel?t=${timestamp}`);
  return response.data;
};
export const checkInvite = async (InviteToken: string) => {
  const response = await baseapi.get(`/user/checkInvite/${InviteToken}`);
  return response.data; // Return the resolved data
};

export const deleteGroup = async (groupId: number) => {
    const response = await baseapi.delete(`/user/deleteGroup/${groupId}`);
    return response.data; // Return the resolved data
};
export const createGroup = async (name: string) => {
  const response = await baseapi.post(`/user/createGroup`, { name }); // Correctly sending name in body
  return response.data;
};
export const AcceptInvite = async (InviteToken: string) => {
  const response = await baseapi.post(`/user/acceptInvite/${InviteToken}`);
  return response.data; // Return the resolved data
};
export const GenerateInvite = async (GroupId: string,inviterId:string) => {
  const response = await baseapi.post(`/user/inviteUser`,{GroupId,inviterId});
  return response.data; // Return the resolved data
};

  