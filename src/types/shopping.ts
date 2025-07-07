export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  note?: string;
  created_by: string;
  completed_by?: string;
}
