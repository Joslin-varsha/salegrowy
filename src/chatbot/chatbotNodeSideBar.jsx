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
  Bot,
  ChevronRight,
  Phone,
  GripVertical,
  CalendarSync,
  MailQuestion,
  MessageCircleQuestion,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";


export default function Sidebar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);
  const [isOpen5, setIsOpen5] = useState(false);
  const [isOpen6, setIsOpen6] = useState(false);
  const [isOpen7, setIsOpen7] = useState(false);
  const [isOpen8, setIsOpen8] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const nodes = [
    {
      name: "Simple Bot Reply",
      type: "questionnode",
      icon: <FileText className="w-4 h-4" alt="icon" />,
    },
    {
      name: "Media Bot Reply",
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
  const bot_flow_uid = localStorage.getItem('domain');

  return (

    <aside
      className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-70 h-screen shadow-md flex flex-col justify-between transition-all duration-300 ${
        isDarkMode
          ? "bg-white border-gray-700 text-gray-900"
          : "bg-white border-gray-700 text-gray-900"
      }`}
    >

      { isClient &&
      <div>
        <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => window.history.back()} // change this function as needed
          className="p-2 rounded hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>

        <h3
          className={`text-xl font-bold mt-2 ${
            isDarkMode ? "text-black" : "text-black"
          }`}
        >
          Node Panel
        </h3>
      </div>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery ? (
          <>
            {filteredNodes.map((node, index) => (
              <div
                key={index}
                className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
                onDragStart={(event) =>
                  event.dataTransfer.setData("application/reactflow", node.type)
                }
                draggable
              >
                {node.icon} {node.name}
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Text Nodes */}
            <div className="mb-3">
              <h4 className="text-gray-700 font-semibold mb-1">Bot Reply</h4>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "questionnode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Simple Bot Reply
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
                    "textmedianode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />Media Bot Reply
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "advancenode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />Advance Interactive Bot 
                  </div>
                  <GripVertical className=" ml-4 w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>

            </div>
            {/* Question Nodes */}
            <div className="mb-3">
              <h4 className="text-gray-700 font-semibold mb-1">Question Nodes</h4>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "phonequestionnode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Question
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
            </div>
    
            {/* Media Nodes */}
            {/* <details className="mb-4">
              <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen2(!isOpen2)}
              >
                {isOpen2 ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5 " />
                )}  Media Nodes
              </summary>
              <div
                className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "textnode"
                  )
                }
                draggable
              >
                <Image className="w-4 h-4" alt="icon" /> Media Node
              </div>
            </details> */}

            {/* Others */}
            <div className="mb-3">
              <h4 className="text-gray-700 font-semibold mb-1">Others</h4>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "paymentnode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" alt="icon" /> Create Payment Link
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "flowtemplatenode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" alt="icon" /> Flow Template
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "catlognode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" alt="icon" /> Catalog Node
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
               <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "createordernode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" alt="icon" /> Create Order Node
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              {/* <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "businesshoursnode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" alt="icon" /> Business Hours
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div> */}
              {/* <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "humantakeovernode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" alt="icon" /> Human TakeOver
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div> */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "remindernode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarSync className="w-4 h-4" alt="icon" /> Reminder
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "aiProductNode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" alt="icon" /> AI Product
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "inactiveNode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" alt="icon" /> Inactive Followup
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "apirequestnode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Api Request 
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "conditionrouternode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Conditions Router
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 cursor-grab transition mb-1"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "pincodenode"
                  )
                }>
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Pincode
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      }
      {/* <div
        className="p-3 border rounded-lg cursor-pointer flex justify-center items-center hover:bg-red-500 hover:text-white transition-all duration-200 gap-2 shadow-lg"
        onClick={() => window.open("/chatBot", "_blank")}
      >
        <Database className="w-5 h-5" />
        <p>Raw Data</p>
      </div> */}
      
    </aside>
  );
}

// <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <MessageSquareText className="w-5 h-5 text-blue-700" /> Text Nodes
//           </summary>
//           <div
//             className="p-2 hover:cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "questionnode")
//             }
//             draggable
//           >
//             <FileText className="w-4 h-4" /> Text Node
//           </div>

//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "textmedianode")
//             }
//             draggable
//           >
//             <Image className="w-4 h-4" /> Text Media Node
//           </div>
//         </details>

//         {/* Question Nodes */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <User className="w-5 h-5 text-green-700" /> Question Nodes
//           </summary>
//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-green-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "questionnamenode")
//             }
//             draggable
//           >
//             <User className="w-4 h-4" /> Ask for Name
//           </div>
//         </details>

//         {/* Media Nodes */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <Image className="w-5 h-5 text-yellow-700" /> Media Nodes
//           </summary>
//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-yellow-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "textnode")
//             }
//             draggable
//           >
//             <Image className="w-4 h-4" /> Media Node
//           </div>
//         </details>

//         {/* Advanced Nodes */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <Settings className="w-5 h-5 text-purple-700" /> Advanced Nodes
//           </summary>
//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "advancenode")
//             }
//             draggable
//           >
//             <Settings className="w-4 h-4" /> Advanced Node
//           </div>

//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "listbuttonnodde")
//             }
//             draggable
//           >
//             <ClipboardList className="w-4 h-4" /> List Messages
//           </div>

//           {/* <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white rounded-lg border mt-2"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "listbuttonnodde")
//             }
//             draggable
//           >
//             <List className="w-4 h-4" /> List Button
//           </div> */}
//         </details>















// Old Side Bar

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
// } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function Sidebar() {
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const [isOpen1, setIsOpen1] = useState(false);
//   const [isOpen2, setIsOpen2] = useState(false);
//   const [isOpen3, setIsOpen3] = useState(false);
//   const [isOpen4, setIsOpen4] = useState(false);
//   const [isOpen5, setIsOpen5] = useState(false);
//   const [isOpen6, setIsOpen6] = useState(false);
//   const [isOpen7, setIsOpen7] = useState(false);
//   const [isOpen8, setIsOpen8] = useState(false);

//   useEffect(() => {
//     if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//       setIsDarkMode(true);
//     }
//   }, []);

//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const nodes = [
//     {
//       name: "Simple Bot Reply",
//       type: "questionnode",
//       icon: <FileText className="w-4 h-4" alt="icon" />,
//     },
//     {
//       name: "Media Bot Reply",
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

//   return (


//     <aside
//       className={`border-r max-h-screen overflow-y-auto  p-5 text-sm w-64 h-screen shadow-md flex flex-col justify-between transition-all duration-300 ${
//         isDarkMode
//           ? "bg-white border-gray-700 text-gray-900"
//           : "bg-white border-gray-700 text-gray-900"
//       }`}
//     >

//       { isClient &&
//       <div>
//         <h3
//           className={`text-xl mb-6 font-bold ${
//             isDarkMode ? "text-black" : "text-black"
//           }`}
//         >
//           Node Panel
//         </h3>

//         <div className="relative mb-4">
//           <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
//           <input
//             type="text"
//             placeholder="Search nodes..."
//             className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         {searchQuery ? (
//           <>
//             {filteredNodes.map((node, index) => (
//               <div
//                 key={index}
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData("application/reactflow", node.type)
//                 }
//                 draggable
//               >
//                 {node.icon} {node.name}
//               </div>
//             ))}
//           </>
//         ) : (
//           <>
//             {/* Text Nodes */}
//             <details className="mb-4">
//               <summary 
//                 className="cursor-pointer font-semibold flex items-center gap-2"
//                 onClick={() => setIsOpen(!isOpen)}
//               >
//                 {isOpen ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )} Bot Reply
//               </summary>
//               <div
//                 className="p-2 hover:cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "questionnode"
//                   )
//                 }
//                 draggable
//               >
//                 <FileText className="w-4 h-4" /> Simple Bot Reply
//               </div>

//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "textmedianode"
//                   )
//                 }
//                 draggable
//               >
//                 <Image className="w-4 h-4" alt="icon" /> Media Bot Reply
//               </div>
//             </details>

//             {/* Question Nodes */}
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen1(!isOpen1)}
//               >
//                 {isOpen1 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Question Nodes
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "questionnamenode"
//                   )
//                 }
//                 draggable
//               >
//                 <User className="w-4 h-4" /> Ask for Name
//               </div>

//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "phonequestionnode"
//                   )
//                 }
//                 draggable
//               >
//                 <Phone className="w-4 h-4" /> Ask for Phone
//               </div>

//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "emailquestionnode"
//                   )
//                 }
//                 draggable
//               >
//                 <MailQuestion className="w-4 h-4" /> Ask for Email 
//               </div>

//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "askquestionnode"
//                   )
//                 }
//                 draggable
//               >
//                 <MessageCircleQuestion className="w-4 h-4" /> Ask Question  
//               </div>
              
//             </details>

//             {/* Media Nodes */}
//             {/* <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen2(!isOpen2)}
//               >
//                 {isOpen2 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Media Nodes
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "textnode"
//                   )
//                 }
//                 draggable
//               >
//                 <Image className="w-4 h-4" alt="icon" /> Media Node
//               </div>
//             </details> */}

//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen2(!isOpen2)}
//               >
//                 {isOpen2 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Payment Link
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "paymentnode"
//                   )
//                 }
//                 draggable
//               >
//                 <Image className="w-4 h-4" alt="icon" /> Create Payment Link
//               </div>
//             </details>
            
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen3(!isOpen3)}
//               >
//                 {isOpen3 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Flow Template
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "flowtemplatenode"
//                   )
//                 }
//                 draggable
//               >
//                 <Image className="w-4 h-4" alt="icon" /> Flow Template
//               </div>
//             </details>
            
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen4(!isOpen4)}
//               >
//                 {isOpen4 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  AI Product
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "aiProductNode"
//                   )
//                 }
//                 draggable
//               >
//                 <Image className="w-4 h-4" alt="icon" /> AI Product
//               </div>
//             </details>
            
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen5(!isOpen5)}
//               >
//                 {isOpen5 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Inactive Followup
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "inactiveNode"
//                   )
//                 }
//                 draggable
//               >
//                 <Image className="w-4 h-4" alt="icon" /> Inactive Followup
//               </div>
//             </details>

//             {/* Advanced Nodes */}
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen6(!isOpen6)}
//               >
//                 {isOpen6 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Advanced BotFlow
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "advancenode"
//                   )
//                 }
//                 draggable
//               >
//                 <Settings className="w-4 h-4" /> interactive Bot 
//               </div>

//               {/* <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "listbuttonnodde"
//                   )
//                 }
//                 draggable
//               >
//                 <ClipboardList className="w-4 h-4" /> List Messages
//               </div> */}
              
//             </details>

//             {/* Api Request Nodes */}
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen7(!isOpen7)}
//               >
//                 {isOpen7 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  API Request Bot
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "apirequestnode"
//                   )
//                 }
//                 draggable>
//                 <Settings className="w-4 h-4" /> Api Request
                
//               </div>
//             </details>

//             {/* Conditions Router Nodes */}
//             <details className="mb-4">
//               <summary className="cursor-pointer font-semibold flex items-center gap-2"onClick={() => setIsOpen8(!isOpen8)}
//               >
//                 {isOpen8 ? (
//                   <ChevronDown className="w-5 h-5" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 " />
//                 )}  Conditions Router Bot
//               </summary>
//               <div
//                 className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-[#f0ecec] hover:text-black rounded-lg ms-3"
//                 onDragStart={(event) =>
//                   event.dataTransfer.setData(
//                     "application/reactflow",
//                     "conditionrouternode"
//                   )
//                 }
//                 draggable>
//                 <Settings className="w-4 h-4" /> Conditions Router
                
//               </div>
//             </details>
//           </>
//         )}

//       </div>

//       }
//       <div
//         className="p-3 border rounded-lg cursor-pointer flex justify-center items-center hover:bg-red-500 hover:text-white transition-all duration-200 gap-2 shadow-lg"
//         onClick={() => window.open("/chatBot", "_blank")}
//       >
//         <Database className="w-5 h-5" />
//         <p>Raw Data</p>
//       </div>
      
//     </aside>
//   );
// }

// <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <MessageSquareText className="w-5 h-5 text-blue-700" /> Text Nodes
//           </summary>
//           <div
//             className="p-2 hover:cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "questionnode")
//             }
//             draggable
//           >
//             <FileText className="w-4 h-4" /> Text Node
//           </div>

//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "textmedianode")
//             }
//             draggable
//           >
//             <Image className="w-4 h-4" /> Text Media Node
//           </div>
//         </details>

//         {/* Question Nodes */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <User className="w-5 h-5 text-green-700" /> Question Nodes
//           </summary>
//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-green-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "questionnamenode")
//             }
//             draggable
//           >
//             <User className="w-4 h-4" /> Ask for Name
//           </div>
//         </details>

//         {/* Media Nodes */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <Image className="w-5 h-5 text-yellow-700" /> Media Nodes
//           </summary>
//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-yellow-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "textnode")
//             }
//             draggable
//           >
//             <Image className="w-4 h-4" /> Media Node
//           </div>
//         </details>

//         {/* Advanced Nodes */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold flex items-center gap-2">
//             <Settings className="w-5 h-5 text-purple-700" /> Advanced Nodes
//           </summary>
//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "advancenode")
//             }
//             draggable
//           >
//             <Settings className="w-4 h-4" /> Advanced Node
//           </div>

//           <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white rounded-lg ms-3"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "listbuttonnodde")
//             }
//             draggable
//           >
//             <ClipboardList className="w-4 h-4" /> List Messages
//           </div>

//           {/* <div
//             className="p-2 cursor-grab flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white rounded-lg border mt-2"
//             onDragStart={(event) =>
//               event.dataTransfer.setData("application/reactflow", "listbuttonnodde")
//             }
//             draggable
//           >
//             <List className="w-4 h-4" /> List Button
//           </div> */}
//         </details>
