"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Edit } from "lucide-react";
import { useReactFlow } from "reactflow";
import Data from "../../../data/data";
import * as Yup from "yup";
import axios from "axios";
import { Spin, Modal } from "antd";


export default function ConditionRouterSidebar({
  selectedNode,
  setSelectedElements,
  selectedField,
  setSelectedField,
  nodeId,
  isNewNode,
  reactFlowInstance,
  edges,
  nodes,
  flowKey,
  nodeName,
  setNodeName
}) {

  const { getNode, setNodes } = useReactFlow();
  const keys = Data.conditions;
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: "" });
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  // Sync local state with selected node

  useEffect(() => {

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }

    if (!selectedNode) return;

    const node = getNode(selectedNode.id);
    if (!node) return;

    setFormData((prev) => ({
      ...prev,
      name: node.data?.label === "conditionrouternode" ? "" : node.data?.label || ""
    }));

    if (node.data?.conditions) {
      setConditions(JSON.parse(JSON.stringify(node.data.conditions)));
    } else {
      setConditions([{ id: Date.now(), name: "", type: "", value: "" }]);
    }

    if (!isNewNode && nodeId) {
      getcondition();
      // } else {

      //   setFormData({ name: "" });
      //   setConditions([{ name: "", type: "", value: "" }]);
    }
  }, [nodeId, isNewNode]);


  // Handle input change and live update node
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNodeName(value);
  };

  const removeCondition = (index) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };
  // Submit form
  const submitConditionalBot = async (e) => {
    e.preventDefault();

    try {

      await schema.validate(formData, { abortEarly: false });
      const formattedConditions = conditions.map((cond, index) => ({
        conditionSlNo: cond.name,
        conditionType: cond.type,
        valueToCompare: cond.value,
      }));
      console.log("formattedConditions", formattedConditions);
      setLoading(true);
      const payload = {
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        message_type: "conditionRouter",
        validate_bot_reply: "0",
        name: formData.name,
        node_id: nodeId,
        conditions: formattedConditions,
      };

      const response1 = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/storeBotReply`,
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
                  label: formData.name,
                  replyMessage: formData.replay,
                  replyWebhookUrl: "",
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

  const updateNode = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );

    console.log(nodes);
  };

  const [conditions, setConditions] = useState([
    { id: Date.now(), name: "", type: "", value: "" },
  ]);


  useEffect(() => {
    if (!selectedNode) return;

    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, conditions } }
          : n
      )
    );
  }, [conditions]);

  const addCondition = () => {
    setConditions([...conditions, { id: Date.now(), name: "", type: "", value: "" }]);
  };

  const handleSectionTitleChange = (sectionId, data, type) => {
    if (type === "value") {
      setConditions((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, value: data } : s))
      );
      const updated = sections.map((s) =>
        s.id === sectionId ? { ...s, value: data } : s
      );
      //updateNode({ conditions: updated });

    } else if (type === "type") {
      setConditions((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, type: data } : s))
      );
      const updated = sections.map((s) =>
        s.id === sectionId ? { ...s, type: data } : s
      );
      updateNode({ conditions: updated });
    } else if (type === "name") {
      setConditions((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, name: data } : s))
      );
      const updated = sections.map((s) =>
        s.id === sectionId ? { ...s, name: data } : s
      );
      updateNode({ conditions: updated });
    }

  };


  const [isDarkMode, setIsDarkMode] = useState(false);
  // useEffect(() => {
  //   if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  //     setIsDarkMode(true);
  //   }
  // }, []);

  // Fetch reply variables
  const getcondition = async () => {
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

        });
        setbotReplyIdOrUid(data.data._uid);

        //  Parse __data if exists (for conditionRouter)
        if (data.data.__data) {
          try {
            const parsedData = JSON.parse(data.data.__data);
            const jsonValues = JSON.parse(parsedData.interaction_message.json_values);

            //  Convert every JSON object into sidebar condition fields
            const allConditions = jsonValues.map((item, index) => ({
              name: item.conditionSlNo || `Condition ${index + 1}`,
              type: item.conditionType || "",
              value: item.valueToCompare || "",
            }));

            setConditions(allConditions);
            console.log("Loaded conditions:", allConditions);
          } catch (err) {
            console.error("Error parsing __data:", err);
          }
        }
        var defaultSelected = ""

        //  optional: default field selector
        if (data.data.select_type === null) {
          defaultSelected = "conditionRouter"
        } else {
          defaultSelected = data.data.select_type || data.data.trigger_type || "conditionRouter";
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
            botflow_uid: bot_flow_uid,
            nodes: nodePayload,
          };

          // Send API request with Axios
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URI}/api/storeNodes`,
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

  // Update Conditional Bot Reply
  const updateConditionalBot = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      const formattedConditions = conditions.map((cond) => ({
        conditionSlNo: cond.name,
        conditionType: cond.type,
        valueToCompare: cond.value,
      }));


      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        node_id: nodeId,
        name: formData.name,
        message_type: "conditionRouter",
        validate_bot_reply: "0",
        reply_trigger: "is",
        trigger_type: "is",
        conditions: formattedConditions,
      };

      console.log("🟦 Update Condition Payload:", payload);


      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/updateBotReply`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Update Condition Response:", response.data);

      if (response.data.success || response.data.status === "success") {
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
        console.error("Error updating condition router:", err);
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
            }`}>
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${isDarkMode ? "text-black" : "text-blue-900"
                }`}>
              Add Bot Reply
            </h3>

            {/* Close Button (X) */}
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}>
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Name Input */}
          <label className="block text-sm font-regular py-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            onChange={handleInputChange}
            placeholder="Enter Your Name..."
          />
          {errors.name && (<p className="text-red-500 text-sm mb-0 mt-1 mb-0">{errors.name}</p>)}

          {/* Condition box */}
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="relative w-full p-3 mb-4 mt-5 border-2 border-dotted border-gray-300 text-black rounded">
              {/* Close button */}
              <button
                className="absolute -top-3 -right-3 bg-red-500 text-white border border-red-600 px-2 py-1 shadow hover:bg-red-600 rounded"
                onClick={() => removeCondition(index)}>
                <X size={16} />
              </button>

              {/* Input for Condition Name */}
              <input
                type="text"
                name="name"
                className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                onChange={(e) =>
                  handleSectionTitleChange(condition.id, e.target.value, "name")
                }
                value={condition.name || `Condition ${index + 1}`}
                placeholder="Condition1"

              />

              {/* Condition Type */}
              <label className="block text-sm font-regular mt-3">Condition Type</label>
              <div>
                <select
                  name="type"
                  className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  onChange={(e) => {
                    handleSectionTitleChange(condition.id, e.target.value, "type");
                    handleSectionTitleChange(condition.id, `Condition ${index + 1}`, "name")
                  }}
                  value={condition.type || ""}
                >
                  <option value="">Select a field</option>
                  {keys.map((item, idx) => (
                    <option key={idx} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value to Compare */}
              <label className="block text-sm font-regular py-0 mt-3">Value to Compare</label>
              <label className="block text-sm font-regular py-0 mt-1">
                (If the "Condition Type" is Between, enter two values separated by a comma — for example: 10,20)
              </label>
              <input
                type="text"
                name="value"
                className="w-full p-2 border border-gray-300 mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                onChange={(e) =>
                  handleSectionTitleChange(condition.id, e.target.value, "value")
                  // handleConditionInputChange(index, "value", e.target.value)
                }
                value={condition.value || ""} />
            </div>
          ))}

          <div className="mt-2 flex justify-center">
            <button
              type="button"
              className="bg-green-500 hover:bg-blue-600 text-white font-bold py-3 rounded-md flex items-center justify-center space-x-1"
              style={{ width: "150px", borderRadius: "5px" }}
              onClick={addCondition}>

              <span>+</span>
              <span style={{ fontSize: "13px" }}>Add New Condition</span>
            </button>
          </div>

          {/* Reply Message Section */}
          {/* <div className="w-full max-w-xl mx-auto mt-8">
            <div className="border border-gray-200 shadow-sm rounded-lg bg-white p-4">
              <div className="inline-block -mt-7 mb-4 bg-white px-2 text-sm text-blue-600 font-medium -ml-2">
                Reply Message
              </div>

              <label className="block text-gray-700 text-sm mb-2">
                Reply Message After Payment Success
              </label>

               <textarea
                rows={4}
                placeholder="Type your reply message..."
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-3"
               // value={replyMessage}
                onChange={(e) => {
                  const value = e.target.value;
                  //setReplyMessage(value);

                  if (selectedNode) {
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, replyMessage: value } }
                          : node
                      )
                    );
                  }
                }}>

              </textarea> 
            </div>
          </div> */}

          <div className="mt-2 flex justify-end space-x-3 mt-[20px]">

            <button
              style={{ width: "100px", float: "right" }}
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
              onClick={(e) => {
                if (isNewNode || isFailed) {
                  submitConditionalBot(e);
                } else {
                  updateConditionalBot(e);
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
      )}
    </>
  );
}