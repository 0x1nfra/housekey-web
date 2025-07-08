export const getMemberAvatar = (memberName: string) => {
  const avatars: { [key: string]: string } = {
    Sarah: "👩‍💼",
    Mike: "👨‍💻",
    Emma: "👧",
  };
  return avatars[memberName] || "👤";
};

export const getCategoryColor = (category?: string) => {
  const colors: { [key: string]: string } = {
    Dairy: "bg-blue-50 text-blue-700 border-blue-200",
    Bakery: "bg-amber-50 text-amber-700 border-amber-200",
    Produce: "bg-green-50 text-green-700 border-green-200",
    Meat: "bg-red-50 text-red-700 border-red-200",
    Pantry: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    colors[category || ""] || "bg-gray-50 text-charcoal-muted border-gray-200"
  );
};
