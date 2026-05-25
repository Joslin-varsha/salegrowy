// "use client";

import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Camera, Copy } from "lucide-react";
import Data from "../../../data/data";
import axios from "axios";
import { Spin, Modal } from "antd";

function FlowTemplateNode({ data, selected, id }) {
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
      type: "flowtemplatenode",
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
          ? "border-2 border-indigo-500 scale-105"
          : "border border-gray-200"
        }`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Camera size={14} className="opacity-90" /> Flow Template Node
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

        <div className="px-3 py-2 text-xs text-black">

          <div className="py-2 relative">
            <p className="font-semibold text-sm text-gray-700 mb-1">Name</p>
            <p
              className={`mt-2 p-2 border rounded bg-gray-50 text-xs ${data.label && userData ? "text-gray-700" : "text-gray-400"
                }`}
            >
              {data.label && userData
                ? formatLabel(
                  data.label === "flowtemplatenode"
                    ? "Enter your name....."
                    : data.label
                )
                : "Type your name here..."}
            </p>
          </div>

        </div>
      </div>

      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-gray-500"
      ></Handle>
      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="w-1 rounded-full bg-gray-500"
      />
    </div>
  );
}

export default FlowTemplateNode;

// "use client";

// import React from "react";
// import { Handle, Position, useReactFlow } from "reactflow";
// import Link from "next/link";
// import { Trash2 } from "lucide-react";
// import Data from "@/app/data/data";

// function TextNode({ data, selected, id }) {
//   const { deleteElements } = useReactFlow();
//   const dataList = Data.data;

//   const preUseID = sessionStorage.getItem("id");
//   const userDataId = preUseID - 1;
//   const userData = dataList?.[userDataId];

//   // Function to replace placeholders with actual values
//   const formatLabel = (label) => {
//     return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
//       const trimmedKey = key.trim();
//       return userData?.[trimmedKey] || match;
//     });
//   };

//   return (
//     <div className={`w-48 shadow-md rounded-md bg-white ${selected ? "border-2 border-indigo-500" : ""}`}>
//       <div className="flex flex-col">
//         {/* Header */}
//         <div className="px-2 py-2 text-left text-black text-xs font-bold rounded-t-md bg-teal-300 flex justify-between items-center">
//           ✉️ Media Node
//           <button
//             onClick={() => deleteElements({ nodes: [{ id }] })}
//             className="text-white hover:text-red-500 transition"
//           >
//             <Trash2 size={16} />
//           </button>
//         </div>

//         <div className="px-3 py-2 text-xs text-black">
//           {/* Send Message */}
//           {data.label && userData && (
//             <div className="py-2 relative">
//               <p className="font-bold my-1">Send Message</p>
//               <p className="border rounded p-2">{formatLabel(data.label)}</p>
//               <Handle
//                 id="handle-message"
//                 type="source"
//                 position={Position.Right}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               />
//             </div>
//           )}

// {/* Send Image */}
// {data.image && (
//   <div className="py-2 relative">
//     <p className="font-bold">Send Image</p>
//     <img src={data.image} alt="Node" className="w-full h-auto rounded-md mt-2" />
//     <Handle
//       id="handle-image"
//       type="source"
//       position={Position.Right}
//       className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//     />
//   </div>
// )}

//           {/* Send Video */}
//           {data.video && (
//             <div className="mb-2 relative">
//               <p className="font-bold">Send Video</p>
//               <video controls className="w-full h-auto rounded border border-blue-300">
//                 <source src={data.video} type="video/mp4" />
//               </video>
//               <Handle
//                 id="handle-video"
//                 type="source"
//                 position={Position.Right}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               />
//             </div>
//           )}

//           {/* Send Audio */}
//           {data.audio && (
//             <div className="mb-2 relative">
//               <p className="font-bold">Send Audio</p>
//               <audio controls>
//                 <source src={data.audio} type="audio/mpeg" />
//               </audio>
//               <Handle
//                 id="handle-audio"
//                 type="source"
//                 position={Position.Right}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               />
//             </div>
//           )}

//           {/* Send File */}
//           {data.file && (
//             <div className="mb-2 relative">
//               <p className="font-bold">Send File</p>
//               <a href={data.file} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
//                 Open File
//               </a>
//               <Handle
//                 id="handle-file"
//                 type="source"
//                 position={Position.Right}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               />
//             </div>
//           )}

//           {/* External Link */}
//           {data.link && (
//             <div className="py-2 relative">
//               <Link
//                 href={data.link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="border-2 w-full items-center justify-center p-1 flex bg-green-500 text-white font-bold"
//               >
//                 Click Me
//               </Link>
//               <Handle
//                 id="handle-link"
//                 type="source"
//                 position={Position.Right}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Global Handles */}
//       <Handle id="input" type="target" position={Position.Left} className="w-1 rounded-full bg-slate-500" />
//     </div>
//   );
// }

// export default TextNode;
