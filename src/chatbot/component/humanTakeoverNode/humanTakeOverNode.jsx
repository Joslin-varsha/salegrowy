"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Clock, Copy, MoreHorizontal, Plus, Award } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";

function HumanTakeOverNodeNode({ data, selected, id }) {
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
      type: "humantakeovernode",
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
      className={`w-72 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${selected ? "ring-2 ring-indigo-500 ring-offset-2 scale-105" : ""
        }`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-4 py-2.5 bg-indigo-600 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold">$</span>
            </div>
            <span className="text-white text-sm font-medium">Human Takeover</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="text-white hover:bg-indigo-500 p-1 rounded-md transition-colors"
              aria-label="Copy Node"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="text-white hover:bg-indigo-500 p-1 rounded-md transition-colors"
              aria-label="Delete Node"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Award size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-800"> {formatLabel(data.label || "Human takeover configuration")}</h4>
              <p className="text-xs text-gray-500">Transfer to human agent</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal size={16} />
              </button>
              {/* <button className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
                <Plus size={14} />
              </button>
              <button className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors">
                <Plus size={14} />
              </button> */}
            </div>
          </div>
          {/* <div className="mt-3 text-xs text-gray-500">
            {formatLabel(data.label || "Human takeover configuration")}
          </div> */}
        </div>
      </div>
      <Handle
        id="handle-link"
        type="source"
        position={Position.Right}
        className="w-2 h-2 rounded-full bg-indigo-500 border-2 border-white"
      />
      <Handle
        id="handle-target"
        type="target"
        position={Position.Left}
        className="w-2 h-2 rounded-full bg-indigo-500 border-2 border-white"
      />
    </div>
  );
}

export default HumanTakeOverNodeNode;
