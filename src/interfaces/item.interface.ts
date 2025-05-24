export interface Item {
    id?: number;
    item_type: string;
    item_name: string;
    description: string;

    city?: string;
    specific_place?: string;

    status: 'Lost' | 'Found';
    created_at?: Date;
    created_by?: number;
}