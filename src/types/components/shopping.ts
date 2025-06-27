import { CreateItemData, UpdateItemData } from "../../store/shopping/types";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  note?: string;
  created_by: string;
  completed_by?: string;
}

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdd: (itemData: CreateItemData) => void;
}

export interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemEdit: (itemId: string, itemData: UpdateItemData) => Promise<void>;
  itemId: string;
  initialData?: {
    name: string;
    quantity: number;
    category: string;
    note: string;
  };
}
