import React, { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Rocket, HelpCircle } from "lucide-react";
import Data from "../../../../data/data";

function NameQuestionNode({ data, selected, id }) {
  const { setNodes } = useReactFlow();
  const { deleteElements } = useReactFlow();
  const dataList = Data.data;
  const preUseID = parseInt(sessionStorage.getItem("id"), 10);
  const userDataId = isNaN(preUseID) ? 0 : preUseID - 1;
  const userData =
    Array.isArray(dataList) && dataList.length > 0
      ? dataList.find((user) => user.id === userDataId) || dataList[0]
      : undefined;

  const [inputValue, setInputValue] = useState(data.label || "");

  useEffect(() => {
    setInputValue(data.label || "");
  }, [data.label]);

  const handleUpdate = () => {
    if (inputValue.trim()) {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, label: inputValue },
            };
          }
          return node;
        })
      );
    }
  };

  const formatLabel = (label) =>
    label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData && userData[trimmedKey] ? userData[trimmedKey] : match;
    });

  return (
    <div
      className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
        selected ? "border-2 border-indigo-500 scale-105" : "border border-gray-200"
      }`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <HelpCircle size={20} /> Question Node
          </span>
          <button
            
            onClick={() => deleteElements({ nodes: [{ id }] })}
            className="text-white hover:text-red-500 transition-transform transform hover:scale-110"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 text-xs text-black">
          <div className="py-2 relative">
            <p className="font-semibold text-sm text-gray-700 mb-1">Name</p>
            <p
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${
                data.label && userData ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {data.label && userData
                ? formatLabel(
                    data.label === "questionnamenode"
                      ? "Enter your name....."
                      : data.label
                  )
                : "Type your name here..."}
            </p>

            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 bg-slate-400 p-2 rounded-full hover:bg-green-600"
              onClick={handleUpdate}
            >
              <Rocket size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Handles */}
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

export default NameQuestionNode;
