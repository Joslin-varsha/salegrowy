import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, MessageCircle, Copy, LinkIcon } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";

function CreateOrderNode({ data, selected, id }) {
  const { deleteElements, addNodes } = useReactFlow();
  const dataList = Data.data;
  const [orderNotes, setOrderNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Get user ID from sessionStorage
  const preUseID = parseInt(sessionStorage.getItem("id"), 10);
  const userDataId = isNaN(preUseID) ? 0 : preUseID - 1;
  const userData =
    Array.isArray(dataList) && dataList.length > 0
      ? dataList.find((user) => user.id === userDataId) || dataList
      : undefined;

  const formatLabel = (label) =>
    label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData && userData[trimmedKey] ? userData[trimmedKey] : match;
    });

  const vendor_uid = localStorage.getItem("vendor_uid");
  const bot_flow_uid = localStorage.getItem("bot_flow_uid");

  // Fetch Order Notes
  const fetchOrderNotes = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        vendor_uid: vendor_uid,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/orderNotes`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setOrderNotes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order notes:", error);
    } finally {
      setLoading(false);
    }
  }, [vendor_uid]);

  // Fetch order notes on component mount
  useEffect(() => {
    if (vendor_uid) {
      fetchOrderNotes();
    }
  }, [vendor_uid, fetchOrderNotes]);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(() => {
    if (orderNotes?.url) {
      navigator.clipboard.writeText(orderNotes.url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  }, [orderNotes?.url]);

  const getNodeDetails = async () => {
    const payload = {
      vendor_uid,
      botflow_uid: bot_flow_uid,
      nodeId: id,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/viewBot`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

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
          className: "no-btn-hover-red",
        },
      });
    }
  };

  const deletenode = async (botId) => {
    const payload = {
      vendor_uid: vendor_uid,
      botflow_uid: bot_flow_uid,
      nodeId: id,
      botId,
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
            className: "ok-btn-hover-green",
          },
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
          className: "no-btn-hover-red",
        },
      });
    }
  };

  const handleDelete = useCallback(async () => {
    try {
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

  // COPY NODE FUNCTIONALITY
  const handleCopy = useCallback(() => {
    const newId = `${id}-copy-${Date.now()}`;
    const newPosition = {
      x: data?.position?.x ? data.position.x + 50 : Math.random() * 400,
      y: data?.position?.y ? data.position.y + 50 : Math.random() * 400,
    };

    const newNode = {
      id: newId,
      type: "createordernode",
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
      className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${selected
          ? " border-2 border-indigo-500 scale-105"
          : "border-2 border-gary-500"
        }`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <MessageCircle size={14} className="opacity-90" /> Create Order
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
        <div className="px-4 py-3 text-xs text-black">
          <div className="py-2">
            <p className="font-semibold text-sm text-gray-700 mb-1">Name</p>
            <p
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${data.label && userData ? "text-gray-700" : "text-gray-400"
                }`}
            >
              {!data.label || data.label === "createordernode"
                ? "Type your name here..."
                : data.label}
            </p>

            <p
              className="font-semibold text-sm text-gray-700 mb-1"
              style={{ paddingTop: "7px" }}
            >
              Reply
            </p>
            <div
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${data.replyMessage ? "text-gray-700" : "text-gray-400"
                }`}
            >
              {data.replyMessage || "Type your reply message..."}
            </div>

            {/* Order Notes Section */}
            {orderNotes && (
              <div className="mt-4 pt-3 border-t border-gray-300">
                <p className="font-semibold text-sm text-gray-700 mb-2">
                  Notes
                </p>

                {/* API Response URL Display */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="font-semibold text-xs text-blue-900 mb-2 flex items-center gap-1">
                    <LinkIcon size={14} /> API Endpoint
                  </p>

                  <div className="bg-white border border-blue-300 rounded p-2 mb-2">
                    <p className="text-xs text-gray-600 font-mono break-all text-blue-700">
                      {orderNotes.url || "No URL available"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-2 mb-2">
                    <div className="text-xs text-gray-600">
                      <p>
                        <span className="font-semibold">Method:</span>{" "}
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs">
                          {orderNotes.method}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={handleCopyUrl}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${copySuccess
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      title="Copy URL"
                    >
                      <Copy size={12} />
                      {copySuccess ? "Copied!" : ""}
                    </button>
                  </div>
                  {orderNotes.payload && orderNotes.payload.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Payload:
                      </p>
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-700">
                        {JSON.stringify(orderNotes.payload, null, 2)}
                      </div>
                    </div>
                  )}
                  {orderNotes.notes && (
                    <div className="mt-3 mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700">
                      <p className="font-medium text-yellow-800 mb-1">Note:</p>
                      <p>{orderNotes.notes}</p>
                    </div>
                  )}

                </div>
              </div>
            )}

            {loading && (
              <div className="mt-3 text-center text-xs text-gray-500">
                Loading order details...
              </div>
            )}
          </div>
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
        className="custom-handle p-2"
      >
        <span className="handle-icon">+</span>
      </Handle>
    </div>
  );
}

export default CreateOrderNode;
