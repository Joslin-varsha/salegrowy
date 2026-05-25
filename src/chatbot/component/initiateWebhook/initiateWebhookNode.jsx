import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { ArrowRight } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";

function InitiateWebhookNode({ data, selected, id }) {

  const { deleteElements } = useReactFlow();
  const dataList = Data.data;
  const [startMessage, setStartMessage] = useState('');

  useEffect(() => {
    // Get the start message from localStorage
    const message = localStorage.getItem('start_message') || 'Start';
    setStartMessage(message);

    // Update the node data with the start message
    if (data && data.updateNodeData) {
      data.updateNodeData({ label: message });
    }
  }, [data]);

  // Get user ID from sessionStorage, ensure integer and valid index
  const preUseID = parseInt(sessionStorage.getItem("id"), 10);
  const userDataId = isNaN(preUseID) ? 0 : preUseID - 1;
  // Safely get userData object either by .find or array index
  const userData =
    Array.isArray(dataList) && dataList.length > 0
      ? dataList.find((user) => user.id === userDataId) || dataList
      : undefined;


  return (
    <div className={`shadow-md rounded-full bg-white transition-all duration-200 border-2 ${selected ? "border-indigo-500" : "border-gray-200"}`}>
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
            <ArrowRight size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-700">Webhook</span>
            {/* <span className="text-[10px] text-gray-500">{startMessage || (data.label || 'Start')}</span> */}
          </div>
        </div>
      </div>

      <Handle
        id="a"
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="custom-handle p-2"
        style={{ right: -8 }}
      >
        <span className="handle-icon">+</span>
      </Handle>
    </div>
  );
}

export default InitiateWebhookNode;
