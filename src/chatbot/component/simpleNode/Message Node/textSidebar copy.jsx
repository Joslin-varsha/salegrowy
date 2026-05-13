"use client";

import { useState, useEffect ,useRef } from "react";
import Data from "../../../../data/data";
import { X, ChevronLeft, Edit, List, ArrowLeft } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TextSidebar({
  dataUserId,
  nodeName,
  setNodeName,
  nodeImage,
  nodeVideo,
  setNodeImage,
  setNodeVideo,
  nodeLink,
  setNodeLink,
  selectedNode,
  setNodeOption,
  setSelectedElements,
}) {


  const base_uri = import.meta.env.VITE_BASE_URI;
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  const handleInputChange = (event, field) => {
    const value = event.target.value;
    if (field === "name") setNodeName(value);
    if (field === "link") setNodeLink(value);
    if (field === "option") setNodeOption(value);
  };

  const handleFileChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      if (field === "image") setNodeImage(fileUrl);
      if (field === "video") setNodeVideo(fileUrl);
    }
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value) {
      // Append the selected item in curly brackets
      const updatedText = `${nodeName} { ${value} }`;
      handleInputChange({ target: { value: updatedText } }, "name");
      sessionStorage.setItem("textNodeField", value);
    }
  };

  const keys = Object.keys(Data.data[0]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  const handleChange = (content) => {
    handleInputChange({ target: { value: content } }, "name");
  };

  const modules = {
    toolbar: [
      ["bold", "italic"], // Bold & Italic
      [{ list: "ordered" }, { list: "bullet" }], // Ordered & Bullet List
    ],
  };

  const [lent, setLent] = useState(1);
   const [text, setText] = useState('');
   const [title, setTitle] = useState('');
  const textareaRef = useRef("");
  
    const insertAtCursor = (item) => {
     
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const insertText = `{${item}}`;
    const newValue = text.slice(0, start) + insertText + text.slice(end);
    setText(newValue);
    // wait for DOM update
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + insertText.length, start + insertText.length);
    });
  };

  const submitSimpleBot = async () => {
    const formData = new FormData();
    formData.append('name',title);
    formData.append('reply_text',text);
    formData.append('message_type','simple');
    formData.append('vendor_uid',vendor_uid);
    formData.append('bot_flow_uid',bot_flow_uid);

    try {
      const response = await fetch(`${base_uri}storeBotReply`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("SimpleBot Add Error:", error);
    }

  };

  return (
    <>
      {selectedNode ? (
    <aside
      className={`border-r p-5 text-sm w-[32vw] h-screen shadow-md transition-all duration-300 flex flex-col ${
        isDarkMode
        ? "bg-white border-gray-700 text-gray-900"
        : "bg-white border-gray-700 text-gray-900"
      }`}
    >
       <form onSubmit={submitSimpleBot}>
      <div className="relative flex items-center justify-between mb-4">
          <h3
            className={`text-xl font-bold flex items-center gap-2 pr-8 ${
              isDarkMode ? "text-black" : "text-blue-900"
            }`}
          >
            Simple Bot Reply
          </h3>

          {/* Close Button (X) - Top Right */}
          <button
            className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
            onClick={() => setSelectedElements([])}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

      {/* ID Select for Testing */}
      <label className="block text-sm font-medium mb-1">Create a Message:</label>
      {/* Node Name Input */}
      <label className="block text-sm font-medium mt-4">Name:</label>
      <input
        type="text"
        className="w-full p-2 border rounded transition-all duration-200 focus:outline-none text-black" value={title}  onChange={(e) => setTitle(e.target.value)}
        // value={nodeName}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Node Name Input */}
      {Array.from({ length: lent }).map((_, index) => (
      <div key={index} className="w-full  mt-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 py-2">
        Reply Text:
      </label>

      {/* React Quill Editor */}
      <div className="w-full p-2 border rounded transition-all duration-200 focus:outline-none text-black">
        <textarea ref={textareaRef}
          className="mb-2 w-full p-2 resize-y focus:outline-none focus:ring
             whitespace-pre-wrap break-words"
          placeholder="Enter Your message"
           onChange={(e) => setText(e.target.value)}
           value={text}
          
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      

      {/* Select Field */}
      <div className="mt-4">
        <div className="relative mt-1">
          <p className="p-2 pe-0 text-justify">You are free to use the following dynamic variables for reply text, which will get replaced with the contact's concerned field value.</p>
          <code className="text-xs text-red-500" >
            {keys.map((item, index) => (
              <button key={index} type="button" className="bg-gray-100 p-1 rounded mr-1 me-1"  onClick={() => insertAtCursor(`{${item}}`)} >
                {`{${item}}`}
              </button>
            ))}
          </code>
        </div>
      </div>
    </div>
    

     
    ))}

<div className="mt-4">
    <button  style={{ width: '100px',float:'right' }}  disabled={value.trim().length === 0}
  type="submit" 
  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
>
  Submit
</button>
</div>
</form>
    </aside>
      ) : null}
    </>
  );
}
