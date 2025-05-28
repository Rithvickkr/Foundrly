import { UUID } from "crypto";
import { getAuthToken } from "./getauthtoken";

export interface PitchDeckResponseDetails {
    id: any;
    created_at: string; 
    pitch_id: UUID;
    title: string;
    description: string;
    industry: string;
    startup_stage: string;
    target_market: string;
}

export const getSpecificDeck = async (deckId: string): Promise<PitchDeckResponseDetails | null> => {
  try {
    const token = await getAuthToken();

    const response = await fetch(`http://127.0.0.1:8000/pitchdecks/${deckId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pitch deck with ID: ${deckId}`);
    }

    const data: PitchDeckResponseDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching pitch deck with ID ${deckId}:`, error);
    return null;
  }
};
