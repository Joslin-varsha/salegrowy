// "use client";

import {
  MessageSquareText,
  Image,
  Settings,
  Database,
  User,
  FileText,
  List,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  MailQuestion,
  MessageCircleQuestion,
  MessageCircle,
  TimerIcon,
  Grid,
  GridIcon,
  GripVertical,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [botData, setBotData] = useState(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const nodes = [
    {
      name: "Text Node",
      type: "questionnode",
      icon: <FileText className="w-4 h-4" alt="icon" />,
    },
    {
      name: "Text Media Node",
      type: "textmedianode",
      icon: <Image className="w-4 h-4" alt="icon" />,
    },
    {
      name: "Ask for Name",
      type: "questionnamenode",
      icon: <User className="w-4 h-4" />,
    },
    {
      name: "Media Node",
      type: "textnode",
      icon: <Image className="w-4 h-4" alt="icon" />,
    },
    {
      name: "Advanced Node",
      type: "advancenode",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      name: "List Messages",
      type: "listbuttonnodde",
      icon: <ClipboardList className="w-4 h-4" />,
    },
  ];

  const filteredNodes = nodes.filter((node) =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[16vw] h-screen shadow-md flex flex-col justify-between transition-all duration-300 ${
        isDarkMode ? "bg-white text-gray-900" : "bg-white text-gray-900"
      }`}
    >
      {isClient && (
        <div>
          <h3 className="text-xl mb-6 font-bold text-black">Flow Builder</h3>

          <div className="relative mb-6 bordered border-gray-300">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search nodes..."
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery ? (
            <>
              {filteredNodes.map((node, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-md cursor-grab hover:bg-blue-600 hover:text-white transition mb-2"
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      "application/reactflow",
                      node.type
                    )
                  }
                  draggable
                >
                  {node.icon} <span>{node.name}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Group: Messages */}
              <div className="mb-6">
                <h4 className="text-gray-700 font-semibold mb-2">Messages</h4>

                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-2"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      "application/reactflow",
                      "textnode"
                    )
                  }
                >
                  <div className="flex w-full justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Send a Message
                    </div>
                    <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      "application/reactflow",
                      "tempnode"
                    )
                  }
                >
                  <div className="flex w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />Select an Template
                    </div>
                    <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                  </div>
                </div>
              </div>

              {/* Group: Time Node */}
              <div>
                <h4 className="text-gray-700 font-semibold mb-2">Time Nodes</h4>

                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-2"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      "application/reactflow",
                      "timenode"
                    )
                  }
                >
                  <div className="flex w-full justify-between">
                    <div className="flex items-center gap-2">
                      <TimerIcon className="w-4 h-4" /> Choose Delay Time
                    </div>
                    <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </aside>

    //     <aside
    //   className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-64 h-screen shadow-md flex flex-col justify-between transition-all duration-300 ${
    //     isDarkMode
    //       ? "bg-white border-gray-700 text-gray-900"
    //       : "bg-white border-gray-700 text-gray-900"
    //   }`}
    // >
    //   {isClient && (
    //     <div>
    //       <h3
    //         className={`text-xl mb-6 font-bold ${
    //           isDarkMode ? "text-black" : "text-black"
    //         }`}
    //       >
    //         Flow Builder
    //       </h3>

    //       <div className="relative mb-4">
    //         <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
    //         <input
    //           type="text"
    //           placeholder="Search nodes..."
    //           className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    //           value={searchQuery}
    //           onChange={(e) => setSearchQuery(e.target.value)}
    //         />
    //       </div>

    //       {searchQuery ? (
    //         <>
    //           {filteredNodes.map((node, index) => (
    //             <div
    //               key={index}
    //               className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
    //               onDragStart={(event) =>
    //                 event.dataTransfer.setData(
    //                   "application/reactflow",
    //                   node.type
    //                 )
    //               }
    //               draggable
    //             >
    //               {node.icon} {node.name}
    //             </div>
    //           ))}
    //         </>
    //       ) : (
    //         <>
    //           {/* Template Nodes Section */}
    //           <h4 className="font-semibold mb-2 mt-4 flex items-center gap-2">
    //             Template Nodes
    //           </h4>
    //           <div
    //             className="p-2 hover:cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3 mb-4"
    //             onDragStart={(event) =>
    //               event.dataTransfer.setData(
    //                 "application/reactflow",
    //                 "tempnode"
    //               )
    //             }
    //             draggable
    //           >
    //             <FileText className="w-4 h-4" /> Template Node
    //           </div>

    //           {/* Message Nodes Section */}
    //           <h4 className="font-semibold mb-2 mt-4 flex items-center gap-2">
    //             Message Nodes
    //           </h4>
    //           <div
    //             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3 mb-4"
    //             onDragStart={(event) =>
    //               event.dataTransfer.setData(
    //                 "application/reactflow",
    //                 "textnode"
    //               )
    //             }
    //             draggable
    //           >
    //             <MessageCircle className="w-4 h-4" alt="icon" /> Message Node
    //           </div>

    //           {/* Delay Nodes Section */}
    //           <h4 className="font-semibold mb-2 mt-4 flex items-center gap-2">
    //             Delay Nodes
    //           </h4>
    //           <div
    //             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3 mb-4"
    //             onDragStart={(event) =>
    //               event.dataTransfer.setData(
    //                 "application/reactflow",
    //                 "timenode"
    //               )
    //             }
    //             draggable
    //           >
    //             <Image className="w-4 h-4" alt="icon" /> Time Node
    //           </div>
    //         </>
    //       )}
    //     </div>
    //   )}
    // </aside>
  );
}


// -- ONClick Action --

// "use client";

// import {
//   MessageSquareText,
//   Image,
//   Settings,
//   Database,
//   User,
//   FileText,
//   List,
//   ClipboardList,
//   Search,
//   ChevronDown,
//   ChevronRight,
//   Phone,
//   MailQuestion,
//   MessageCircleQuestion,
//   MessageCircle,
//   TimerIcon,
//   Grid,
//   GridIcon,
//   GripVertical,
// } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function Sidebar({ onAddNode }) {  // Add onAddNode prop
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const [isOpen1, setIsOpen1] = useState(false);
//   const [isOpen2, setIsOpen2] = useState(false);
//   const [isOpen3, setIsOpen3] = useState(false);
//   const [botData, setBotData] = useState(null);

//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const nodes = [
//     {
//       name: "Text Node",
//       type: "questionnode",
//       icon: <FileText className="w-4 h-4" alt="icon" />,
//     },
//     {
//       name: "Text Media Node",
//       type: "textmedianode",
//       icon: <Image className="w-4 h-4" alt="icon" />,
//     },
//     {
//       name: "Ask for Name",
//       type: "questionnamenode",
//       icon: <User className="w-4 h-4" />,
//     },
//     {
//       name: "Media Node",
//       type: "textnode",
//       icon: <Image className="w-4 h-4" alt="icon" />,
//     },
//     {
//       name: "Advanced Node",
//       type: "advancenode",
//       icon: <Settings className="w-4 h-4" />,
//     },
//     {
//       name: "List Messages",
//       type: "listbuttonnodde",
//       icon: <ClipboardList className="w-4 h-4" />,
//     },
//   ];

//   const filteredNodes = nodes.filter((node) =>
//     node.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleNodeClick = (nodeType) => {
//     if (onAddNode) {
//       onAddNode(nodeType);  // Call the parent function to add the node
//     }
//   };

//   return (
//     <aside
//       className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[16vw] h-screen shadow-md flex flex-col justify-between transition-all duration-300 ${
//         isDarkMode ? "bg-white text-gray-900" : "bg-white text-gray-900"
//       }`}
//     >
//       {isClient && (
//         <div>
//           <h3 className="text-xl mb-6 font-bold text-black">Flow Builder</h3>

//           <div className="relative mb-6 bordered border-gray-300">
//             <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Search nodes..."
//               className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {searchQuery ? (
//             <>
//               {filteredNodes.map((node, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 hover:text-white transition mb-2"
//                   onClick={() => handleNodeClick(node.type)}  // Change to onClick
//                 >
//                   {node.icon} <span>{node.name}</span>
//                 </div>
//               ))}
//             </>
//           ) : (
//             <>
//               {/* Group: Messages */}
//               <div className="mb-6">
//                 <h4 className="text-gray-700 font-semibold mb-2">Messages</h4>

//                 <div
//                   className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition mb-2"
//                   onClick={() => handleNodeClick("textnode")}  // Change to onClick
//                 >
//                   <div className="flex w-full justify-between">
//                     <div className="flex items-center gap-2">
//                       <MessageCircle className="w-4 h-4" /> Send a Message
//                     </div>
//                   </div>
//                 </div>

//                 <div
//                   className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition"
//                   onClick={() => handleNodeClick("tempnode")}  // Change to onClick
//                 >
//                   <div className="flex w-full justify-between">
//                     <div className="flex items-center gap-2">
//                       <Image className="w-4 h-4" />Select an Template
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Group: Time Node */}
//               <div>
//                 <h4 className="text-gray-700 font-semibold mb-2">Time Nodes</h4>

//                 <div
//                   className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition mb-2"
//                   onClick={() => handleNodeClick("timenode")}  // Change to onClick
//                 >
//                   <div className="flex w-full justify-between">
//                     <div className="flex items-center gap-2">
//                       <TimerIcon className="w-4 h-4" /> Choose Delay Time
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </aside>
//   );
// }