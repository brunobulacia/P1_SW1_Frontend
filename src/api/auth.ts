import axios from "../lib/axios";
import { LoginData, RegisterData } from "../types/auth/auth";
export const loginApi = async (data: LoginData) => {
  const response = await axios.post("auth/login", data);
  console.log(response);
  return response.data;
};

export const registerApi = async (data: RegisterData) => {
  const response = await axios.post("auth/register", data);
  console.log(response);
  return response.data;
};
