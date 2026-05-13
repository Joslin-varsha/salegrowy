"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Edit } from "lucide-react";
import { useReactFlow } from "reactflow";
import * as Yup from "yup";
import whatsappImage from "../../../assets/wa.jpg";
import placeholderImage from "../../../assets/placeholder.png";
import axios from "axios";
import { Spin, Modal } from "antd";

export default function InactiveSidebar({
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
  const [replyType, setReplyType] = useState("bot");
  const [buttonType, setButtonType] = useState("reply");
  const [sections, setSections] = useState([]);
  const [botReplyIdOrUid, setbotReplyIdOrUid] = useState("");
  const [name, setName] = useState(selectedNode?.data?.label || "");
  const [listButtonText, setListButtonText] = useState("");
  const [nodeCtaButton, setNodeCtaButton] = useState("");
  const [nodeCta, setNodeCta] = useState("");
  const [waitTimeValue, setWaitTimeValue] = useState("");
  const [waitTimeUnit, setWaitTimeUnit] = useState("Minutes");
  const { setNodes } = useReactFlow();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [keys, setKeys] = useState([]);
  const textareaRef = useRef(null);
  const [decryptedData, setDecryptedData] = useState([]);
  const [bodyValues, setBodyValues] = useState({});
  const [templateId, setTemplateId] = useState(null);
  const [templateUid, setTemplateUid] = useState(null); // Added for template_uid
  const [templateName, setTemplateName] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [parseTemplateData, setParseTemplateData] = useState(null);
  const [templateData1, setTemplateData1] = useState(null);
  const [templateParams, setTemplateParams] = useState({});
  const [columnData, setColumnData] = useState([]);
  const fileInputRef = useRef(null);
  const [headerMedia, setHeaderMedia] = useState(null);
  const [headerMediaPreview, setHeaderMediaPreview] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [tempParams, setTempParams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [button1Label, setButton1Label] = useState("");
  const [button2Label, setButton2Label] = useState("");
  const [button3Label, setButton3Label] = useState("");
  const [replyMessage, setReplyMessage] = useState("");


  const [selectedField, setSelectedField] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [newValue, setNewValue] = useState("");

  const vendor_uid = localStorage.getItem('vendor_uid');
  const bot_flow_uid = localStorage.getItem('bot_flow_uid');
  // console.log(vendor_uid)

  const updateNode = (newData) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }

    fetchTemplateData();
    fetchColumnData();
    getReplayVariable();
    if (!isNewNode && nodeId) {
      getBot();
    }


  }, [nodeId, isNewNode]);

  useEffect(() => {
    setSelectedField("");
    if (!selectedNode) return;

    const node = selectedNode; // since selectedNode is already from useReactFlow
    if (!node.data) return;

    setNodeName(node.data.label === "inactiveNode" ? "" : node.data.label || "");
    setReplyMessage(node.data.replyMessage || "");
    setButton1Label(node.data.button_1 || "");
    setButton2Label(node.data.button_2 || "");
    setButton3Label(node.data.button_3 || "");
    setWaitTimeValue(node.data.bot_delay_time || "");
    setWaitTimeUnit(node.data.delay_unit || "Minutes");
    setWebHookUrl(node.data.webhook_url || "");
    setButtonType(node.data?.button_type ?? "reply");

    if (node.data.sections) {
      setSections(JSON.parse(JSON.stringify(node.data.sections)));
    }

  }, [selectedNode]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReplyMessage(value);
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
      saveNodeData(value, nodeTexts[selectedNode.id]?.title || "");
    }
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

  useEffect(() => {
    updateNode1({});
  }, [buttonType, button2Label, button1Label, button3Label]);


  const updateNode1 = (updates) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
            ...n,
            data: {
              ...n.data,
              // label: nodeName,
              // reply_webhook_url: webHookUrl,
              // selectType: selectedType,
              // text: headerText ?? "",
              button_1: button1Label ?? "",
              button_2: button2Label ?? "",
              button_3: button3Label ?? "",
              button_type: buttonType ?? "",
              // video: updates.video ?? "",
              // image: updates.image ?? "",
              // file: updates.file ?? "",
              // nodeCtaButton:nodeCtaButton ?? "",
              // nodeCta:nodeCta ?? "",
              // listButtonText:listButtonText ?? "",
              // section:sections ?? []
            },
          }
          : n
      )
    );
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
    const newText = replyMessage.slice(0, start) + insertText + replyMessage.slice(end);
    setReplyMessage(newText);
    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, replyMessage: newText } }
            : node
        )
      );
    }
  };

  const fetchColumnData = () => {
    const payload = {
      vendorId: vendor_uid,
    };

    fetch(`https://dev.salegrowybox.com/api/getContactDataMaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setColumnData(data);
      })
      .catch((error) => {
        console.error("Error fetching column data:", error);
      });
  };

  // show default api

  const getBot = async () => {
    setLoading(true);
    const payload = {
      vendor_uid: vendor_uid,
      bot_flow_uid: bot_flow_uid,
      nodeId: nodeId,
    };

    try {
      const response = await fetch(`https://dev.salegrowybox.com/api/viewBot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      // if (!response.ok) {
      //   setLoading(false);
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
      setLoading(false);
      if (data.status && data.data) {
        setIsFailed(false);

        // Safely parse __data
        let parsedData = {};
        try {
          parsedData = JSON.parse(data.data.__data || "{}");
        } catch (e) {
          console.error("Error parsing __data:", e);
        }

        const interaction = parsedData.interaction_message || {};

        // Common sidebar fields
        setNodeName(data.data.name || "");
        setReplyMessage(data.data.reply_text || "");
        setWebHookUrl(data.data.reply_webhook_url || "");
        setWaitTimeValue(data.data.delay_time || "");
        setWaitTimeUnit(data.data.delay_unit || "Minutes");
        setbotReplyIdOrUid(data.data._uid);
        setSelectedField(data.data.reply_variable)

        // Buttons
        if (interaction.buttons) {
          setButtonType("reply");
          setButton1Label(interaction.buttons["1"] || "");
          setButton2Label(interaction.buttons["2"] || "");
          setButton3Label(interaction.buttons["3"] || "");
        }

        // Detect CTA or List message
        if (interaction.interactive_type === "cta_url") {
          setButtonType("cta");
          setNodeCtaButton(interaction.cta_url.display_text || "");
          setNodeCta(interaction.cta_url.url || "");
          console.log("CTA URL Button Loaded:", interaction.button_display_text, interaction.button_url);
        }
        else if (interaction.interactive_type === "list") {
          setButtonType("list");

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
          console.log("List Message Loaded:", formattedSections);
        }
        else {
          setButtonType("reply");
        }

        //  Optional UI update in React Flow
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === nodeId
              ? {
                ...node,
                data: {
                  ...node.data,
                  label: data.data.name || "",
                  replyMessage: data.data.reply_text || "",
                },
              }
              : node
          )
        );
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

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (selectedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, label: value } }
            : node
        )
      );
    }
  };

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

  function findJsonPaths(obj, currentPath = "") {
    const paths = [];

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const arrayPath = `${currentPath}[${index}]`;
        if (typeof item === "object" && item !== null) {
          paths.push(...findJsonPaths(item, arrayPath));
        } else {
          paths.push({ path: arrayPath, value: item });
        }
      });
    } else {
      for (let key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
          paths.push(...findJsonPaths(obj[key], newPath));
        } else {
          paths.push({ path: newPath, value: obj[key] });
        }
      }
    }

    return paths;
  }


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


  const getValidationSchema = () => {
    let schema = Yup.object().shape({
      nodeName: Yup.string().required("Name is required"),
      waitTimeValue: Yup.string().required("Wait time value is required"),
      waitTimeUnit: Yup.string()
        .required("Wait time unit is required")
        .oneOf(["Minutes", "Hours", "Days"], "Invalid time unit"),
      url: Yup.string()
        .nullable()
        .notRequired()
        .test("valid-url", "Please enter a valid URL", (value) => {
          if (!value) return true; // empty → allowed
          return Yup.string().url().isValidSync(value); // if value exists → must be valid URL
        })
    });

    if (replyType === "bot") {
      schema = schema.shape({
        replyMessage: Yup.string().required("Reply Message is required"),
        nodeButton1: Yup.string().when([], {
          is: () => !button2Label && !button3Label,
          then: (s) => s.required("At least one reply button is required"),
          otherwise: (s) => s.optional(),
        }),
        nodeButton2: Yup.string().optional(),
        nodeButton3: Yup.string().optional(),
      });

      if (buttonType === "cta") {
        schema = schema.shape({
          nodeCtaButton: Yup.string().required("CTA Button Display Text is required"),
          nodeCta: Yup.string().required("CTA Button URL is required"),
        });
      } else if (buttonType === "list") {
        schema = schema.shape({
          listButtonText: Yup.string().required("List Button Label is required"),
          sections: Yup.array()
            .of(
              Yup.object().shape({
                title: Yup.string().required("Section title is required"),
                rows: Yup.array()
                  .min(1, "At least one row is required per section")
                  .of(
                    Yup.object().shape({
                      rowId: Yup.string().optional(),
                      rowTitle: Yup.string().required("Row Title is required"),
                      rowDescription: Yup.string().optional(),
                    })
                  ),
              })
            )
            .min(1, "At least one section is required"),
        });
      }
    } else if (replyType === "template") {
      schema = schema.shape({
        selected_template_id: Yup.string().required("Template selection is required"),
        template_uid: Yup.string().required("Template UID is required"),
      });
    }

    return schema;
  };


  const handleFileChange = async (event, format) => {
    const format_typ =
      format === "IMAGE"
        ? "whatsapp_image"
        : format === "VIDEO"
          ? "whatsapp_video"
          : "whatsapp_document";

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setHeaderMedia(file);

    const fileType = format.toLowerCase();
    const previewUrl = URL.createObjectURL(file);
    setHeaderMediaPreview({
      type: fileType,
      url: previewUrl,
      name: file.name,
    });

    const formData = new FormData();
    formData.append("filepond", file);
    formData.append("vendorId", vendor_uid);
    formData.append("uploadfile", format_typ);

    try {
      const response = await fetch(`https://dev.salegrowybox.com/api/uploadTempMedia`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      const url = responseData.url || responseData.data?.url;
      setDocUrl(url);

      setTemplateParams((prevParams) => ({
        ...prevParams,
        [`header_${fileType}`]: url,
      }));
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const submitInterativeBot = async () => {

    const formData = {
      nodeName,
      replyMessage,
      nodeButton1: button1Label,
      nodeButton2: button2Label,
      nodeButton3: button3Label,
      nodeCtaButton,
      nodeCta,
      listButtonText,
      sections,
      waitTimeValue,
      waitTimeUnit,
      selected_template_id: templateId,
      template_uid: templateUid,
      url: webHookUrl,
      selectVariable: selectedField
    };

    try {
      await getValidationSchema().validate(formData, { abortEarly: false });
      setErrors({});

      let payload = {
        name: nodeName,
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        node_id: nodeId,
        bot_delay_time: waitTimeValue,
        delay_unit: waitTimeUnit,
        message_type: "followup",
        select_variable: selectedField,
        new_variable_value: selectedField === "create_new" ? newValue : "",
      };

      //  console.log(vendorId)

      if (replyType === "bot") {
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
          "1": button1Label,
          "2": button2Label,
          "3": button3Label,
        };

        const interactiveType =
          buttonType === "reply" ? "button" :
            buttonType === "cta" ? "cta_url" :
              buttonType === "list" ? "list" : "button";
        setLoading(true);
        payload = {
          ...payload,
          reply_text: replyMessage,
          replyWebhookUrl: webHookUrl,
          validate_bot_reply: "0",
          list_button_text: listButtonText,
          interactive_type: interactiveType,
          inactive_type: "bot_reply",
          sections: JSON.stringify(output),
          buttons: buttonData,
          button_url: nodeCta,
          button_display_text: nodeCtaButton,
        };
      } else if (replyType === "template") {
        setLoading(true);
        payload = {
          ...payload,
          inactive_type: "template",
          trigger_type: "Stop",
          reply_trigger: "followup",
          selected_template_id: templateId,
          template_uid: templateUid,
          field_1: "dynamic_contact_first_name"
          // field_1: JSON.stringify(templateParams),
          // header_media: headerMedia ? headerMedia.name : null,
        };
      }

      console.log(payload);


      const response = await fetch(`https://dev.salegrowybox.com/api/storeBotReply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(response);

      const data = await response.json();

      console.log(data);

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
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
        console.error("Validation errors:", newErrors);
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

  const fetchTemplateData = () => {
    const payload = {
      vendorUId: vendor_uid,
    };
    fetch(`https://dev.salegrowybox.com/api/templatelistflow`, {
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

  const components = useMemo(() => {
    return (
      parseTemplateData?.template?.components ||
      parseTemplateData?.components ||
      []
    );
  }, [parseTemplateData]);

  const initializeBodyValues = (newParams) => {
    const initialValues = { ...bodyValues };
    Object.keys(newParams).forEach((key) => {
      if (key.startsWith("field_") && !initialValues[key]) {
        initialValues[key] = "";
      }
    });
    setBodyValues(initialValues);
  };

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selectedTemplate = decryptedData.find(
      (t) => t.id == selectedId || t._id == selectedId
    );
    if (!selectedTemplate) return;
    console.log(selectedTemplate);
    setTemplateId(selectedTemplate.id || selectedTemplate._id);
    setTemplateUid(selectedTemplate.uid || selectedTemplate.template_id); // Store template_uid
    setTemplateName(selectedTemplate.templateName || selectedTemplate.template_name);
    setSelectedTemplate(selectedTemplate);

    try {
      const templateData = selectedTemplate.data || selectedTemplate.__data;
      const parsedData = JSON.parse(templateData);
      setParseTemplateData(parsedData);

      let components = [];
      if (parsedData.template?.components) {
        components = parsedData.template.components;
      } else if (parsedData.components) {
        components = parsedData.components;
      } else if (Array.isArray(parsedData)) {
        components = parsedData;
      }

      setTemplateData1(components);
      const params = extractTemplateParameters(components);
      setTemplateParams(params);
      initializeBodyValues(params);
    } catch (err) {
      console.error("Template parsing error:", err);
      setTemplateName("");
      setTemplateParams({});
      setParseTemplateData(null);
    }
  };

  const extractTemplateParameters = (components) => {
    const parameters = {};
    components.forEach((component) => {
      if (
        component.type === "HEADER" &&
        component.format === "TEXT" &&
        component.text
      ) {
        const matches = component.text.match(/\{\{\s*(\d+)\s*\}\}/g);
        matches?.forEach((match) => {
          const paramNum = match.replace(/\D/g, "");
          parameters[`header_field_${paramNum}`] = "";
        });
      } else if (component.type === "BODY" && component.text) {
        const matches = component.text.match(/\{\{\s*(\d+)\s*\}\}/g);
        matches?.forEach((match) => {
          const paramNum = match.replace(/\D/g, "");
          parameters[`field_${paramNum}`] = "";
        });
      } else if (component.type === "BUTTONS" && component.buttons) {
        component.buttons.forEach((btn, index) => {
          if (btn.text) {
            const matches = btn.text.match(/\{\{\s*(\d+)\s*\}\}/g);
            matches?.forEach((match) => {
              const paramNum = match.replace(/\D/g, "");
              parameters[`button_${index}`] = "";
            });
          }
        });
      }
    });
    return parameters;
  };


  const getDynamicUrl = (url, example) => {
    if (!url.includes("{{")) return url;
    return url.replace(/{{(\d+)}}/g, (_, idx) => example?.[idx - 1] || "");
  };

  const handleParamChange = (fieldName, newValue) => {
    setTemplateParams((prevParams) => ({
      ...prevParams,
      [fieldName]: newValue,
    }));
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

  const updateInterativeBot = async () => {
    try {
      const formData = {
        nodeName,
        replyMessage,
        nodeButton1: button1Label,
        nodeButton2: button2Label,
        nodeButton3: button3Label,
        nodeCtaButton,
        nodeCta,
        listButtonText,
        sections,
        waitTimeValue,
        waitTimeUnit,
        selected_template_id: templateId,
        template_uid: templateUid,
      };

      await getValidationSchema().validate(formData, { abortEarly: false });
      setErrors({});

      const buttonData = {
        "1": button1Label,
        "2": button2Label,
        "3": button3Label,
      };

      let interactiveType = "button";
      if (buttonType === "cta") {
        interactiveType = "cta_url";
      } else if (buttonType === "list") {
        interactiveType = "list";
      }

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

      setLoading(true);
      const payload = {
        botReplyIdOrUid: botReplyIdOrUid,
        vendor_uid: vendor_uid,
        bot_flow_uid: bot_flow_uid,
        node_id: nodeId,
        name: nodeName,
        bot_delay_time: waitTimeValue,
        delay_unit: waitTimeUnit,
        message_type: "followup",
        reply_text: replyMessage,
        replyWebhookUrl: webHookUrl,
        validate_bot_reply: "0",
        list_button_text: listButtonText,
        interactive_type: interactiveType,
        inactive_type: "bot_reply",
        sections: output,
        buttons: buttonData,
        button_url: nodeCta,
        button_display_text: nodeCtaButton,
        reply_trigger: "followup",
        trigger_type: "Stop",
        selected_template_id: templateId,
        template_uid: templateUid,
        field_1: "dynamic_contact_first_name",
        select_variable: selectedField,
        new_variable_value: selectedField === "create_new" ? newValue : "",
      }

      console.log("Update Payload:", payload);

      const response = await fetch(
        `https://dev.salegrowybox.com/api/updateBotReply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      console.log("Raw Update Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setLoading(false);
        console.error("Invalid JSON returned:", text.slice(0, 300));
        Modal.error({
          title: "Error",
          content: "Server returned invalid JSON. Please check backend logs.",
          centered: true,
          okText: "OK",
          okButtonProps: {
            className: "no-btn-hover-red"
          }
        });
        return;
      }

      if (data.success || data.status === "success") {

        if (interactiveType === "cta_url") {
          setButtonType("cta");
          setNodeCta(nodeCta);
          setNodeCtaButton(nodeCtaButton);
          console.log("CTA Button Updated:", nodeCtaButton, nodeCta);
        }
        else if (interactiveType === "list") {
          setButtonType("list");
          setListButtonText(listButtonText);
          setSections(output);
          console.log("List Message Updated:", listButtonText, output);
        }
        else {
          setButtonType("reply");
        }
        onSave("edit");
      } else {
        setLoading(false);
        Modal.error({
          title: "Error",
          content: data.message || "Something went wrong while updating the bot reply.",
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
      {selectedNode ? (
        <aside
          className={`border-r max-h-screen overflow-y-auto p-5 text-sm w-[30vw] h-auto shadow-md transition-all duration-300 flex flex-col ${isDarkMode
              ? "bg-white border-gray-700 text-gray-900"
              : "bg-white border-gray-700 text-gray-900"
            }`}
        >
          <div className="relative flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold flex items-center gap-2 pr-8 ${isDarkMode ? "text-black" : "text-blue-900"
                }`}
            >
              <Edit className="w-5 h-5" /> Inactive Followup
            </h3>
            <button
              className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              onClick={() => setSelectedElements([])}>
              <X className="w-3 h-3" />
            </button>
          </div>

          <label className="block text-sm font-medium py-2">Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            value={nodeName ?? ""}
            name="name"
            onChange={(e) => {
              const value = e.target.value;
              setNodeName(value);

              // if (selectedNode) {
              //   setNodes((nodes) =>
              //     nodes.map((node) =>
              //       node.id === selectedNode.id
              //         ? { ...node, data: { ...node.data, label: value } }
              //         : node
              //     )
              //   );
              // }
            }}
            placeholder="Enter Name..."
          />
          {errors.nodeName && <p className="text-red-500 text-sm mt-1 mb-0">{errors.nodeName}</p>}

          <div className=" mt-3">
            <label className="block font-medium text-gray-700">Wait time</label>
            <div className="flex gap-2 mt-1">
              <div className="w-1/2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  onChange={(e) => {
                    setWaitTimeValue(e.target.value);
                    updateNode("bot_delay_time", e.target.value);
                  }}
                  value={waitTimeValue}

                  placeholder="Enter time..."
                />
                {errors.waitTimeValue && (
                  <p className="text-red-500 text-sm mt-1 mb-0">{errors.waitTimeValue}</p>
                )}
              </div>
              <div className="w-1/2">
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                  value={waitTimeUnit}
                  onChange={(e) => setWaitTimeUnit(e.target.value)}
                >
                  <option value="Minutes">Minute(s)</option>
                  <option value="Hours">Hour(s)</option>

                  {/* Show Days only when replyType = 'template' */}
                  {replyType === "template" && (
                    <option value="Days">Day(s)</option>
                  )}
                </select>
                {errors.waitTimeUnit && (
                  <p className="text-red-500 text-sm">{errors.waitTimeUnit}</p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full mx-auto mt-5 border border-gray-200 shadow-sm rounded-lg bg-white p-4 relative">
            <div className="absolute -top-3 left-4 bg-white px-2 text-sm text-blue-600 font-medium">
              Reply Message
            </div>

            <div className="flex space-x-6 mt-2 mb-3 text-sm text-gray-700">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="replyType"
                  value="bot"
                  checked={replyType === "bot"}
                  onChange={(e) => setReplyType(e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span>Bot Reply</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="replyType"
                  value="template"
                  checked={replyType === "template"}
                  onChange={(e) => setReplyType(e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span>Template</span>
              </label>
            </div>

            {replyType === "template" && (
              <div className="mt-3">
                <label className="block text-gray-700 text-sm mb-1">
                  Select a Template
                </label>
                {decryptedData && decryptedData.length > 0 && (
                  <select
                    className="block w-full border border-gray-300 rounded-md p-2 mb-4"
                    onChange={handleSelectChange}
                    value={templateId || ""}>
                    <option value="" disabled>
                      Select a template
                    </option>
                    {decryptedData
                      .filter(
                        (template) => template.templateName || template.template_name
                      )
                      .map((template) => (
                        <option
                          key={template.id || template._id}
                          value={template.id || template._id}
                        >
                          {template.templateName || template.template_name}
                        </option>
                      ))}
                  </select>
                )}

                {selectedTemplate && templateData1 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Template Parameters:</h4>

                    {/* Header Parameters */}
                    {Object.entries(templateParams)
                      .filter(([fieldName]) => fieldName.startsWith("header_field_"))
                      .map(([fieldName, paramValue]) => {
                        const headerSection = components.find(
                          (item) => item.type === "HEADER"
                        );
                        const paramNum = fieldName.replace("header_field_", "");
                        let label = `Header value {{${paramNum}}}`;

                        if (
                          headerSection?.example?.header_text?.[0]?.[paramNum - 1]
                        ) {
                          label += ` (${headerSection.example.header_text[0][paramNum - 1]
                            })`;
                        }

                        return (
                          <div key={fieldName} className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              {label}
                            </label>
                            <select
                              className="block w-full border border-gray-300 rounded-md p-2"
                              value={paramValue || tempParams?.header_field_1}
                              onChange={(e) =>
                                handleParamChange(fieldName, e.target.value)
                              }
                            >
                              <option value="">Select an option</option>
                              {Object.entries(columnData).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}

                    {/* Body Parameters */}
                    {Object.entries(templateParams)
                      .filter(([fieldName]) => fieldName.startsWith("field_"))
                      .map(([fieldName, paramValue]) => {
                        const bodySection = components.find(
                          (item) => item.type === "BODY"
                        );
                        const paramNum = fieldName.replace("field_", "");
                        let label = `Body value {{${paramNum}}}`;

                        if (bodySection?.example?.body_text?.[0]?.[paramNum - 1]) {
                          label += ` (${bodySection.example.body_text[0][paramNum - 1]
                            })`;
                        }

                        return (
                          <div key={fieldName} className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              {label}
                            </label>
                            <select
                              className="block w-full border border-gray-300 rounded-md p-2"
                              value={paramValue || tempParams?.[`field_${paramNum}`]}
                              onChange={(e) =>
                                handleParamChange(fieldName, e.target.value)
                              }
                            >
                              <option value="">Select an option</option>
                              {Object.entries(columnData).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}

                    {/* Button Parameters */}
                    {Object.entries(templateParams)
                      .filter(([fieldName]) => fieldName.startsWith("button_"))
                      .map(([fieldName, paramValue]) => {
                        const buttonIndex = fieldName.replace("button_", "");
                        return (
                          <div key={fieldName} className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Button {buttonIndex} text
                            </label>
                            <select
                              className="block w-full border border-gray-300 rounded-md p-2"
                              value={paramValue}
                              onChange={(e) =>
                                handleParamChange(fieldName, e.target.value)
                              }
                            >
                              <option value="">Select an option</option>
                              {Object.entries(columnData).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}

                    {/* Media upload sections */}
                    {components
                      .filter(
                        (comp) => comp.type === "HEADER" && comp.format !== "TEXT"
                      )
                      .map((comp, index) => {
                        const format = comp.format;
                        return (
                          <div key={index} className="mb-4 mt-4">
                            <label className="block font-semibold mb-2">
                              Upload {format}
                            </label>
                            <div className="flex flex-col">
                              <input
                                type="file"
                                accept={
                                  format === "IMAGE"
                                    ? "image/*"
                                    : format === "VIDEO"
                                      ? "video/*"
                                      : format === "DOCUMENT"
                                        ? ".pdf,.doc,.docx,.xls,.xlsx"
                                        : undefined
                                }
                                ref={fileInputRef}
                                onChange={(event) => handleFileChange(event, format)}
                                className="hidden"
                              />
                              <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md mb-2 flex items-center gap-2 hover:bg-blue-700 transition"
                                onClick={triggerFileInput}
                              >
                                Select File
                              </button>
                              {headerMedia && (
                                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mt-2 text-sm">
                                  Selected file: {headerMedia.name} (
                                  {Math.round(headerMedia.size / 1024)} KB)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {/* Template preview */}
                    <div
                      className="p-5 rounded m-10 mx-20"
                      style={{
                        backgroundImage: `url(${whatsappImage})`,
                        backgroundColor: "#e5ddd5",
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain",
                        backgroundBlendMode: "overlay",
                      }}
                    >
                      <div className="bg-[#f4f4f4] p-4 rounded-lg max-w-[90%] mx-2 my-2 relative shadow border border-[#e5ddd5]">
                        {components.map((comp, index) => {
                          switch (comp.type) {
                            case "HEADER":
                              const format = comp.format;
                              const handle = comp.example?.header_handle?.[0] || null;

                              const getMediaUrlFromHandle = (handle) => {
                                if (!handle) return null;
                                const parts = handle.split(":");
                                return `https://your-media-domain.com/${parts[2]}`;
                              };

                              const mediaUrl = getMediaUrlFromHandle(handle);

                              switch (format) {
                                case "TEXT":
                                  return (
                                    <div key={index} className="mb-2">
                                      <h6 className="font-bold text-[#3b4a54] text-sm">
                                        {comp.text}
                                      </h6>
                                    </div>
                                  );

                                case "IMAGE":
                                  return (
                                    <div
                                      key={index}
                                      className="mb-2 rounded-lg overflow-hidden"
                                    >
                                      <img
                                        src={placeholderImage}
                                        alt="Header"
                                        className="max-w-full h-auto"
                                      />
                                    </div>
                                  );

                                case "VIDEO":
                                  return (
                                    <div
                                      key={index}
                                      className="mb-2 rounded-lg overflow-hidden"
                                    >
                                      <video controls className="max-w-full">
                                        <source src={mediaUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  );

                                case "DOCUMENT":
                                  return (
                                    <a
                                      key={index}
                                      href={mediaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mb-2 block font-semibold text-sm text-[#075e54]"
                                    >
                                      📄 {comp.text || "Download File"}
                                    </a>
                                  );

                                default:
                                  return null;
                              }

                            case "BODY":
                              return (
                                <div key={index}>
                                  <p className="text-[#3b4a54] text-sm whitespace-pre-line leading-snug">
                                    {comp.text}
                                  </p>
                                </div>
                              );

                            case "BUTTONS":
                              return (
                                <div key={index} className="mt-3 w-full">
                                  {comp.buttons.map((btn, i) => {
                                    const isLink =
                                      btn.type === "URL" ||
                                      btn.type === "PHONE_NUMBER" ||
                                      btn.type === "COPY_CODE";

                                    if (isLink) {
                                      let href = "#";
                                      if (btn.type === "URL")
                                        href = getDynamicUrl(btn.url, btn.example);
                                      else if (btn.type === "PHONE_NUMBER")
                                        href = `tel:${btn.phone_number}`;

                                      return (
                                        <a
                                          key={i}
                                          target=""
                                          rel="noopener noreferrer"
                                          className="block text-center bg-[#f4f4f4] py-2 px-3 text-sm font-medium text-sky-600 transition-colors"
                                        >
                                          {btn.text}
                                        </a>
                                      );
                                    }

                                    return (
                                      <button
                                        key={i}
                                        className="block text-center w-full py-1 bg-[#f4f4f4] px-3 text-sm font-medium text-sky-600 transition-colors"
                                      >
                                        {btn.text}
                                      </button>
                                    );
                                  })}
                                </div>
                              );

                            default:
                              return null;
                          }
                        })}

                        <div className="text-right text-[0.6875rem] text-[#667781] mt-2">
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {replyType === "bot" && (
              <div className="mt-3 text-gray-500 text-sm">
                <label className="block text-gray-700 text-sm mb-1">
                  Reply Text
                </label>
                <textarea
                  maxLength={1000}
                  rows={4}
                  ref={textareaRef}
                  name="reply"
                  placeholder="Type your reply message..."
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  value={replyMessage ?? ""}
                  onChange={handleInputChange}
                ></textarea>
                {errors.replyMessage && <p className="text-red-500 text-sm mb-0">{errors.replyMessage}</p>}


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

                <div className="flex space-x-6 mb-3 text-sm text-gray-700 mt-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="buttonType"
                      value="reply"
                      checked={buttonType === "reply"}
                      onChange={(e) => {
                        setButtonType(e.target.value);
                        updateNode({ buttonType: "reply" });
                      }}
                      className="form-radio text-blue-600"
                    />
                    <span>Reply Buttons</span>
                  </label>

                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="buttonType"
                      value="cta"
                      checked={buttonType === "cta"}
                      onChange={(e) => { setButtonType(e.target.value); updateNode({ buttonType: "cta" }); }}
                      className="form-radio text-blue-600"
                    />
                    <span>CTA URL Button</span>
                  </label>

                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="buttonType"
                      value="list"
                      checked={buttonType === "list"}
                      onChange={(e) => { setButtonType(e.target.value); updateNode({ buttonType: "list" }); }}
                      className="form-radio text-blue-600"
                    />
                    <span>List Message</span>
                  </label>
                </div>

                {buttonType === "reply" && (
                  <div className="space-y-2">

                    {/* Button 1 */}
                    <div>
                      <input
                        placeholder="Button 1 Label"
                        className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                        name="button1"
                        value={button1Label}
                        onChange={(e) => {
                          const value = e.target.value;
                          setButton1Label(value);
                          updateNode("button_1", value);
                        }}
                      />
                      {errors.nodeButton1 && (
                        <p className="text-red-500 text-sm mt-1 mb-0">{errors.nodeButton1}</p>
                      )}
                    </div>

                    {/* Button 2 */}
                    <div>
                      <input
                        placeholder="Button 2 Label (optional)"
                        className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                        value={button2Label}
                        onChange={(e) => {
                          const value = e.target.value;
                          setButton2Label(value);
                          updateNode("button_2", value);
                        }}
                      />
                      {errors.nodeButton2 && (
                        <p className="text-red-500 text-sm">{errors.nodeButton2}</p>
                      )}
                    </div>

                    {/* Button 3 */}
                    <div>
                      <input
                        placeholder="Button 3 Label (optional)"
                        className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                        value={button3Label}
                        onChange={(e) => {
                          const value = e.target.value;
                          setButton3Label(value);
                          updateNode("button_3", value);
                        }}
                      />
                      {errors.nodeButton3 && (
                        <p className="text-red-500 text-sm">{errors.nodeButton3}</p>
                      )}
                    </div>

                  </div>
                )}

                {buttonType === "cta" && (
                  <div className="space-y-3">
                    <div>
                      <input
                        placeholder="CTA Button Display Text"
                        className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                        value={nodeCtaButton}
                        onChange={(e) => setNodeCtaButton(e.target.value)}
                      />
                      {errors.nodeCtaButton && <p className="text-red-500 text-sm">{errors.nodeCtaButton}</p>}
                    </div>
                    <div>
                      <input
                        placeholder="CTA Button URL"
                        className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                        value={nodeCta}
                        onChange={(e) => setNodeCta(e.target.value)}
                      />
                      {errors.nodeCta && <p className="text-red-500 text-sm">{errors.nodeCta}</p>}
                    </div>
                  </div>
                )}

                {buttonType === "list" && (
                  <div className="space-y-3">
                    <div>
                      <input
                        placeholder="Button Label"
                        className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                        value={listButtonText}
                        onChange={(e) => setListButtonText(e.target.value)}
                      />
                      {errors.listButtonText && <p className="text-red-500 text-sm mt-1 mb-0">{errors.listButtonText}</p>}
                    </div>

                    {errors.sections && <p className="text-red-500 text-sm">{errors.sections}</p>}

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
                            maxLength={50}
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
                                    // className="w-full p-2 border border-gray-300 rounded-mdfocus:outline-none focus:ring-2 focus:ring-blue-400"
                                    className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={row[field]}
                                    maxLength={24}
                                    onChange={(e) => handleRowChange(section.id, row.id, field, e.target.value)}
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
                    <button
                      onClick={handleAddSection}
                      className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-all"
                    >
                      Add Section
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="block text-sm font-medium mt-4">Webhook URL:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
            onChange={(e) => {
              setWebHookUrl(e.target.value);
            }}
            value={webHookUrl ?? ""}
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
              onClick={(e) => {
                if (isNewNode || isFailed) {
                  submitInterativeBot(e);
                } else {
                  updateInterativeBot(e);
                }
              }}
              className="w-[100px] bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
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