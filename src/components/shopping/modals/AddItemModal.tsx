import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Camera, Zap, Plus } from "lucide-react";
import { AddItemModalProps } from "../../../types/components/shopping";

/*
FIXME: 
- add suggestion logic
*/

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onItemAdd,
}) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");
  const [note, setNotes] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock suggestions - in real app, these would be dynamic based on input and household history
  const suggestions = [
    { name: "Milk", category: "Dairy", icon: "🥛" },
    { name: "Bread", category: "Bakery", icon: "🍞" },
    { name: "Bananas", category: "Produce", icon: "🍌" },
    { name: "Chicken Breast", category: "Meat", icon: "🍗" },
    { name: "Eggs", category: "Dairy", icon: "🥚" },
    { name: "Apples", category: "Produce", icon: "🍎" },
    { name: "Rice", category: "Pantry", icon: "🍚" },
    { name: "Yogurt", category: "Dairy", icon: "🥛" },
  ];

  const categories = [
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

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(itemName.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onItemAdd({
      name: itemName,
      quantity,
      category,
      note,
    });

    // Reset form
    setItemName("");
    setQuantity(1);
    setCategory("");
    setNotes("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setItemName(suggestion.name);
    setCategory(suggestion.category);
    setShowSuggestions(false);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Mock barcode scanning - in real app, this would lookup product info
    console.log("Barcode scanned:", barcode);
    setItemName("Scanned Product");
    setCategory("Unknown");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Plus size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Edit Item</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Name with Smart Suggestions */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Item Name *
                </label>
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Start typing item name..."
                    required
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {suggestion.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {suggestion.category}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleBarcodeScanned("123456789")}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  <Camera size={16} />
                  Scan Barcode
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                >
                  <Zap size={16} />
                  Quick Add
                </motion.button>
              </div>

              {/* Quantity and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Brand preference, size, etc."
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!itemName.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddItemModal;
