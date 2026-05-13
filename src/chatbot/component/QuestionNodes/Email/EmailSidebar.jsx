"use client";

import Data from "../../../../data/data";
import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";

export default function EmailSidebar({
  dataUserId,
  nodeName,
  setNodeName,
  setNodeLink,
  selectedNode,
  setNodeOption,
  setSelectedElements,
  updateUserName,
}) {
  const [selectedField, setSelectedField] = useState(""); // Selected field to store
  const [inputValue, setInputValue] = useState(""); // Input value for the message
  const [newField, setNewField] = useState(""); // For creating new field
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  const keys = Object.keys(Data.data[0] || {});

  // Update input live
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === "name") setNodeName(value);
    if (field === "link") setNodeLink && setNodeLink(value);
    if (field === "option") setNodeOption && setNodeOption(value);
    setInputValue(value);
  };

  // Select which field to store data in
  const handleFieldSelect = (e) => {
    const value = e.target.value;
    setSelectedField(value);
    sessionStorage.setItem("selectedField", value);
  };

  // Add new field dynamically
  const handleAddNewField = () => {
    if (!newField) return;
    Data.data.forEach((user) => {
      if (!(newField in user)) user[newField] = "";
    });
    updateUserName();
    setNewField("");
  };

  return (
    <>
      {selectedNode && (
        <aside
          className={`border-r p-5 text-sm w-80 h-screen shadow-md transition-all duration-300 flex flex-col ${
            isDarkMode
              ? "bg-white border-gray-700 text-gray-900"
              : "bg-white border-gray-700 text-gray-900"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${
                isDarkMode ? "text-black" : "text-blue-900"
              }`}
            >
              <Edit className="w-5 h-5" />
              Ask For Email
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Question Text Input */}
          <label className="block text-sm font-medium py-2 mt-2">Enter your email</label>
          <textarea
            placeholder="Enter Message to show ..."
            className="p-2 flex w-full border text-black border-blue-300 rounded mb-3"
            value={nodeName === "emailquestionnode" ? "Enter Your Email" : nodeName}
            onChange={(e) => handleInputChange(e, "name")}
          />

          {/* Select Field To Store */}
          <label className="block text-sm font-medium py-2">Select Field to Store</label>
          <select
            className="p-2 flex w-full border text-black border-blue-300 rounded mb-3"
            onChange={handleFieldSelect}
            value={selectedField}
          >
            <option value="">Select a field</option>
            {keys.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Add New Field */}
          <div className="pt-3">
            <label className="block text-sm font-medium py-2">Add New Field:</label>
            <input
              type="text"
              placeholder="Create New field"
              className="p-2 w-full border text-black border-blue-300 rounded mb-2"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
            />
            {newField && (
              <button
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                onClick={handleAddNewField}
              >
                Add Field
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
