export interface Claim {
    id?: number;
    item_id: number;
    claimant_id: number;

    item_name: string;
    item_color: string;
    model?: string;
    special_tag_or_symbol?: string;
    specific_location?: string;

    image?: string;
    status?: 'pending' | 'Rejected' | 'Approved';
    created_at?: Date;
}

