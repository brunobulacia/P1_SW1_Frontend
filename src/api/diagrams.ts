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

export const deleteDiagram = async (diagramId: string) => {
  const response = await axios.delete(`/diagrams/${diagramId}`);
  return response.data;
};

export const updateDiagram = async (
  diagramId: string,
  diagramData: Partial<CreateDiagramDTO>
) => {
  const response = await axios.patch(`/diagrams/${diagramId}`, diagramData);
  return response.data;
};
