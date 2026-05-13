"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useReactFlow } from "reactflow";
import { X, Edit } from "lucide-react";
import Data from "../../../../data/data";
import axios from "axios";
import * as Yup from "yup";
import { Spin, Modal } from "antd";

export default function PhoneSidebar({
  nodeName,
  setNodeName,
  nodePhone,
  setNodePhone,
  nodeId,
  selectedNode,
  setSelectedElements,
  updateUserName,
  setNodeLink,
  setNodeOption,
  isNewNode,
  reactFlowInstance,
  edges,
  nodes,
  flowKey,
  webHookUrl,
  setWebHookUrl
}) {
  const [newField, setNewField] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const textareaRef = useRef(null);
  const [keys, setKeys] = useState([]);
  const [errors, setErrors] = useState({});
  const { setNodes } = useReactFlow();
  const [showInput, setShowInput] = useState(false);
  const [formData, setFormData] = useState({ name: "", reply: "", selectType: "" });
  const [newValue, setNewValue] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    reply: Yup.string().required("Reply text is required"),
    selectType: Yup.string().required("Select type is required"),
    selectVariable: Yup.string().required("Select variable is required"),
    url: Yup.string()
      .nullable()
      .notRequired()
      .test("valid-url", "Please enter a valid URL", (value) => {
        if (!value) return true; // empty → allowed
        return Yup.string().url().isValidSync(value); // if value exists → must be valid URL
      })
  });

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  useEffect(() => {

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }

    getReplayVariable();

    if (!isNewNode && nodeId) {
      getstaticvalue();
    }
  }, [nodeId, isNewNode]);

  useEffect(() => {
    if (!selectedNode) return;
    setFormData({
      name: selectedNode.data?.label === "phonequestionnode" ? "" : selectedNode.data?.label,
      reply: selectedNode.data?.replyMessage || "",
      selectType: selectedNode.data?.selectType || "",
      selectVariable: selectedNode.data?.selectVariable || "",
      url: selectedNode.data?.webhook_url || ""
    });
    setWebHookUrl(selectedNode.data?.webhook_url || "");
    setSelectedField(selectedNode.data?.selectVariable || "");
  }, [selectedNode]);


  const handleFieldSelect = (e) => {
    const { name, value } = e.target;
    const selectedText = e.target.options[e.target.selectedIndex].text;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSelectedField(selectedText);

    // Show input only if Create New is chosen
    setShowInput(selectedText === "Create New");

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? {
              ...node,
              data: {
                ...node.data,
                replyVariable: selectedText,
                selectVariable: value,
              },
            }
            : node
        )
      );
    }
  };

  const handleFieldType = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? {
              ...node,
              data: {
                ...node.data,
                selectType: value, // ✅ save instantly in node data
              },
            }
            : node
        )
      );
    }
  };

  const handleWebhookChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    setWebHookUrl(e.target.value);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));


    if (name === "reply" && selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? {
              ...node,
              data: {
                ...node.data,
                replyMessage: value,
              },
            }
            : node
        )
      );
    }
  };


  // Insert dynamic variable
  const insertAtCursor = (item) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const insertText = `{${item}}`;
    const newText =
      formData.reply.slice(0, start) + insertText + formData.reply.slice(end);
    setFormData((prev) => ({ ...prev, reply: newText }));
    setErrors((prev) => ({ ...prev, reply: "" }));

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, replyMessage: newText } }
            : node
        )
      );
    }

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + insertText.length, start + insertText.length);
    });
  };


  const getReplayVariable = async () => {
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
    };

    try {
      const { data } = await axios.post(
        `https://dev.salegrowybox.com/api/getReplyVariable`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Handle response
      if (data.success) {
        setKeys(data.data);
      } else {
        Modal.error({
          title: "Error",
          content: data.message || "Something went wrong while fetching variables",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (error) {
      console.error("Error fetching variables:", error);

      // Handle server or network errors
      if (error.response) {
        Modal.error({
          title: "Error",
          content: error.response.data?.message || "Failed to fetch variables",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      } else {
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



  // Handle input change and live update node
  const handleNameChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNodeName(value)

    //  Live update node name
    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? {
              ...node,
              data: {
                ...node.data,
                label: value, // update label immediately
              },
            }
            : node
        )
      );
    }
  };

  // Submit form
  const submitQuestionBot = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      // Build payload
      const payload = {
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        message_type: "questionanswer",
        name: formData.name,
        reply_text: formData.reply,
        select_type: formData.selectType,
        select_variable: selectedField,
        new_variable_value: selectedField === "Create New" ? newValue : "",
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: "0",
        node_id: nodeId,
      };

      // Send API request with Axios
      const response = await axios.post(
        `https://dev.salegrowybox.com/api/storeBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;
      // if (!response.ok) {
      //   setLoading(false);
      //   Modal.error({
      //     title: "Error",
      //     content:data.errors?.name || data.message || "Failed to save data",
      //     centered: true,
      //     okText: "OK",
      //     okButtonProps: {
      //       className: "no-btn-hover-red"
      //     }
      //   });
      //   return;
      // }

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
                  label: formData.name,
                  replyMessage: formData.reply,
                  replyWebhookUrl: webHookUrl,
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

  // Fetch reply variables
  const getstaticvalue = async () => {
    setLoading(true);
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
      nodeId: nodeId
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
          reply: data.data.reply_text || "",
          selectType: data.data.select_type || "",
          selectVariable: data.data.reply_variable || ""
        });
        setSelectedField(data.data.reply_variable || "");
        setWebHookUrl(data.data.reply_webhook_url)
        setbotReplyIdOrUid(data.data._uid);

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

  const updateQuestionBot = async (e) => {
    e.preventDefault();

    try {

      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        name: formData.name,
        reply_text: formData.reply,
        node_id: nodeId,
        message_type: "questionanswer",
        select_type: formData.selectType,
        select_variable: selectedField,
        new_variable_value: selectedField === "Create New" ? newValue : "",
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: 0,
        trigger_type: "is",
        reply_trigger: "is",
      };

      console.log("Update Payload:", payload);


      const response = await fetch(`https://dev.salegrowybox.com/api/updateBotReply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Update Response:", data);

      if (!response.ok) {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.message || "Failed to update media reply",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      if (data.success) {
        onSave("edit");

      } else {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.errors?.name || data.message || "Something went wrong while updating.",
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
        console.error("Error updating bot:", err);
        Modal.error({
          title: "Error",
          content: newErrors,
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
            }`}>
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${isDarkMode ? "text-black" : "text-blue-900"
                }`}>
              Question Node
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
              aria-label="Close sidebar">
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Phone Number Input */}
          <label className="block text-sm font-medium mt-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            placeholder="Enter Your Name..."
          />
          {errors.name && (<p className="text-red-500 text-sm mt-1 mb-0">{errors.name}</p>)}
          {/* Select Field To Store */}
          <label className="block text-sm font-medium mt-2">
            Select Type
          </label>
          <select
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            onChange={handleFieldType}
            name="selectType"
            value={formData.selectType}>
            <option value="">Select a field</option>

            {/* Static options */}
            <option value="name">Ask for a name</option>
            <option value="email">Ask for an email</option>
            <option value="phone">Ask for a phone</option>
            <option value="date">Ask for a date</option>
            <option value="address">Ask for an address</option>
            <option value="URL">Ask for a URL</option>

          </select>
          {errors.selectType && (<p className="text-red-500 text-sm mt-1 mb-0">{errors.selectType}</p>)}
          {/*  Reply Text */}
          <div className="w-full mt-3 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
            <label className="block text-sm font-medium text-gray-700 py-2">
              Reply Text:
            </label>
            <div className="w-full rounded transition-all duration-200 focus:outline-none text-black">
              <textarea
                ref={textareaRef}
                maxLength={1000}
                rows={4}
                name="reply"
                placeholder="Type your reply message..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-1"
                value={formData.reply}
                onChange={handleInputChange}
              />
              {errors.reply && (<p className="text-red-500 text-sm">{errors.reply}</p>)}
            </div>

            <div className=" p-4 bg-blue-50 rounded-lg border border-blue-200 mt-3">
              <p className="text-xs text-gray-700 mb-3">Click to insert dynamic variables:</p>
              <div className="flex flex-wrap gap-2">
                {keys.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => insertAtCursor(item)}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-md transition hover:shadow"
                  >
                    {`{${item}}`}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium mt-3">
              Select Variable to assign
            </label>
            <select
              className="w-full p-2.5 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              onChange={handleFieldSelect}
              name="selectVariable"
              value={selectedField}>
              <option value="">Select Type</option>

              {/*  Static options */}

              <option value="create_new">Create New</option>
              <option value="bot_name">bot_name</option>
              <option value="bot_email">bot_email</option>
              <option value="bot_number">bot_number</option>
              <option value="bot_phone">bot_phone</option>
              <option value="bot_date">bot_date</option>
              <option value="bot_address">bot_address</option>
              <option value="bot_url">bot_url</option>

            </select>
            {errors.selectVariable && (<p className="text-red-500 text-sm mt-1 mb-0">{errors.selectVariable}</p>)}
            {showInput && (
              <div>
                <label className="block text-sm font-medium mt-2">Enter New Value</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                    placeholder="Enter new field name..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/*  Webhook URL validation */}
          <label className="block text-sm font-medium mt-3">Webhook URL:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            onChange={handleWebhookChange}
            name="url"
            value={webHookUrl}
            placeholder="Enter URL..."
          />
          {errors.url && (
            <p className="text-red-500 text-sm mb-2">
              {errors.url}
            </p>
          )}

          {/*  Submit */}
          <div className="mt-4">
            <div className="mt-4">
              <button
                style={{ width: "100px", float: "right" }}
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                onClick={(e) => {
                  if (isNewNode || isFailed) {
                    submitQuestionBot(e);
                  } else {
                    updateQuestionBot(e);
                  }
                }}
              >
                Submit
              </button>
            </div>
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
