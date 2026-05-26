"use client";

import { useState, useEffect, useRef } from "react";
import { X, Edit } from "lucide-react";
import CryptoJS from "crypto-js";
import whatsappImage from "../../../assets/wa.jpg";
import placeholderImage from "../../../assets/placeholder.png";
const SECRET_KEY = "48962874218962874213689687";
import Select from "react-select";

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

export default function TempSidebar({
  nodeName,
  setNodeName,
  nodeImage,
  nodeVideo,
  setNodeImage,
  setNodeVideo,
  selectedNode,
  setNodeOption,
  setSelectedElements,
  setTemplateData,
  templateData,
  templateParams,
  setTemplateParams,
  setTemplateId,
  templateId,
  templateName,
  setTemplateName,
  setSelectedHeaderValue,
  selectedHeaderValue,
  bodyValues,
  setBodyValues,
  setWebhookData,
  webhookData,
  setComponents,
}) {
  const [templateData1, setTemplateData1] = useState(null);
  const [decryptedData, setDecryptedData] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [columnData, setColumnData] = useState([]);
  const [parseTemplateData, setParseTemplateData] = useState(null);
  const token = import.meta.env.VITE_JWT_TOKEN;
  const vendorId = import.meta.env.VITE_VENDOR_ID;
  const base_url = import.meta.env.VITE_BASE_URL;
  const base_uri = import.meta.env.VITE_BASE_URI;
  // const vendor_uid = "5e30ff02-d130-4cde-9050-82818e82b067";
  const vendor_uid = localStorage.getItem("v_id");
  const vendor__uid = localStorage.getItem("vendor_uid");

  const fileInputRef = useRef(null);
  const [headerMedia, setHeaderMedia] = useState(null);
  const [headerMediaPreview, setHeaderMediaPreview] = useState(null);
  const [docUrl, setDocUrl] = useState(null);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [tempParams, setTempParams] = useState([]);
  const [jsonPaths, setJsonPaths] = useState([]);
  const [currentEditingParam, setCurrentEditingParam] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isBodyOpen, setIsBodyOpen] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    if (webhookData?.test_data) {
      const data = JSON.parse(webhookData.test_data);
      const format = { data: [data] };
      setJsonData(format);
    }
  }, [webhookData]);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
    fetchTemplateData();
    fetchColumnData();
    initializeBodyValues();
  }, []);

  useEffect(() => {
    if (parseTemplateData) {
      const payload = {
        data: parseTemplateData,
        params: templateParams,
      };
      setTemplateData(payload);
      localStorage.setItem("templateData", JSON.stringify(payload));
    }
    setTempParams(selectedNode.data.templateParams);
  }, [parseTemplateData, templateParams, selectedNode]);

  const initializeBodyValues = () => {
    const initialValues = {};
    // Initialize all possible body fields
    for (let i = 1; i <= 10; i++) {
      initialValues[`field_${i}`] = "";
    }
    setBodyValues(initialValues);
  };

  const fetchTemplateData = () => {
    const payload = {
      vendorUId: vendor_uid,
    };

    fetch(`${base_uri}templatelistflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDecryptedData(data.data);
      })
      .catch((error) => {
        console.error("Error fetching templates:", error);
      });
  };

  const fetchColumnData = () => {
    const payload = {
      vendorId: vendor__uid,
    };

    fetch(`${base_uri}getContactDataMaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setColumnData(data);
      })
      .catch((error) => {
        console.error("Error fetching column data:", error);
      });
  };

  useEffect(() => {
    if (decryptedData.length > 0 && templateId) {
      const foundTemplate = decryptedData.find(
        (t) => t.id === templateId || t._id === templateId
      );

      if (foundTemplate) {
        setSelectedTemplate(foundTemplate);
        setTemplateName(
          foundTemplate.templateName || foundTemplate.template_name
        );

        try {
          const templateData = foundTemplate.data || foundTemplate.__data;
          const parsedData = JSON.parse(templateData);
          setParseTemplateData(parsedData);

          let components = [];
          if (parsedData.template?.components) {
            components = parsedData.template.components;
          } else if (parsedData.components) {
            components = parsedData.components;
          } else if (Array.isArray(parsedData)) {
            components = parsedData;
          }

          setTemplateData1(components);
          const params = extractTemplateParameters(components);
          setTemplateParams(params);
        } catch (err) {
          console.error("Parse error:", err);
        }
      }
    }
  }, [decryptedData, templateId]);

  const extractTemplateParameters = (components) => {
    const parameters = {};

    components.forEach((component) => {
      if (
        component.type === "HEADER" &&
        component.format === "TEXT" &&
        component.text
      ) {
        const matches = component.text.match(/\{\{\s*(\d+)\s*\}\}/g);
        matches?.forEach((match) => {
          const paramNum = match.replace(/\D/g, "");
          parameters[`header_field_${paramNum}`] = "";
        });
      } else if (component.type === "BODY" && component.text) {
        const matches = component.text.match(/\{\{\s*(\d+)\s*\}\}/g);
        matches?.forEach((match) => {
          const paramNum = match.replace(/\D/g, "");
          parameters[`field_${paramNum}`] = "";
        });
      } else if (component.type === "BUTTONS" && component.buttons) {
        component.buttons.forEach((btn, index) => {
          if (btn.text) {
            const matches = btn.text.match(/\{\{\s*(\d+)\s*\}\}/g);
            matches?.forEach((match) => {
              const paramNum = match.replace(/\D/g, "");
              parameters[`button_${index}`] = "";
            });
          }
        });
      }
    });

    return parameters;
  };

  const handleParamChange = (fieldName, newValue) => {
    setTemplateParams((prevParams) => ({
      ...prevParams,
      [fieldName]: newValue,
    }));
  };

  const handleBodyValueChange = (fieldName, value) => {
    setBodyValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    handleParamChange(fieldName, value);
  };

  const openParamSelection = (paramName) => {
    setCurrentEditingParam(paramName);
    setIsOpen(true);
  };

  const handleSelection = (value) => {
    if (currentEditingParam) {
      handleBodyValueChange(currentEditingParam, value);
    }
    setIsOpen(false);
    setCurrentEditingParam(null);
  };

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selectedTemplate = decryptedData.find(
      (t) => t.id === selectedId || t._id === selectedId
    );

    if (!selectedTemplate) return;

    setTemplateId(selectedTemplate.id || selectedTemplate._id);
    setTemplateName(
      selectedTemplate.templateName || selectedTemplate.template_name
    );
    setSelectedTemplate(selectedTemplate);

    try {
      const templateData = selectedTemplate.data || selectedTemplate.__data;
      const parsedData = JSON.parse(templateData);
      setParseTemplateData(parsedData);

      let components = [];
      if (parsedData.template?.components) {
        components = parsedData.template.components;
      } else if (parsedData.components) {
        components = parsedData.components;
      } else if (Array.isArray(parsedData)) {
        components = parsedData;
      }

      setTemplateData1(components);
      const params = extractTemplateParameters(components);
      setTemplateParams(params);
    } catch (err) {
      console.error("Template parsing error:", err);
      setTemplateName("");
      setTemplateParams({});
      setParseTemplateData(null);
    }
  };

  const components =
    parseTemplateData?.template?.components ||
    parseTemplateData?.components ||
    [];

    useEffect(() => {
      setComponents(components)
    }, [components])

    console.log(components)
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getDynamicUrl = (url, example) => {
    if (!url.includes("{{")) return url;
    return url.replace(/{{(\d+)}}/g, (_, idx) => example?.[idx - 1] || "");
  };

  const handleFileChange = async (event, format) => {
    const format_typ =
      format === "IMAGE"
        ? "whatsapp_image"
        : format === "VIDEO"
        ? "whatsapp_video"
        : "whatsapp_document";

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setHeaderMedia(file);

    const fileType = format.toLowerCase();
    const previewUrl = URL.createObjectURL(file);
    setHeaderMediaPreview({
      type: fileType,
      url: previewUrl,
      name: file.name,
    });

    const formData = new FormData();
    formData.append("filepond", file);
    formData.append("vendorId", vendor__uid);
    formData.append("uploadfile", format_typ);

    try {
      const response = await fetch(`${base_uri}uploadTempMedia`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      const url = responseData.url || responseData.data?.url;
      setDocUrl(url);

      setTemplateParams((prevParams) => ({
        ...prevParams,
        [`header_${fileType}`]: url,
      }));
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const formatOption = ({ path, value }) => ({
    value: `{{${path}}}`,
    label: (
      <div className="grid grid-cols-2 gap-2">
        <div className="font-mono truncate">{`{{${path}}}`}</div>
        <div className="text-gray-600 truncate">
          {String(value).length > 30
            ? `${String(value).substring(0, 30)}...`
            : String(value)}
        </div>
      </div>
    ),
  });

  const renderHeaderParameters = () => {
    return Object.entries(templateParams)
      .filter(([fieldName]) => fieldName.startsWith("header_field_"))
      .map(([fieldName, paramValue]) => {
        const headerSection = components.find((item) => item.type === "HEADER");
        const paramNum = fieldName.replace("header_field_", "");
        let label = `Header value {{${paramNum}}}`;

        if (headerSection?.example?.header_text?.[0]?.[paramNum - 1]) {
          label += ` (${headerSection.example.header_text[0][paramNum - 1]})`;
        }

        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedHeaderValue || ""}
                readOnly
                disabled
                className="block w-full border border-gray-300 rounded-md p-2 mt-2 bg-gray-100"
              />

              <button
                onClick={() => setIsBodyOpen(true)}
                className="mt-2 bold text-white hover:bg-blue-600 px-4 py-2 rounded-md bg-blue-500"
              >
                Select
              </button>
            </div>
          </div>
        );
      });
  };

  const renderBodyParameters = () => {
    return Object.entries(templateParams)
      .filter(([fieldName]) => fieldName.startsWith("field_"))
      .map(([fieldName, paramValue]) => {
        const bodySection = components.find((item) => item.type === "BODY");
        const paramNum = fieldName.replace("field_", "");
        let label = `Body value {{${paramNum}}}`;

        if (bodySection?.example?.body_text?.[0]?.[paramNum - 1]) {
          label += ` (${bodySection.example.body_text[0][paramNum - 1]})`;
        }

        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="block w-full border border-gray-300 rounded-md p-2 mt-2"
                value={bodyValues[fieldName] || ""}
                readOnly
                disabled
              />
              <button
                onClick={() => openParamSelection(fieldName)}
                className="mt-2 bold text-white hover:bg-blue-600 px-4 py-2 rounded-md bg-blue-500"
              >
                Select
              </button>
            </div>
          </div>
        );
      });
  };

  const renderButtonParameters = () => {
    return Object.entries(templateParams)
      .filter(([fieldName]) => fieldName.startsWith("button_"))
      .map(([fieldName, paramValue]) => {
        const buttonIndex = fieldName.replace("button_", "");
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Button {buttonIndex} text
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md p-2"
              value={paramValue}
              onChange={(e) => handleParamChange(fieldName, e.target.value)}
            >
              <option value="">Select an option</option>
              {jsonPaths.map(({ path, value }, index) => {
                const fullText = `{{${path}}} → ${String(value)}`;
                return (
                  <option key={index} value={`{{${path}}}`} title={fullText}>
                    {fullText.length > 40
                      ? `${fullText.slice(0, 50)}...`
                      : fullText}
                  </option>
                );
              })}
            </select>
          </div>
        );
      });
  };

  const [template, setTemplate] = useState({});

  const handleInsert = (path, fieldName) => {
    const newValue = `{{${path}}}`;

    // Update local state
    setBodyValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    // Update parent state
    setBodyValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    // Also update templateParams
    handleParamChange(fieldName, newValue);
    setIsOpen(false);
  };

  console.log("Body Values:", bodyValues);
  console.log("Header Values", selectedHeaderValue);

  return (
    <>
      {selectedNode && (
        <aside
          className={`border-r p-5 text-sm w-[30%] h-screen shadow-md transition-all duration-300 flex flex-col border-l-slate-400 ${
            isDarkMode
              ? "bg-white border-gray-700 text-gray-900"
              : "bg-white border-gray-700 text-gray-900"
          }`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${
                isDarkMode ? "text-black" : "text-blue-900"
              }`}
            >
              <Edit className="w-5 h-5" />
              Template Node
            </h3>

            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <label className="block text-sm font-medium mb-1">
            Select a Template:
          </label>
          {decryptedData && decryptedData.length > 0 && (
            <select
              className="block w-full border border-gray-300 rounded-md p-2 mb-4"
              onChange={handleSelectChange}
              value={templateId || ""}
            >
              <option value="" disabled>
                Select a template
              </option>
              {decryptedData
                .filter(
                  (template) => template.templateName || template.template_name
                )
                .map((template) => (
                  <option
                    key={template.id || template._id}
                    value={template.id || template._id}
                  >
                    {template.templateName || template.template_name}
                  </option>
                ))}
            </select>
          )}

          {selectedTemplate && templateData1 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Template Parameters:</h4>

              {renderHeaderParameters()}
              {renderBodyParameters()}
              {renderButtonParameters()}

              {components
                .filter(
                  (comp) => comp.type === "HEADER" && comp.format !== "TEXT"
                )
                .map((comp, index) => {
                  const format = comp.format;
                  return (
                    <div key={index} className="mb-4 mt-4">
                      <label className="block font-semibold mb-2">
                        Upload {format}
                      </label>
                      <div className="flex flex-col">
                        <input
                          type="file"
                          accept={
                            format === "IMAGE"
                              ? "image/*"
                              : format === "VIDEO"
                              ? "video/*"
                              : format === "DOCUMENT"
                              ? ".pdf,.doc,.docx,.xls,.xlsx"
                              : undefined
                          }
                          ref={fileInputRef}
                          onChange={(event) => handleFileChange(event, format)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-2 flex items-center gap-2 hover:bg-blue-700 transition"
                          onClick={triggerFileInput}
                        >
                          Select File
                        </button>
                        {headerMedia && (
                          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mt-2 text-sm">
                            Selected file: {headerMedia.name} (
                            {Math.round(headerMedia.size / 1024)} KB)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Whatsapp Preview section */}
              <div
                className="p-5 rounded m-5 overflow-y-auto max-h-[60vh]"
                style={{
                  backgroundImage: `url(${whatsappImage})`,
                  backgroundColor: "#e5ddd5",
                  backgroundRepeat: "repeat",
                  backgroundSize: "contain",
                  backgroundBlendMode: "overlay",
                }}
               >
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
                            {comp.buttons.map((btn, i) => {
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
              </div>
            </div>
          )}
        </aside>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] max-w-4xl p-6 animate-fade-in max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Select Parameter Value
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold transition"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">
                      Path
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-gray-800">
                  {findJsonPaths(jsonData).map(({ path, value }, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 font-medium text-gray-700">
                        {path}
                      </td>
                      <td
                        className="px-4 py-2 break-words cursor-pointer hover:text-blue-600 transition"
                        onClick={() => handleInsert(path, currentEditingParam)} // Fixed here
                      >
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isBodyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] max-w-4xl p-6 animate-fade-in max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Select Body Value
              </h2>
              <button
                onClick={() => setIsBodyOpen(false)}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold transition"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Table Section */}
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">
                      Path
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-gray-800">
                  {findJsonPaths(jsonData).map(({ path, value }, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 font-medium text-gray-700">
                        {path}
                      </td>
                      <td
                        className="px-4 py-2 break-words cursor-pointer hover:text-blue-600 transition"
                        onClick={() => {
                          const newValue = `{{${path}}}`;
                          setSelectedHeaderValue(newValue); // Local state
                          setSelectedHeaderValue(newValue); // Parent state (same function name)
                          setIsBodyOpen(false);
                        }}
                      >
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>
        {`
          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
}

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { X, Edit } from "lucide-react";
// import CryptoJS from "crypto-js";
// import whatsappImage from "../../../assets/wa.jpg";
// import placeholderImage from "../../../assets/placeholder.png";
// const SECRET_KEY = "48962874218962874213689687";

// export default function TextSidebar({
//   nodeName,
//   setNodeName,
//   nodeImage,
//   nodeVideo,
//   setNodeImage,
//   setNodeVideo,
//   nodeLink,
//   setNodeLink,
//   selectedNode,
//   setNodeOption,
//   setSelectedElements,
//   setTemplateData,
//   templateData,
//   templateParams,
//   setTemplateParams,
//   setTemplateId,
//   templateId,
//   templateName,
//   setTemplateName,
// }) {
//   const [templateData1, setTemplateData1] = useState(null);
//   const [decryptedData, setDecryptedData] = useState([]);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [columnData, setColumnData] = useState([]);
//   const [parseTemplateData, setParseTemplateData] = useState();
//   const token = import.meta.env.VITE_JWT_TOKEN;
//   const vendorId = import.meta.env.VITE_VENDOR_ID;
//   const base_url = import.meta.env.VITE_BASE_URL;
//   const base_uri = import.meta.env.VITE_BASE_URI;
//   const vendor_uid = import.meta.env.VITE_VENDOR_UID;
//   // etc.

//   useEffect(() => {
//     if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//       setIsDarkMode(true);
//     }
//     fetchTemplateData();
//     fetchColumnData();
//   }, []);

//   useEffect(() => {
//     if (parseTemplateData && Array.isArray(templateParams)) {
//       const payload = {
//         data: parseTemplateData,
//         params: templateParams,
//       };
//       setTemplateData(payload);
//       localStorage.setItem("templateData", JSON.stringify(payload));
//     }
//   }, [parseTemplateData, templateParams]);

//   // const fetchTemplateData = () => {
//   //   const token = import.meta.env.VITE_JWT_TOKEN;
//   //   fetch(
//   //     `${base_url}template/template?page=1&limit=1000&vendorId=${vendorId}`,
//   //     {
//   //       method: "GET",
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //         "Content-Type": "application/json",
//   //       },
//   //     }
//   //   )
//   //     .then((res) => res.text())
//   //     .then((encryptedResponse) => {
//   //       const bytes = CryptoJS.AES.decrypt(encryptedResponse, SECRET_KEY);
//   //       const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
//   //       const parsedData = JSON.parse(decryptedText);
//   //       setDecryptedData(parsedData.data);
//   //     })
//   //     .catch(console.error);
//   // };

//   const fetchTemplateData = () => {
//     const token = import.meta.env.VITE_JWT_TOKEN;
//     const payload = {
//       vendorId: vendor_uid,
//     };

//     fetch(`${base_uri}templatelist`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json(); // Convert response to JSON
//       })
//       .then((data) => {
//         setDecryptedData(data.data); // Set parsed data
//         console.log(data.data, "Parsed response from templatelist------------");
//       })
//       .catch((error) => {
//         console.error("Error fetching contact data maps:", error);
//       });
//   };

//   const fetchColumnData = () => {
//     const token = import.meta.env.VITE_JWT_TOKEN;
//     const payload = {
//       vendorId: vendor_uid,
//     };

//     fetch(`${base_uri}getContactDataMaps`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json(); // Convert response to JSON
//       })
//       .then((data) => {
//         setColumnData(data); // Set parsed data
//         console.log(data, "Parsed response from getContactDataMaps");
//       })
//       .catch((error) => {
//         console.error("Error fetching contact data maps:", error);
//       });
//   };

//   useEffect(() => {
//     console.log(decryptedData, "Decrypted Text Data inside TextSidebar");
//     console.log(templateId, "Template ID inside TextSidebar");
//     if (decryptedData.length > 0 && templateId) {
//       const selectedTemplate = decryptedData.find((t) => t.id === templateId);
//       if (selectedTemplate) {
//         setTemplateName(selectedTemplate.templateName);

//         try {
//           const parsedData = JSON.parse(selectedTemplate.data);
//           setParseTemplateData(parsedData);

//           let components = [];
//           if (parsedData.template?.components) {
//             components = parsedData.template.components;
//           } else if (parsedData.components) {
//             components = parsedData.components;
//           } else if (Array.isArray(parsedData)) {
//             components = parsedData;
//           }

//           setTemplateData1(components);

//           const params = extractTemplateParameters(components);
//           const formattedParams = params.map((param) => ({
//             value: param,
//             name: "",
//             isStatic: 1, // Default to static
//           }));
//           setTemplateParams(formattedParams);
//         } catch (err) {
//           console.error("Parse error:", err);
//         }
//       }
//     }
//   }, [decryptedData, templateId]);
//   console.log(templateData1, "Template Data 1");

//   const extractTemplateParameters = (components) => {
//     const parameters = new Set();
//     components.forEach((component) => {
//       const allText = [
//         component.text,
//         ...(component.buttons || []).map((btn) => btn.text),
//       ];
//       allText.forEach((text) => {
//         if (text) {
//           const matches = text.match(/\{\{\s*(\d+)\s*\}\}/g);
//           matches?.forEach((match) => {
//             parameters.add(match.replace(/\D/g, ""));
//           });
//         }
//       });
//     });
//     return Array.from(parameters).sort((a, b) => a - b);
//   };

//   const handleParamChange = (paramValue, newName, isStatic) => {
//     setTemplateParams((prevParams) =>
//       prevParams.map((item) =>
//         item.value === paramValue ? { ...item, name: newName, isStatic } : item
//       )
//     );
//   };

//   const handleSelectChange = (e) => {
//     const selectedId = e.target.value;

//     // Use template_id to match
//     const selectedTemplate = decryptedData.find(
//       (t) => t.template_id === selectedId
//     );

//     if (!selectedTemplate) return;

//     setTemplateId(selectedTemplate.template_id);
//     setTemplateName(selectedTemplate.template_name);

//     try {
//       // Use __data as the correct JSON string field
//       const parsedData = JSON.parse(selectedTemplate.__data);
//       setParseTemplateData(parsedData);

//       let components = [];

//       if (parsedData.template?.components) {
//         components = parsedData.template.components;
//       } else if (parsedData.components) {
//         components = parsedData.components;
//       } else if (Array.isArray(parsedData)) {
//         components = parsedData;
//       }

//       setTemplateData1(components);

//       const params = extractTemplateParameters(components);
//       const formattedParams = params.map((param) => ({
//         value: param,
//         name: "",
//       }));
//       setTemplateParams(formattedParams);
//     } catch (err) {
//       console.error("Template parsing error:", err);
//       setTemplateName("");
//       setTemplateParams([]);
//       setParseTemplateData(null);
//     }
//   };

//   // ---------------- Template Preview -----------------------

//   // const templatePreviewData = parsedData

//   const components =
//     parseTemplateData?.template?.components ||
//     parseTemplateData?.components ||
//     [];

//   const getBodyContent = (text, example) => {
//     if (!example?.body_text?.[0]) return text;
//     let updated = text;
//     example.body_text[0].forEach((val, i) => {
//       updated = updated.replace(`{{${i + 1}}}`, val);
//     });
//     return updated;
//   };

//   const getDynamicUrl = (url, example) => {
//     if (!url.includes("{{")) return url;
//     return url.replace(/{{(\d+)}}/g, (_, idx) => example?.[idx - 1] || "");
//   };

//   // In your useEffect that sets templateData
//   useEffect(() => {
//     if (parseTemplateData) {
//       const formattedParams = Object.entries(templateParams).map(
//         ([key, value]) => ({
//           value: key,
//           name: value,
//           isStatic: 1,
//         })
//       );

//       const payload = {
//         data: parseTemplateData,
//         params: templateParams,
//       };

//       localStorage.setItem("templateData", JSON.stringify(payload));
//     }
//   }, [parseTemplateData, templateParams]);

//   console.log(components, "Bla Bla Bla");
//   console.log(JSON.stringify(templateParams), "template Params");
//   // {getBodyContent(comp.text, comp.example)}

//   const fileInputRef = useRef(null);
//   const [headerMedia, setHeaderMedia] = useState(null);
//   const [headerMediaPreview, setHeaderMediaPreview] = useState(null);
//   const [docUrl, setDocUrl] = useState(null);

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (event, format) => {
//     const format_typ =
//       format === "IMAGE"
//         ? "whatsapp_image"
//         : format === "VIDEO"
//         ? "whatsapp_video"
//         : "whatsapp_document";

//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const file = files[0];
//     setHeaderMedia(file);

//     const fileType =
//       templateData?.components?.header?.type?.toLowerCase?.() ||
//       format.toLowerCase();
//     const previewUrl = URL.createObjectURL(file);
//     setHeaderMediaPreview({
//       type: fileType,
//       url: previewUrl,
//       name: file.name,
//     });

//     const formData = new FormData();

//     for (let i = 0; i < files.length; i++) {
//       formData.append("filepond", files[i]);
//     }

//     formData.append("vendorId", vendor_uid);
//     formData.append("uploadfile", format_typ);

//     try {
//       const response = await fetch(`${base_uri}uploadTempMedia`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.status) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const responseData = await response.json();
//       console.log("Uploaded Filed data", responseData);
//       const url = response.url;
//       setDocUrl(url);
//     } catch (error) {
//       console.error("Upload error:", error);
//     }
//   };
//   console.log(docUrl, "Doc URL");

//   return (
//     <>
//       {selectedNode && (
//         <aside
//           className={`border-r p-5 text-sm w-[30%] h-screen shadow-md transition-all duration-300 flex flex-col ${
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
//               <Edit className="w-5 h-5" />
//               Template Node
//             </h3>

//             <button
//               className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
//               onClick={() => setSelectedElements([])}
//             >
//               <X className="w-3 h-3" />
//             </button>
//           </div>

//           <label className="block text-sm font-medium mb-1">
//             Select a Template:
//           </label>
//           {decryptedData && decryptedData.length > 0 && (
//             <select
//               className="block w-full border border-gray-300 rounded-md p-2 mb-4"
//               onChange={handleSelectChange}
//               value={templateId || ""}
//             >
//               <option value="" disabled>
//                 Select a template
//               </option>

//               {decryptedData
//                 .filter((template) => template.template_name)
//                 .map((template) => (
//                   <option key={template._uid} value={template.template_id}>
//                     {template.template_name}
//                   </option>
//                 ))}
//             </select>
//           )}

//           {/* Display template parameters */}
//           {templateData1 && (
//             <div className="mt-4">
//               <h4 className="font-medium mb-2">Template Parameters:</h4>
//               {templateParams.length > 0 &&
//                 templateParams
//                   .sort((a, b) => a.value - b.value)
//                   .map((param) => {
//                     // Extract body params from BODY section
//                     const bodySection = components.find(
//                       (item) => item.type === "BODY"
//                     );
//                     const paramLabel =
//                       bodySection?.example?.body_text?.[0]?.[param.value - 1] ||
//                       "";

//                     return (
//                       <div key={param.value} className="mb-3">
//                         <label className="block text-sm font-medium mb-1">
//                           Value for {`{{${param.value}}}`}{" "}
//                           {paramLabel && (
//                             <span className="text-gray-600">{`(${paramLabel}):`}</span>
//                           )}
//                         </label>

//                         {/* Dropdown */}
//                         <select
//                           className="block w-full border border-gray-300 rounded-md p-2 mb-2"
//                           value={
//                             param.name &&
//                             Object.keys(columnData).includes(param.name)
//                               ? param.name
//                               : param.isStatic === 0
//                               ? "custom"
//                               : ""
//                           }
//                           onChange={(e) => {
//                             const selected = e.target.value;
//                             if (selected === "custom") {
//                               handleParamChange(param.value, "", 0); // custom input mode
//                             } else {
//                               handleParamChange(param.value, selected, 1); // static dropdown selection
//                             }
//                           }}
//                         >
//                           <option value="">Select an option</option>
//                           {Object.entries(columnData).map(([key, label]) => (
//                             <option key={key} value={key}>
//                               {label}
//                             </option>
//                           ))}
//                           <option value="custom">Custom Input</option>
//                         </select>

//                         {/* Custom Input */}
//                         {param.isStatic === 0 && (
//                           <input
//                             type="text"
//                             className="block w-full border border-gray-300 rounded-md p-2"
//                             placeholder="Enter custom value"
//                             value={param.name}
//                             onChange={(e) =>
//                               handleParamChange(param.value, e.target.value, 0)
//                             }
//                           />
//                         )}

//                         {components.map((comp, index) => {
//                           if (comp.type !== "HEADER") return null;

//                           const format = comp.format;
//                           const handle =
//                             comp.example?.header_handle?.[0] || null;

//                           return (
//                             <div key={index} className="mb-4 mt-4">
//                               <label className="block font-semibold mb-2">
//                                 {format !== "TEXT" &&
//                                  `Upload ${format}`
//                                 }
//                               </label>

//                               <div className="flex flex-col">
//                                 <input
//                                   type="file"
//                                   accept={
//                                     format === "IMAGE"
//                                       ? "image/*"
//                                       : format === "VIDEO"
//                                       ? "video/*"
//                                       : format === "DOCUMENT"
//                                       ? ".pdf,.doc,.docx,.xls,.xlsx"
//                                       : undefined
//                                   }
//                                   ref={fileInputRef}
//                                   onChange={(event) =>
//                                     handleFileChange(event, format)
//                                   }
//                                   className="hidden"
//                                 />
//                                 {format !== "TEXT" && (
//                                 <button
//                                   type="button"
//                                   className="bg-blue-600 text-white px-4 py-2 rounded-md mb-2 flex items-center gap-2 hover:bg-blue-700 transition"
//                                   onClick={triggerFileInput}
//                                 >
//                                   <i className="fas fa-upload"></i>
//                                   Select File
//                                 </button>
//                                 )}

//                                 {headerMedia && (
//                                   <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mt-2 text-sm">
//                                     Selected file: {headerMedia.name} (
//                                     {Math.round(headerMedia.size / 1024)} KB)
//                                   </div>
//                                 )}

//                                 {/* {headerMediaPreview?.type === "image" && (
//                                   <div className="mt-2">
//                                     <img
//                                       src={headerMediaPreview.url}
//                                       alt="Preview"
//                                       className="max-w-full max-h-[200px] rounded"
//                                     />
//                                   </div>
//                                 )}

//                                 {headerMediaPreview?.type === "video" && (
//                                   <div className="mt-2">
//                                     <video
//                                       controls
//                                       className="max-w-full max-h-[200px] rounded"
//                                     >
//                                       <source
//                                         src={headerMediaPreview.url}
//                                         type="video/mp4"
//                                       />
//                                       Your browser does not support the video
//                                       tag.
//                                     </video>
//                                   </div>
//                                 )} */}

//                                 {headerMediaPreview?.type === "document" && (
//                                   <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mt-2 text-sm">
//                                     Document ready: {headerMediaPreview.name}
//                                   </div>
//                                 )}
//                               </div>

//                               {handle && !headerMedia && (
//                                 <div className="mt-2 text-sm text-muted">
//                                   Existing file:{" "}
//                                   <a
//                                     href={handle}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                   >
//                                     View Current File
//                                   </a>
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     );
//                   })}

//               <div
//                 className="p-5 rounded m-10 mx-20"
//                 style={{
//                   backgroundImage: `url(${whatsappImage})`,
//                   backgroundColor: "#e5ddd5",
//                   backgroundRepeat: "repeat",
//                   backgroundSize: "contain", // or 'auto' if your image is small
//                   backgroundBlendMode: "overlay", // subtle blend with background color
//                 }}
//               >
//                 <div className="bg-[#f4f4f4] p-4 rounded-lg max-w-[90%] mx-2 my-2 relative shadow border border-[#e5ddd5]">
//                   {components.map((comp, index) => {
//                     switch (comp.type) {
//                       case "HEADER":
//                         const format = comp.format;
//                         const handle = comp.example?.header_handle?.[0] || null;

//                         const getMediaUrlFromHandle = (handle) => {
//                           if (!handle) return null;
//                           const parts = handle.split(":");
//                           return `https://your-media-domain.com/${parts[2]}`;
//                         };

//                         const mediaUrl = getMediaUrlFromHandle(handle);

//                         const isValidImage = mediaUrl && mediaUrl !== "";

//                         switch (format) {
//                           case "TEXT":
//                             return (
//                               <div key={index} className="mb-2">
//                                 <h6 className="font-bold text-[#3b4a54] text-sm">
//                                   {comp.text}
//                                 </h6>
//                               </div>
//                             );

//                           case "IMAGE":
//                             return (
//                               <div
//                                 key={index}
//                                 className="mb-2 rounded-lg overflow-hidden"
//                               >
//                                 <img
//                                   src={placeholderImage}
//                                   alt="Header"
//                                   className="max-w-full h-auto"
//                                 />
//                               </div>
//                             );

//                           case "VIDEO":
//                             return (
//                               <div
//                                 key={index}
//                                 className="mb-2 rounded-lg overflow-hidden"
//                               >
//                                 <video controls className="max-w-full">
//                                   <source src={mediaUrl} type="video/mp4" />
//                                   Your browser does not support the video tag.
//                                 </video>
//                               </div>
//                             );

//                           case "DOCUMENT":
//                             return (
//                               <a
//                                 key={index}
//                                 href={mediaUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="mb-2 block font-semibold text-sm text-[#075e54]"
//                               >
//                                 📄 {comp.text || "Download File"}
//                               </a>
//                             );

//                           default:
//                             return null;
//                         }

//                       case "BODY":
//                         return (
//                           <div key={index}>
//                             <p className="text-[#3b4a54] text-sm whitespace-pre-line leading-snug">
//                               {comp.text}
//                             </p>
//                           </div>
//                         );

//                       case "BUTTONS":
//                         return (
//                           <div key={index} className="mt-3 w-full">
//                             {comp.buttons.map((btn, i) => {
//                               const isLink =
//                                 btn.type === "URL" ||
//                                 btn.type === "PHONE_NUMBER" ||
//                                 btn.type === "COPY_CODE";

//                               if (isLink) {
//                                 let href = "#";
//                                 if (btn.type === "URL")
//                                   href = getDynamicUrl(btn.url, btn.example);
//                                 else if (btn.type === "PHONE_NUMBER")
//                                   href = `tel:${btn.phone_number}`;

//                                 return (
//                                   <a
//                                     key={i}
//                                     target=""
//                                     rel="noopener noreferrer"
//                                     className="block text-center bg-[#f4f4f4] py-2 px-3 text-sm font-medium text-sky-600 transition-colors"
//                                   >
//                                     {btn.text}
//                                   </a>
//                                 );
//                               }

//                               return (
//                                 <button
//                                   key={i}
//                                   className="block text-center w-full py-1 bg-[#f4f4f4] px-3 text-sm font-medium text-sky-600 transition-colors"
//                                 >
//                                   {btn.text}
//                                 </button>
//                               );
//                             })}
//                           </div>
//                         );

//                       default:
//                         return null;
//                     }
//                   })}

//                   {/* Message timestamp */}
//                   <div className="text-right text-[0.6875rem] text-[#667781] mt-2">
//                     {new Date().toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </aside>
//       )}
//     </>
//   );
// }

// ____ Sample JSON Data ____

// const jsonData1 = {
//   data: [
//     {
//       id: 981820079255243537,
//       name: "#981820079255243537",
//       note: null,
//       email: "example@email.com",
//       phone: null,
//       token: "123123123",
//       source: null,
//       gateway: null,
//       user_id: null,
//       currency: "INR",
//       customer: {
//         id: 603851970716743426,
//         note: null,
//         email: null,
//         phone: null,
//         state: "disabled",
//         currency: "INR",
//         last_name: "Smith",
//         created_at: null,
//         first_name: "John",
//         tax_exempt: false,
//         updated_at: null,
//         tax_exemptions: [],
//         verified_email: true,
//         default_address: {
//           id: null,
//           zip: "K2H7A8",
//           city: "Ottawa",
//           name: "John Smith",
//           phone: "123-123-1234",
//           company: null,
//           country: "Canada",
//           default: true,
//           address1: "123 Elm St.",
//           address2: null,
//           province: "Ontario",
//           last_name: "Smith",
//           first_name: "John",
//           customer_id: 603851970716743426,
//           country_code: "CA",
//           country_name: "Canada",
//           province_code: "ON",
//         },
//         admin_graphql_api_id: "gid://shopify/Customer/603851970716743426",
//         multipass_identifier: null,
//       },
//       closed_at: null,
//       device_id: null,
//       tax_lines: [],
//       total_tax: "0.00",
//       cart_token: "eeafa272cebfd4b22385bc4b645e762c",
//       created_at: "2025-07-15T13:57:19+05:30",
//       line_items: [
//         {
//           key: "2ad217a7386b395ea65dfef10f69a9e9",
//           sku: null,
//           rank: null,
//           grams: 500,
//           price: "499.00",
//           title: "Dhoni Lightning Speed T-shirts",
//           vendor: "Mayilo",
//           taxable: false,
//           user_id: null,
//           quantity: 1,
//           gift_card: false,
//           tax_lines: [],
//           line_price: "499.00",
//           product_id: 9361634164966,
//           properties: null,
//           variant_id: 46446030782694,
//           variant_price: "499.00",
//           variant_title: null,
//           compare_at_price: null,
//           applied_discounts: [],
//           presentment_title: "Dhoni Lightning Speed T-shirts",
//           requires_shipping: true,
//           origin_location_id: 3767089365222,
//           fulfillment_service: "manual",
//           discount_allocations: [],
//           unit_price_measurement: {
//             measured_type: null,
//             quantity_unit: null,
//             quantity_value: null,
//             reference_unit: null,
//             reference_value: null,
//           },
//           destination_location_id: 3767063707878,
//           presentment_variant_title: null,
//         },
//         {
//           key: "8ed300681b7f1a06f76fea2e8829fc17",
//           sku: null,
//           rank: null,
//           grams: 500,
//           price: "489.00",
//           title: "Love Proposal T-shirt",
//           vendor: "Mayilo",
//           taxable: true,
//           user_id: null,
//           quantity: 1,
//           gift_card: false,
//           tax_lines: [],
//           line_price: "489.00",
//           product_id: 9361636851942,
//           properties: null,
//           variant_id: 46446044938470,
//           variant_price: "489.00",
//           variant_title: null,
//           compare_at_price: null,
//           applied_discounts: [],
//           presentment_title: "Love Proposal T-shirt",
//           requires_shipping: true,
//           origin_location_id: 3767089365222,
//           fulfillment_service: "manual",
//           discount_allocations: [],
//           unit_price_measurement: {
//             measured_type: null,
//             quantity_unit: null,
//             quantity_value: null,
//             reference_unit: null,
//             reference_value: null,
//           },
//           destination_location_id: 3767063707878,
//           presentment_variant_title: null,
//         },
//       ],
//       source_url: null,
//       updated_at: "2025-07-15T13:57:19+05:30",
//       location_id: null,
//       source_name: "web",
//       total_price: "988.00",
//       completed_at: null,
//       landing_site: null,
//       total_duties: null,
//       total_weight: 1000,
//       discount_codes: [],
//       referring_site: null,
//       shipping_lines: [],
//       subtotal_price: "988.00",
//       taxes_included: false,
//       billing_address: {
//         zip: "K2P0B0",
//         city: "Billtown",
//         name: "Bob Biller",
//         phone: "555-555-BILL",
//         company: "My Company",
//         country: "United States",
//         address1: "123 Billing Street",
//         address2: null,
//         latitude: null,
//         province: "Kentucky",
//         last_name: "Biller",
//         longitude: null,
//         first_name: "Bob",
//         country_code: "US",
//         province_code: "KY",
//       },
//       customer_locale: null,
//       note_attributes: [],
//       total_discounts: "0.00",
//       shipping_address: {
//         zip: "K2P0S0",
//         city: "Shippington",
//         name: "Steve Shipper",
//         phone: "555-555-SHIP",
//         company: "Shipping Company",
//         country: "United States",
//         address1: "123 Shipping Street",
//         address2: null,
//         latitude: null,
//         province: "Kentucky",
//         last_name: "Shipper",
//         longitude: null,
//         first_name: "Steve",
//         country_code: "US",
//         province_code: "KY",
//       },
//       reservation_token: null,
//       source_identifier: null,
//       sms_marketing_phone: null,
//       presentment_currency: "INR",
//       abandoned_checkout_url:
//         "https://checkout.shopify.com/75876204774/checkouts/123123123/recover?key=example-secret-token",
//       total_line_items_price: "988.00",
//       buyer_accepts_marketing: false,
//       buyer_accepts_sms_marketing: false,
//     },
//   ],
// };
