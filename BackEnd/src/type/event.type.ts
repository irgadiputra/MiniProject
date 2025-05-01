export type EventParam = {
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    quota: number;
    status: string;
    description: string;
    price: number;
}

export type UpdateEventParam = {
    name?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    quota?: number;
    status?: string;
    description?: string;
    price?: number;
}
export type EventListQuery = {
    skip: number;
    limit: number;
};

export type SearchParams = {
    name?: string;
    location?: string;
    status?: string;
    page: number;
    limit: number;
};