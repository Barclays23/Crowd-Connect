// backend/src/services/profanity-services/implementations/BadWordsFilterService.ts
import { IProfanityFilterService } from "../interfaces/IProfanityFilterService";
import { Filter } from "bad-words";




export class BadWordsFilterService implements IProfanityFilterService {
    private profanityFilter: Filter;                

    constructor() {
        this.profanityFilter = new Filter();
    }

    async isProfane(text: string): Promise<boolean> {
        const isOffensive: boolean = this.profanityFilter.isProfane(text);

        if (isOffensive) {
            console.log("\n⚠️ CENSOR RESULT:", this.profanityFilter.clean(text), "\n");
        }

        return isOffensive;
    }
}