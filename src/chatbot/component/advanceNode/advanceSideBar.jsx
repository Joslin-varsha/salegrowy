"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, Edit } from "lucide-react";
import { useReactFlow } from "reactflow";
import * as Yup from "yup";
import axios from "axios";
import { Spin, Modal } from "antd";

export default function AdvanceSideBar({
  dataUserId,
  nodeName,
  setNodeName,
  nodeId,
  nodeImage,
  nodeVideo,
  nodeFile,
  nodeCta,
  setNodeButtons,
  nodeButtons,
  nodeButton1,
  nodeButton2,
  nodeButton3,
  nodeFooter1,
  nodeFooter2,
  nodeFooter3,
  nodeCtaButton,
  setNodeImage,
  setNodeVideo,
  setNodeFile,
  nodeLink,
  setNodeLink,
  setNodeCta,
  setNodeCtaButton,
  setNodeButton1,
  setNodeButton2,
  setNodeButton3,
  setNodeFooter1,
  setNodeFooter2,
  setNodeFooter3,
  setNodeOption,
  selectedNode,
  setSelectedElements,
  isNewNode,
  reactFlowInstance,
  edges,
  nodes,
  flowKey,
  webHookUrl,
  setWebHookUrl,
  footerText,
  setFooterText
}) {

  const [selectedType, setSelectedType] = useState("");
  const [headerText, setHeaderText] = useState("");
  const textareaRef = useRef(null);
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const [uploadFileName, setUploadfileName] = useState("");
  const [listButtonText, setListButtonText] = useState("");
  const [buttonType, setButtonType] = useState("reply");
  const [sections, setSections] = useState([]);
  const [sectionData, setSectionData] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [listButton1, setListButton1] = useState("");
  const [listButton2, setListButton2] = useState("");
  const [listButton3, setListButton3] = useState("");
  const [listButton, setListButton] = useState("");
  const [keys, setKeys] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const [selectedField, setSelectedField] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [newValue, setNewValue] = useState("");


  const [errors, setErrors] = useState({});
  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');

  const isNoneHeader = selectedType === "";
  const canUseListMessage = isNoneHeader || selectedType === "text";


  const { setNodes, getNode } = useReactFlow();


  useEffect(() => {
    getReplayVariable();
    if (!selectedNode) return;

    const data = selectedNode.data;
    setSelectedType("");
    setSelectedField("");
    setNodeName(data.label === "advancenode" ? "" : data.label ?? "");
    setWebHookUrl(data.webhook_url ?? "");
    setReplyMessage(data?.replyMessage ?? "");
    setNodeButton1(data?.button1 ?? "");
    setNodeButton2(data?.button2 ?? "");
    setNodeButton3(data?.button3 ?? "");
    setButtonType(data?.buttonType ?? "reply");
    setNodeCtaButton(data?.nodeCtaButton ?? "");
    setNodeCta(data?.nodeCta ?? "");
    setFooterText(data?.footer_text ?? "");
    setListButtonText(data?.listButtonText ?? "");
    setSections(data?.sections ?? [])


    if (data.selectType === "text") { setSelectedType("text"); }
    else if (data.selectType === "image") { setSelectedType("image"); }
    else if (data.selectType === "video") { setSelectedType("video"); }
    else if (data.selectType === "document") { setSelectedType("document"); }
    else if (data.selectType === "") { setSelectedType(""); }


    if (data.imageurl) { setNodeImage(data.imageurl); setSelectedType("image"); setUploadfileName(data.imageurl); }
    else if (data.videourl) { setNodeVideo(data.videourl); setSelectedType("video"); setUploadfileName(data.videourl); }
    else if (data.fileurl) { setNodeFile(data.fileurl); setSelectedType("document"); setUploadfileName(data.fileurl); }

    // if (data.image) { setNodeImage(data.image); setUploadfileName(data.image); }
    // else if (data.video) { setNodeVideo(data.video); setUploadfileName(data.video); }
    // else if (data.text) { setHeaderText(data.text);setUploadfileName(""); }
    // else if (data.file) { setNodeFile(data.file);  setUploadfileName(data.file); }

    if (!isNewNode && nodeId) {
      getadvancednode();
    }
  }, [selectedNode, isNewNode]);

  useEffect(() => {
    updateNode1({});
  }, [selectedType, headerText, nodeButton1, nodeButton2, nodeButton3, buttonType, nodeCtaButton, nodeCta, listButtonText, sections, uploadFileName, footerText]);


  const updateNode1 = (updates) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
            ...n,
            data: {
              ...n.data,
              label: nodeName,
              selectType: selectedType,
              text: headerText ?? "",
              button1: nodeButton1 ?? "",
              button2: nodeButton2 ?? "",
              button3: nodeButton3 ?? "",
              buttonType: buttonType ?? "",
              video: updates.video ?? "",
              image: updates.image ?? "",
              file: updates.file ?? "",
              nodeCtaButton: nodeCtaButton ?? "",
              nodeCta: nodeCta ?? "",
              listButtonText: listButtonText ?? "",
              section: sections ?? [],
              imageurl: nodeImage || "",
              videourl: nodeVideo || "",
              fileurl: nodeFile || "",
              footer_text: footerText
            },
          }
          : n
      )
    );
  };

  const handleFieldSelect = (e) => {
    const { name, value } = e.target;
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


  const getReplayVariable = async () => {
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URI}/api/getReplyVariable`,
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

  const handleFileUpload = async (file, type) => {
    console.log(type);
    var uploadfile = "";

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
    if (type === "image") {
      uploadfile = "whatsapp_image";
    } else if (type === "video") {
      uploadfile = "whatsapp_video";
    } else if (type === "audio") {
      uploadfile = "whatsapp_audio";
    } else {
      uploadfile = "whatsapp_document";
    }
    //const vendor__uid = localStorage.getItem("vendor_uid");
    //const vendor__uid = "537478f9-a51f-4250-9c42-3e1a40a263fd";
    const formData = new FormData();
    formData.append("filepond", file); // actual file object
    formData.append("vendorId", vendor_uid);
    formData.append("uploadfile", uploadfile);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/uploadTempMedia`, {
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

      if (data.success === true) {
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
        setUploadfileName(filename)
        // updateNodeMedia({ [type]: url });

        console.log("type", type);
        switch (type) {
          case "image":
            setNodeImage(url);
            setNodeVideo("");
            setNodeFile("")
            break;
          case "video":
            setNodeVideo(url);
            setNodeFile("");
            setNodeImage("")
            break;
          case "document":
            setNodeFile(url); // Store URL instead of file object
            setNodeImage("");
            setNodeVideo("")
            break;
        }
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

  const getValidationSchema = () => {
    let schema = Yup.object().shape({
      nodeName: Yup.string().required("Name is required"),
      replyMessage: Yup.string().required("Reply Message is required"),
      url: Yup.string()
        .nullable()
        .notRequired()
        .test("valid-url", "Please enter a valid URL", (value) => {
          if (!value) return true; // empty → allowed
          return Yup.string().url().isValidSync(value); // if value exists → must be valid URL
        })
    });

    if (["image", "video", "audio", "file"].includes(selectedType)) {
      schema = schema.shape({
        uploadFileName: Yup.string().required("File upload is required for media headers"),
      });
    }

    if (buttonType === "reply") {
      schema = schema.shape({
        nodeButton1: Yup.string().when([], {
          is: () => !nodeButton2 && !nodeButton3,
          then: (s) => s.required("At least one reply button is required"),
          otherwise: (s) => s.optional(),
        }),
        nodeButton2: Yup.string().optional(),
        nodeButton3: Yup.string().optional(),
      });
    } else if (buttonType === "cta") {
      schema = schema.shape({
        nodeCtaButton: Yup.string().required("CTA Button Display Text is required"),
        nodeCta: Yup.string().required("CTA Button URL is required"),
      });
    } else if (buttonType === "list") {
      schema = schema.shape({
        listButtonText: Yup.string()
          .required("List Button Label is required"),

        sections: Yup.array()
          .of(
            Yup.object().shape({
              title: Yup.string()
                .required("Section title is required")
                .max(25, "Section title must be at most 25 characters"),

              rows: Yup.array()
                .min(1, "At least one row is required per section")
                .of(
                  Yup.object().shape({
                    rowId: Yup.string()
                      .required("Row ID is required")
                      .matches(/^[0-9]+$/, "Row ID must contain only numbers"),
                    rowTitle: Yup.string()
                      .required("Row Title is required"),
                    rowDescription: Yup.string().optional(),
                  })
                ),
            })
          )
          .min(1, "At least one section is required"),
      });
      // schema = schema.shape({
      //   listButtonText: Yup.string().required("List Button Label is required"),
      //   sections: Yup.array()
      //     .of(
      //       Yup.object().shape({
      //         title: Yup.string().required("Section title is required"),
      //         rows: Yup.array()
      //           .min(1, "At least one row is required per section")
      //           .of(
      //             Yup.object().shape({
      //               rowId: Yup.string().required("Row ID is required"),
      //               rowTitle: Yup.string().required("Row Title is required"),
      //               rowDescription: Yup.string().optional(),
      //             })
      //           ),
      //       })
      //     )
      //     .min(1, "At least one section is required"),
      // });
    }

    return schema;
  };

  const submitInterativeBot = async () => {
    console.log(nodeId);
    const formData = {
      nodeName,
      replyMessage,
      selectedType,
      uploadFileName: ["image", "video", "audio", "file"].includes(selectedType) ? uploadFileName : undefined,
      nodeButton1,
      nodeButton2,
      nodeButton3,
      nodeCtaButton,
      nodeCta,
      listButtonText,
      sections,
      url: webHookUrl,
      selectVariable: selectedField

    };

    try {
      await getValidationSchema().validate(formData, { abortEarly: false });

      setErrors({});

      const output = sections.map(section => ({
        title: section.title,
        id: section.id,
        rows: section.rows.map(row => ({
          id: row.id,
          row_id: row.rowId,
          title: row.rowTitle,
          description: row.rowDescription
        }))
      }));

      const totalRows = sections.reduce((count, section) => {
        return count + section.rows.length;
      }, 0);

      const sectionCount = sections.length;

      if (sectionCount > 10) {
        Modal.error({
          title: "Error",
          content: "Maximum 10 sections allowed!",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      if (totalRows > 8) {
        Modal.error({
          title: "Error",
          content: "Maximum 8 rows allowed!",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      setSectionData(output);
      console.log(output);
      const buttonData = {
        "1": nodeButton1,
        "2": nodeButton2,
        "3": nodeButton3,
      };

      console.log(buttonType);
      let interactiveType = "";
      if (buttonType === "reply") {
        interactiveType = "button";
        setNodeCtaButton("");
        setNodeCta("");
      } else if (buttonType === "cta") {
        interactiveType = "cta_url";
      } else if (buttonType === "list") {
        interactiveType = "list";
        setNodeCtaButton("");
        setNodeCta("");
      } else {
        interactiveType = "button";
        setNodeCtaButton("");
        setNodeCta("");
      }
      setLoading(true);
      const payload = {
        vendor_uid: vendor_uid,
        message_type: "interactive",
        botflow_uid: bot_flow_uid,
        name: nodeName,
        reply_text: replyMessage,
        header_type: selectedType,
        header_text: headerText,
        replyWebhookUrl: webHookUrl,
        uploaded_media_file_name: uploadFileName,
        validate_bot_reply: "0",
        list_button_text: listButtonText,
        interactive_type: interactiveType,
        sections: buttonType === "reply" ? "" : JSON.stringify(output),
        buttons: buttonData,
        button_url: nodeCta,
        button_display_text: nodeCtaButton,
        node_id: nodeId,
        footer_text: footerText,
        select_variable: selectedField,
        new_variable_value: selectedField === "create_new" ? newValue : "",
      };

      const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/storeBotReply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.errors?.name || data.message || "Failed to save",
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
    } catch (err) {
      setLoading(false);
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
        console.error("Error sending trigger:", newErrors);
      } else {
        console.error("Error sending trigger:", err);
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

  const updateNode = (newData) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  };

  const updateNodeMedia = (newData) => {
    if (!selectedNode) return;

    const type = Object.keys(newData)[0];   // key (image / video / audio / document)
    const value = newData[type];
    if (type === "image") {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
              ...n,
              data: {
                ...n.data,
                image: value ?? "",
                video: "",
                file: "",
              },
            }
            : n
        )
      );

    } else if (type === "video") {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
              ...n,
              data: {
                ...n.data,
                image: "",
                video: value ?? "",
                file: "",
              },
            }
            : n
        )
      );

    } else if (type === "file") {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
              ...n,
              data: {
                ...n.data,
                image: "",
                video: "",
                file: value ?? "",
              },
            }
            : n
        )
      );
    }
  };

  const handleInputChange = (event, field) => {
    const value = event.target.value;

    switch (field) {
      case "name":
        setNodeName(value);
        updateNode({ label: value });
        break;

      case "replyText":
        setReplyText(value);
        updateNode({ replyMessage: value });
        break;

      case "button1":
        setNodeButton1(value);
        updateNode({ button1: value, type: "reply" });
        break;

      case "button2":
        setNodeButton2(value);
        updateNode({ button2: value, type: "reply" });
        break;

      case "button3":
        setNodeButton3(value);
        updateNode({ button3: value, type: "reply" });
        break;

      case "ctabutton":
        setNodeCtaButton(value);
        updateNode({ buttonType: "cta", ctaButtonText: value, ctaUrl: nodeCta });
        break;

      case "cta":
        setNodeCta(value);
        updateNode({ buttonType: "cta", ctaButtonText: nodeCtaButton, ctaUrl: value });
        break;

      case "listButton1":
        setListButton1(value);
        break;

      case "listButton2":
        setListButton2(value);
        break;

      case "listButton3":
        setListButton3(value);
        break;

      default:
        break;
    }

    // updateNodeData();
  };


  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      switch (type) {
        case "image":
          setNodeImage(url);
          handleFileUpload(file, "image");
          break;
        case "video":
          setNodeVideo(url);
          handleFileUpload(file, "video");
          break;
        case "document":
          setNodeFile(url);
          handleFileUpload(file, "file");
          break;
        default:
          break;
      }

    }
  };

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  const handleAddSection = () => {
    const newSection = { id: Date.now(), title: "", rows: [] };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    //updateNodeData(updatedSections);
  };

  const handleRemoveSection = (sectionId) => {
    const updatedSections = sections.filter((section) => section.id !== sectionId);
    setSections(updatedSections);
    // updateNodeData(updatedSections);
    updateNode({ sections: updatedSections });
  };

  const handleSectionTitleChange = (sectionId, value) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: value } : s))
    );
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, title: value } : s
    );
    updateNode({ sections: updated });
  };

  const handleAddRow = (sectionId) => {
    const totalRows = sections.reduce((count, section) => count + section.rows.length, 0);

    if (totalRows >= 8) {
      Modal.error({
        title: "Error",
        content: "Maximum 8 rows allowed!",
        centered: true,
        okText: "OK",
        okButtonProps: {
          className: "no-btn-hover-red"
        }
      });
      return;
    }

    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? {
          ...section,
          rows: [
            ...section.rows,
            { id: Date.now(), rowId: "", rowTitle: "", rowDescription: "" },
          ],
        }
        : section
    );
    setSections(updatedSections);
    // updateNodeData(updatedSections);
  };

  const handleRemoveRow = (sectionId, rowId) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, rows: section.rows.filter((row) => row.id !== rowId) }
        : section
    );
    setSections(updatedSections);
    // updateNodeData(updatedSections);
    updateNode({ sections: updatedSections });
  };

  const handleRowChange = (sectionId, rowId, field, value) => {
    const updatedSections = sections.map((s) =>
      s.id === sectionId
        ? {
          ...s,
          rows: s.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
        }
        : s
    );
    setSections(updatedSections);
    updateNode({ sections: updatedSections });
  };


  const handleListButtonChange = (e) => setListButton(e.target.value);

  // Fetch reply variables
  const getadvancednode = async () => {
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

      if (data.status && data.data) {
        setIsFailed(false);
        setbotReplyIdOrUid(data.data._uid);
        // Extract __data JSON safely
        let parsedData = {};
        try {
          parsedData = JSON.parse(data.data.__data || "{}");
        } catch (e) {
          console.error("Error parsing __data:", e);
        }

        const interaction = parsedData.interaction_message || {};
        const mediaLink = parsedData.interaction_message.media_link || {};
        const header_type = parsedData.interaction_message.header_type || {};


        if (header_type === "text") { setSelectedType("text"); }
        else if (header_type === "image") { setSelectedType("image"); setNodeImage(mediaLink) }
        else if (header_type === "video") { setSelectedType("video"); setNodeVideo(mediaLink) }
        else if (header_type === "document") { setSelectedType("document"); setNodeFile(mediaLink) }
        else if (header_type === "") { setSelectedType(""); }

        // Set default sidebar field values
        setNodeName(data.data.name || "");
        setReplyMessage(data.data.reply_text || "");
        setSelectedType(interaction.header_type || "");
        setHeaderText(interaction.header_text || "");
        setWebHookUrl(data.data.reply_webhook_url || "");
        setFooterText(data.data.footer_text || "");
        setSelectedField(data.data.reply_variable || "")
        let currentButtonType = "reply";
        if (interaction.interactive_type === "cta_url") {
          currentButtonType = "cta";
        } else if (interaction.interactive_type === "list") {
          currentButtonType = "list";

          const listData = interaction.list_data || {};
          setListButtonText(listData.button_text || "");

          const sectionsObj = listData.sections || {};
          const formattedSections = Object.values(sectionsObj).map((section) => ({
            id: section.id || Date.now() + Math.random(),
            title: section.title || "",
            rows: Object.values(section.rows || {}).map((row) => ({
              id: row.id || Date.now() + Math.random(),
              rowId: row.row_id || "",
              rowTitle: row.title || "",
              rowDescription: row.description || "",
            })),
          }));
          setSections(formattedSections);
        }

        setButtonType(currentButtonType);

        if (interaction.buttons) {
          setNodeButton1(interaction.buttons["1"] || "");
          setNodeButton2(interaction.buttons["2"] || "");
          setNodeButton3(interaction.buttons["3"] || "");
        }


        //  Update node state visually in React Flow
        updateNode({
          name: data.data.name || "",
          replyMessage: data.data.reply_text || "",
          headerType: interaction.header_type || "",
          headerText: interaction.header_text || "",
          type: currentButtonType,
        });

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

  //Update Interactive Bot Reply 

  const updateInterativeBot = async () => {
    try {
      const output = sections.map((section) => ({
        title: section.title,
        id: section.id,
        rows: section.rows.map((row) => ({
          id: row.id,
          row_id: row.rowId,
          title: row.rowTitle,
          description: row.rowDescription,
        })),
      }));

      const totalRows = sections.reduce((count, section) => {
        return count + section.rows.length;
      }, 0);

      const sectionCount = sections.length;

      if (sectionCount > 10) {
        Modal.error({
          title: "Error",
          content: "Maximum 10 sections allowed!",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      if (totalRows > 8) {
        Modal.error({
          title: "Error",
          content: "Maximum 8 rows allowed!",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      const buttonData = {
        "1": nodeButton1,
        "2": nodeButton2,
        "3": nodeButton3,
      };

      let interactiveType = "";
      if (buttonType === "reply") interactiveType = "button";
      else if (buttonType === "cta") interactiveType = "cta_url";
      else if (buttonType === "list") interactiveType = "list";
      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        botflow_uid: bot_flow_uid,
        node_id: nodeId,
        name: nodeName,
        message_type: "interactive",
        reply_text: replyMessage,
        header_type: selectedType,
        header_text: headerText,
        replyWebhookUrl: webHookUrl,
        uploaded_media_file_name: uploadFileName,
        validate_bot_reply: "0",
        list_button_text: listButtonText,
        interactive_type: interactiveType,
        sections: buttonType === "reply" ? [] : output,
        buttons: buttonData,
        button_url: nodeCta,
        button_display_text: nodeCtaButton,
        reply_trigger: "is",
        trigger_type: "is",
        footer_text: footerText,
        select_variable: selectedField,
        new_variable_value: selectedField === "create_new" ? newValue : "",
      };

      console.log("Update Payload:", payload);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URI}/api/updateBotReply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Update API Response:", data);

      if (data.success || data.status === "success") {
        onSave("edit");
      } else {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.message || "Something went wrong while updating",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating interactive bot:", error);
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

  // Insert dynamic variable
  const insertAtCursor = (item) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const insertText = `{${item}}`;
    const newText =
      replyMessage.slice(0, start) + insertText + replyMessage.slice(end);

    setReplyMessage(newText);
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

  return (
    <>
      {selectedNode ? (
        <aside
          className={`border-r p-5 text-sm p-1 max-h-screen overflow-y-auto w-[30vw] h-full min-h-screen shadow-md transition-all duration-300 flex flex-col ${isDarkMode
            ? "bg-white border-gray-700 text-gray-900"
            : "bg-white border-gray-700 text-gray-900"
            }`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold flex items-center gap-2 pr-8 ${isDarkMode ? "text-black" : ""}`}>
              Advance Node
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <label className="block text-sm font-medium py-2">Create a Message:</label>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            value={nodeName}
            onChange={(e) => handleInputChange(e, "name")}
            placeholder="Enter Name..."
          />
          {errors.nodeName && <p className="text-red-500 text-sm mb-0">{errors.nodeName}</p>}

          <div className="w-full mx-auto mt-5">
            <div className="border border-gray-200 shadow-sm rounded-lg bg-white p-4 relative">
              <div className="absolute -top-3 left-4 bg-white px-2 text-sm text-blue-600 font-medium">
                Reply Message
              </div>
              <div className="mt-3 text-gray-500 text-sm">
                <label className="block text-gray-700 text-sm mb-1">Reply Text</label>
                <textarea
                  ref={textareaRef}
                  rows={4}
                  maxLength={1000}
                  placeholder="Type your reply message..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  value={replyMessage}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReplyMessage(value);
                    if (selectedNode) updateNode({ replyMessage: value });
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, replyMessage: value } }
                          : node
                      )
                    );
                  }}>

                </textarea>

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
                {errors.replyMessage && <p className="text-red-500 text-sm mt-1">{errors.replyMessage}</p>}
                {/* Select Variable to assign */}
                <label className="block text-sm font-medium mt-4">
                  Select Variable to assign
                </label>

                <select
                  className="w-full p-2.5 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={handleFieldSelect}
                  name="selectVariable"
                  value={selectedField}
                >
                  <option value="">Select Variable</option>

                  {/* Create New option */}
                  <option value="create_new">Create New</option>

                  {/* Dynamic Variables Loaded from API */}
                  {keys.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
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

                <select
                  className="w-full p-3 mt-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  value={selectedType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedType(val);
                    if (["image", "video", "document"].includes(val) && buttonType === "list") {
                      setButtonType("reply");
                    }
                  }}>
                  <option value="">None</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
                {errors.selectedType && <p className="text-red-500 text-sm mb-2">{errors.selectedType}</p>}

                {selectedType === "text" && (
                  <div>
                    <label className="block text-sm font-medium mt-3">Header Text</label>
                    <input
                      type="text"
                      className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" c
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                    />

                    {nodeImage && (
                      <img
                        src={nodeImage}
                        alt="Uploaded"
                        width={500}
                        height={300}
                        className="w-full h-24 object-cover mt-2"
                      />
                    )}
                  </div>
                )}

                {selectedType === "image" && (
                  <div>
                    <label className="block text-sm font-medium mt-3">Upload Image:</label>
                    <input
                      type="file"
                      accept="image/*"  // fixed (was video/*)
                      className="w-full p-3 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      onChange={(e) => handleFileChange(e, "image")}
                    />
                    {errors.uploadFileName && <p className="text-red-500 text-sm">{errors.uploadFileName}</p>}
                    {nodeImage && (
                      <img
                        src={nodeImage}
                        alt="Uploaded"
                        className="aspect-square object-cover rounded-md mt-2 mx-auto h-[200px]"
                      />
                    )}
                  </div>
                )}

                {selectedType === "video" && (
                  <div>
                    <label className="block text-sm font-medium mt-3">Upload Video:</label>
                    <input
                      type="file"
                      accept="video/*"  // fixed (was audio/*)
                      className="w-full p-3 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      onChange={(e) => handleFileChange(e, "video")}
                    />
                    {errors.uploadFileName && <p className="text-red-500 text-sm">{errors.uploadFileName}</p>}
                    {nodeVideo && (
                      <video controls className="w-full h-24 mt-2">
                        <source src={nodeVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}

                {selectedType === "document" && (
                  <div>
                    <label className="block text-sm font-medium mt-3">Upload Document:</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"  //  added proper doc types
                      className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                      onChange={(e) => handleFileChange(e, "document")}
                    />
                    {errors.uploadFileName && <p className="text-red-500 text-sm">{errors.uploadFileName}</p>}
                    {nodeFile && (
                      <>
                        {/* Upload Button */}
                        {/* <button
                            onClick={handleFileUpload}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
                          >
                            Upload File
                          </button> */}

                        {/* Optional: preview link */}
                        {/* <p className="text-xs text-gray-500 mt-1">Selected file: {nodeFile.name}</p> */}
                      </>
                    )}
                  </div>
                )}


                <div className="flex space-x-6 mb-3 text-sm text-gray-700 mt-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      value="reply"
                      checked={buttonType === "reply"}
                      onChange={() => {
                        setButtonType("reply");
                        updateNode({ type: "reply" });
                      }}
                    />
                    <span>Reply Buttons</span>
                  </label>

                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="buttonType"
                      value="cta"
                      checked={buttonType === "cta"}
                      onChange={(e) => {
                        setButtonType(e.target.value);
                        updateNode({ type: "cta" });
                      }}
                    />
                    <span>CTA URL Button</span>
                  </label>

                  <label
                    className={`flex items-center space-x-1 cursor-pointer ${!canUseListMessage ? "opacity-50 pointer-events-none" : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="buttonType"
                      value="list"
                      checked={buttonType === "list"}
                      disabled={!canUseListMessage}
                      onChange={() => setButtonType("list")}
                      // onChange={(e) => {
                      //   console.log(buttonType);
                      //   if(selectedType === "text"){
                      //     buttonType === "list"
                      //     setButtonType(e.target.value);
                      //     updateNode({ type: "list" });
                      //   }else{
                      //     buttonType === buttonType
                      //   }
                      // }}
                      className="accent-blue-500 cursor-pointer"
                    />
                    <span>List Message</span>
                  </label>
                </div>

                {buttonType === "reply" && (
                  <div>

                    <div>
                      {[["Button 1", nodeButton1, "button1"], ["Button 2", nodeButton2, "button2"], ["Button 3", nodeButton3, "button3"]].map(
                        ([label, value, field]) => (
                          <div key={field}>
                            <label className="block text-gray-700 text-sm mb-1">{label}</label>
                            <input
                              placeholder={label}
                              value={value}
                              maxLength={20}
                              onChange={(e) => handleInputChange(e, field)}
                              className="w-full p-2 border border-gray-300 mb-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                            />

                          </div>
                        )
                      )}

                    </div>
                    {errors.nodeButton1 && <p className="text-red-500 text-sm">{errors.nodeButton1}</p>}
                  </div>

                )}

                {buttonType === "cta" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">CTA Button Display Text</label>
                      <input
                        type="text"
                        value={nodeCtaButton}
                        onChange={(e) => setNodeCtaButton(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      {errors.nodeCtaButton && <p className="text-red-500 text-sm mb-2">{errors.nodeCtaButton}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">CTA Button URL</label>
                      <input
                        type="text"
                        value={nodeCta}
                        onChange={(e) => {
                          const v = e.target.value;
                          setNodeCta(v);
                          if (!validateUrl(v)) {
                            setErrors((p) => ({ ...p, nodeCta: "Invalid URL" }));
                          } else {
                            setErrors((p) => ({ ...p, nodeCta: "" }));
                          }
                        }}
                        className={`w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 ${errors.nodeCta ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                          }`}
                      />

                    </div>
                    {errors.nodeCta && <p className="text-red-500 text-sm mb-2">{errors.nodeCta}</p>}
                  </div>
                )}

                {buttonType === "list" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">List Button Label</label>
                      <input
                        type="text"
                        placeholder="List Button Label"
                        value={listButtonText}
                        maxLength={24}
                        onChange={(e) => setListButtonText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      {errors.listButtonText && <p className="text-red-500 text-sm mt-3">{errors.listButtonText}</p>}
                    </div>

                    {sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-300 rounded-md p-4 bg-white relative mt-5">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-sm text-blue-600 font-medium">
                          Section
                        </div>
                        <button onClick={() => handleRemoveSection(section.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <X size={16} />
                        </button>

                        <div className="mt-4">
                          <label className="block text-gray-700 text-sm mb-1">Section Title</label>
                          <input
                            type="text"
                            value={section.title}
                            maxLength={25}
                            onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          {errors[`sections[${sectionIndex}].title`] && (
                            <p className="text-red-500 text-sm mb-2">{errors[`sections[${sectionIndex}].title`]}</p>
                          )}

                        </div>

                        {section.rows.map((row, rowIndex) => (
                          <div key={row.id} className="border border-gray-300 rounded-md p-4 bg-white relative mt-4">
                            <div className="absolute -top-3 left-4 bg-white px-2 text-sm text-purple-600 font-medium">Row</div>
                            <button onClick={() => handleRemoveRow(section.id, row.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                              <X size={16} />
                            </button>

                            {["rowId", "rowTitle", "rowDescription"].map((field) => (
                              <div className="mt-4" key={field}>
                                <label className="block text-gray-700 text-sm mb-1">
                                  {field === "rowDescription" ? "Row Description (optional)" : field === "rowId" ? "Row ID" : "Row Title"}
                                </label>
                                {field === "rowDescription" ? (
                                  <textarea
                                    rows={2}
                                    value={row[field]}
                                    onChange={(e) => handleRowChange(section.id, row.id, field, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={row[field]}
                                    maxLength={24}
                                    onChange={(e) => {
                                      let val = e.target.value;
                                      if (field === "rowId") {
                                        val = val.replace(/\D/g, "");
                                      }
                                      handleRowChange(section.id, row.id, field, val);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                )}

                                {errors[`sections[${sectionIndex}].rows[${rowIndex}].${field}`] && (
                                  <p className="text-red-500 text-sm mb-2">
                                    {errors[`sections[${sectionIndex}].rows[${rowIndex}].${field}`]}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}

                        {errors[`sections[${sectionIndex}].rows`] && (
                          <p className="text-red-500 text-sm mb-2">{errors[`sections[${sectionIndex}].rows`]}</p>
                        )}
                        <button
                          onClick={() => handleAddRow(section.id)}
                          className="mt-3 bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded hover:bg-gray-400 transition-all">
                          Add Row
                        </button>
                      </div>
                    ))}
                    {errors.sections && <p className="text-red-500 text-sm mt-3">{errors.sections}</p>}
                    <button onClick={handleAddSection} className="mt-4 bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-all">
                      Add Section
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4">
              </div>
            </div>
          </div>
          <label className="block text-sm font-medium mt-4">Footer Text:</label>
          <input
            type="text"
            className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={e => { setFooterText(e.target.value); }}
            value={footerText}
            name="footer-text"
            placeholder="Enter Footer Text..."
          />
          <label className="block text-sm font-medium mt-4">Webook URL:</label>
          <input
            type="text"
            className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={e => { setWebHookUrl(e.target.value); }}
            value={webHookUrl}
            name="url"
            placeholder="Enter URL..."
          />
          {errors.url && (
            <p className="text-red-500 text-sm mb-2">
              {errors.url}
            </p>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
              onClick={(e) => {
                e.preventDefault();
                if (isNewNode || isFailed) {
                  submitInterativeBot(e);
                } else {
                  updateInterativeBot(e);
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