import axios from "../lib/axios";

export const getZip = async () => {
  const response = await axios.get("export/demo-zip", {
    responseType: "blob",
  });
  return response.data;
};
