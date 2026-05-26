
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useReactFlow } from "reactflow";
import * as Yup from "yup";
import axios from "axios";
import { Spin, Modal } from "antd";

export default function InitiateSidebar({
  nodeName,
  setNodeName,
  nodeId,
  selectedNode,
  setSelectedElements,
  setNodeBotId,
  isNewNode,
  reactFlowInstance,
  edges,
  nodes,
  flowKey
}) {
  const [webHookUrl, setWebHookUrl] = useState("");
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const [urlValid, setUrlValid] = useState(null);
  const [keys, setKeys] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nodeTexts, setNodeTexts] = useState(
    JSON.parse(localStorage.getItem("nodeTexts") || "{}")
  );
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: "", replay: "" });
  const textareaRef = useRef(null);

  const { setNodes } = useReactFlow();
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  // Validation schema
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    replay: Yup.string().required("Reply text is required"),
  });
  const [loading, setLoading] = useState(false);
  // Load dark mode and variables
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }

  }, [nodeId, isNewNode]);


  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "replay" && selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, replyMessage: value } }
            : node
        )
      );
    }

    if (name === "name") {
      saveNodeData(value, nodeTexts[selectedNode.id]?.title || "");
    }
  };

  // Submit form
  const submitSimpleBot = async (e) => {
    e.preventDefault();

    // Prevent submission if URL invalid
    if (webHookUrl && urlValid === false) {
      return;
    }

    try {
      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      const payload = {
        name: formData.name,
        reply_text: formData.replay,
        message_type: "simple",
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        replyWebhookUrl: webHookUrl,
        node_id: nodeId,
      };
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URI}/api/storeBotReply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.errors?.name || data.message || "Failed to save data",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }
      if (data.status === "success") {
        setNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId
              ? {
                ...n,
                data: {
                  ...n.data,
                  label: formData.name,
                  replyMessage: formData.replay,
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
          content: "Something went wrong",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (err) {
      setLoading(false);
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
    }
  };


  // Update bot reply
  const updateSimpleBot = async (e) => {
    e.preventDefault();

    try {

      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        name: formData.name,
        reply_text: formData.replay,
        message_type: "simple",
        validate_bot_reply: 0,
        replyWebhookUrl: webHookUrl,
        node_id: nodeId,
        trigger_type: "is",
        reply_trigger: "is"
      };

      console.log("Update Payload:", payload);

      const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/updateBotReply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Update Response:", data);

      if (!response.ok) {
        Modal.error({
          title: "Error",
          content: data.message || "Failed to update data",
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
          content: "Something went wrong",
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
            botflow_uid: bot_flow_uid,
            nodes: nodePayload,
          };

          // Send API request with Axios
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URI}/api/storeNodes`,
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
          //       title: "Error",
          //       content: data.errors?.name || data.message || "Something went wrong",
          //       centered: true,
          //       okText: "OK",
          //       okButtonProps: {
          //         className: "no-btn-hover-red"
          //       }
          //     });
          // }
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
      }
    }
  }, [reactFlowInstance]);



  return (
    <>
      {selectedNode && (
        <aside
          className={`border-r p-5 text-sm w-[200vw] h-screen shadow-md transition-all duration-300 flex flex-col ${isDarkMode
              ? "bg-white border-gray-700 text-gray-900"
              : "bg-white border-gray-700 text-gray-900"
            }`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 pr-8">
              Node Initiate
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Name Field */}
          <label className="block text-sm font-medium mt-4">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border border-blue-300 text-black rounded"
            placeholder="Enter Name..."
          />

          {errors.name && (<p className="text-red-500 text-sm mb-0 mt-[-10px]">{errors.name}</p>)}

          {/*  Submit */}
          <div className="mt-4">
            <div className="mt-4">
              <button
                style={{ width: "100px", float: "right" }}
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={(e) => {
                  if (isNewNode) {
                    submitSimpleBot(e);
                  } else {
                    updateSimpleBot(e);
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
