import axios from "../lib/axios";

export const getZip = async (diagramId: string) => {
  const response = await axios.get(`export/generate-spring/${diagramId}`, {
    responseType: "blob",
  });
  return response.data;
};
