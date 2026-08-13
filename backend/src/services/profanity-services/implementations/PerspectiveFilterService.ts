// backend/src/services/profanity-services/implementations/PerspectiveFilterService.ts
import axios from 'axios';
import { IProfanityFilterService } from "../interfaces/IProfanityFilterService";


// Important Notice
// Perspective API is sunsetting at the end of 2026.
// can submit requests until February 2026.
// After that, we will no longer accept any new requests.
// The API will no longer be in service after 2026.



export class PerspectiveFilterService implements IProfanityFilterService {
    private apiKey = process.env.PERSPECTIVE_API_KEY;
    private apiUrl = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${this.apiKey}`;


    
    async isProfane(text: string): Promise<boolean> {
        try {
            const response = await axios.post(this.apiUrl, {
                comment: { text: text },
                requestedAttributes: { TOXICITY: {} }
            });
            
            // Get the score (0.0 to 1.0)
            const toxicityScore: number = response.data.attributeScores.TOXICITY.summaryScore.value;
            
            // If the score is higher than 75% toxic, flag it as profane
            return toxicityScore > 0.75; 

        } catch (error) {
            console.error("Perspective API Error:", error);
            return false;
        }
    }
}