"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, Edit, Save } from "lucide-react";
import * as Yup from "yup";
import { useReactFlow } from "reactflow";
import axios from "axios";
import { Spin, Modal } from "antd";

export default function TextMediaSidebar({
  nodeName,
  setNodeName,
  nodeId,
  nodeImage,
  setNodeImage,
  nodeVideo,
  setNodeVideo,
  nodeFile,
  setNodeFile,
  nodeAudio,
  setNodeAudio,
  selectedNode,
  setSelectedElements,
  setNodeBotId,
  isNewNode,
  reactFlowInstance,
  edges,
  nodes,
  flowKey,
  setNodeCaption,
  nodeCaption,
  webHookUrl,
  setWebHookUrl
}) {


  const inputRef = useRef(null);
  const [selectedType, setSelectedType] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [urlValid, setUrlValid] = useState(null);

  const [errors, setErrors] = useState({});
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  // Validation schema
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    selectedType: Yup.string().required("File type is required"),
    uploadFileName: Yup.string().required("A file must be uploaded"),
    url: Yup.string()
      .nullable()
      .notRequired()
      .test("valid-url", "Please enter a valid URL", (value) => {
        if (!value) return true; // empty → allowed
        return Yup.string().url().isValidSync(value); // if value exists → must be valid URL
      })
  });
  const { setNodes } = useReactFlow();
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(false);
    }
    getReplayVariable();
    if (!isNewNode && nodeId) {
      getandviewbot();
    }

    if (!selectedNode?.data) return;
    const data = selectedNode.data;
    console.log("selectedNode", selectedNode);

    setNodeName(data.label === "textmedianode" ? "" : data.label ?? "");
    setWebHookUrl(data.webhook_url ?? "");
    setNodeCaption(data.captions ?? "");
    console.log(data.imageurl);
    if (data.imageurl) { setNodeImage(data.imageurl); setSelectedType("image"); setUploadFileName(data.imageurl); }
    else if (data.videourl) { setNodeVideo(data.videourl); setSelectedType("video"); setUploadFileName(data.videourl); }
    else if (data.audiourl) { setNodeAudio(data.audiourl); setSelectedType("audio"); setUploadFileName(data.audiourl); }
    else if (data.fileurl) { setNodeFile(data.fileurl); setSelectedType("document"); setUploadFileName(data.fileurl); }

    if (data.select_type === "image") { setSelectedType("image"); }
    else if (data.select_type === "audio") { setSelectedType("audio"); }
    else if (data.select_type === "video") { setSelectedType("video"); }
    else if (data.select_type === "document") { setSelectedType("document"); }

  }, [nodeId, isNewNode]);

  useEffect(() => {
    updateNode({});
  }, [selectedType, uploadFileName]);

  const updateNode = (updates) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? {
            ...n,
            data: {
              ...n.data,
              label: nodeName,
              select_type: selectedType,
              imageurl: nodeImage || "",
              videourl: nodeVideo || "",
              audiourl: nodeAudio || "",
              fileurl: nodeFile || "",
            },
          }
          : n
      )
    );
  };

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
  const getandviewbot = async () => {
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
        setNodeName(data.data.name);
        setWebHookUrl(data.data.reply_webhook_url)
        setbotReplyIdOrUid(data.data._uid);
        // sdataetStatus("edit");
        if (data.data.__data) {
          try {
            setIsFailed(false)
            const parsed = JSON.parse(data.data.__data);
            const media = parsed.media_message || {};

            //  If media_link is available, set image/video/audio accordingly
            resetOtherMedia(media.header_type);
            if (media.media_link) {
              if (media.header_type === "image") {
                setNodeImage(media.media_link);
                setSelectedType("image");
              } else if (media.header_type === "video") {
                setNodeVideo(media.media_link);
                setSelectedType("video");
              } else if (media.header_type === "audio") {
                setNodeAudio(media.media_link);
                setSelectedType("audio");
              } else if (media.header_type === "document") {
                setNodeFile(media.media_link);
                setSelectedType("document");
              }
            }
            let parsedData = {};
            try {
              parsedData = JSON.parse(data.data.__data || "{}");
            } catch (e) {
              console.error("Error parsing __data:", e);
            }

            const mediaLink = parsedData.media_message.media_link || {};
            const header_type = parsedData.media_message.header_type || {};

            if (header_type === "text") { setSelectedType("text"); }
            else if (header_type === "image") { setSelectedType("image"); setNodeImage(mediaLink) }
            else if (header_type === "video") { setSelectedType("video"); setNodeVideo(mediaLink) }
            else if (header_type === "document") { setSelectedType("document"); setNodeFile(mediaLink) }
            else if (header_type === "") { setSelectedType(""); }
            console.log("mediaLink", mediaLink);

            // Set caption if available
            if (media.caption) {
              setNodeCaption(media.caption);
            }

          } catch (error) {

            console.error("Error parsing __data:", error);
          }
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

  const resetOtherMedia = (type) => {
    if (type !== "image") setNodeImage("");
    if (type !== "video") setNodeVideo("");
    if (type !== "audio") setNodeAudio("");
    if (type !== "document") setNodeFile("");
  };

  // File Handlers
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    resetOtherMedia(type);
    setUploadFileName(file)
    handleFileUpload(file, type);
  };

  // Handle URL input and validate
  const handleUrlChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setWebHookUrl(e.target.value);

  };

  const handleFileUpload = async (file, type) => {
    if (!file) {
      Modal.error({
        title: "Error",
        content: `Please select a ${type} before uploading.`,
        centered: true,
        okText: "OK",
        okButtonProps: {
          className: "no-btn-hover-red"
        }
      });
      return;
    }

    let uploadfile = "";
    switch (type) {
      case "image":
        uploadfile = "whatsapp_image";
        break;
      case "video":
        uploadfile = "whatsapp_video";
        break;
      case "audio":
        uploadfile = "whatsapp_audio";
        break;
      case "document":
        uploadfile = "whatsapp_document";
        break;
      default:
        return;
    }

    const formData = new FormData();
    formData.append("filepond", file);
    formData.append("vendorId", vendor_uid);
    formData.append("uploadfile", uploadfile);

    try {
      const response = await fetch(`https://dev.salegrowybox.com/api/uploadTempMedia`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Modal.error({
          title: "Error",
          content: data.message || `${type} upload failed.`,
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      if (data.success) {
        // Modal.success({
        //   title: "Success",
        //   content: `${type} uploaded successfully!`,
        //   centered: true,
        //   okText: "OK",
        //   okButtonProps: {
        //     className: "ok-btn-hover-green"
        //   }
        // });
        const url = data.url;
        const filename = url.split("/").pop();

        setErrors((prev) => ({ ...prev, uploadFileName: "" }));
        // setMediaUrl(url);
        //updateNode({ [type]: url });
        // Update node states with URL
        switch (type) {
          case "image":
            setNodeImage(url);
            setNodeAudio("");
            setNodeVideo("");
            setNodeFile("")
            break;
          case "video":
            setNodeVideo(url);
            setNodeAudio("");
            setNodeFile("");
            setNodeImage("")
            break;
          case "audio":
            setNodeAudio(url);
            setNodeImage("");
            setNodeFile("");
            setNodeVideo("")
            break;
          case "document":
            setNodeFile(url); // Store URL instead of file object
            setNodeAudio("");
            setNodeImage("");
            setNodeVideo("")
            break;
        }
        console.log(url);
        setUploadFileName(filename);

      } else {

        Modal.error({
          title: "Error",
          content: `Something went wrong while uploading ${type}.`,
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (error) {
      console.error(`${type} upload error:`, error);
      Modal.error({
        title: "Error",
        content: `Error uploading ${type}.`,
        centered: true,
        okText: "OK",
        okButtonProps: {
          className: "no-btn-hover-red"
        }
      });
    }
  };

  //update ex

  const submitSimpleBot = async (e) => {

    e.preventDefault();
    const formData = {
      name: nodeName,
      selectedType,
      uploadFileName,
      url: webHookUrl
    };

    try {
      setLoading(true);
      await schema.validate(formData, { abortEarly: false });
      const payload = {
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        message_type: "media",
        name: nodeName,
        media_header_type: selectedType,
        uploaded_media_file_name: uploadFileName,
        media_file_url: selectedType === "document" ? nodeFile : (selectedType === "image" ? nodeImage : selectedType === "video" ? nodeVideo : nodeAudio),
        caption: nodeCaption,
        replyWebhookUrl: webHookUrl,
        node_id: nodeId,
      };

      const response = await fetch(`https://dev.salegrowybox.com/api/storeBotReply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
                  isAdded: false,
                  imageurl: nodeImage || "",
                  videourl: nodeVideo || "",
                  audiourl: nodeAudio || "",
                  fileurl: nodeFile || "",
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
          content: data.message || "Something Went Wrong",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (error) {
      setLoading(false);
      if (error.name === "ValidationError") {
        const newErrors = {};
        error.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Error sending trigger:", error);
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

  // update node
  const updateMediaBot = async (e) => {
    e.preventDefault();

    const formData = {
      name: nodeName,
      selectedType,
      uploadFileName,
    };


    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        node_id: nodeId,
        name: nodeName,
        message_type: "media",
        media_header_type: selectedType,
        uploaded_media_file_name: uploadFileName,
        media_file_url: selectedType === "document" ? nodeFile : (selectedType === "image" ? nodeImage : selectedType === "video" ? nodeVideo : nodeAudio),
        caption: nodeCaption,
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
          content: data.message || "Something went wrong while updating.",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });

      }
    } catch (error) {
      setLoading(false);
      if (error.name === "ValidationError") {
        const newErrors = {};
        error.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);

      } else {

        console.error("Something went wrong. Please try again later.");
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

  const insertAtCursor = (text) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const insertText = `{${text}}`;

    const newText =
      nodeCaption.slice(0, start) + insertText + nodeCaption.slice(end);

    setNodeCaption(newText);
    updateNode({});
    // Restore cursor position correctly
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + insertText.length;
      input.focus();
    }, 0);
  };

  return (
    <>
      {selectedNode && (
        <aside
          className={`border-r p-5 text-sm w-[30vw] h-screen shadow-md transition-all duration-300 flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}>
          <div className="relative flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 pr-8">

              Media Bot Reply
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}>
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">

            <label className="block text-sm font-medium py-0">Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              value={nodeName === "textmedianode" ? "" : nodeName ?? ""}
              onChange={(e) => {
                setNodeName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
                updateNode({});
              }}
              placeholder="Enter Name..."
            />
            {errors.name && (<p className="text-red-500 text-sm mb-0 mt-1">{errors.name}</p>)}

            <label className="block text-sm font-medium mt-3">
              Select File Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              value={selectedType}
              onChange={(e) => {
                const type = e.target.value;
                resetOtherMedia(type);
                setSelectedType(type);

                setErrors((prev) => ({
                  ...prev,
                  selectedType: ""
                }));

                updateNode({});
              }}
            >
              <option value="">Select Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
            </select>

            {errors.selectedType && (<p className="text-red-500 text-sm mt-1">{errors.selectedType}</p>)}

            {selectedType === "image" && (
              <div>
                <label className="block text-sm font-medium mt-3">Upload Image:</label>
                <input
                  type="file"
                  accept="image/*"

                  className="w-full mt-1 p-2 border border-blue-300 rounded"
                  onChange={(e) => handleFileChange(e, "image")}
                />
                {errors.uploadFileName && (<p className="text-red-500 text-sm mt-2">{errors.uploadFileName}</p>)}
                {nodeImage && (
                  <img
                    src={nodeImage}
                    alt="Uploaded"
                    className="aspect-square object-cover rounded-md mt-2 mx-auto h-[200px]"
                  />
                )}

                <label className="block text-sm font-medium mt-2">Caption/Text</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={nodeCaption}
                  name="captions"
                  onChange={(e) => {
                    setNodeCaption(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                />
                <div className=" p-4 bg-blue-50 rounded-lg  border border-blue-200 mt-3">
                  <p className="text-xs text-gray-700 mb-3">You can use the following dynamic variables for reply text, which
                    will be replaced with the contact’s data.</p>
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
            )}

            {selectedType === "video" && (
              <div>
                <label className="block mt-3 text-sm font-medium">Upload Video:</label>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  onChange={(e) => handleFileChange(e, "video")}
                />
                {errors.uploadFileName && (<p className="text-red-500 text-sm mt-2">{errors.uploadFileName}</p>)}
                <label className="block text-sm font-medium mt-2">Caption/Text</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={nodeCaption}
                  name="captions"
                  onChange={(e) => {
                    setNodeCaption(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                />
                <div className=" p-4 bg-blue-50 rounded-lg border border-blue-200 mt-3">
                  <p className="text-xs text-gray-700 mb-3">You can use the following dynamic variables for reply text, which
                    will be replaced with the contact’s data.</p>
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
                {nodeVideo && (
                  <video controls className="w-full h-24 mt-2">
                    <source src={nodeVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            {selectedType === "audio" && (
              <div>
                <label className="block mt-3 text-sm font-medium">Upload Audio:</label>
                <input
                  type="file"
                  accept="audio/*"
                  className="w-full p-2 border border-gray-300 mt-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  onChange={(e) => handleFileChange(e, "audio")}
                />
                {errors.uploadFileName && (<p className="text-red-500 mt-2 text-sm">{errors.uploadFileName}</p>)}

                {nodeAudio && (
                  <audio controls className="w-full h-24 mt-2">
                    <source src={nodeAudio} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                )}
              </div>
            )}
            {selectedType === "document" && (
              <div>
                <label className="block mt-3 text-sm font-medium">Upload Document:</label>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  onChange={(e) => handleFileChange(e, "document")}
                />
                {errors.uploadFileName && (<p className="text-red-500 text-sm mt-2">{errors.uploadFileName}</p>)}

                <label className="block text-sm font-medium mt-2">Caption/Text</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={nodeCaption}
                  name="captions"
                  onChange={(e) => {
                    setNodeCaption(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                />
                <div className=" p-4 bg-blue-50 rounded-lg border border-blue-200 mt-3">
                  <p className="text-xs text-gray-700 mb-3">You can use the following dynamic variables for reply text, which
                    will be replaced with the contact’s data.</p>
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

                {/* {nodeFile && (
                  <>
                    <button
                      onClick={() => handleFileUpload(uploadFileName, "document")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2">
                      Upload File
                    </button>
                    {uploadFileName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected file: {uploadFileName}
                    </p>
                  )}
                  </>
                )} */}
              </div>
            )}

            <label className="block text-sm font-medium mt-3">Webhook URL:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
              onChange={(e) => {
                setWebHookUrl(e.target.value);
              }}
              name="url"
              value={webHookUrl}
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
                    updateMediaBot(e);
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