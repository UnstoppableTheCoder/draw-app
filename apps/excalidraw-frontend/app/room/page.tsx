"use client";

import isUser from "@/auth/isUser";
import Logout from "@/components/Logout";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Room {
  id: number;
  slug: string;
  createdAt: Date;
  adminId: string;
}

export default function Room() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState();
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const userExits = isUser(token);
    if (!userExits) {
      router.push("/signup");
      toast.error("User is not logged in");
    }

    // Get all the rooms from backend
    async function fetchRooms() {
      try {
        const res = await axios.get("http://localhost:3001/rooms", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        setRooms(res.data.rooms);

        if (res.data.rooms.length) {
          toast.success("Rooms fetches successfully");
        } else {
          toast.success("You haven't created rooms yet");
        }
      } catch (error: any) {
        console.log("Error fetching the rooms: ", error);
        toast.error(error.response.data.message);
      }
    }

    fetchRooms();
  }, [roomId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const token = localStorage.getItem("token") || "";
    e.preventDefault();
    const res = await axios.post(
      "http://localhost:3001/rooms",
      {
        name: roomName,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    if (res) {
      toast.success(`Room created successfully`);
      setRoomId(res.data.roomId);
      setRoomName("");
    }
    try {
    } catch (error: any) {
      console.log("Error", error);
      toast.error(error.response.data.message);
    }
  };

  const handleJoinRoom = (id: number) => {
    router.push(`/canvas/${id}`);
  };

  const handleDeleteRoom = async (roomId: number) => {
    const token = localStorage.getItem("token") || "";
    console.log("Room Id: ", roomId);
    try {
      const res = await fetch(`http://localhost:3001/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const jsonRes = await res.json();

      setRoomId(jsonRes.room.id);
      toast.success("Room deleted successfully");
    } catch (error: any) {
      console.log("Error deleting the room: ", error);
      toast.error(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-700 relative">
      <div className="absolute top-3 right-5">
        <Logout bgColor="bg-gray-500" />
      </div>
      <div className="flex justify-center items-center h-full w-full">
        <div className="space-y-8 bg-white text-gray-800 p-5 rounded-lg w-[550px]">
          <h1 className="font-bold text-3xl text-center">Create a Room</h1>

          <form onSubmit={handleSubmit} className="w-full flex">
            <input
              type="text"
              placeholder="Enter your room name"
              className="border-2 border-r-0 rounded-l-lg px-3 py-2 border-gray-700 outline-none flex-1"
              onChange={handleChange}
              value={roomName}
            />
            <button className="border-2 border-gray-700 border-l-0 px-3 py-2 rounded-r-lg bg-gray-700 text-white cursor-pointer">
              Create Room
            </button>
          </form>

          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Join a Room</h2>
            <div className="flex flex-col gap-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex justify-between w-full">
                  <div className="px-3 py-2 rounded-l-lg bg-gray-300 text-black flex items-center flex-1">
                    <div className="flex-1">{room.slug}</div>

                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="mr-3 cursor-pointer bg-gray-700 text-white transition duration-300 rounded-full p-2 hover:bg-gray-800"
                    >
                      <Trash />
                    </button>
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="px-3 py-2 rounded-r-lg bg-gray-700 text-white cursor-pointer"
                  >
                    Join Room
                  </button>
                </div>
              ))}
              {!rooms.length && <div>No Rooms Created</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
