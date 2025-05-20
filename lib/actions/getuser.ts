import { getAuthToken } from "./getauthtoken";

export interface UserProfile {
  name: string;
  email: string;
  created_at: string;
}

export async function getUser(): Promise<UserProfile | null> {
  try {
    const token = await getAuthToken();
    const response = await fetch("http://127.0.0.1:8000/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    const data: UserProfile = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
