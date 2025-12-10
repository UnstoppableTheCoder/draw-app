"use client";

import axios from "axios";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import isLoggedIn from "@/helper/isLoggedIn";

export default function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [payload, setPayload] = useState({ username: "", password: "" });

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const loggedIn = isLoggedIn(token);

    if (loggedIn) {
      router.push("/");
      toast.error("User already logged in");
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({ ...prevPayload, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignin) {
      try {
        const res = await axios.post("http://localhost:3001/signin", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res) {
          toast.success(`User has been signed in`);
          localStorage.setItem("token", res.data.token);
          router.push("/");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error while signing in");
        }
      }
    } else {
      try {
        const res = await fetch("http://localhost:3001/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // if (!res.ok) throw Error("Error Signing up the user");

        const data = await res.json();
        toast.success(data.message);
        router.push("/signin");
      } catch (error: unknown) {
        console.error(error);

        if (axios.isAxiosError(error) && error.response?.data) {
          toast.error(error.response.data.message || "An error occurred");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error during signup");
        }
      }
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-700">
      <div className="p-6 m-2 bg-white rounded-lg text-black w-[500px] space-y-3">
        <h1 className="text-4xl text-gray-700 text-center font-bold mb-7">
          {isSignin ? "Sign in" : "Sign up"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              value={payload.username}
              className="p-2 w-full border-2 rounded-lg text-lg"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="p-2 w-full border-2 rounded-lg text-lg"
              onChange={handleChange}
              value={payload.password}
            />
          </div>
          <div className="pt-2 text-center">
            <button className="px-5 py-2 bg-gray-600 hover:bg-gray-700 cursor-pointer text-white rounded-lg">
              {isSignin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        <div className="text-gray-400">
          {isSignin ? (
            <div>
              If you don&apos;t have an account -{" "}
              {
                <Link
                  className="text-blue-700 hover:text-blue-600"
                  href={"/signup"}
                >
                  Sign up
                </Link>
              }{" "}
              here
            </div>
          ) : (
            <div>
              If you already have an account -{" "}
              {
                <Link
                  className="text-blue-700 hover:text-blue-600"
                  href={"/signin"}
                >
                  Sign in
                </Link>
              }{" "}
              here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
