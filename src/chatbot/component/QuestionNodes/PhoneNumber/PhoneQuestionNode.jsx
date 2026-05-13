import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Rocket, HelpCircle, Copy } from "lucide-react";
import Data from "../../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";

function PhoneQuestionNode({ data, selected, id, nodePhone, setNodePhone }) {
  const { deleteElements } = useReactFlow();
  const dataList = Data.data;

  // Get user data safely, fallback first user
  const preUseID = parseInt(sessionStorage.getItem("id"), 10);
  const userDataId = isNaN(preUseID) ? 0 : preUseID - 1;
  const userData =
    Array.isArray(dataList) && dataList.length > 0
      ? dataList.find((user) => user.id === userDataId) || dataList[0]
      : undefined;

  // Initialize inputValue with nodePhone or label or placeholder text
  const [inputValue, setInputValue] = useState(
    nodePhone || data.label || "Enter your phone number"
  );

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  // Sync inputValue with props changes
  useEffect(() => {
    setInputValue(nodePhone || data.label || "Enter your phone number");
  }, [nodePhone, data.label]);

  // Updates nodePhone upwards trimmed
  const handleUpdate = () => {
    if (inputValue.trim()) {
      setNodePhone(inputValue.trim());
    }
  };

  // Format label placeholders - optional here, used if label present
  const formatLabel = (label) =>
    label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData && userData[trimmedKey] ? userData[trimmedKey] : match;
    });


  const getNodeDetails = async () => {
    const payload = {
      vendor_uid,
      bot_flow_uid,
      nodeId: id,
    };
    console.log(payload);
    try {
      const response = await axios.post(
        `https://dev.salegrowybox.com/api/viewBot`,
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
        `https://dev.salegrowybox.com/api/deleteBot`,
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
      type: "phonequestionnode",
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
        }`}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <HelpCircle size={20} /> Question Node
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
              className="text-white hover:text-red-500 transition-transform transform hover:scale-110"
              aria-label="Delete Node"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 text-xs text-black py-2">
          {Data.data.length ? (
            <div className="py-2 relative">
              <p className="font-semibold text-sm text-gray-700 mb-1">Name</p>
              <p
                className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${data.label && userData ? "text-gray-700" : "text-gray-400"
                  }`}>
                {data.label && userData
                  ? formatLabel(
                    data.label === "phonequestionnode"
                      ? "Enter your Name....."
                      : data.label
                  )
                  : "Type your name here..."}
              </p>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 bg-slate-400 p-2 rounded-full hover:bg-green-600"
                onClick={handleUpdate}
                aria-label="Update Phone Number">
                <Rocket size={10} />
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">No user selected.</p>
          )}
        </div>
      </div>

      {/* React Flow node handles */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-slate-500" />

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

export default PhoneQuestionNode;
