"use client";

import Data from "../../../../data/data";
import { useState, useEffect, useRef} from "react";
import { X, Edit } from "lucide-react";
import "react-quill/dist/quill.snow.css";

export default function NameSidebar({
  dataUserId,
  nodeName,
  setNodeName,
  setNodeLink,
  selectedNode,
  setNodeOption,
  setSelectedElements,
  updateUserName,
  setNodeBotId,
}) {
  const [selectedField, setSelectedField] = useState(""); // Store selected field
  const [inputValue, setInputValue] = useState(""); // Store input value
   const textareaRef = useRef(null);
   const [formData, setFormData] = useState({ replay: "" });
  const [errors, setErrors] = useState({});
  const [webHookUrl, setWebHookUrl] = useState("");
  const [urlValid, setUrlValid] = useState(null);
  
  
  // Dropdown select field handler
  const handleFieldSelect = (e) => {
    const value = e.target.value;
    setSelectedField(value);
  };


  // Input change handler for dynamic fields
  const handleInputChange = (event, field) => {
    const value = event.target.value;
    if (field === "name") setNodeName(value);
    if (field === "link") setNodeLink(value);
    if (field === "option") setNodeOption(value);
    setInputValue(value);
  };

  // Update Data when clicking update button
  const handleUpdate = () => {
    if (!selectedNode || !selectedField) return;
    const index = Data.data.findIndex((user) => user.id === selectedNode.id);
    if (index !== -1) {
      Data.data[index][selectedField] = nodeName; // use nodeName prop for synced data
      updateUserName();
      setInputValue("");
    }
  };

  // Get keys dynamically for select options
  const keys = Object.keys(Data.data[0]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  // New field states and handler
  const [newField, setNewField] = useState("");

  const handleNewField = (e) => {
    const value = e.target.value;
    setNewField(value);
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setWebHookUrl(value);

    if (value.trim() === "") {
      setUrlValid(null);
      return;
    }

    try {
      new URL(value);
      setUrlValid(true);
    } catch {
      setUrlValid(false);
    }
  };
   

  

  return (
    <>
      {selectedNode ? (
        <aside
          className={`border-r p-5 text-sm w-[30rem] h-screen shadow-md transition-all duration-300 flex flex-col ${
            isDarkMode
              ? "bg-white border-gray-700 text-gray-900"
              : "bg-white border-gray-700 text-gray-900"
          }`}>
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${
                isDarkMode ? "text-black" : "text-blue-900"
              }`}>
              <Edit className="w-5 h-5" />
              Ask For Name
            </h3>

            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}>
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Question Text Input */}
          <label className="block text-sm font-medium py-2 mt-2">
            Question Text
          </label>
          <div className="pt-1">
            <textarea
              type="text"
              placeholder="Enter Message to show ..."
              className="p-2 flex w-full h-10 border text-black border-blue-300 rounded mb-3"
              value={
                nodeName === "Start" || nodeName === "questionnamenode"
                  ? ""
                  : nodeName || ""
              }
              onChange={(e) => handleInputChange(e, "name")}
            />
          </div>

           {/* Select Field */}
          <label className="block text-sm font-medium py-2">
            Select Field to Store
          </label>
          <select
            className="p-2 flex w-full border text-black border-blue-300 rounded"
            onChange={handleFieldSelect}
            value={selectedField}
          >
            <option value="">Select a field</option>
            <option value="name">Ask for a name</option>
            <option value="email">Ask for an email</option>
            <option value="number">Ask for a number</option>
            <option value="phone">Ask for a phone</option>
            <option value="date">Ask for a date</option>
            <option value="address">Ask for an address</option>
            <option value="url">Ask for a URL</option>
          </select>

          


             

          {/* Reply Text */}
          <div className="w-full mt-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
            <label className="block text-sm font-medium text-gray-700 py-2">
              Reply Text:
            </label>
            <div className="w-full p-2 border rounded transition-all duration-200 focus:outline-none text-black">
              <textarea
                ref={textareaRef}
                maxLength={1000}
                rows={4}
                name="replay"
                placeholder="Type your reply message..."
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-3"

              />
              {errors.replay && (
                <p className="text-red-500 text-sm mb-0 mt-[-10px]">
                  {errors.replay}
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="p-2 text-justify">
                You can use the following dynamic variables for reply text, which
                will be replaced with the contact’s data.
              </p>
              <code className="text-xs text-red-500">
                {keys.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="bg-gray-100 p-1 rounded mr-1 me-1 mb-1"
                    onClick={() => insertAtCursor(item)}
                  >
                    {`{${item}}`}
                  </button>
                ))}
              </code>
            </div>
             {/* Select Field */}
          <label className="block text-sm font-medium py-2">Select Field to Store</label>
          <select
            className="p-2 flex w-full border text-black border-blue-300 rounded"
            onChange={handleFieldSelect}
            value={selectedField}
>
            <option value="">Select a field</option>
            <option value="create_new">Create New</option>
            <option value="bot_name">bot_name</option>
            <option value="bot_email">bot_email</option>
            <option value="bot_number">bot_number</option>
            <option value="bot_phone">bot_phone</option>
            <option value="bot_date">bot_date</option>
            <option value="bot_address">bot_address</option>
             <option value="bot_url">bot_url</option>
           </select>

           {/* Show new input box when "Create New" is selected */}
            {selectedField === "create_new" && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">
                  New Field :
                </label>
                <input
                  type="text"
                  placeholder="Enter new field name..."
                  className="p-2 w-full border text-black border-blue-300 rounded"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                />
              </div>
            )}  
          </div>

          {/* Webhook URL validation */}
          <label className="block text-sm font-medium mt-4">Webhook URL:</label>
          <input
            type="text"
            className={`w-full p-2 mb-1 border text-black rounded ${
              urlValid === false ? "border-red-500" : "border-blue-300"
            }`}
            onChange={handleUrlChange}
            value={webHookUrl}
            placeholder="Enter URL..."
          />
          {urlValid === false && (
            <p className="text-red-500 text-sm"> Not a valid URL</p>
          )}

          
              
          
        </aside>
      ) : null}
    </>
  );
}
