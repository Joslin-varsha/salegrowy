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

export default function BusinessHoursSidebar({
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
  const [trigenTime, setTrigenTime] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    reply: "",
    chooseFlow: "",
    url: "",
    trigenTime: ""
  });
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    url: Yup.string()
      .nullable()
      .notRequired()
      .test("valid-url", "Please enter a valid URL", (value) => {
        if (!value) return true;
        return Yup.string().url().isValidSync(value);
      }),
    trigenTime: Yup.number()
      .typeError('Reminder time must be a number')
      .positive('Reminder time must be a positive number')
      .required('Reminder time is required')
  }).test(
    'reminder-validation',
    null,
    function () {
      return true;
    }
  )
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [reminderDate, setReminderDate] = useState(null);
  const [reminderEndDate, setReminderEndDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);
  const [reminderEndTime, setReminderEndTime] = useState(null);
  const [reminderFrequency, setReminderFrequency] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedReminderType, setSelectedReminderType] = useState('fixed'); // 'fixed' or 'not_fixed'
  const [decryptedData, setDecryptedData] = useState([]);
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  const [templateId, setTemplateId] = useState(null);
  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ];

  const [businessHours, setBusinessHours] = useState(
    nodes?.data?.businessHours || {
      monday: { enabled: false, slots: [{ start: '', end: '' }] },
      tuesday: { enabled: false, slots: [{ start: '', end: '' }] },
      wednesday: { enabled: false, slots: [{ start: '', end: '' }] },
      thursday: { enabled: false, slots: [{ start: '', end: '' }] },
      friday: { enabled: false, slots: [{ start: '', end: '' }] },
      saturday: { enabled: false, slots: [{ start: '', end: '' }] },
      sunday: { enabled: false, slots: [{ start: '', end: '' }] },
    }
  );



  // Reset form when node changes
  useEffect(() => {
    // Reset all form state when nodeId changes
    const resetForm = () => {
      setFormData({
        name: "",
        reply: "",
        chooseFlow: "",
        url: "",
        trigenTime: ""
      });
      setTrigenTime("");
      setWebHookUrl("");
      setReminderDate(null);
      setReminderTime(null);
      setReminderEndTime(null);
      setReminderFrequency('');
      setSelectedDay('');
      setSelectedReminderType('fixed');
      setTemplateId(null);
      setbotReplyIdOrUid("");
      setChooseFlow("");
    };

    if (nodeId) {
      if (!isNewNode) {
        getflowstatic();
      } else {
        // For new nodes, set default values
        resetForm();
        setFormData({
          name: selectedNode?.data?.label === "businesshoursnode" ? "" : selectedNode?.data?.label || "",
          reply: selectedNode?.data?.chooseFlow || "",
          chooseFlow: selectedNode?.data?.chooseFlow || "",
          url: selectedNode?.data?.webhook_url || ""
        });
      }
    } else {
      resetForm();
    }
  }, [nodeId, isNewNode]);

  // Initial setup
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
    fetchTemplateData();
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

  }, [nodeId, isNewNode]);

  const fetchTemplateData = () => {
    const payload = {
      vendorUId: vendor_uid,
    };
    fetch(`${import.meta.env.VITE_BASE_URI}/api/templatelistflow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Template data:", data.data);
        setDecryptedData(data.data);
      })
      .catch((error) => {
        console.error("Error fetching templates:", error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'trigenTime') {
      setTrigenTime(value);
      // Clear error when user starts typing
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, trigenTime: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

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

  };

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selectedTemplate = decryptedData.find(
      (t) => t.id == selectedId || t._id == selectedId
    );
    if (!selectedTemplate) return;
    setTemplateId(selectedTemplate.id || selectedTemplate._id);

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

      if (data.status) {
        setIsFailed(false);

        // Set form data
        setFormData({
          name: data.data.name || "",
          reply: data.data.reply_text || "",
          url: data.data.reply_webhook_url || "",
          chooseFlow: data.data.flow_id || "",
          trigenTime: data.data.reminder_send_Time || ""
        });

        // Set bot reply UID and webhook URL
        setbotReplyIdOrUid(data.data._uid);
        setChooseFlow(data.data.flow_id || "");
        setWebHookUrl(data.data.reply_webhook_url || "");

        // Set reminder type
        const reminderType = data.data.reminder_type === 'fixed' ? 'fixed' : 'not_fixed';
        setSelectedReminderType(reminderType);

        // Set template ID if exists
        if (data.data.reminder_template_id) {
          setTemplateId(data.data.reminder_template_id);
        }

        // Set template ID if exists
        if (data.data.reminder_feedback_template_id) {
          setFormData(prev => ({
            ...prev,
            chooseFlow: data.data.reminder_feedback_template_id
          }));
        }

        //   Set date and time if available
        if (data.data.reminder_date) {
          setReminderDate(dayjs(data.data.reminder_date));
        }

        if (data.data.reminder_from_time) {
          const [hours, minutes] = data.data.reminder_from_time.split(':');
          const time = dayjs().hour(hours).minute(minutes);
          setReminderTime(time);
        }

        if (data.data.reminder_to_time) {
          const [hours, minutes] = data.data.reminder_to_time.split(':');
          const endTime = dayjs().hour(hours).minute(minutes);
          setReminderEndTime(endTime);
        }

        // Set frequency and day for recurring reminders
        if (reminderType === 'not_fixed' && data.data.reminder_frequency_type) {
          setReminderFrequency(data.data.reminder_frequency_type);
          if (data.data.reminder_day) {
            setSelectedDay(data.data.reminder_day);
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

  // Submit form
  const submitSimpleBot = async (e) => {
    e.preventDefault();

    try {
      // setLoading(true);
      // Build payload
      const payload = {
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        message_type: "reminder",
        name: formData.name,
        reply_text: formData.reply ?? "Thank You",
        reminder_type: selectedReminderType === "fixed" ? "fixed" : "frequent", // 'fixed' or 'frequent'
        date: reminderDate ? reminderDate.format('YYYY-MM-DD') : null,
        from_time: reminderTime ? reminderTime.format('HH:mm') : null,
        to_time: reminderEndTime ? reminderEndTime.format('HH:mm') : null,
        frequency_type: selectedReminderType === 'not_fixed' ? reminderFrequency : null,
        day: selectedReminderType === 'not_fixed' ? selectedDay : null,
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: "0",
        node_id: nodeId,
        templateId: templateId || null,
        flowTemplateId: formData.chooseFlow || null,
        reminder_send_Time: trigenTime || 0,
        reminder_end_date: reminderFrequency === "daily" ? reminderEndDate ? reminderEndDate.format('YYYY-MM-DD') : null : null,
      };

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
        message_type: "reminder",
        name: formData.name,
        reply_text: formData.reply ?? "Thank You",
        reminder_type: selectedReminderType === "fixed" ? "fixed" : "frequent",
        date: reminderDate ? reminderDate.format('YYYY-MM-DD') : null,
        from_time: reminderTime ? reminderTime.format('HH:mm') : null,
        to_time: reminderEndTime ? reminderEndTime.format('HH:mm') : null,
        frequency_type: selectedReminderType === 'not_fixed' ? reminderFrequency : null,
        day: selectedReminderType === 'not_fixed' ? selectedDay : null,
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: "0",
        node_id: nodeId,
        templateId: templateId || null,
        flowTemplateId: formData.chooseFlow || null,
        trigger_type: "is",
        reply_trigger: "is",
        normalMessage: formData.message,
        reminder_send_Time: trigenTime || null,
        reminder_end_date: reminderFrequency === "daily" ? reminderEndDate ? reminderEndDate.format('YYYY-MM-DD') : null : null,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/updateBotReply`,
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
  const handleTimeChange = (day, slotIndex, field, timeString) => {
    setBusinessHours(prev => {
      const updatedSlots = [...prev[day].slots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        [field]: timeString
      };

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots
        }
      };
    });
  };


  const toggleDay = (day) => {
    setBusinessHours(prev => {
      const currentState = prev[day]?.enabled ?? true; // Default to true if undefined
      return {
        ...prev,
        [day]: {
          ...prev[day],
          enabled: !currentState
        }
      };
    });
  };

  const addTimeSlot = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: '', end: '' }]
      }
    }));
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
              Business Hours
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
            <label className="block text-sm font-medium">Closed Message</label>
            <textarea
              name="reply"
              rows="3"
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y transition"
              value={formData.reply || ''}
              onChange={handleInputChange}
              placeholder="Enter your reply text here..."
            />
            <p className="mt-1 text-xs text-gray-500">Shown when business is closed</p>
          </div>

          {daysOfWeek.map((day) => (
            <div
              key={day.id}
              className={`p-3 border rounded ${businessHours[day.id]?.enabled ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={businessHours[day.id]?.enabled ?? true}
                      onChange={() => toggleDay(day.id)}
                      className="sr-only"
                    />
                    <div className={`block w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${businessHours[day.id]?.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${businessHours[day.id]?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{day.label}</span>
                </label>

                {businessHours[day.id].enabled && (
                  <button
                    onClick={() => addTimeSlot(day.id)}
                    className="text-xs px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"
                  >
                    Add Time Slot
                  </button>
                )}
              </div>

              {businessHours[day.id].enabled && (
                <div className="mt-2 space-y-2">
                  {businessHours[day.id].slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 pl-8">

                      <TimePicker
                        className="w-full"
                        value={slot.start ? dayjs(slot.start, 'HH:mm') : null}
                        onChange={(time) => handleTimeChange(day.id, index, 'start', time)}
                        format="HH:mm"
                        use12Hours={false}
                        placeholder="Select time (24h)"
                        suffixIcon={<Clock className="w-4 h-4 text-gray-400" />}
                      />
                      <TimePicker
                        className="w-full"
                        value={slot.end ? dayjs(slot.end, 'HH:mm') : null}
                        onChange={(time) => handleTimeChange(day.id, index, 'end', time)}
                        format="HH:mm"
                        use12Hours={false}
                        placeholder="Select time (24h)"
                        suffixIcon={<Clock className="w-4 h-4 text-gray-400" />}
                      />
                      {/* {businessHours[day.id].slots.length > 1 && (
                        <button 
                          onClick={() => removeTimeSlot(day.id, index)}
                          className="text-red-500 hover:text-red-700 p-1 -mr-1"
                          aria-label="Remove time slot"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )} */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
