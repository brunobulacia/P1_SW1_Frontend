import axios from "../lib/axios";
import { CreateDiagramDTO } from "../types/diagrams/diagrams";

export const getDiagramsByUser = async (userId: string) => {
  const response = await axios.get(`/diagrams/?userId=${userId}`);
  return response.data;
};

export const createDiagram = async (diagramData: CreateDiagramDTO) => {
  const response = await axios.post("/diagrams", diagramData);
  return response.data;
};
