// backend/src/services/profanity-services/interfaces/IProfanityFilterService.ts

export interface IProfanityFilterService {
    isProfane(text: string): Promise<boolean>;
}