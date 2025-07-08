import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface ItemFormData {
  name: string;
  quantity: number;
  category: string;
  note: string;
}

interface ItemFormFieldsProps {
  formData: ItemFormData;
  onInputChange: (field: keyof ItemFormData, value: any) => void;
  showSuggestions: boolean;
  onShowSuggestions: (show: boolean) => void;
  suggestions: Array<{ name: string; category: string; icon: string }>;
  onSuggestionClick: (suggestion: any) => void;
}

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Pantry",
  "Frozen",
  "Household",
  "Personal Care",
  "Other",
];

export const ItemFormFields: React.FC<ItemFormFieldsProps> = ({
  formData,
  onInputChange,
  showSuggestions,
  onShowSuggestions,
  suggestions,
  onSuggestionClick,
}) => {
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(formData.name.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Item Name with Smart Suggestions */}
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Item Name *
        </label>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              onInputChange("name", e.target.value);
              onShowSuggestions(e.target.value.length > 0);
            }}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Start typing item name..."
            required
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-2xl">{suggestion.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {suggestion.category}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Quantity and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => onInputChange("quantity", parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onInputChange("category", e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Notes (Optional)
        </label>
        <input
          type="text"
          value={formData.note}
          onChange={(e) => onInputChange("note", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Brand preference, size, etc."
        />
      </div>
    </div>
  );
};
