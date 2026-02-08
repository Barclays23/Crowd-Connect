// backend/src/services/interfaces/IAuthRecovery.ts

import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";


export interface IEventManagementServices {
    createEvent({ createDto, imageFile }: { 
        createDto: CreateEventDTO; 
        imageFile?: Express.Multer.File;
        // currentUserId: string;
    }): Promise<EventResponseDTO>;
}