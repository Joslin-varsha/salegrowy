import React, { useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Rocket, HelpCircle } from "lucide-react";
import Data from "../../../../data/data";

function AskQuestionNode({ data, selected, id, updateUserName }) {
  const { deleteElements } = useReactFlow();
  const [inputValue, setInputValue] = useState("");
  // const [selectedField, setSelectedField] = useState("name"); // Default field is "name"

  // Retrieve selected ID from sessionStorage
  const selectedId = parseInt(sessionStorage.getItem("selectedUserId")) || 1;

  // Find the user data based on the selected ID
  const userIndex = Data.data.findIndex((user) => user.id === selectedId);
  const userData = Data.data[userIndex];

  // Handle field update
  const handleUpdate = () => {
    if (userIndex !== -1 && inputValue.trim() && selectedField) {
      Data.data[userIndex][selectedField] = inputValue; // Update the selected field

      if (selectedField === "name") {
        updateUserName(inputValue); // Update globally if it's a name change
      }

      setInputValue(""); // Reset input
    }
  };

  const selectedField = sessionStorage.getItem("selectedField") ;

  const formatLabel = (label) => label;


  return (
    <div
      className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
        selected
          ? "border-2 border-indigo-500 scale-105"
          : "border border-gray-200"
      }`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1"><HelpCircle size={20} /> Question Nodee</span>
          <button
            onClick={() => deleteElements({ nodes: [{ id }] })}
            className="text-white hover:text-red-500 transition-transform transform hover:scale-110"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {/* Content */}
       <div className="px-4 text-xs text-black py-2">
          {Data.data.length ? (
            <div className="py-2 relative">
              <p className="font-semibold text-sm text-gray-700 mb-1">How Can I help you</p>

              {/* Conditional label or placeholder text */}
              <p
                className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${
                  data.label && data.label.length ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {data.label && data.label.length ? (
                  formatLabel(
                    data.label === "askquestionnode"
                      ? "Type your qestion ....."
                      : data.label
                  )
                ) : (
                  "Type your qestion here..."
                )}
              </p>

              {/* Update button */}
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 bg-slate-400 p-2 rounded-full hover:bg-green-600"
                onClick={handleUpdate}
                aria-label="Update Email"
              >
                <Rocket size={10} />
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">No user selected.</p>
          )}
        </div>
      </div>

      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-slate-500"
      />
            <Handle
              id="b"
              type="source"
              position={Position.Right}
              className="custom-handle p-2">
         <span className="handle-icon">+</span>
      
            </Handle>
    </div>
  );
}

export default AskQuestionNode;
