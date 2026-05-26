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

export default function FlowTemplateSidebar({
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
  const [flows, setFlows] = useState([]);
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const { setNodes } = useReactFlow();
  const [chooseFlow, setChooseFlow] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    chooseFlow: "",
    url: ""
  });
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    chooseFlow: Yup.string().required("Please select a flow"), // Add this
    url: Yup.string()
      .nullable()
      .notRequired()
      .test("valid-url", "Please enter a valid URL", (value) => {
        if (!value) return true; // empty → allowed
        return Yup.string().url().isValidSync(value); // if value exists → must be valid URL
      })
  })
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
    setFormData({
      name: selectedNode.data.label === "flowtemplatenode" ? "" : selectedNode.data.label || "",
      reply: selectedNode.data.chooseFlow || "",
      url: selectedNode.data.webhook_url || "",
    });
    setWebHookUrl(selectedNode.data?.webhook_url || "");

    axios
      .post("https://dev.salegrowy.com/api/getFlowMessages", {
        vendor_uid: vendor_uid,
      })
      .then((res) => {
        if (res.data.success) {
          setFlows(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching flows:", err));

    if (!isNewNode && nodeId) {
      getflowstatic();
    }

  }, [nodeId, isNewNode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Update label live
    if (name === "name") {
      setNodeName(value);
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, label: value } }
              : node
          )
        );
      }
    }

    if (name === "link") setNodeLink(value);
    if (name === "option") setNodeOption(value);
  };

  // Submit form
  const submitSimpleBot = async (e) => {
    e.preventDefault();


    try {
      // Validate form
      await schema.validate(formData, { abortEarly: false });

      // setLoading(true);
      // Build payload
      const payload = {
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        message_type: "flowTemplate",
        name: formData.name,
        flow_id: formData.chooseFlow,
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: "0",
        node_id: nodeId,
      };
      console.log(payload);

      // Send API request with Axios
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/storeBotReply`,
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
                  replyMessage: formData.replay,
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
  const getflowstatic = async () => {
    setLoading(true);
    const payload = {
      vendor_uid: vendor_uid,
      botflow_uid: bot_flow_uid,
      nodeId: nodeId
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URI}/api/viewBot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      setLoading(false);
      // if (!response.ok) {
      //   Modal.error({
      //     title: "Error",
      //     content: data.errors?.name || data.message || "Failed to fetch variables",
      //     centered: true,
      //     okText: "OK",
      //     okButtonProps: {
      //       className: "no-btn-hover-red"
      //     }
      //   });
      //   return;
      // }
      if (data.status) {
        setIsFailed(false);
        setFormData({
          name: data.data.name || "",
          reply: data.data.reply_text || "",
          url: data.data.reply_webhook_url || "",
        });
        setbotReplyIdOrUid(data.data._uid);
        setChooseFlow(data.data.flow_id || "");
        setWebHookUrl(data.data.reply_webhook_url)
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

  // Update flow template bot reply
  const updateFlowTemplateBot = async (e) => {
    e.preventDefault();

    try {

      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        node_id: nodeId,
        name: formData.name,
        message_type: "flowTemplate",
        flow_id: chooseFlow,
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: 0,
        trigger_type: "is",
        reply_trigger: "is",
      };

      console.log("Update Payload:", payload);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/updateBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Update Response:", response.data);

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
              Flow Template
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
          {/* Flow Selection */}
          <label className="block text-sm font-medium mt-3">Choose Flow</label>
          <select
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            name="chooseFlow"
            value={formData.chooseFlow}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              Select a Flow
            </option>

            {flows.map((flow) => (
              <option key={flow._id} value={flow._id}>
                {flow.flow_name}
              </option>
            ))}
          </select>
          {errors.chooseFlow && (<p className="text-red-500 text-sm mb-0 mt-1 mb-0">{errors.chooseFlow}</p>)}
          {/* Reply Message Section */}
          {/* <div className="w-full mx-auto mt-8">
            <div className="border border-gray-200 shadow-sm rounded-lg bg-white p-4">
              <div className="inline-block -mt-4 mb-2 bg-white text-sm text-blue-600 font-medium">
                Reply Message
              </div>

              <label className="block text-gray-700 text-sm mb-2">
                Reply Message After Payment Success
              </label>
            </div>
          </div> */}
          {/*  Webhook URL validation */}
          <div className="mt-3">
            <label className="block text-sm font-medium">Webhook URL:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              value={webHookUrl}
              name="url"
              onChange={handleWebhookChange}
              placeholder="Enter URL..."
            />
            {/* <div className="flex justify-start mt-5">
              <button
                type="button"
                className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                onClick={() => {
                  // Add your reminder functionality here
                  console.log("Set Reminder clicked");
                }}
              >
                Set Reminder
              </button>
            </div> */}
            {errors.url && (
              <p className="text-red-500 text-sm mb-2">
                {errors.url}
              </p>
            )}
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
