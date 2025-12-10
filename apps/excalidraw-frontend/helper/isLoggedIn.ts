import { jwtDecode } from "jwt-decode";

export default function isLoggedIn(token: string) {
  try {
    const decoded = jwtDecode(token) as { userId?: string };
    return !!decoded.userId;
  } catch {
    return false;
  }
}
