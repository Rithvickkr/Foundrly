// utils/deleteDeck.ts
import { UUID } from "crypto";
import { getAuthToken } from "./getauthtoken";

export async function deleteDeck(pitchId: UUID): Promise<{ message: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('No authentication token found');
        }
    const res = await fetch(`https://pitchdeckbend.onrender.com/pitchdecks/${pitchId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to delete pitch deck');
    }

    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Something went wrong while deleting the deck');
  }
}
