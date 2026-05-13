"use client";

import { useState, useEffect, useCallback } from "react";

import { X, Edit } from "lucide-react";
import { useReactFlow } from "reactflow";
import Data from "../../../data/data";
import axios from "axios";
import ResponseDisplay from "./method/responseDisplay";
import * as Yup from "yup";
import { Spin, Modal } from "antd";

export default function ApiRequestSidebar({
  selectedNode,
  setSelectedElements,
  nodeId,
  isNewNode,
  nodeName,
  setNodeName,
  reactFlowInstance,
  edges,
  nodes,
  flowKey
}) {
  const { getNode, setNodes } = useReactFlow();

  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const keys = Data.method.map((item) => item.name);
  const [method, setMethod] = useState(keys[0] || "")
  const [response, setResponse] = useState([]);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: "", url: "" });
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    url: Yup.string().required("Url is required"),
  });

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);


  // Sync local state with selected node
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }

    if (!isNewNode && nodeId) {
      getapirequest();
    } else {
      setFormData({ name: "", url: "" });
      setHeaders([{ key: "Content-Type", value: "multipart/form-data" }]);
      setBody([{ key: "", value: "" }]);
      setVariables([{ key: "", value: "" }]);
      setResponse([]);
    }
  }, [nodeId, isNewNode]);

  const [isDarkMode, setIsDarkMode] = useState(false);


  useEffect(() => {
    if (!selectedNode) return;

    const rawLabel = selectedNode.data?.label || "";

    // remove default node names
    const defaultNames = [
      "apirequestnode",
      "api node",
      "api",
      "apicallnode",
      "apicall",
    ];

    const isDefault = defaultNames.includes(rawLabel.trim().toLowerCase());

    setFormData({
      name: isDefault ? "" : rawLabel,
      url: selectedNode.data?.apicall_url || "",
    });
    setMethod(selectedNode.data?.apicall_method || "POST");

    // Restore saved headers
    if (selectedNode.data?.headerKey) {
      setHeaders(
        selectedNode.data.headerKey.map((k, i) => ({
          key: k,
          value: selectedNode.data.headerValue[i],
        }))
      );
    }

    // Restore body
    if (selectedNode.data?.bodyKey) {
      setBody(
        selectedNode.data.bodyKey.map((k, i) => ({
          key: k,
          value: selectedNode.data.bodyValue[i],
        }))
      );
    }

    // Restore variables
    if (selectedNode.data?.variableName) {
      setVariables(
        selectedNode.data.variableName.map((k, i) => ({
          key: k,
          value: selectedNode.data.variableValue[i],
        }))
      );
    }

    // Restore API response preview
    setResponse(selectedNode.data?.apicall_response || []);
  }, [selectedNode]);


  useEffect(() => {
    // When response updates, just trigger variables re-render
    setVariables((prev) => [...prev]);
  }, [response]);

  // Submit form
  const submitApiBot = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      await schema.validate(formData, { abortEarly: false });
      const headerKey = headers.map((h) => h.key);
      const headerValue = headers.map((h) => h.value);
      const bodyKey = body.map((h) => h.key);
      const bodyValue = body.map((h) => h.value);
      const variableName = variables.map((h) => h.key);
      const variableValue = variables.map((h) => h.value);
      // Build payload
      setLoading(true);
      const payload = {
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        message_type: "apiCall",
        reply_trigger: "Thank You",
        trigger_type: "apiCall",
        validate_bot_reply: "0",
        name: formData.name,
        apicall_method: method,
        apicall_url: formData.url,
        node_id: nodeId,
        headerKey,
        headerValue,
        bodyKey,
        bodyValue,
        variableName,
        variableValue,
        apicall_response: response
      };

      // Send API request with Axios
      const response1 = await axios.post(
        `https://dev.salegrowybox.com/api/storeBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response1.data;

      if (data.status === "success") {

        setNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId
              ? {
                ...n,
                style: {
                  ...n.style,
                  border: "none",
                  boxShadow: "none",
                },
                data: {
                  ...n.data,
                  isAdded: false,
                },
              }
              : n
          )
        );

        setTimeout(() => {
          onSave("add");
        }, 100);
      } else {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.errors?.name || data.message || "Something went wrong",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        // Handle server errors (non-2xx)

        Modal.error({
          title: "Error",
          content: err.response.data?.message ||
            err.response.data?.errors?.name ||
            "Failed to save data",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      } else if (err.name === "ValidationError") {
        // Handle Yup validation errors
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        // Handle network or unknown errors
        Modal.error({
          title: "Error",
          content: "Something went wrong: " + err.message,
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    }
  };


  // Handle input change and live update node
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNodeName(e.target.value);
  };

  // Url live updation
  const handleUrl = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, url: value }));
    setErrors((prev) => ({ ...prev, url: "" }));

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, apicall_url: value } }
            : n
        )
      );
    }
  };


  const handleFieldSelect = (e) => {
    setMethod(e.target.value);
  };

  // Add Headers
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "multipart/form-data" },
  ]);

  const handleHeaderInputChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  // Add Body
  const [body, setBody] = useState([
    { key: "", value: "" },
  ]);


  const handleBodyInputChange = (index, field, value) => {
    const newBody = [...body];
    newBody[index][field] = value;
    setBody(newBody);

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === selectedNode.id
            ? {
              ...n,
              data: {
                ...n.data,
                bodyKey: newBody.map((b) => b.key),
                bodyValue: newBody.map((b) => b.value),
              },
            }
            : n
        )
      );
    }
  };


  const addBody = () => {
    setBody([...body, { key: "", value: "" }]);
  };

  // Add Variables
  const [variables, setVariables] = useState([
    { key: "", value: "" },
  ]);

  const handleVariableInputChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === selectedNode.id
            ? {
              ...n,
              data: {
                ...n.data,
                variableName: newVariables.map((v) => v.key),
                variableValue: newVariables.map((v) => v.value),
              },
            }
            : n
        )
      );
    }
  };


  const addVariable = () => {
    setVariables([...variables, { key: "", value: "" }]);
  };

  const handleSubmit = async () => {
    console.log(method);

    try {
      setError(null);

      const headerObj = headers.reduce((acc, h) => {
        if (h.key) acc[h.key] = h.value;
        return acc;
      }, {});

      const formData1 = new FormData();
      body.forEach(f => {
        if (f.key) formData1.append(f.key, f.value);
      });

      let res;
      const url = formData.url;
      if (method === "GET") {
        res = await axios.get(url, { headers: headerObj });
      } else {
        res = await axios({
          method,
          url,
          headers: headerObj,
          data: formData1,
        });
      }
      const flattened = flattenObject(res.data);
      setResponse(flattened);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setResponse([]);
      console.log(err.message);
    }
  };

  function flattenObject(obj, parentKey = "") {
    const rows = [];

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        rows.push(...flattenObject(item, `${parentKey}[${index}]`));
      });
    } else if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (value && typeof value === "object") {
          rows.push(...flattenObject(value, newKey));
        } else {
          rows.push({ key: newKey, value: value });
        }
      });
    } else {
      rows.push({ key: parentKey, value: obj });
    }

    return rows;
  }

  // Fetch reply variables
  const getapirequest = async () => {
    setLoading(true);
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
      nodeId: nodeId,
    };

    try {
      const response = await fetch(
        `https://dev.salegrowybox.com/api/viewBot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      setLoading(false);
      if (data.status) {
        setIsFailed(false);
        setFormData({
          name: data.data.name || "",
          url: data.data.apicall_url || "",
        });
        setbotReplyIdOrUid(data.data._uid);
        setMethod(data.data.apicall_method || "POST");

        // Parse headers and set default
        if (data.data.apicall_headers) {
          try {
            const parsedHeaders = JSON.parse(data.data.apicall_headers);
            // Convert [{ "Content-Type": "multipart/form-data" }] → [{ key, value }]
            const formattedHeaders = parsedHeaders.map((obj) => {
              const key = Object.keys(obj)[0];
              const value = obj[key];
              return { key, value };
            });
            setHeaders(formattedHeaders);
          } catch (err) {
            console.error("Error parsing headers:", err);
          }
        }

        // Parse body and set default
        if (data.data.apicall_body) {
          try {
            const parsedBody = JSON.parse(data.data.apicall_body);
            const formattedBody = parsedBody.map((obj) => {
              const key = Object.keys(obj)[0];
              const value = obj[key];
              return { key, value };
            });
            setBody(formattedBody);
          } catch (err) {
            console.error("Error parsing body:", err);
          }
        }

        //  Parse and display previous API response 
        if (data.data.apicall_response) {
          try {
            const parsedResponse = JSON.parse(data.data.apicall_response);
            setResponse(parsedResponse);
          } catch (err) {
            console.error("Error parsing response:", err);
          }
        }
      } else {
        setIsFailed(true);
        setNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId
              ? {
                ...n,
                data: {
                  ...n.data,
                  isAdded: true,
                },
              }
              : n
          )
        );
      }
    } catch (error) {
      setLoading(false);
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

  const checkEmptyTargetHandles = () => {
    let emptyTargetHandles = 0;
    edges.forEach((edge) => {
      if (!edge.targetHandle) {
        emptyTargetHandles++;
      }
    });
    return emptyTargetHandles;
  };

  const onSave = useCallback(async (type) => {
    const flow = reactFlowInstance.toObject();
    console.log(flow);
    if (reactFlowInstance) {
      const emptyTargetHandles = checkEmptyTargetHandles();;

      if (nodes.length > 1 && (emptyTargetHandles > 1)) {
        Modal.error({
          title: "Error",
          content: "Bot Update Failed",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      } else {
        const flow = reactFlowInstance.toObject();
        let nodePayload = JSON.stringify(flow);
        nodePayload = nodePayload.replace(/\\/g, "");
        localStorage.setItem(flowKey, JSON.stringify(flow));
        console.log(JSON.stringify(flow));
        try {

          // Build payload
          const payload = {
            vendor_uid: vendor_uid,
            bot_flow_uid: bot_flow_uid,
            nodes: nodePayload,
          };

          // Send API request with Axios
          const response = await axios.post(
            `https://dev.salegrowybox.com/api/storeNodes`,
            payload,
            { headers: { "Content-Type": "application/json" } }
          );

          //const data = response.data;

          setLoading(false);
          if (type == "add") {
            setSelectedElements([]);
            Modal.success({
              title: "Success",
              content: "Data saved successfully!",
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "ok-btn-hover-green"
              }
            });
          } else {
            setSelectedElements([]);
            Modal.success({
              title: "Success",
              content: "Data saved successfully!",
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "ok-btn-hover-green"
              }
            });
          }
          // if (data.success) {
          //   if(type == "add"){
          //     setSelectedElements([]);
          //     Modal.success({
          //       title: "Success",
          //       content: "Data saved successfully!",
          //       centered: true,
          //       okText: "OK",
          //       okButtonProps: {
          //         className: "ok-btn-hover-green"
          //       }
          //     });
          //   } else{
          //     Modal.success({
          //       title: "Success",
          //       content: data.errors?.name || data.message || "Bot Updated Failed",
          //       centered: true,
          //       okText: "OK",
          //       okButtonProps: {
          //         className: "ok-btn-hover-green"
          //       }
          //     });
          //   }
          // }
          // else {
          //   Modal.error({
          //     title: "Error",
          //     content: data.errors?.name || data.message || "Something went wrong",
          //     centered: true,
          //     okText: "OK",
          //     okButtonProps: {
          //       className: "no-btn-hover-red"
          //     }
          //   });
          // }
        } catch (err) {
          setLoading(false);
          if (err.response) {
            // Handle server errors (non-2xx)
            Modal.error({
              title: "Error",
              content: err.response.data?.message ||
                err.response.data?.errors?.name ||
                "Failed to save data",
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "no-btn-hover-red"
              }
            });
          } else {
            // Handle network or unknown errors
            Modal.error({
              title: "Error",
              content: "Something went wrong: " + err.message,
              centered: true,
              okText: "OK",
              okButtonProps: {
                className: "no-btn-hover-red"
              }
            });

          }
        }
      }
    }
  }, [reactFlowInstance]);

  // Update API Bot Reply
  const updateApiBot = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });

      const headerKey = headers.map((h) => h.key);
      const headerValue = headers.map((h) => h.value);
      const bodyKey = body.map((h) => h.key);
      const bodyValue = body.map((h) => h.value);
      const variableName = variables.map((h) => h.key);
      const variableValue = variables.map((h) => h.value);
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        node_id: nodeId,
        name: formData.name,
        message_type: "apiCall",
        apicall_method: method,
        apicall_url: formData.url,
        reply_trigger: "is",
        trigger_type: "is",
        validate_bot_reply: 0,
        headerKey,
        headerValue,
        bodyKey,
        bodyValue,
        variableName,
        variableValue,
        apicall_response: response,
      };

      console.log("Update API Payload:", payload);

      const response1 = await axios.post(
        `https://dev.salegrowybox.com/api/updateBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Update API Response:", response1.data);

      if (response1.data.success) {

        onSave("edit");
      } else {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: response1.data.message || "Something went wrong while updating.",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (err) {
      setLoading(false);
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Error updating API bot:", err);
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
    }
  };


  return (
    <>
      {selectedNode && (
        <aside
          className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[30vw] h-auto shadow-md transition-all duration-300 flex flex-col ${isDarkMode
              ? "bg-white border-gray-700 text-gray-900"
              : "bg-white border-gray-700 text-gray-900"
            }`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${isDarkMode ? "text-black" : "text-blue-900"
                }`}
            >
              <Edit className="w-5 h-5" /> Add Bot Reply
            </h3>

            {/* Close Button (X) */}
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Name Input */}
          <label className="block text-sm font-regular py-2">Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter Your Name..."
          />
          {errors.name && (<p className="text-red-500 text-sm mb-0 mt-1 mb-0">{errors.name}</p>)}
          {/* Choose Method */}
          <div className="row flex items-center space-x-4">
            {/* Select Method */}
            <div>
              <label className="block text-sm font-regular">
                Method
              </label>

              <select
                className="p-2 border text-black border-blue-300 rounded"
                value={method}
                onChange={(e) => {
                  const value = e.target.value;
                  setMethod(value);


                  if (selectedNode) {
                    setNodes((nodes) =>
                      nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, apicall_method: value } }
                          : n
                      )
                    );
                  }
                }}
              >
                <option value="">Select Method</option>
                {keys.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>


            {/* Display Url */}
            <div className="w-full text-black font-regular py-0 mt-4">
              <label className="block text-sm font-regular ">URL</label>
              <input
                type="text"
                name="url"
                value={formData.url}
                className="w-full p-2 mb-4 border border-blue-300 text-black rounded"
                onChange={handleUrl}
                placeholder="Enter URL..."
              />
            </div>
          </div>
          {errors.url && (<p className="text-red-500 text-sm mb-0 mt-[-10px]">{errors.url}</p>)}

          {/* Headers */}
          <div row flex items-center space-x-4>
            <label className="block text-sm font-regular py-2">Headers</label>
            {headers.map((header, index) => (
              <div className="row flex items-center space-x-4" key={index}>
                <div className="w-full text-black font-medium py-0 mt-0">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) =>
                      handleHeaderInputChange(index, "key", e.target.value)
                    }
                  />
                </div>

                <div className="w-full text-black font-medium py-1">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) =>
                      handleHeaderInputChange(index, "value", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="bg-blue-500 w-[90px] rounded-[5px] hover:bg-blue-600 text-white font-bold py-1 rounded-full flex items-center justify-center space-x-1"
                onClick={addHeader}
              >
                <span>+</span>
                <span className="text-[10px]">Add Header</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div row flex items-center space-x-4>
            <label className="block text-sm font-regular py-2">Body</label>
            {body.map((body, index) => (
              <div className="row flex items-center space-x-4" key={index}>
                <div className="w-full text-black font-medium py-0 mt-0">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                    placeholder="Key"
                    value={body.key}
                    onChange={(e) =>
                      handleBodyInputChange(index, "key", e.target.value)
                    }
                  />
                </div>

                <div className="w-full text-black font-medium py-1">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                    placeholder="Value"
                    value={body.value}
                    onChange={(e) =>
                      handleBodyInputChange(index, "value", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="bg-blue-500 w-[90px] rounded-[5px] hover:bg-blue-600 text-white font-bold py-1 rounded-full flex items-center justify-center space-x-1"
                onClick={addBody}>
                <span>+</span>
                <span className="text-[10px]">Add Body</span>
              </button>
            </div>
          </div>

          <div className="mt-2 flex justify-start">
            <button
              type="button"
              className="bg-orange-500 w-[100px] rounded-[5px] hover:bg-orange-700 text-white font-bold py-2 rounded-md flex items-center justify-center space-x-1"
              onClick={handleSubmit}>
              <span className="text-[10px]">Make Request</span>
            </button>
          </div>

          {error && <pre className="text-red-500 mt-3">{error}</pre>}

          {response && <div className=""><ResponseDisplay flattened={response} /></div>}

          {/* Next Node */}
          <label className="block text-sm font-regular mt-4">You Can Use this Variable Names in the Next Node :  </label>
          {variables.map((variable, index) => (
            <div className="row flex items-center space-x-4">
              <div className="w-full text-black font-medium py-0 mt-2">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  value={variable.key}
                  onChange={(e) =>
                    handleVariableInputChange(index, "key", e.target.value)
                  }
                  placeholder="Variable Name"
                />
              </div>

              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition mt-2"
                  onChange={(e) =>
                    handleVariableInputChange(index, "value", e.target.value)
                  }
                  value={variable.value} >
                  <option value=""> -- Select Variable keys -- </option>
                  {response.map((item, index) => (
                    <option key={index} value={item.key}>
                      {item.key}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="mt-2 flex justify-start">
            <button
              type="button"
              className="bg-blue-500 w-[100px] rounded-[5px] hover:bg-blue-600 text-white font-bold py-2 rounded-md flex items-center justify-center space-x-1"
              onClick={addVariable}>
              <span>+</span>
              <span className="text-[10px]">Add More</span>
            </button>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                if (isNewNode || isFailed) {
                  submitApiBot(e);
                } else {
                  updateApiBot(e);
                }
              }}
              className="bg-green-500 w-[100px] rounded-[5px] hover:bg-green-600 text-white font-bold py-2 rounded-md flex items-center justify-center space-x-1">
              <span className="text-[10px]">Submit</span>
            </button>
          </div>
          {loading && (
            <div className="full_screen_loading">
              <Spin size="large" tip="Loading..." />
            </div>
          )}

        </aside>
      )}
    </>
  );
}