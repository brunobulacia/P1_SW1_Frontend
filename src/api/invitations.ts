import axios from "../lib/axios";

export const getDiagramByInvitationToken = async (token: string) => {
  const response = await axios.get(`/diagram-invites/token/${token}`);
  return response.data;
};
