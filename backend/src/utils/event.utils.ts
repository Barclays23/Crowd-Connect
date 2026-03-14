import { PublicEventsSortOption } from "@/types/event.types";


export interface SortConfig {
    sortField: string;
    sortOrder: 1 | -1;
}



export const getPublicEventSortQuery = (sortOption?: PublicEventsSortOption): SortConfig => {
    switch (sortOption) {
        case "newest":
            return { sortField: "createdAt", sortOrder: -1 };
        case "popular":
            return { sortField: "views", sortOrder: -1 };
        case "price_asc":
            return { sortField: "ticketPrice", sortOrder: 1 };
        case "price_desc":
            return { sortField: "ticketPrice", sortOrder: -1 };
        case "upcoming":
        default:
            return { sortField: "startDateTime", sortOrder: 1 };
    }
};