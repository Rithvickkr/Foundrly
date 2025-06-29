import { getAuthToken } from "./getauthtoken";

export interface PitchDeckRequest {
    title: string;
    description: string;
    industry: string;
    startup_stage: string;
    target_market: string;
  }
  
  export interface PitchDeckResponse {
    generated_pitch: string;
  }
  
  export const fetchGeneratedPitch = async (
    pitchData: PitchDeckRequest
  ): Promise<PitchDeckResponse | null> => {
    try {
    const token=await getAuthToken() 
    // console.error("token yeh hai"+token)   // Retrieve JWT token from local storage
      const response = await fetch("https://pitchdeckbend.onrender.com/generate-pitch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Attach token in headers
        },
        body: JSON.stringify(pitchData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate AI pitch deck");
      }
  
      const data: PitchDeckResponse = await response.json();
      console.log(data)
      return data;
    } catch (error) {
      console.error("Error fetching AI-generated pitch:", error);
      return null;
    }
  };
  