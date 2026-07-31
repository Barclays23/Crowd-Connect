// backend/src/services/chat-services/interfaces/IFaqIngestionService.ts

import { TermsSettingsEntity } from "@/entities/platformSettings.entity";




export interface IFaqIngestionService {
    reindexTermsKnowledgeBase(termsData: TermsSettingsEntity): Promise<void>
}