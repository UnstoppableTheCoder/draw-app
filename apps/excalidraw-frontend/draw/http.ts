import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const token = localStorage.getItem("token") || "";
  const res = await axios.get(`${HTTP_BACKEND}/canvas/${roomId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const shapes = res.data.shapes;
  return shapes;
}
