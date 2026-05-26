"use client";

import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";

export default function Sidebar({
  setNodeName,
  nodeLink,
  setNodeLink,
  setNodeOption,
  selectedNode,
  setSelectedElements,
  message,
  setMessage,
  setWebhookData,
  webhookData,
  setNodeBotId
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [result, setResult] = useState("");
  const [paths, setPaths] = useState([]);
  const [jsonData, setJsonData] = useState(null);
  
  console.log("Json Data Test", jsonData);

  useEffect(() => {
    if (webhookData?.test_data) {
      const data = JSON.parse(webhookData.test_data);
      const format = { data: [data] };
      setJsonData(format);
    }
  }, [webhookData]);

  function findJsonPaths(obj, currentPath = "") {
    const paths = [];

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const arrayPath = `${currentPath}[${index}]`;
        if (typeof item === "object" && item !== null) {
          paths.push(...findJsonPaths(item, arrayPath));
        } else {
          paths.push({ path: arrayPath, value: item });
        }
      });
    } else {
      for (let key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
          paths.push(...findJsonPaths(obj[key], newPath));
        } else {
          paths.push({ path: newPath, value: obj[key] });
        }
      }
    }

    return paths;
  }

  function getValueFromPath(data, path) {
    const cleanPath = path.replace(/\[(\d+)\]/g, ".$1");
    const keys = cleanPath.split(".");
    return keys.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""),
      data
    );
  }

  function renderTemplate(template, data) {
    return template.replace(/{{(.*?)}}/g, (_, path) => {
      return getValueFromPath(data, path.trim());
    });
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (jsonData) {
      const extracted = findJsonPaths(jsonData);
      setPaths(extracted);
    }
  }, [jsonData]);

  console.log("Webhook Data", webhookData);

  const handleInputChange = (event, field) => {
    const value = event.target.value;
    if (field === "name") setNodeName(value);
    if (field === "link") setNodeLink(value);
    if (field === "option") setNodeOption(value);
  };

  const handleInsertPath = (path) => {
    setMessage((prev) => prev + `{{${path}}}`);
  };

  const handleRender = () => {
    if (jsonData) {
      const rendered = renderTemplate(message, jsonData);
      setResult(rendered);
    }
    Swal.fire({
      title: "Saved",
      text: "Message Saved Successfully!",
      icon: "success",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
  };

  return selectedNode ? (
    <aside
      className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[30%] h-auto shadow-md transition-all duration-300 flex flex-col ${
        isDarkMode ? "bg-white text-gray-900" : "bg-white text-gray-900"
      }`}
    >
      <div className="relative flex items-center justify-between mb-4">
        <h3
          className={`text-xl font-bold flex items-center gap-2 pr-8 ${
            isDarkMode ? "text-black" : "text-blue-900"
          }`}
        >
          <Edit className="w-5 h-5" /> Media Node
        </h3>

        <button
          className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
          onClick={() => setSelectedElements([])}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <label className="block text-sm font-medium py-2">
        Create a Message:
      </label>

      {/* Template Input */}
      <textarea
        placeholder="Enter your message with {{path}}..."
        className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none focus:outline-none min-h-[100px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="w-full flex justify-end">
        <button
          className="px-4 py-2 my-3 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          onClick={handleRender}
        >
          Save Message
        </button>
      </div>

      {/* JSON Path List */}
      <h4 className="mt-4 font-semibold text-gray-800">Available Paths:</h4>
      <div className="max-h-full overflow-y-auto mt-1 border border-gray-200 rounded">
        {paths.map((item, index) => (
          <div
            key={index}
            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm border-b"
            onClick={() => handleInsertPath(item.path)}
          >
            <strong>{item.path}</strong>: {String(item.value)}
          </div>
        ))}
      </div>

      {/* Optional Link Field */}
      <label className="block text-sm font-medium sm:hidden mt-4">Link:</label>
      <input
        type="text"
        className="w-full p-2 mb-2 border border-blue-300 text-black my-2 rounded sm:hidden"
        value={nodeLink}
        onChange={(e) => handleInputChange(e, "link")}
      />
    </aside>
  ) : null;
}

// "use client";

// import { useState, useEffect } from "react";
// import Data from "../../../data/data";
// import { X, ChevronLeft, Edit, List, ArrowLeft } from "lucide-react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// export default function Sidebar({
//   dataUserId,
//   nodeName,
//   setNodeName,
//   nodeImage,
//   nodeVideo,
//   nodeAudio,
//   nodeFile,
//   setNodeImage,
//   setNodeVideo,
//   setNodeFile,
//   setNodeAudio,
//   nodeLink,
//   setNodeLink,
//   setNodeOption,
//   selectedNode,
//   setSelectedElements,
// }) {
//   const [selectedType, setSelectedType] = useState("");

//   const handleInputChange = (event, field) => {
//     const value = event.target.value;
//     if (field === "name") setNodeName(value);
//     if (field === "link") setNodeLink(value);
//     if (field === "option") setNodeOption(value);
//   };

//   const handleFileChange = (e, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       switch (type) {
//         case "image":
//           setNodeImage(url);
//           break;
//         case "video":
//           setNodeVideo(url);
//           break;
//         case "audio":
//           setNodeAudio(url);
//           break;
//         case "file":
//           setNodeFile(url);
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   const handleSelectChange = (e) => {
//     const value = e.target.value;
//     if (value) {
//       // Append the selected item in curly brackets
//       const updatedText = `${nodeName} { ${value} }`;
//       handleInputChange({ target: { value: updatedText } }, "name");
//       sessionStorage.setItem("textNodeField", value);
//     }
//   };

//   const keys = Object.keys(Data.data[0]);

//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//       setIsDarkMode(true);
//     }
//   }, []);

//   const handleChange = (content) => {
//     handleInputChange({ target: { value: content } }, "name");
//   };

//   const modules = {
//     toolbar: [
//       ["bold", "italic"], // Bold & Italic
//       [{ list: "ordered" }, { list: "bullet" }], // Ordered & Bullet List
//     ],
//   };

//   return (
//     <>
//       {selectedNode ? (
//         <aside
//           className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[30%] h-auto shadow-md transition-all duration-300 flex flex-col ${
//             isDarkMode
//               ? "bg-white border-gray-700 text-gray-900"
//               : "bg-white border-gray-700 text-gray-900"
//           }`}
//         >
//           <div className="relative flex items-center justify-between mb-4">
//             <h3
//               className={`text-xl font-bold flex items-center gap-2 pr-8 ${
//                 isDarkMode ? "text-black" : "text-blue-900"
//               }`}
//             >
//               <Edit className="w-5 h-5" /> Media Node
//             </h3>

//             {/* Close Button (X) - Top Right */}
//             <button
//               className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
//               onClick={() => setSelectedElements([])}
//             >
//               <X className="w-3 h-3" />
//             </button>
//           </div>

//           <label className="block text-sm font-medium py-2">
//             Create a Message:
//           </label>

//           {/* Node Name Input */}
//           <div className="w-full  mt-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
//             {/* Label */}
//             <label className="block text-sm font-medium text-gray-700 py-2">
//               Enter Message:
//             </label>

//             {/* React Quill Editor */}
//             {/* <div className="border border-gray-300 rounded-md shadow-sm">
//               <ReactQuill
//                 theme="snow"
//                 value={nodeName === "textnode" ? "" : nodeName}
//                 onChange={handleChange}
//                 className="mb-2"
//                 placeholder="Enter Your Message"
//                 modules={modules}
//               />

//               <input type="text-area" placeholder="Enter Your Message" />
//             </div> */}

//             <div className="border border-gray-300 rounded-md shadow-sm p-2">
//               <textarea
//                 placeholder="Enter your message"
//                 className="w-full h-24 p-2 border-none focus:outline-none resize-none rounded-md"
//               ></textarea>
//             </div>

//             {/* Select Field */}
//             <div className="mt-4">
//               <label className="block text-sm font-medium text-gray-700">
//                 Fields
//               </label>
//               <div className="relative mt-1">
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   onChange={handleSelectChange}
//                 >
//                   <option value="">Select an item</option>
//                   {keys.map((item, index) => (
//                     <option key={index} value={item}>
//                       {item}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Dropdown for selecting file type */}
//           <label className="py-1 block text-sm font-medium pt-3">
//             Select File Type:
//           </label>
//           <select
//             className="w-full p-2 mb-4 border border-blue-300 text-black my-2 rounded"
//             onChange={(e) => setSelectedType(e.target.value)}
//           >
//             <option value="">Select Type</option>
//             <option value="image">Image</option>
//             <option value="video">Video</option>
//             <option value="audio">Audio</option>
//             <option value="file">File</option>
//           </select>

//           {/* Conditional Rendering Based on Selection */}
//           {selectedType === "image" && (
//             <div>
//               <label className="block text-sm font-medium">Upload Image:</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="w-full p-2 mb-2 border border-blue-300 text-black my-2 rounded"
//                 onChange={(e) => handleFileChange(e, "image")}
//               />
//               {nodeImage && (
//                 <img
//                   src={nodeImage}
//                   alt="Uploaded"
//                   width={500}
//                   height={300}
//                   className="w-full h-24 object-cover mt-2"
//                 />
//               )}
//             </div>
//           )}

//           {selectedType === "video" && (
//             <div>
//               <label className="block text-sm font-medium">Upload Video:</label>
//               <input
//                 type="file"
//                 accept="video/*"
//                 className="w-full p-2 mb-2 border border-blue-300 text-black my-2 rounded"
//                 onChange={(e) => handleFileChange(e, "video")}
//               />
//               {nodeVideo && (
//                 <video controls className="w-full h-24 mt-2">
//                   <source src={nodeVideo} type="video/mp4" />
//                   Your browser does not support the video tag.
//                 </video>
//               )}
//             </div>
//           )}

//           {selectedType === "audio" && (
//             <div>
//               <label className="block text-sm font-medium">Upload Audio:</label>
//               <input
//                 type="file"
//                 accept="audio/*"
//                 className="w-full p-2 mb-2 border border-blue-300 text-black my-2 rounded"
//                 onChange={(e) => handleFileChange(e, "audio")}
//               />
//               {nodeAudio && (
//                 <div className="mt-2">
//                   <audio controls className="w-full">
//                     <source src={nodeAudio} type="audio/mpeg" />
//                     Your browser does not support the audio element.
//                   </audio>
//                   <p className="text-blue-600 mt-2">
//                     <a
//                       href={nodeAudio}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="underline"
//                     >
//                       Open Audio in New Tab
//                     </a>
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {selectedType === "file" && (
//             <div>
//               <label className="block text-sm font-medium">Upload File:</label>
//               <input
//                 type="file"
//                 accept=".pdf,.docx,.txt,.xlsx,.csv"
//                 className="w-full p-2 mb-2 border border-blue-300 text-black my-2 rounded"
//                 onChange={(e) => handleFileChange(e, "file")}
//               />
//               {nodeFile && (
//                 <p className="text-sm text-blue-700 mt-2">
//                   Uploaded File:{" "}
//                   <a
//                     href={nodeFile}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500 underline"
//                   >
//                     Download
//                   </a>
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Link */}
//           <label className="block text-sm font-medium">Link:</label>
//           <input
//             type="text"
//             className="w-full p-2 mb-2 border border-blue-300 text-black my-2 rounded"
//             value={nodeLink}
//             onChange={(e) => handleInputChange(e, "link")}
//           />
//         </aside>
//       ) : null}
//     </>
//   );
// }
