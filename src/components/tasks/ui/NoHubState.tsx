import React from "react";
import { CheckCircle } from "lucide-react";

const NoHubState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Hub Selected
      </h3>
      <p className="text-gray-500">
        Please select a hub to view and manage tasks
      </p>
    </div>
  );
};

export default NoHubState;
