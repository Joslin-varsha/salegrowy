"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Clock, Copy } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";

function BusinessHoursNode({ data, selected, id }) {
  const { deleteElements } = useReactFlow();

  const dataList = Data.data;

  // const userDataId = dataList.userId
  const preUseID = sessionStorage.getItem("id") || 1;

  const userDataId = preUseID - 1;

  // Find specific user by ID (if data.userId is provided)
  const userData = dataList.userId
    ? dataList.find((user) => user.id === userDataId)
    : dataList[userDataId || 0]; // Default to the first user if no ID is given

  // Function to replace placeholders with actual values
  const formatLabel = (label) => {
    return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim(); // Remove extra spaces
      return userData?.[trimmedKey] || match; // Replace if key exists, else keep placeholder
    });
  };
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  const getNodeDetails = async () => {
    const payload = {
      vendor_uid,
      botflow_uid: bot_flow_uid,
      nodeId: id,
    };
    console.log(payload);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/viewBot`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data; // axios stores JSON here directly

      if (data.status) {
        deletenode(data.data._id);
      } else {
        deleteElements({ nodes: [{ id }] });
      }
    } catch (error) {
      console.error("Error fetching variables:", error);
      Modal.error({
        title: "Error",
        content: "Something went wrong. Please try again later.",
        centered: true,
        okText: "OK",
        okButtonProps: {
          className: "no-btn-hover-red"
        }
      });
    }
  };

  const deletenode = async (botId) => {
    const payload = {
      vendor_uid: vendor_uid,
      botflow_uid: bot_flow_uid,
      nodeId: id,
      botId
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/deleteBot`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const res = response.data;
      deleteElements({ nodes: [{ id }] });

      if (res.success) {

        if (data?.onDeleteNode) {
          data.onDeleteNode(id, "delete");
        }

        Modal.success({
          title: "Success",
          content: "Delete Successfully",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "ok-btn-hover-green"
          }
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      Modal.error({
        title: "Error",
        content: "Something went wrong. Please try again later.",
        centered: true,
        okText: "OK",
        okButtonProps: {
          className: "no-btn-hover-red"
        }
      });
    }
  };

  const handleDelete = useCallback(async () => {
    try {
      // Case: Node is just added and not saved in DB
      if (data?.isAdded) {
        if (data?.onDeleteNode) {
          deleteElements({ nodes: [{ id }] });
          data.onDeleteNode(id, "");
        }
        return;
      } else {
        getNodeDetails();
      }
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  }, [data, id, deleteElements, getNodeDetails, deletenode]);

  const handleCopy = useCallback(() => {
    const newId = `${id}-copy-${Date.now()}`;
    const newPosition = {
      x: data?.position?.x ? data.position.x + 50 : Math.random() * 400,
      y: data?.position?.y ? data.position.y + 50 : Math.random() * 400,
    };

    const newNode = {
      id: newId,
      type: "businesshoursnode",
      position: newPosition,
      data: {
        ...data,
        isAdded: true,
        label: data.label,
        replyMessage: data.replyMessage,
      },
    };


    if (data?.onDuplicateNode) {
      data.onDuplicateNode(newNode);
    }

    Modal.success({
      title: "Copied",
      content: "Node duplicated successfully.",
      centered: true,
      okText: "OK",
      okButtonProps: {
        className: "ok-btn-hover-green",
      },
    });
  }, [data, id,]);

  return (
    <div
      className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${selected ? "border-2 border-indigo-500 scale-105" : "border border-gray-200"
        }`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Clock size={14} className="opacity-90" /> Business Hours
          </span>
          <div className="flex gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="text-white hover:text-yellow-300 transition-transform transform hover:scale-110"
              aria-label="Copy Node"
            >
              <Copy size={16} />
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="text-white hover:text-red-300 transition-transform transform hover:scale-110"
              aria-label="Delete Node"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative flex flex-col gap-2 w-full">
            <div className="relative">
              <button className="px-4 py-2 bg-green-500 text-white rounded transition-colors w-full">
                Open
              </button>
              <Handle
                id="handle-business-open"
                type="source"
                position={Position.Right}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white"
              />
            </div>
            <div className="relative mt-1">
              <button className="px-4 py-2 bg-red-500 text-white rounded transition-colors w-full">
                Close
              </button>
              <Handle
                id="handle-business-close"
                type="source"
                position={Position.Right}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white"
              />
            </div>

          </div>
        </div>
      </div>
      {/* <Handle
        id="handle-link"
        type="source"
        position={Position.Right}
        className="w-2 h-2 rounded-full bg-indigo-500 border-2 border-white"
      /> */}
      <Handle
        id="handle-target"
        type="target"
        position={Position.Left}
        className="w-2 h-2 rounded-full bg-indigo-500 border-2 border-white"
      />
    </div>
  );
}

export default BusinessHoursNode;
