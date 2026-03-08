// // backend/src/utils/meeting-link.ts
// import { nanoid } from "nanoid";
// import { EventEntity } from "@/entities/event.entity";

// export const generateMeetingLink = (event: EventEntity): string => {
//     const roomName = `crowdconnect-${event.id}-${nanoid(6)}`;
//     return `https://meet.jit.si/${roomName}`;
// };