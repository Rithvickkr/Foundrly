import { getAuthToken } from "./getauthtoken";

export interface PitchDeckRequest2 {
    
    industry: string;
    startup_stage: string;
    target_market: string;
  }
  
  export interface PitchDeckResponse {
    generated_analysis: string;
  }
  
  export const fetchCompanalysis = async (
    pitchData : PitchDeckRequest2
  ): Promise<PitchDeckResponse | null> => {
    try {
    const token=await getAuthToken() 
       // Retrieve JWT token from local storage

    // console.error("token yeh hai"+token)   // Retrieve JWT token from local storage
      const response = await fetch("http://127.0.0.1:8000/competitor-analysis", {
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
  