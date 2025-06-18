export interface Item {
  id?: number;
  item_type: string;
  description?: string;
  city?: string;
  image?: string;
  status: 'Lost' | 'Found';
  created_at?: Date;
  created_by?: number;
  latitude?: number | null;
  longitude?: number | null;
}
