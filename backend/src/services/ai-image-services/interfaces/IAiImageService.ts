// backend/src/services/ai-image-services/interfaces/IAiService.ts
import { 
    GeneratePosterDTO, 
    GeneratePosterResponseDTO 
} from "@/dtos/ai.dto";


export interface IAiImageService {
    generateEventPoster(data: GeneratePosterDTO): Promise<GeneratePosterResponseDTO>;
}