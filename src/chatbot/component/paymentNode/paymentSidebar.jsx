"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Data from "../../../data/data";
import { X, Edit } from "lucide-react";
import { useReactFlow } from "reactflow";
import * as Yup from "yup";
import axios from "axios";
import { Spin, Modal } from "antd";


export default function PaymentSidebar({
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
  const [unitQuantity, setUnitQuantity] = useState(1);
  const [successUrl, setSuccessUrl] = useState("");
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const [failureUrl, setFailureUrl] = useState("");
  const [selectedGateway, setSelectedGateway] = useState("");
  const [formData, setFormData] = useState({ name: "", productName: "", unitAmount: "", reply: "", url: "" });
  const [errors, setErrors] = useState({});
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    productName: Yup.string().required("ProductName is required"),
    unitAmount: Yup.string().required("UnitAmount is required"),
    reply: Yup.string().required("Reply text is required"),
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
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [keys, setKeys] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Dark mode check
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
    getReplayVariable();

    if (!isNewNode && nodeId) {
      getpaymentstatic();
    }
  }, [nodeId, isNewNode]);


  useEffect(() => {
    if (!selectedNode) return;

    const rawLabel = selectedNode.data?.label;

    setFormData({
      name: rawLabel === "paymentnode" ? "" : rawLabel || "",
      productName: selectedNode.data?.productName || "",
      unitAmount: selectedNode.data?.unitAmount || "",
      reply: selectedNode.data?.replyMessage || "",
      url: selectedNode.data?.webhook_url || "",
    });

    setSelectedGateway(selectedNode.data?.paymentGateway || "");
    setUnitQuantity(selectedNode.data?.unitQuantity || "");
    setSuccessUrl(selectedNode.data?.successUrl || "");
    setFailureUrl(selectedNode.data?.failureUrl || "");
    setWebHookUrl(selectedNode.data?.webhook_url || "");

  }, [selectedNode]);


  const handleNameChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, name: value }));
    setErrors((prev) => ({ ...prev, name: "" }));
    setNodeName(value)
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

  const handleInputChange = (e) => {
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
                [name]: value || "",
              },
            }
            : node
        )
      );
    }
  };

  // payment live updation
  const handleGatewayChange = (e) => {
    const value = e.target.value;
    setSelectedGateway(value);

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? {
              ...node,
              data: {
                ...node.data,
                paymentGateway: value || "",
              },
            }
            : node
        )
      );
    }
  };

  // Product Name live updation
  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, productName: value }));
    setErrors((prev) => ({ ...prev, productName: "" }));

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, productName: value || "" } }
            : node
        )
      );
    }
  }

  // Unit Amount
  const handleUnitAmountChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, unitAmount: value }));
    setErrors((prev) => ({ ...prev, unitAmount: "" }));

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, unitAmount: value || "" } }
            : node
        )
      );
    }
  };

  // Unit Quantity
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setUnitQuantity(value);

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, unitQuantity: value || "" } }
            : node
        )
      );
    }
  };

  // Success URL
  const handleSuccessUrlChange = (e) => {
    const value = e.target.value;
    setSuccessUrl(value);

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, successUrl: value || "" } }
            : node
        )
      );
    }
  };

  // Failure URL
  const handleFailureUrlChange = (e) => {
    const value = e.target.value;
    setFailureUrl(value);

    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, failureUrl: value || "" } }
            : node
        )
      );
    }
  };

  // Webhook URL
  const handleWebhookUrlChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    setWebHookUrl(e.target.value);

  };

  // Submit form
  const submitSimpleBot = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        message_type: "payment",
        node_id: nodeId,
        name: formData.name,
        product_name: formData.productName,
        payment_gateway: selectedGateway,
        unit_amount: formData.unitAmount,
        quantity: unitQuantity,
        success_url: successUrl,
        failure_url: failureUrl,
        reply_text: formData.reply,
        validate_bot_reply: 0,
        replyWebhookUrl: webHookUrl,
      };
      const response = await fetch(
        `https://dev.salegrowybox.com/api/storeBotReply`,
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
                style: {
                  ...n.style,
                  border: "none",
                  boxShadow: "none",
                },
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
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      console.log(newErrors);
      setErrors(newErrors);
    }
  };


  // Update payment bot reply

  const updatePaymentBot = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        name: formData.name,
        product_name: formData.productName,
        payment_gateway: selectedGateway,
        unit_amount: formData.unitAmount,
        node_id: nodeId,
        quantity: unitQuantity,
        success_url: successUrl,
        failure_url: failureUrl,
        reply_text: formData.reply,
        replyWebhookUrl: webHookUrl,
        message_type: "payment",
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
        Modal.error({
          title: "Error",
          content: data.message || "Failed to update payment bot reply",
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
          content: data.message || "Something went wrong while updating.",
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

  // File upload handler
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === "image") setNodeImage(url);
      if (type === "video") setNodeVideo(url);
      if (type === "audio") setNodeAudio(url);
      if (type === "file") setNodeFile(url);
    }
  };

  // Fetch reply variables
  const getpaymentstatic = async () => {
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
          productName: data.data.product_name || "",
          unitAmount: data.data.unit_amount || ""

        });
        setbotReplyIdOrUid(data.data._uid);
        // setSelectedField(data.data.reply_variable || "");
        setSelectedGateway(data.data.payment_gateway)
        setUnitQuantity(data.data.quantity)
        setWebHookUrl(data.data.reply_webhook_url)
        setSuccessUrl(data.data.success_url)
        setFailureUrl(data.data.failure_url)

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
              Create Payment Link
            </h3>

            {/* Close Button */}
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Name */}
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Enter Name..."
          />
          {errors.name && (<p className="text-red-500 text-sm mb-0 mt-1 mb-0">{errors.name}</p>)}

          {/* Payment Gateway */}
          <label className="block text-sm font-medium mt-3">Payment Gateway</label>
          <select className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            value={selectedGateway}
            onChange={handleGatewayChange}

          >
            <option value="" disabled>
              Select Payment Gateway
            </option>
            <option value="razerpay">Razer Pay</option>
            {/* Add more gateways as needed */}
          </select>

          {/* Product Name */}
          <label className="block text-sm font-medium mt-3">Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleProductNameChange}
            placeholder="Enter Product Name..."
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
          />
          {errors.productName && (<p className="text-red-500 text-sm mb-0 mt-1">{errors.productName}</p>)}

          {/* Unit Amount */}
          <label className="block text-sm font-medium mt-3">Unit Amount</label>
          <input
            type="number"
            name="unitAmount"
            value={formData.unitAmount}
            onChange={handleUnitAmountChange}
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            placeholder="Please Enter Unit Amount (₹)"
          />
          {errors.unitAmount && (<p className="text-red-500 text-sm mt-1 mb-0">{errors.unitAmount}</p>)}
          {/* Unit Quantity */}
          <label className="block text-sm font-medium mt-3">Unit Quantity</label>
          <input
            type="number"
            value={unitQuantity}
            onChange={handleQuantityChange}
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
          />
          <label className="text-red-500 mt-1">
            {`Note : If you Provide any variable for quantity in previous bot, 
            Kindly enter that variable name inside {{}}. Else ignore this.`}
          </label>

          {/* Success URL */}
          <label className="block text-sm font-medium mt-3">Success URL</label>
          <input
            type="text"
            value={successUrl}
            onChange={handleSuccessUrlChange}
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
          />

          {/* Failure URL */}
          <label className="block text-sm font-medium mt-3">Failure URL</label>
          <input
            type="text"
            value={failureUrl}
            onChange={handleFailureUrlChange}
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
          />

          {/* Reply Message Section */}
          <div className="w-full mx-auto mt-8">
            <div className="border border-gray-200 shadow-sm rounded-lg bg-white p-4">
              <div className="inline-block -mt-7 mb-2 bg-white text-sm text-blue-600 font-medium">
                Reply Message
              </div>

              <label className="block text-gray-700 text-sm mb-2">
                Reply Message After Payment Success
              </label>

              <textarea
                ref={textareaRef}
                maxLength={1000}
                rows={4}
                placeholder="Type your reply message..."
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-3"
                value={formData.reply}
                name="reply"
                onChange={(e) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({ ...prev, [name]: value }));
                  setErrors((prev) => ({ ...prev, [name]: "" }));
                  if (selectedNode) {
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, replyMessage: value } }
                          : node
                      )
                    );
                  }
                }}
              ></textarea>
              {errors.reply && (<p className="text-red-500 text-sm mb-0 mt-[-10px]">{errors.reply}</p>)}

              <div className=" p-4 bg-blue-50 rounded-lg border border-blue-200 mt-2">
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
            </div>

          </div>
          <label className="block text-sm font-medium mt-3">Webook URL:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            onChange={handleWebhookUrlChange}
            value={webHookUrl}
            name="url"
            placeholder="Enter URL..."
          />

          {errors.url && (
            <p className="text-red-500 text-sm mb-2">
              {errors.url}
            </p>
          )}


          <div className="mt-4">
            <button
              style={{ width: "100px", float: "right" }}
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
              onClick={(e) => {
                if (isNewNode || isFailed) {
                  submitSimpleBot(e);
                } else {
                  updatePaymentBot(e);
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