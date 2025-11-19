import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTU4Mjg3Mi1kMGZmLTQwZjQtOWFjNS0wZGIyZTQ5NWEzODgiLCJpYXQiOjE3NjMyMDY2MzF9.cMoGNVXjJN91g86zGiFzWhbO63658Vpj80heFCwGhFM`
    );
    setLoading(false);
    setSocket(ws);

    // return () => {
    //   ws.close();
    // };
  }, []);

  return {
    socket,
    loading,
  };
}
