"use client";

import Logout from "@/components/auth/Logout";
import isLoggedIn from "@/helper/isLoggedIn";
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const loggedIn = isLoggedIn(token);

    if (!loggedIn) {
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
      } catch (error: unknown) {
        console.log("Error fetching the rooms: ", error);
        if (axios.isAxiosError(error) && error.response?.data) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error while fetching the rooms");
        }
      }
    }

    fetchRooms();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleRoomCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const token = localStorage.getItem("token") || "";
    e.preventDefault();
    try {
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
        console.log(res.data);
        toast.success(`Room created successfully`);
        setRooms((prev) => [...prev, res.data.room]);
        setRoomName("");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error while creating the room");
      }
    }
  };

  const handleJoinRoom = (id: number) => {
    router.push(`/canvas/${id}`);
  };

  const handleDeleteRoom = async (roomId: number) => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`http://localhost:3001/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const jsonRes = await res.json();

      setRooms((prevRooms) =>
        prevRooms.filter((room) => room.id !== jsonRes.room.id)
      );
      toast.success("Room deleted successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error while deleting the room");
      }
    }
  };

  const handleCopy = (roomId: number) => {
    try {
      navigator.clipboard.writeText(roomId.toString());
      toast.success("Id copied to clipboard successfully");
    } catch (error) {
      toast.error("Failed to copy the ID");
      console.log("Failed to copy the ID to the clipboard", error);
    }
  };

  const handleJoinRoomWithId = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/canvas/${roomId}`);
  };

  return (
    <div className="w-screen h-screen bg-gray-700 relative">
      {/* Logout  */}
      <div className="absolute top-3 right-5">
        <Logout bgColor="bg-gray-500" />
      </div>

      <div className="flex justify-center items-center h-full w-full">
        <div className="space-y-8 bg-white text-gray-800 p-5 rounded-lg w-[550px]">
          {/* Create Room */}
          <h1 className="font-bold text-3xl text-center">Create a Room</h1>

          <form onSubmit={handleRoomCreateSubmit} className="w-full flex">
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

          {/* Join Room */}
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Join Your Rooms</h2>

            <div className="flex flex-col gap-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex justify-between w-full">
                  <div className="px-3 py-2 rounded-l-lg bg-gray-300 text-black flex items-center flex-1">
                    <div className="flex-1 space-x-3">
                      <span
                        onClick={() => handleCopy(room.id)}
                        className="bg-gray-600 hover:bg-gray-700 transition duration-100 text-white py-2 px-3 rounded-lg cursor-pointer"
                      >
                        ID: {room.id}
                      </span>
                      <span className="font-bold text-xl">{room.slug}</span>
                    </div>

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

          {/* Join Room With Id */}
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Join a Room with roomID</h2>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between w-full">
                <form onSubmit={handleJoinRoomWithId} className="w-full flex">
                  <input
                    type="number"
                    placeholder="Enter your room id"
                    className="border-2 border-r-0 rounded-l-lg px-3 py-2 border-gray-700 outline-none flex-1"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                  />
                  <button className="border-2 border-gray-700 border-l-0 px-3 py-2 rounded-r-lg bg-gray-700 text-white cursor-pointer">
                    Join Room
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
