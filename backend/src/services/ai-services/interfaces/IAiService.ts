// backend/src/services/ai-services/interfaces/IAiService.ts
import { 
    GeneratePosterDTO, 
    GeneratePosterResponseDTO 
} from "@/dtos/ai.dto";


export interface IAiService {
    generateEventPoster(data: GeneratePosterDTO): Promise<GeneratePosterResponseDTO>;
}