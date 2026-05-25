import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Handshake } from "lucide-react";
import Data from "../../../data/data";
import whatsappImage from "../../../assets/wa.jpg";

function TempNode({ data, selected, id }) {
  const { deleteElements } = useReactFlow();
  const [components, setComponents] = useState([]); // Initialize as empty array

  const dataList = Data.data;

  const preUseID = sessionStorage.getItem("id") || 1;
  const userDataId = preUseID - 1;
  const userData = dataList.userId
    ? dataList.find((user) => user.id === userDataId)
    : dataList[userDataId];

  const formatLabel = (label) => {
    return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return userData?.[trimmedKey] || match;
    });
  };

  useEffect(() => {
    setComponents(data?.components || []); // Fallback to empty array if undefined
  }, [data]);

  return (
    <div
      className={`relative rounded-2xl min-w-[18vw] shadow-lg border-2 transition-all duration-300 ease-in-out ${
        selected ? "border-blue-500 scale-105" : "border-gray-200"
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
      <div className="flex justify-between items-center py-3 px-6 rounded-t-2xl bg-white/70">
          <div className="flex items-center justify-between w-full">
            <Handshake size={24} className="text-black" />
            <h3 className="text-lg font-bold text-black">Select Template</h3>

            <button
              onClick={() => deleteElements({ nodes: [{ id }] })}
              className="text-black hover:text-red-500 transition-transform transform hover:scale-110 z-10"
            >
              <Trash2 size={16} />
            </button>
          </div>
      </div>
      <div className=" bg-white/70 rounded-2xl">
        <p className="text-sans text-center underline italic font-bold">Template Preview Section</p>
        <div
          className=" py-2 rounded overflow-y-auto max-h-[60vh] flex justify-center"
          // style={{
          //   backgroundImage: `url(${whatsappImage})`,
          //   backgroundColor: "#e5ddd5",
          //   backgroundRepeat: "repeat",
          //   backgroundSize: "contain",
          //   backgroundBlendMode: "overlay",
          // }}
        >
          {components.length > 0 ? (
            <div className="bg-[#f4f4f4] p-4 rounded-lg max-w-[90%] mx-2 my-2 relative shadow border border-[#e5ddd5]">
              {components.map((comp, index) => {
                switch (comp.type) {
                  case "HEADER":
                    const format = comp.format;
                    const handle = comp.example?.header_handle?.[0] || null;

                    const getMediaUrlFromHandle = (handle) => {
                      if (!handle) return null;
                      const parts = handle.split(":");
                      return `https://your-media-domain.com/${parts[2]}`;
                    };

                    const mediaUrl = getMediaUrlFromHandle(handle);

                    switch (format) {
                      case "TEXT":
                        return (
                          <div key={index} className="mb-2">
                            <h6 className="font-bold text-[#3b4a54] text-sm">
                              {comp.text}
                            </h6>
                          </div>
                        );

                      case "IMAGE":
                        return (
                          <div
                            key={index}
                            className="mb-2 rounded-lg overflow-hidden"
                          >
                            <img
                              src={placeholderImage}
                              alt="Header"
                              className="max-w-full h-auto"
                            />
                          </div>
                        );

                      case "VIDEO":
                        return (
                          <div
                            key={index}
                            className="mb-2 rounded-lg overflow-hidden"
                          >
                            <video controls className="max-w-full">
                              <source src={mediaUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        );

                      case "DOCUMENT":
                        return (
                          <a
                            key={index}
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-2 block font-semibold text-sm text-[#075e54]"
                          >
                            📄 {comp.text || "Download File"}
                          </a>
                        );

                      default:
                        return null;
                    }

                  case "BODY":
                    return (
                      <div key={index}>
                        <p className="text-[#3b4a54] text-sm whitespace-pre-line leading-snug">
                          {comp.text}
                        </p>
                      </div>
                    );

                  case "BUTTONS":
                    return (
                      <div key={index} className="mt-3 w-full">
                        {comp.buttons?.map((btn, i) => {
                          const isLink =
                            btn.type === "URL" ||
                            btn.type === "PHONE_NUMBER" ||
                            btn.type === "COPY_CODE";

                          if (isLink) {
                            let href = "#";
                            if (btn.type === "URL")
                              href = getDynamicUrl(btn.url, btn.example);
                            else if (btn.type === "PHONE_NUMBER")
                              href = `tel:${btn.phone_number}`;

                            return (
                              <a
                                key={i}
                                target=""
                                rel="noopener noreferrer"
                                className="block text-center bg-[#f4f4f4] py-2 px-3 text-sm font-medium text-sky-600 transition-colors"
                              >
                                {btn.text}
                              </a>
                            );
                          }

                          return (
                            <button
                              key={i}
                              className="block text-center w-full py-1 bg-[#f4f4f4] px-3 text-sm font-medium text-sky-600 transition-colors"
                            >
                              {btn.text}
                            </button>
                          );
                        })}
                      </div>
                    );

                  default:
                    return null;
                }
              })}

              <div className="text-right text-[0.6875rem] text-[#667781] mt-2">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#f4f4f4] p-4 rounded-lg max-w-[90%] mx-2 my-2 relative shadow border border-[#e5ddd5]">
              <p className="text-[#3b4a54] text-sm italic">
                Select An Template
              </p>

              <div className="text-right text-[0.6875rem] text-[#667781] mt-2">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Handles */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm transition-transform duration-200 hover:scale-125"
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

export default TempNode;

// import React, { useEffect, useState } from "react";
// import { Handle, Position, useReactFlow } from "reactflow";
// import { Trash2, Handshake } from "lucide-react";
// import Data from "../../../data/data";

// function TempNode({ data, selected, id }) {
//   const { deleteElements } = useReactFlow();

//   const dataList = Data.data;

//   const preUseID = sessionStorage.getItem("id") || 1;
//   const userDataId = preUseID - 1;
//   const userData = dataList.userId
//     ? dataList.find((user) => user.id === userDataId)
//     : dataList[userDataId];

//   const formatLabel = (label) => {
//     return label.replace(/\{(\s*\w+\s*)\}/g, (match, key) => {
//       const trimmedKey = key.trim();
//       return userData?.[trimmedKey] || match;
//     });
//   };

//   const handleTemplateSelect = () => {
//     // router.push('/model')
//   };

//   return (
//     <div
//       className={`w-40 h-48 text-center shadow-md rounded-xl bg-[#EC9072] relative transition-all duration-200 flex flex-col justify-center items-center ${
//         selected ? "scale-105 ring-2 ring-white" : ""
//       }`}
//     >
//       <button
//         onClick={() => deleteElements({ nodes: [{ id }] })}
//         className="absolute top-2 right-2 text-white hover:text-red-500 transition-transform transform hover:scale-110 z-10"
//       >
//         <Trash2 size={16} />
//       </button>

//       <div className="flex flex-col justify-center items-center space-y-2">
//         <Handshake size={26} className="text-white" />
//         <p className="text-white text-sm font-semibold">Select Template</p>

//         <button
//           className="text-[#EC9072] bg-white px-4 py-1 rounded-full text-xs font-medium hover:scale-105 transition"
//           onClick={handleTemplateSelect}
//         >
//           Configure
//         </button>
//       </div>

//       <Handle
//         id="a"
//         type="target"
//         position={Position.Left}
//         className="w-1 rounded-full bg-slate-500"
//       />
//       <Handle
//         id="b"
//         type="source"
//         position={Position.Right}
//         className="custom-handle p-2"
//       >
//         <span className="handle-icon">+</span>
//       </Handle>
//     </div>
//   );
// }

// export default TempNode;
