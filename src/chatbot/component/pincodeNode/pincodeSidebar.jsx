"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useReactFlow } from "reactflow";
import * as Yup from "yup";
import axios from "axios";
import { Spin, Modal } from "antd";

export default function TextSidebar({
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
  flowKey,
  webHookUrl,
  setWebHookUrl
}) {
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
  const [selectedField, setSelectedField] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [newValue, setNewValue] = useState("");
  const { setNodes } = useReactFlow();
  const [pincodeType, setPincodeType] = useState("single");
  const [singlePincode, setSinglePincode] = useState("");
  const [multiplePincodes, setMultiplePincodes] = useState({ from: "", to: "" });
  const [excelFile, setExcelFile] = useState(null);

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  // Validation schema
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    url: Yup.string()
      .nullable()
      .notRequired()
      .test("valid-url", "Please enter a valid URL", (value) => {
        if (!value) return true; // empty → allowed
        return Yup.string().url().isValidSync(value); // if value exists → must be valid URL
      })
  });
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  // Load dark mode and variables
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
    getReplayVariable();
    if (!isNewNode && nodeId) {
      getSimpleBot();
    }

  }, [nodeId, isNewNode]);

  useEffect(() => {
    setSelectedField("")
    if (!selectedNode) return;

    setFormData({
      name: selectedNode.data?.label === "pincodenode" ? "" : selectedNode.data?.label,
      replay: selectedNode.data?.replyMessage || "",
      url: selectedNode.data?.webhook_url || "",
    });
    setWebHookUrl(selectedNode.data?.webhook_url || "");

  }, [selectedNode, isNewNode]);

  // Save node data locally
  const saveNodeData = (newText, newTitle) => {
    if (!selectedNode) return;
    const updatedNodeTexts = {
      ...nodeTexts,
      [selectedNode.id]: { text: newText, title: newTitle },
    };
    setNodeTexts(updatedNodeTexts);
    localStorage.setItem("nodeTexts", JSON.stringify(updatedNodeTexts));
    setNodeName(newText);
  };
  const handleFieldSelect = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    const selectedText = e.target.options[e.target.selectedIndex].text;

    setSelectedField(value);
    setErrors((prev) => ({ ...prev, selectVariable: "" }));

    // Show new input if Create New selected
    setShowInput(selectedText === "Create New");

    // if (selectedNode) {
    //   setNodes((nodes) =>
    //     nodes.map((node) =>
    //       node.id === selectedNode.id
    //         ? {
    //             ...node,
    //             data: {
    //               ...node.data,
    //               replyVariable: selectedText, 
    //               selectVariable: value,
    //             },
    //           }
    //         : node
    //     )
    //   );
    // }
  };

  const clearAllHighlights = () => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          border: "none",
          boxShadow: "none",
        },
      }))
    );
  };
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

  // Insert dynamic variable
  const insertAtCursor = (item) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const insertText = `{${item}}`;
    const newText =
      formData.replay.slice(0, start) + insertText + formData.replay.slice(end);
    setFormData((prev) => ({ ...prev, replay: newText }));
    setErrors((prev) => ({ ...prev, replay: "" }));

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

  // Fetch reply variables
  const getReplayVariable = async () => {
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
    };

    try {
      const response = await fetch(
        `https://dev.salegrowybox.com/api/getReplyVariable`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        Modal.error({
          title: "Error",
          content: data.errors?.name || data.message || "Failed to fetch variables",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });

        return;
      }
      if (data.success) {
        setKeys(data.data);
      } else {
        Modal.error({
          title: "Error",
          content: "Something went wrong while fetching variables",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });

      }
    } catch (error) {
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
      console.log("datadatadata", data);
      if (data.status) {
        setIsFailed(false)
        setFormData({
          name: data.data.name,
          replay: data.data.reply_text,
          url: data.data.reply_webhook_url
        });
        setNodeName(data.data.name || "");
        setSelectedField(data.data.reply_variable)
        setbotReplyIdOrUid(data.data._uid);
        setWebHookUrl(data.data.reply_webhook_url)

        const pincodeArr = data.pincode || [];
        if (pincodeArr.length === 0) {
          setPincodeType("single");
          setSinglePincode("");
        } else if (pincodeArr.length === 1) {
          setPincodeType("single");
          setSinglePincode(pincodeArr[0].pincode || "");
        } else if (pincodeArr.length === 2) {
          setPincodeType("multiple");
          setMultiplePincodes({
            from: pincodeArr[0].pincode || "",
            to: pincodeArr[1].pincode || ""
          });
        } else if (pincodeArr.length >= 3) {
          setPincodeType("ex");
        }

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

    // Prevent submission if URL invalid
    if (webHookUrl && urlValid === false) {
      return;
    }

    try {
      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name || "");
      formDataObj.append("reply_text", "Thank you");
      formDataObj.append("message_type", "pincodes");
      formDataObj.append("vendor_uid", vendor_uid || "");
      formDataObj.append("bot_flow_uid", bot_flow_uid || "");
      formDataObj.append("replyWebhookUrl", webHookUrl || "");
      formDataObj.append("select_variable", selectedField || "");
      formDataObj.append("new_variable_value", selectedField === "create_new" ? newValue : "");
      formDataObj.append("node_id", nodeId || "");

      if (pincodeType === "single") {
        formDataObj.append("pincode_comma_separated", singlePincode || "");
        formDataObj.append("pincode_range_from", "");
        formDataObj.append("pincode_range_to", "");
        formDataObj.append("pincode_excel_file", "");
      } else if (pincodeType === "multiple") {
        formDataObj.append("pincode_range_from", multiplePincodes.from || "");
        formDataObj.append("pincode_range_to", multiplePincodes.to || "");
        formDataObj.append("pincode_comma_separated", "");
        formDataObj.append("pincode_excel_file", "");
      } else if (pincodeType === "ex") {
        if (excelFile) {
          formDataObj.append("pincode_excel_file", excelFile);
        }
        formDataObj.append("pincode_comma_separated", "");
        formDataObj.append("pincode_range_from", "");
        formDataObj.append("pincode_range_to", "");
      }

      const response = await fetch(
        `https://dev.salegrowybox.com/api/storeBotReply`,
        {
          method: "POST",
          body: formDataObj,
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

        setShowInput(false);
        setIsFailed(false);

        setTimeout(() => {
          onSave("add");
        }, 100);

      } else {
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
      const formDataObj = new FormData();
      formDataObj.append("botReplyIdOrUid", botReplyIdOrUid || "");
      formDataObj.append("vendor_uid", vendor_uid || "");
      formDataObj.append("name", formData.name || "");
      formDataObj.append("reply_text", "Thank you");
      formDataObj.append("message_type", "pincodes");
      formDataObj.append("validate_bot_reply", 0);
      formDataObj.append("replyWebhookUrl", webHookUrl || "");
      formDataObj.append("node_id", nodeId || "");
      formDataObj.append("trigger_type", "is");
      formDataObj.append("reply_trigger", "is");
      formDataObj.append("select_variable", selectedField || "");
      formDataObj.append("new_variable_value", selectedField === "create_new" ? newValue : "");

      if (pincodeType === "single") {
        formDataObj.append("pincode_comma_separated", singlePincode || "");
        formDataObj.append("pincode_range_from", "");
        formDataObj.append("pincode_range_to", "");
        formDataObj.append("pincode_excel_file", "");
      } else if (pincodeType === "multiple") {
        formDataObj.append("pincode_range_from", multiplePincodes.from || "");
        formDataObj.append("pincode_range_to", multiplePincodes.to || "");
        formDataObj.append("pincode_comma_separated", "");
        formDataObj.append("pincode_excel_file", "");
      } else if (pincodeType === "ex") {
        if (excelFile) {
          formDataObj.append("pincode_excel_file", excelFile);
        }
        formDataObj.append("pincode_comma_separated", "");
        formDataObj.append("pincode_range_from", "");
        formDataObj.append("pincode_range_to", "");
      }

      console.log("Update Payload:", formDataObj);

      const response = await fetch(`https://dev.salegrowybox.com/api/updateBotReply`, {
        method: "POST",
        body: formDataObj,
      });

      const data = await response.json();
      console.log("Update Response:", data);

      if (!response.ok) {
        setLoading(false);
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
        setShowInput(false);
        setIsFailed(false);
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

  // Handle URL input and validate
  const handleUrlChange = (e) => {
    setWebHookUrl(e.target.value);
  };

  return (
    <>
      {selectedNode && (
        <aside
          className={`border-r p-5 text-sm w-[30vw] h-screen shadow-md transition-all duration-300 flex flex-col ${isDarkMode
            ? "bg-white border-gray-700 text-gray-900"
            : "bg-white border-gray-700 text-gray-900"
            }`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 pr-8">
              Pincode Bot Reply
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-1" >

            {/* Name Field */}
            <label className="block text-sm font-medium mt-0">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              placeholder="Enter Name..."
            />

            {errors.name && (<p className="text-red-500 text-sm ml-1 mt-1">{errors.name}</p>)}

            {/* Reply Text */}
            <div className="w-full mt-4 p-4 bg-white border border-gray-300 ml- rounded-md shadow-sm">
              <label className="block text-sm font-medium text-gray-700 py-2">
                Pincode
              </label>

              {/* Radio buttons row */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" value="single" checked={pincodeType === "single"} onChange={(e) => setPincodeType(e.target.value)} />
                  <span className="text-sm">Single</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" value="multiple" checked={pincodeType === "multiple"} onChange={(e) => setPincodeType(e.target.value)} />
                  <span className="text-sm">Multiple</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" value="ex" checked={pincodeType === "ex"} onChange={(e) => setPincodeType(e.target.value)} />
                  <span className="text-sm">Excel Upload</span>
                </label>
              </div>

              {/* Dynamic Inputs */}
              {pincodeType === "single" && (
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter Pincode..."
                    value={singlePincode}
                    onChange={(e) => setSinglePincode(e.target.value)}
                  />
                </div>
              )}

              {pincodeType === "multiple" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="From Pincode"
                    value={multiplePincodes.from}
                    onChange={(e) => setMultiplePincodes({ ...multiplePincodes, from: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="To Pincode"
                    value={multiplePincodes.to}
                    onChange={(e) => setMultiplePincodes({ ...multiplePincodes, to: e.target.value })}
                  />
                </div>
              )}

              {pincodeType === "ex" && (
                <div>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    onChange={(e) => setExcelFile(e.target.files[0])}
                  />
                </div>
              )}

              {/* If Create New → input field */}
              {showInput && (
                <div className="mt-3">
                  <label className="block text-sm font-medium">Enter New Variable Name</label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter new variable..."
                  />
                </div>
              )}
            </div>

            {/* Webhook URL validation */}
            <label className="block text-sm font-medium mt-4">Webhook URL</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 mt-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              name="url"
              value={webHookUrl}
              onChange={(e) => {
                handleUrlChange(e);
              }}
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
                  className="bg-blue-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                  onClick={(e) => {
                    if (isNewNode || isFailed) {
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
