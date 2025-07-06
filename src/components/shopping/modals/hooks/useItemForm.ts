import { useState, useEffect } from 'react';

export interface ItemFormData {
  name: string;
  quantity: number;
  category: string;
  note: string;
}

interface UseItemFormProps {
  isOpen: boolean;
  initialData?: {
    name: string;
    quantity: number;
    category: string;
    note: string;
  };
}

export const useItemForm = ({ isOpen, initialData }: UseItemFormProps) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    quantity: 1,
    category: "",
    note: "",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize form with existing item data
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        quantity: initialData.quantity,
        category: initialData.category,
        note: initialData.note,
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        quantity: initialData.quantity,
        category: initialData.category,
        note: initialData.note,
      });
    } else {
      setFormData({
        name: "",
        quantity: 1,
        category: "",
        note: "",
      });
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: { name: string; category: string }) => {
    setFormData((prev) => ({
      ...prev,
      name: suggestion.name,
      category: suggestion.category,
    }));
    setShowSuggestions(false);
  };

  return {
    formData,
    showSuggestions,
    handleInputChange,
    setShowSuggestions,
    resetForm,
    handleSuggestionClick,
  };
};
