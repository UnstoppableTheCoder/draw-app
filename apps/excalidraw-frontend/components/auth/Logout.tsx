import { useRouter } from "next/navigation";

export default function Logout({ bgColor }: { bgColor?: string }) {
  const router = useRouter();
  const handleClick = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 ${bgColor ? bgColor : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg transition-colors font-medium cursor-pointer`}
    >
      Logout
    </button>
  );
}
