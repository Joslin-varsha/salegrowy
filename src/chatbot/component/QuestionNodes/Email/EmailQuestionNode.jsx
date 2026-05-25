import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Rocket, HelpCircle } from "lucide-react";
import Data from "../../../../data/data";

function EmailQuestionNode({ data, selected, id, nodeEmail, setNodeEmail }) {
  const { deleteElements } = useReactFlow();

  // Controlled input state initialized with nodeEmail or label or empty
  const [inputValue, setInputValue] = useState(nodeEmail || data.label || "");

  // Sync internal input state with props changes
  useEffect(() => {
    setInputValue(nodeEmail || data.label || "");
  }, [nodeEmail, data.label]);

  // Update shared nodeEmail and update Data store on demand
  const handleUpdate = () => {
    if (inputValue.trim()) {
      setNodeEmail(inputValue.trim());

      // Optional: Update global Data.data user object dynamically
      const selectedId = parseInt(sessionStorage.getItem("selectedUserId"), 10) || 1;
      const userIndex = Data.data.findIndex((user) => user.id === selectedId);
      if (userIndex !== -1) {
        const selectedField = sessionStorage.getItem("selectedField") || "email";
        Data.data[userIndex][selectedField] = inputValue.trim();
      }
    }
  };

  // Format label placeholders if needed (stub here)
  const formatLabel = (label) => label;

  return (
    <div
      className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
        selected ? "border-2 border-indigo-500 scale-105" : "border border-gray-200"
      }`}
    >
      <div className="flex flex-col">
        {/* Header with delete button */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <HelpCircle size={20} /> Question Node
          </span>
          <button
            onClick={() => deleteElements({ nodes: [{ id }] })}
            className="text-white hover:text-red-500 transition-transform transform hover:scale-110"
            aria-label="Delete Node"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Content area */}
        <div className="px-4 text-xs text-black py-2">
          {Data.data.length ? (
            <div className="py-2 relative">
              <p className="font-semibold text-sm text-gray-700 mb-1">Email</p>

              {/* Conditional label or placeholder text */}
              <p
                className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${
                  data.label && data.label.length ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {data.label && data.label.length ? (
                  formatLabel(
                    data.label === "emailquestionnode"
                      ? "Enter your Email....."
                      : data.label
                  )
                ) : (
                  "Type your email here..."
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

      {/* React Flow handles */}
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
        className="custom-handle p-2"
      >
        <span className="handle-icon">+</span>
      </Handle>
    </div>
  );
}

export default EmailQuestionNode;
