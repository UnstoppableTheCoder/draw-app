import { LogOut } from "lucide-react";
import { IconButton } from "../canvas/IconButton";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LeaveRoom({
  socket,
  roomId,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const router = useRouter();

  const handleLeaveRoom = () => {
    try {
      socket.send(
        JSON.stringify({
          type: "leave_room",
          roomId,
        })
      );
      router.push("/room");
      toast.success("Left the room");
    } catch (error) {
      console.log("Error leaving the room: ", error);
      toast.error(error as string);
    }
  };

  return (
    <div className="absolute top-2 right-5">
      <IconButton icon={<LogOut />} onClick={handleLeaveRoom} />
    </div>
  );
}
