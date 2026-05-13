import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, MessageCircle, Copy } from "lucide-react";
import Data from "../../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";
import sampleImg from "../../../../assets/image.png";
import sampleVideo from "../../../../assets/video.png"
import sampleAudio from "../../../../assets/audio.png"
import sampleFile from "../../../../assets/file.png"



function TextMediaNode({ data, selected, id }) {
  const { deleteElements } = useReactFlow();
  const dataList = Data.data;

  // Parse user ID safely, fallback to 0 index if invalid
  const preUseID = parseInt(sessionStorage.getItem("id") || "1", 10);
  const userDataId = isNaN(preUseID) ? 0 : preUseID - 1;

  // Find user by ID or default to first user
  const userData = Array.isArray(dataList)
    ? dataList.find((user) => user.id === userDataId) || dataList[0]
    : undefined;

  // Replace placeholders with actual values from userData
  const formatLabel = (label) =>
    label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData && userData[trimmedKey] ? userData[trimmedKey] : match;
    });

  // Determine the displayed label or fallback placeholder
  const displayLabel =
    data.label && userData && formatLabel(data.label).trim()
      ? formatLabel(
        data.label === "" ? "" : data.label
      )
      : "";
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

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
      type: "textmedianode",
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
            <MessageCircle size={14} className="opacity-90" /> Media Bot Reply
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

        {/* Send Image */}
        {data.imageurl && (
          <div className="py-2 relative">
            <p className="font-bold">Sent Image</p>
            <img
              src={sampleImg}
              alt="Node"
              width={300}
              height={300}
              className="w-10 h-auto rounded-md mt-2 mx-3 object-contain"
            />
            {/* <Handle
              id="handle-image"
              type="source"
              position={Position.Right}
              className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
              style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
            /> */}
          </div>
        )}

        {/* Send Video */}
        {data.videourl && (
          <div className="mb-2 relative">
            <p className="font-bold">Send Video</p>
            <img
              src={sampleVideo}
              alt="Node"
              width={300}
              height={300}
              className="w-10 h-auto rounded-md mt-2 mx-3 object-contain"
            />
            {/* <video
              controls
              className="w-full h-auto rounded border border-blue-300"
            >
              <source src={data.videourl} type="video/mp4" />
            </video> */}
            {/* <Handle
              id="handle-video"
              type="source"
              position={Position.Right}
              className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
              style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
            /> */}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-3 text-xs text-black">
          <div className="py-2">
            <p className="font-semibold text-sm text-gray-700 mb-1">Name</p>
            <p
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${displayLabel === "Enter your name....."
                  ? "text-gray-400"
                  : "text-gray-700"
                }`}
            >
              {(!displayLabel || displayLabel === "textmedianode") ? "Type your name here..." : displayLabel}
            </p>
          </div>
        </div>
        {/* Send Document */}
        {data.fileurl && (
          <div className="mb-2 relative mx-3">
            <p className="font-bold">Document</p>
            <img
              src={sampleFile}
              alt="Node"
              width={300}
              height={300}
              className="w-10 h-auto rounded-md mt-2 object-contain"
            />
            {/* <a 
              href={data.fileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline break-all"
            >
              Open Document
            </a> */}
            {/* <Handle
              id="handle-document"
              type="source"
              position={Position.Right}
              className={`custom-handle ${data.isActive ? "active" : "inactive"}`}
              style={{ right: -10, top: "50%", transform: "translateY(-50%)" }}
            /> */}
          </div>
        )}
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
    </div>
  );
}

export default TextMediaNode;
