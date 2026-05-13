"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Zap, Copy } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { X } from "lucide-react";
import { Spin, Modal } from "antd";

function ApiRequestNode({ data, selected, id, setSelectedElements }) {
  const { deleteElements, getEdges } = useReactFlow();
  const dataList = Data.data;

  const preUseID = sessionStorage.getItem("id") || 1;
  const userDataId = preUseID - 1;

  const userData = data.userId
    ? dataList.find((user) => user.id === data.userId)
    : dataList[userDataId] || dataList[0];

  const formatLabel = (label) => {
    return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData?.[trimmedKey] || match;
    });
  };
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  // Function to remove edges connected to Handle with id="b"
  const handleRemoveConnections = () => {
    const edges = getEdges();
    // Filter edges where the source handle is "b" for this node
    const edgesToRemove = edges.filter(
      (edge) => edge.source === id && edge.sourceHandle === "b"
    );
    if (edgesToRemove.length > 0) {
      deleteElements({ edges: edgesToRemove });
    }
  };
  const handleToggleSidebar = () => {
    setSelectedElements((prev) =>
      prev.length > 0 && prev[0].id === id ? [] : [{ id, type: "apirequestnode", data }]
    );
  };

  const getNodeDetails = async () => {
    const payload = {
      vendor_uid,
      bot_flow_uid,
      nodeId: id,
    };

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
      type: "apirequestnode",
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
            <Zap size={14} className="opacity-90" /> API Request Node
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

        <div className="px-4 py-3 text-xs text-black">
          {/* Name */}
          <div className="py-2">
            <p className="font-semibold text-sm text-gray-700 mb-1">Name</p>
            <p
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${data.label && userData ? "text-gray-700" : "text-gray-400"
                }`}>
              {data.label && userData
                ? formatLabel(
                  data.label === "apirequestnode" ? "Enter your name....." : data.label
                )
                : "Type your name here..."}
            </p>

            {/* Reply */}
            <p className="font-semibold text-sm text-gray-700 mb-1" style={{ paddingTop: "7px" }}>
              Reply
            </p>
            <div
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${data.replyMessage ? "text-gray-700" : "text-gray-400"
                }`}
            >
              {data.replyMessage || "Type your reply message..."}
            </div>
          </div>

          {/* LIST MESSAGES */}
          {data.type === "list" &&
            data.sections?.map((section) => (
              <div
                key={section.id}
                className="py-2 relative border p-2 mt-2 rounded bg-gray-50"
              >
                <Handle
                  id={`handle-section-${section.id}`}
                  type="source"
                  position={Position.Right}
                  className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                  style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                />
                {section.rows?.map((row) => (
                  <div
                    key={row.id}
                    className="border p-1 mt-1 rounded bg-white text-sm relative"
                  >
                    <div className="font-medium">{row.rowTitle}</div>
                    <Handle
                      id={`handle-row-${row.id}`}
                      type="source"
                      position={Position.Right}
                      className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                      style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>
                ))}
              </div>
            ))}
          {/* CTA Button */}
          {data.buttonType === "cta" && data.ctaButtonText && (
            <div className="py-2 relative">
              <button
                className="border-2 p-1 flex text-dark w-full font-bold bg-green-100"
                onClick={() => data.ctaUrl && window.open(data.ctaUrl, "_blank")}
              >
                {data.ctaButtonText}
              </button>
              <Handle
                id="handle-cta"
                type="source"
                position={Position.Right}
                className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          )}

          {/* OTHER CONTENT (show only if not a list type) */}
          {data.type !== "list" && (
            <>
              {/* IMAGE */}
              {data.image && (
                <div className="py-2 relative">
                  <p className="font-bold">Send Image</p>
                  <img src={data.image} alt="Node" className="w-full h-auto rounded-md mt-2" />
                  <Handle
                    id="handle-image"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}

              {/* VIDEO */}
              {data.video && (
                <div className="mb-2 relative">
                  <p className="font-bold">Send Video</p>
                  <video controls className="w-full h-auto rounded border border-blue-300">
                    <source src={data.video} type="video/mp4" />
                  </video>
                  <Handle
                    id="handle-video"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}

              {/* AUDIO */}
              {data.audio && (
                <div className="mb-2 relative">
                  <p className="font-bold">Send Audio</p>
                  <audio controls className="w-40">
                    <source src={data.audio} type="audio/mpeg" />
                  </audio>
                  <Handle
                    id="handle-audio"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}

              {/* FILE */}
              {data.file && (
                <div className="mb-2 relative">
                  <p className="font-bold">Send File</p>
                  <a
                    href={data.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Open File
                  </a>
                  <Handle
                    id="handle-file"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}

              {/* Reply Buttons */}
              {data.button1 && (
                <div className="py-2 relative">
                  <button className="border-2 p-1 flex text-dark w-full">{data.button1}</button>
                  <Handle
                    id="handle-button1"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}
              {data.button2 && (
                <div className="py-2 relative">
                  <button className="border-2 p-1 flex text-dark w-full">{data.button2}</button>
                  <Handle
                    id="handle-button2"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}
              {data.button3 && (
                <div className="py-2 relative">
                  <button className="border-2 p-1 flex text-dark w-full">{data.button3}</button>
                  <Handle
                    id="handle-button3"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}

              {/* LIST BUTTON */}
              {data.listButton && (
                <div className="py-2 relative">
                  <button className="border-2 p-1 flex text-dark font-bold w-full">{data.listButton}</button>
                  <Handle
                    id="handle-listButton"
                    type="source"
                    position={Position.Right}
                    className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
                    style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              )}

              {/* LINK */}
              {data.link && (
                <div className="py-2">
                  <a
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 w-full flex p-1 bg-green-500 text-white font-bold"
                  >
                    Click Me
                  </a>
                </div>
              )}

              {/* FOOTERS */}
              {data.footer1 && (
                <div className="px-2 py-2 text-left text-xs font-bold bg-slate-500 text-white">{data.footer1}</div>
              )}
              {data.footer2 && (
                <div className="px-2 py-2 text-left text-xs font-bold bg-slate-500 text-white">{data.footer2}</div>
              )}
              {data.footer3 && (
                <div className="px-2 py-2 text-left text-xs font-bold bg-slate-500 text-white">{data.footer3}</div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Target Handle */}
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

export default ApiRequestNode;