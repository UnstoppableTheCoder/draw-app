"use client";

export default function AuthPage({ isSignin }: { isSignin: boolean }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-6 m-2 bg-white rounded text-black">
        <div>
          <input type="email" placeholder="Email" className="p-2" />
        </div>
        <div>
          <input type="password" placeholder="Password" className="p-2" />
        </div>

        <div className="pt-2">
          <button onClick={() => {}}>{isSignin ? "Sign in" : "Sign up"}</button>
        </div>
      </div>
    </div>
  );
}
