import React, { useEffect, useState,useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import {ArrowRight } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { Spin,Modal } from "antd";

function InitiateNode({ data, selected, id }) {

  const { deleteElements } = useReactFlow();
  const dataList = Data.data;
  const [startMessage, setStartMessage] = useState('');

  useEffect(() => {
    // Get the start message from localStorage
    const message = localStorage.getItem('start_message') || 'Start';
    setStartMessage(message);
  }, []);

  // Get user ID from sessionStorage, ensure integer and valid index
  const preUseID = parseInt(sessionStorage.getItem("id"), 10);
  const userDataId = isNaN(preUseID) ? 0 : preUseID - 1;
  // Safely get userData object either by .find or array index
  const userData =
    Array.isArray(dataList) && dataList.length > 0
      ? dataList.find((user) => user.id === userDataId) || dataList
      : undefined;


  return (
    <div
      className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
        selected
          ? " border-2 border-indigo-500 scale-105"
          : "border-2 border-gary-500"
      }`}>
        
      <div
        // className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
        //   data?.bot_reply_id && data.bot_reply_id !== ""
        //     ? "border-2 border-indigo-500"
        //     : "border-[3px] border-red-500 animate-blink-border"
        // }`}
        >

        <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-green-500 to-emerald-600 flex justify-between items-center">
          <span className="flex items-center gap-1">
            Start trigger <ArrowRight size={14} className="opacity-90" />
          </span>
        </div>

        {/* Content */}
        <div className="px-4 py-3 text-xs text-black">
          <div className="py-2">
            
            <p
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${
                (startMessage || data.label) && userData ? "text-gray-700" : "text-gray-400"
              }`}>

            {startMessage || (data.label || 'Start')}
            </p>
          </div>
        </div>
      </div>

      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="custom-handle p-2"
      >
        <span className="handle-icon">+</span>
      </Handle>
      </div>
    </div>
  );
}

export default InitiateNode;
