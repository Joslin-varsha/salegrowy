"use client";

import { useState, useEffect, useCallback } from "react";

import Data from "../../../data/data";
import { X, Edit, Clock, Calendar } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as Yup from "yup";
import axios from "axios";
import { useReactFlow } from "reactflow";
import { Spin, Modal, DatePicker, TimePicker } from "antd";
import dayjs from 'dayjs';
import 'dayjs/locale/en';

export default function CatLogSidebar({
  dataUserId,
  nodeName,
  setNodeName,
  nodeId,
  nodeImage,
  nodeVideo,
  nodeAudio,
  nodeFile,
  setNodeImage,
  setNodeVideo,
  setNodeFile,
  setNodeAudio,
  nodeLink,
  setNodeLink,
  setNodeOption,
  selectedNode,
  setSelectedElements,
  isNewNode,
  reactFlowInstance,
  edges,
  nodes,
  flowKey,
  webHookUrl,
  setWebHookUrl
}) {

  const [isDarkMode, setIsDarkMode] = useState(false);
  const { setNodes } = useReactFlow();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    reply: "",
  });
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "reply" && selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, replyMessage: value } }
            : node
        )
      );
    }

    if (name === "name") {
      setNodeName(value);
      saveNodeData(value, nodeTexts[selectedNode.id]?.title || "");
    }
  };

  // Reset form when node changes
  useEffect(() => {
    // Reset all form state when nodeId changes
    const resetForm = () => {
      setFormData({
        name: "",
      });
    };

    if (nodeId) {
      if (!isNewNode) {
        getSimpleBot();
      } else {
        // For new nodes, set default values
        resetForm();
        setFormData({
          name: selectedNode?.data?.label === "catlognode" ? "" : selectedNode?.data?.label || "",
          reply: selectedNode?.data?.replyMessage || "",
        });

      }
    } else {
      resetForm();
    }
  }, [nodeId, isNewNode]);


  // Fetch reply variables
  const getSimpleBot = async () => {
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
      nodeId: nodeId
    };
    setLoading(true);
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
        setIsFailed(false)
        setFormData({
          name: data.data.name,
          reply: data.data.reply_text,
        });
        setbotReplyIdOrUid(data.data._uid);
        setNodeName(data?.data?.name);
      } else {
        setIsFailed(true)
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

  // Submit form
  const submitSimpleBot = async (e) => {
    e.preventDefault();

    try {
      // Validate form first
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      // Build payload
      const payload = {
        name: formData.name,
        reply_text: formData.reply || "Thank You",
        message_type: "catlog",
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        node_id: nodeId,

      };

      // Send API request with Axios
      const response = await axios.post(
        `https://dev.salegrowybox.com/api/storeBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

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
        console.log(newErrors);
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

          // const data = response.data;
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

  // Update flow template bot reply
  const updateFlowTemplateBot = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        name: formData.name,
        reply_text: formData.reply || "Thank You",
        message_type: "catlog",
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        node_id: nodeId,
      };

      const response = await axios.post(
        `https://dev.salegrowybox.com/api/updateBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        onSave("edit");
      } else {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: response.data.message || "Something went wrong while updating.",
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
        console.log(newErrors);
      } else {
        console.error("Error updating flow template:", err);
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

  const handleWebhookChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    setWebHookUrl(e.target.value);
  };

  return (
    <>
      {selectedNode ? (
        <aside
          className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[30vw] h-auto shadow-md transition-all duration-300 flex flex-col bg-white border-gray-700 text-gray-900`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${isDarkMode ? "text-black" : "text-blue-900"
                }`}
            >
              Catlog
            </h3>

            {/* Close Button (X) */}
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Name Field */}
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter Name..."
          />
          {errors.name && (<p className="text-red-500 text-sm mb-0 mt-1 mb-0">{errors.name}</p>)}

          {/* Reply Text Field */}
          <div className="mt-3">
            <label className="block text-sm font-medium">Reply Text</label>
            <textarea
              name="reply"
              rows="3"
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y transition"
              value={formData.reply || ''}
              onChange={handleInputChange}
              placeholder="Enter your reply text here..."
            />
            <div className="border-t border-gray-200 my-3"></div>
          </div>

          {/* Submit */}
          <div className="mt-4">
            <button
              style={{ width: "100px", float: "right" }}
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
              onClick={(e) => {
                if (isNewNode || isFailed) {
                  submitSimpleBot(e);
                } else {
                  updateFlowTemplateBot(e);
                }
              }}
            >
              Submit
            </button>
          </div>
          {loading && (
            <div className="full_screen_loading">
              <Spin size="large" tip="Loading..." />
            </div>
          )}
        </aside>
      ) : null}
    </>
  );
}
// Service Quotas
// AWS services
// AWS Lambda
// Concurrent executions