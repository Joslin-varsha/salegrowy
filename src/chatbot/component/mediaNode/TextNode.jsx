"use client";

import React, { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, MessageSquareText } from "lucide-react";
import Data from "../../../data/data";

function TextNode({ data, selected, id }) {
  const [message, setMessage] = useState("");
  const { deleteElements } = useReactFlow();
  const dataList = Data.data;
  const preUseID = sessionStorage.getItem("id") || 1;
  const userDataId = preUseID - 1;

  const userData = dataList.userId
    ? dataList.find((user) => user.id === userDataId)
    : dataList[userDataId || 0];

  const formatLabel = (label) => {
    return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData?.[trimmedKey] || match;
    });
  };

  useEffect(() => {
    const message = data.message;
    setMessage(message);
  }, [data]);
  return (
    <div
      className={`relative rounded-2xl min-w-[18vw] shadow-lg border-2 transition-all duration-300 ease-in-out ${selected ? "border-blue-500 scale-105" : "border-gray-200"
        } text-black hover:shadow-2xl`}
    // style={{
    //   backgroundImage: `url("/wa.jpg")`,
    //   backgroundSize: "cover",
    //   backgroundPosition: "center",
    //   backgroundRepeat: "no-repeat",
    //   backgroundColor: "rgba(229, 221, 213, 0.85)",
    //   backgroundBlendMode: "overlay",
    // }}
    >
      {/* Header */}
      <div className="flex items-center justify-around pt-2 rounded-t-2xl bg-white/70">
        <div className="flex items-center gap-2">
          <MessageSquareText size={26} className="text-black" />
          <h3 className="text-lg font-bold text-black">Message Node</h3>
        </div>
        <button
          onClick={() => deleteElements({ nodes: [{ id }] || 1 })}
          className="text-black hover:text-red-500 transition-transform duration-200 hover:scale-110"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Body Content */}
      <div className="py-3 px-6 text-sm text-gray-900 max-w-[20vw] bg-white/70 rounded-xl">
        <p className="text-[16px] font-sans italic">{message}</p>
      </div>

      {/* Handles */}
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md transition-transform duration-200 hover:scale-125"
      />
      <Handle
        id="output"
        type="source"
        position={Position.Right}
        className="handle-icon"
      />
    </div>

  );
}

export default TextNode;

// // "use client";

// import React from "react";
// import { Handle, Position, useReactFlow } from "reactflow";
// import { Trash2, Camera } from "lucide-react";
// import Data from "../../../data/data";

// function TextNode({ data, selected, id }) {
//   const { deleteElements } = useReactFlow();

//   const dataList = Data.data;

//   // const userDataId = dataList.userId
//   const preUseID = sessionStorage.getItem("id") || 1;

//   const userDataId = preUseID - 1;

//   // Find specific user by ID (if data.userId is provided)
//   const userData = dataList.userId
//     ? dataList.find((user) => user.id === userDataId)
//     : dataList[userDataId || 0]; // Default to the first user if no ID is given

//   // Function to replace placeholders with actual values
//   const formatLabel = (label) => {
//     return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
//       const trimmedKey = key.trim(); // Remove extra spaces
//       return userData?.[trimmedKey] || match; // Replace if key exists, else keep placeholder
//     });
//   };

//   return (
//     <div
//       className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
//         selected
//           ? "border-2 border-indigo-500 scale-105"
//           : "border border-gray-200"
//       }`}
//     >
//       <div className="flex flex-col">
//         {/* Header */}
//         <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
//           <span className="flex items-center gap-1">
//             <Camera size={14} className="opacity-90" /> Message Node
//           </span>
//           <button
//             onClick={() => deleteElements({ nodes: [{ id }] || 1 })}
//             className="text-white hover:text-red-500 transition-transform transform hover:scale-110"
//           >
//             <Trash2 size={16} />
//           </button>
//         </div>

//         <div className="px-3 py-2 text-xs text-black">
//           {data.label && userData && (
//             <div className="py-2 relative">
//               <p className="font-bold my-1">Send Message</p>
//               <p className="border rounded p-2">{formatLabel(data.label === "textnode" ? "{ company }" : data.label)}</p>
//               {/* <Handle
//                 id="handle-message"
//                 type="target"
//                 position={Position.Left}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               />
//               <Handle
//                 id="handle-message"
//                 type="source"
//                 position={Position.Right}
//                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
//               /> */}
//             </div>
//           )}

//           {/* Send Image */}
//           {data.image && (
//             <div className="py-2 relative">
//               <p className="font-bold">Send Image</p>
//               <img
//                 src={data.image}
//                 alt="Node"
//                 width={500}
//                 height={300}
//                 className="w-full h-auto rounded-md mt-2"
//               />
//               <Handle
//                 id={`handle-image}`} // Unique ID for each handle
//                 type="source"
//                 position={Position.Right}
//                 className={`custom-handle ${
//                   data.isActive ? "active" : "inactive"
//                 }`}
//                 style={{
//                   right: -10, // Adjust this value as needed
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                 }}
//               />
//             </div>
//           )}

//           {data.video && (
//             <div className="mb-2 relative">
//               <p className="font-bold">Send Video</p>
//               <video
//                 controls
//                 className="w-full h-auto rounded border border-blue-300"
//               >
//                 <source src={data.video} type="video/mp4" />\
//               </video>

//               <Handle
//                 id={`handle-video}`} // Unique ID for each handle
//                 type="source"
//                 position={Position.Right}
//                 className={`custom-handle ${
//                   data.isActive ? "active" : "inactive"
//                 }`}
//                 // style={{
//                 //   right: -10, // Adjust this value as needed
//                 //   top: "50%",
//                 //   transform: "translateY(-50%)",
//                 // }}
//               />
//             </div>
//           )}

//           {data.audio && (
//             <div className="mb-2 relative">
//               <p className="font-bold">Send Audio</p>
//               <audio controls>
//                 <source src={data.audio} type="audio/mpeg" />
//               </audio>

//               <Handle
//                 id={`handle-audio}`} // Unique ID for each handle
//                 type="source"
//                 position={Position.Right}
//                 className={`custom-handle ${
//                   data.isActive ? "active" : "inactive"
//                 }`}
//               />
//             </div>
//           )}

//           {data.file && (
//             <div className="mb-2 relative">
//               <p className="font-bold">Send File</p>
//               <a
//                 href={data.file}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 underline"
//               >
//                 Open File
//               </a>

//               <Handle
//                 id={`handle-file}`} // Unique ID for each handle
//                 type="source"
//                 position={Position.Right}
//                 className={`custom-handle ${
//                   data.isActive ? "active" : "inactive"
//                 }`}
//               />
//             </div>
//           )}

//           {data.link && (
//             <div className="py-2">
//               <button
//                 href={data.link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="border-2 w-full items-center justify-center p-1 flex bg-green-500 text-white font-bold  duration-5000"
//               >
//                 Click Me
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <Handle
//         id="a"
//         type="target"
//         position={Position.Left}
//         className="w-1 rounded-full bg-gray-500"
//       ></Handle>
//       <Handle
//         id="b"
//         type="source"
//         position={Position.Right}
//         className="w-1 rounded-full bg-gray-500"
//       />
//     </div>
//   );
// }

// export default TextNode;


// "use client";

// import React from "react";
// import { Handle, Position, useReactFlow } from "reactflow";
// import { Trash2, MessageSquareText } from "lucide-react";
// import Data from "../../../data/data";

// function TextNode({ data, selected, id }) {
//   const { deleteElements } = useReactFlow();
//   const dataList = Data.data;
//   const preUseID = sessionStorage.getItem("id") || 1;
//   const userDataId = preUseID - 1;

//   const userData = dataList.userId
//     ? dataList.find((user) => user.id === userDataId)
//     : dataList[userDataId || 0];

//   const formatLabel = (label) => {
//     return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
//       const trimmedKey = key.trim();
//       return userData?.[trimmedKey] || match;
//     });
//   };

//   return (
//     <div
//       className={`relative w-58 h-48 rounded-xl shadow-md border-2 transition-all duration-200 ${
//         selected ? "border-white scale-105" : "border-gray-300"
//       } bg-[#b5b5b5] text-grey-300`}
//     >
//       {/* Delete Icon */}
//       <button
//         onClick={() => deleteElements({ nodes: [{ id }] || 1 })}
//         className="absolute top-2 right-2 text-grey-300 hover:text-red-600 transition-transform hover:scale-110"
//       >
//         <Trash2 size={18} />
//       </button>

//       {/* Left & Right Handles */}
//       <Handle
//         id="input"
//         type="target"
//         position={Position.Left}
//         className="w-2 h-2 bg-white rounded-full"
//       />
//       <Handle
//         id="output"
//         type="source"
//         position={Position.Right}
//         className="w-2 h-2 bg-white rounded-full"
//       />

//       {/* Main Content */}
//       <div className="flex flex-col items-center justify-center px-4 py-6 space-y-4">
//         <MessageSquareText size={28} className="text-white" />
//         <h3 className="text-lg font-semibold">Message Node</h3>

//         <button
//           className="bg-white text-teal-700 font-semibold px-4 py-1 rounded-full shadow hover:bg-teal-100 transition"
//           onClick={() => console.log("Configure Clicked")}
//         >
//           Configure
//         </button>
//       </div>
//     </div>
//   );
// }

// export default TextNode;


// // // "use client";

// // import React from "react";
// // import { Handle, Position, useReactFlow } from "reactflow";
// // import { Trash2, Camera } from "lucide-react";
// // import Data from "../../../data/data";

// // function TextNode({ data, selected, id }) {
// //   const { deleteElements } = useReactFlow();

// //   const dataList = Data.data;

// //   // const userDataId = dataList.userId
// //   const preUseID = sessionStorage.getItem("id") || 1;

// //   const userDataId = preUseID - 1;

// //   // Find specific user by ID (if data.userId is provided)
// //   const userData = dataList.userId
// //     ? dataList.find((user) => user.id === userDataId)
// //     : dataList[userDataId || 0]; // Default to the first user if no ID is given

// //   // Function to replace placeholders with actual values
// //   const formatLabel = (label) => {
// //     return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
// //       const trimmedKey = key.trim(); // Remove extra spaces
// //       return userData?.[trimmedKey] || match; // Replace if key exists, else keep placeholder
// //     });
// //   };

// //   return (
// //     <div
// //       className={`w-64 shadow-lg rounded-lg bg-white transition-all duration-200 ${
// //         selected
// //           ? "border-2 border-indigo-500 scale-105"
// //           : "border border-gray-200"
// //       }`}
// //     >
// //       <div className="flex flex-col">
// //         {/* Header */}
// //         <div className="px-3 py-2 text-left text-white text-xs font-semibold rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
// //           <span className="flex items-center gap-1">
// //             <Camera size={14} className="opacity-90" /> Message Node
// //           </span>
// //           <button
// //             onClick={() => deleteElements({ nodes: [{ id }] || 1 })}
// //             className="text-white hover:text-red-500 transition-transform transform hover:scale-110"
// //           >
// //             <Trash2 size={16} />
// //           </button>
// //         </div>

// //         <div className="px-3 py-2 text-xs text-black">
// //           {data.label && userData && (
// //             <div className="py-2 relative">
// //               <p className="font-bold my-1">Send Message</p>
// //               <p className="border rounded p-2">{formatLabel(data.label === "textnode" ? "{ company }" : data.label)}</p>
// //               {/* <Handle
// //                 id="handle-message"
// //                 type="target"
// //                 position={Position.Left}
// //                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
// //               />
// //               <Handle
// //                 id="handle-message"
// //                 type="source"
// //                 position={Position.Right}
// //                 className="w-1 rounded-full bg-gray-500 absolute top-1/2 right-[-5px] transform -translate-y-1/2"
// //               /> */}
// //             </div>
// //           )}

// //           {/* Send Image */}
// //           {data.image && (
// //             <div className="py-2 relative">
// //               <p className="font-bold">Send Image</p>
// //               <img
// //                 src={data.image}
// //                 alt="Node"
// //                 width={500}
// //                 height={300}
// //                 className="w-full h-auto rounded-md mt-2"
// //               />
// //               <Handle
// //                 id={`handle-image}`} // Unique ID for each handle
// //                 type="source"
// //                 position={Position.Right}
// //                 className={`custom-handle ${
// //                   data.isActive ? "active" : "inactive"
// //                 }`}
// //                 style={{
// //                   right: -10, // Adjust this value as needed
// //                   top: "50%",
// //                   transform: "translateY(-50%)",
// //                 }}
// //               />
// //             </div>
// //           )}

// //           {data.video && (
// //             <div className="mb-2 relative">
// //               <p className="font-bold">Send Video</p>
// //               <video
// //                 controls
// //                 className="w-full h-auto rounded border border-blue-300"
// //               >
// //                 <source src={data.video} type="video/mp4" />\
// //               </video>

// //               <Handle
// //                 id={`handle-video}`} // Unique ID for each handle
// //                 type="source"
// //                 position={Position.Right}
// //                 className={`custom-handle ${
// //                   data.isActive ? "active" : "inactive"
// //                 }`}
// //                 // style={{
// //                 //   right: -10, // Adjust this value as needed
// //                 //   top: "50%",
// //                 //   transform: "translateY(-50%)",
// //                 // }}
// //               />
// //             </div>
// //           )}

// //           {data.audio && (
// //             <div className="mb-2 relative">
// //               <p className="font-bold">Send Audio</p>
// //               <audio controls>
// //                 <source src={data.audio} type="audio/mpeg" />
// //               </audio>

// //               <Handle
// //                 id={`handle-audio}`} // Unique ID for each handle
// //                 type="source"
// //                 position={Position.Right}
// //                 className={`custom-handle ${
// //                   data.isActive ? "active" : "inactive"
// //                 }`}
// //               />
// //             </div>
// //           )}

// //           {data.file && (
// //             <div className="mb-2 relative">
// //               <p className="font-bold">Send File</p>
// //               <a
// //                 href={data.file}
// //                 target="_blank"
// //                 rel="noopener noreferrer"
// //                 className="text-blue-500 underline"
// //               >
// //                 Open File
// //               </a>

// //               <Handle
// //                 id={`handle-file}`} // Unique ID for each handle
// //                 type="source"
// //                 position={Position.Right}
// //                 className={`custom-handle ${
// //                   data.isActive ? "active" : "inactive"
// //                 }`}
// //               />
// //             </div>
// //           )}

// //           {data.link && (
// //             <div className="py-2">
// //               <button
// //                 href={data.link}
// //                 target="_blank"
// //                 rel="noopener noreferrer"
// //                 className="border-2 w-full items-center justify-center p-1 flex bg-green-500 text-white font-bold  duration-5000"
// //               >
// //                 Click Me
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       <Handle
// //         id="a"
// //         type="target"
// //         position={Position.Left}
// //         className="w-1 rounded-full bg-gray-500"
// //       ></Handle>
// //       <Handle
// //         id="b"
// //         type="source"
// //         position={Position.Right}
// //         className="w-1 rounded-full bg-gray-500"
// //       />
// //     </div>
// //   );
// // }

// // export default TextNode;