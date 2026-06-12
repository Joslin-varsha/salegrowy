import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Plus, Trash2, GripVertical, Calendar, ArrowRight, UserPlus, Send, Tag, Bell, Clock, FileText, LayoutList, ShieldAlert, MessageCircle, Smartphone, Radio } from "lucide-react";
import { stages } from "../../data/mockData";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
// Import for WhatsApp background
const whatsappImage = "/wa.jpg";
const placeholderImage = "/placeholder.png";
const BASE_URI = import.meta.env.VITE_BASE_URI;
const VENDOR_ID = localStorage.getItem('vendor_id');
const VENDOR_UID = localStorage.getItem('vendor_uid');
// Static action types (will be replaced by API data)
const ACTION_TYPES = [
  {
    id: 1,
    value: "move_lead_stage",
    label: "Move Lead Stage",
    icon: <ArrowRight className="h-3.5 w-3.5" />,
    group: "CRM"
  },
  {
    id: 2,
    value: "assign_agent",
    label: "Assign Agent",
    icon: <UserPlus className="h-3.5 w-3.5" />,
    group: "CRM"
  },
  {
    id: 3,
    value: "send_message",
    label: "Send Message",
    icon: <Send className="h-3.5 w-3.5" />,
    group: "Communication"
  },
  {
    id: 4,
    value: "send_whatsapp_message",
    label: "Send WhatsApp Message",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    group: "Communication"
  },
  {
    id: 11,
    value: "delay/time",
    label: "Delay/Time",
    icon: <Clock className="h-3.5 w-3.5" />,
    group: "General"
  },
  {
    id: 5,
    value: "notify_agent",
    label: "Notify Agent",
    icon: <Bell className="h-3.5 w-3.5" />,
    group: "Notifications"
  },
  {
    id: 6,
    value: "notify_admin",
    label: "Notify Admin",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    group: "Notifications"
  },
  {
    id: 8,
    value: "send_interactive_message",
    label: "Send Interactive Message",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    group: "Communication"
  },
  {
    id: 9,
    value: "send_media_message",
    label: "Send Media Message",
    icon: <FileText className="h-3.5 w-3.5" />,
    group: "Communication"
  },
  {
    id: 10,
    value: "send_feedback_request",
    label: "Sent Feedback Request",
    icon: <Radio className="h-3.5 w-3.5" />,
    group: "Communication"
  }
];

export function ActionBuilder({ actions, onChange, triggerMasterId }) {
  const [apiActions, setApiActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [columnData, setColumnData] = useState({});
  const [headerMediaPreview, setHeaderMediaPreview] = useState(null);
  const [leadStages, setLeadStages] = useState([]);
  const [leadStagesLoading, setLeadStagesLoading] = useState(false);

  // Fetch column data for dropdown options
  const fetchColumnData = () => {
    const payload = {
      vendorId: VENDOR_UID,
    };

    fetch(`${BASE_URI}/api/getContactDataMaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {

        // Handle different response structures
        let columnDataMap = {};

        if (data.status && data.data) {
          // Original structure: {status: true, data: [...]}
          data.data.forEach(item => {
            columnDataMap[item.field_name] = item.display_name;
          });
        } else if (typeof data === 'object' && data !== null) {
          // Direct object structure: {"dynamic_contact_full_name": "Contact Full Name", ...}
          columnDataMap = data;
        }

        console.log("Mapped column data:", columnDataMap); // Debug log
        setColumnData(columnDataMap);
      })
      .catch((error) => {
        console.error("Error fetching column data:", error);
      });
  };

  useEffect(() => {
    fetchColumnData();
    fetchLeadStages();
  }, []);

  // Fetch lead stages from API
  const fetchLeadStages = async () => {
    if (!VENDOR_ID) return;

    try {
      setLeadStagesLoading(true);
      const response = await axios.post(`${BASE_URI}/api/get-columns`, {
        vendorId: VENDOR_ID
      });

      if (response.data.status === "success" && response.data.data) {
        setLeadStages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching lead stages:", error);
    } finally {
      setLeadStagesLoading(false);
    }
  };

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!VENDOR_UID) return;

      try {
        setTemplatesLoading(true);
        const response = await axios.post(`${BASE_URI}/api/templatelistflow`, {
          vendorUId: VENDOR_UID,
        });
        if (response.data.success && response.data.data) {
          setTemplateLoading(false);
          setTemplates(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Fallback to mock templates if API fails
        setTemplates([
          {
            id: 1,
            template_name: "Appointment Reminder",
            template_body: "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}.",
            components: [
              {
                type: "BODY",
                text: "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}.",
                example: { body_text: ["Customer Name", "Date", "Time"] }
              }
            ]
          }
        ]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [VENDOR_UID]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (!VENDOR_ID) return;

      try {
        setUsersLoading(true);
        const response = await axios.post(`${BASE_URI}/api/get-users`, {
          vendorId: VENDOR_ID
        });

        if (response.data.status && response.data.data) {
          const userData = response.data.data.map(user => ({
            id: user._id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            username: user.username,
            mobile: user.mobile_number,
            status: user.status
          }));
          setUsers(userData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [VENDOR_ID]);

  // Fetch actions from API
  useEffect(() => {
    const fetchActions = async () => {
      if (!triggerMasterId) return;

      try {
        setActionsLoading(true);
        const response = await axios.post(`${BASE_URI}/api/automationRuleActionMasterList`, {
          vendorId: VENDOR_ID,
          masterId: triggerMasterId
        });

        if (response.data.status && response.data.data?.automationMaster) {
          const apiData = response.data.data.automationMaster;
          const transformedActions = apiData.map(action => {
            let icon = <ArrowRight className="h-3.5 w-3.5" />; // Default icon

            // Set specific icons based on action name
            if (action.name.toLowerCase().includes('whatsapp') || action.name.toLowerCase().includes('wa')) {
              icon = <MessageCircle className="h-3.5 w-3.5" />;
            } else if (action.name.toLowerCase().includes('message') || action.name.toLowerCase().includes('send')) {
              icon = <Send className="h-3.5 w-3.5" />;
            } else if (action.name.toLowerCase().includes('appointment') || action.name.toLowerCase().includes('send')) {
              icon = <Calendar className="h-3.5 w-3.5" />;
            } else if (action.name.toLowerCase().includes('assign') || action.name.toLowerCase().includes('agent')) {
              icon = <UserPlus className="h-3.5 w-3.5" />;
            } else if (action.name.toLowerCase().includes('notify') || action.name.toLowerCase().includes('alert')) {
              icon = <Bell className="h-3.5 w-3.5" />;
            } else if (action.name.toLowerCase().includes('move') || action.name.toLowerCase().includes('stage')) {
              icon = <ArrowRight className="h-3.5 w-3.5" />;
            }
            console.log(action)
            return {
              id: action._id || action.id,
              value: action.name.toLowerCase().replace(/\s+/g, '_'),
              label: action.name,
              icon: icon,
              group: action.group || "General"
            };
          });
          setApiActions(transformedActions);
        }
      } catch (error) {
        console.error("Error fetching actions:", error);
      } finally {
        setActionsLoading(false);
      }
    };

    fetchActions();
  }, [triggerMasterId]);

  // Sync actionMasterId if it's missing but we have a type
  useEffect(() => {
    if (actions.length === 0 || actionsLoading) return;

    const allActionsMeta = apiActions.length > 0 ? apiActions : ACTION_TYPES;
    if (allActionsMeta.length === 0) return;

    let hasChanges = false;
    const updatedActions = actions.map(a => {
      if (!a.actionMasterId) {
        const meta = allActionsMeta.find(m => m.value === a.type);
        if (meta) {
          hasChanges = true;
          return { ...a, actionMasterId: meta.id };
        }
      }
      return a;
    });

    if (hasChanges) {
      onChange(updatedActions);
    }
  }, [apiActions, actionsLoading, actions, onChange]);

  // Sync name values to IDs for edit mapping
  useEffect(() => {
    if (leadStagesLoading || usersLoading || templatesLoading || actions.length === 0) return;

    let hasChanges = false;
    const updatedActions = actions.map(a => {
      let newValue = a.value;

      if (a.type === "move_lead_stage" && leadStages.length > 0 && newValue && !/^\d+$/.test(String(newValue))) {
        const matchingStage = leadStages.find(s => s.header_name === newValue);
        if (matchingStage) {
          newValue = matchingStage.id?.toString();
        }
      }

      if (a.type === "assign_agent" && users.length > 0 && newValue && !/^\d+$/.test(String(newValue))) {
        const matchingUser = users.find(u => u.name === newValue || u.username === newValue);
        if (matchingUser) {
          newValue = matchingUser.id?.toString();
        }
      }

      // Sync template name to UID/ID for edit mapping
      const isTemplateAction = (a.type === "send_template_message" || a.type === "send_whatsapp_message" || a.type === "send_appointment_template");
      if (isTemplateAction && templates.length > 0 && newValue) {
        // If current value is not a known ID/UID, check if it's a template name
        const isNotId = !templates.some(t => (t._uid || t.id || t._id)?.toString() === newValue?.toString());

        if (isNotId) {
          const matchingTemplate = templates.find(t => t.template_name === newValue);
          if (matchingTemplate) {
            const uid = (matchingTemplate._uid || matchingTemplate.id || matchingTemplate._id)?.toString();
            if (uid) {
              newValue = uid;
            }
          }
        }
      }

      if (newValue !== a.value) {
        hasChanges = true;
        return { ...a, value: newValue };
      }
      return a;
    });

    if (hasChanges) {
      onChange(updatedActions);
    }
  }, [leadStages, users, templates, leadStagesLoading, usersLoading, templatesLoading, actions, onChange]);

  const addAction = () => {
    const order = actions.length > 0 ? Math.max(...actions.map((a) => a.order)) + 1 : 1;
    onChange([...actions, { id: `a${Date.now()}`, type: "", actionMasterId: null, value: "", order }]);
  };

  const removeAction = (id) => {
    onChange(actions.filter((a) => a.id !== id));
  };

  const updateAction = (id, updates) => {
    onChange(
      actions.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...updates };
        if (updates.type && updates.type !== a.type) updated.value = "";

        return updated;
      })
    );
  };


  // Handle file change for header media
  const handleParamChange = (actionId, fieldName, value) => {
    const currentAction = actions.find(a => a.id === actionId);
    const newParams = {
      ...(currentAction?.extra_values || {}),
      [fieldName]: value
    };

    updateAction(actionId, { extra_values: newParams });
  };

  const handleFileChange = async (actionId, event, format) => {
    const format_typ =
      format === "IMAGE"
        ? "whatsapp_image"
        : format === "VIDEO"
          ? "whatsapp_video"
          : format === "AUDIO"
            ? "whatsapp_audio"
            : "whatsapp_document";

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const fileType = format.toLowerCase();
    const previewUrl = URL.createObjectURL(file);
    setHeaderMediaPreview({
      type: fileType,
      url: previewUrl,
      name: file.name,
    });

    const formData = new FormData();
    formData.append("filepond", file);
    formData.append("vendorId", VENDOR_UID);
    formData.append("uploadfile", format_typ);

    try {
      const response = await fetch(`${BASE_URI}/api/uploadTempMedia`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      const url = responseData.url || responseData.data?.url;

      // Update templateParams with correct field name for FormData
      const fieldName = `header_${fileType}`;

      const currentAction = actions.find(a => a.id === actionId);
      const newParams = {
        ...(currentAction?.extra_values || {}),
        [fieldName]: url
      };

      updateAction(actionId, { extra_values: newParams });

      console.log("Media uploaded and stored in templateParams:", {
        [fieldName]: url
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };


  const handleTemplateSelect = (actionId, templateUid) => {
    const template = templates.find(t => (t._uid || t.id || t._id)?.toString() === templateUid);
    const parsedData = parseTemplateData(template);
    const autoParams = {};

    if (parsedData?.components) {
      parsedData.components.forEach(comp => {
        // Handle media headers that require upload
        if (comp.type === "HEADER" && comp.format && comp.format !== "TEXT") {
          const fieldName = `header_${comp.format.toLowerCase()}`;
          autoParams[fieldName] = "";
        }

        if (comp.type === "BUTTONS" && comp.buttons) {
          comp.buttons.forEach((btn, btnIndex) => {
            const strToSearch = (btn.url || "") + " " + (btn.text || "");
            const rawMatches = strToSearch.match(/\{\{(\d+)\}\}/g) || [];
            rawMatches.forEach(match => {
              const num = match.replace(/\{\{(\d+)\}\}/, "$1");
              const fieldName = `button_${btnIndex}_field_${num}`;
              autoParams[fieldName] = "";
            });
          });
        }

        const matches = comp.text?.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach(match => {
            const num = match.replace(/\{\{(\d+)\}\}/, "$1");
            const fieldName = comp.type === "HEADER" ? `header_field_${num}` : `field_${num}`;
            autoParams[fieldName] = ""; // Initialize with empty string for validation

            // Simple auto-mapping based on common patterns
            if (num === "1" && columnData["dynamic_contact_full_name"]) {
              autoParams[fieldName] = "dynamic_contact_full_name";
            } else if (num === "2" && columnData["dynamic_contact_mobile_number"]) {
              autoParams[fieldName] = "dynamic_contact_mobile_number";
            }
          });
        }
      });
    }

    const currentAction = actions.find(a => a.id === actionId);
    // When a template is selected, we should start with a clean extra_values
    // based on the template's requirements, but preserve reminder_time if it exists.
    const newExtraValues = { ...autoParams };
    if (currentAction?.extra_values?.reminder_time) {
      newExtraValues.reminder_time = currentAction.extra_values.reminder_time;
    }
    if (currentAction?.reminder_time) {
      newExtraValues.reminder_time = currentAction.reminder_time;
    }

    updateAction(actionId, {
      value: templateUid,
      templateId: templateUid,
      extra_values: newExtraValues
    });
  };

  const parseTemplateData = (template) => {
    if (!template) return null;
    try {
      if (template.__data) {
        const parsed = JSON.parse(template.__data || "{}");
        return parsed.template || parsed || null;
      }
      // If it already has components, return the template itself
      if (template.components) {
        return template;
      }
    } catch (error) {
      console.error("Error parsing template data:", error);
    }
    return template; // Fallback to template itself
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const renderValueInput = (action) => {
    console.log(action);
    switch (action.type) {

      case "assign_agent":
        return (
          <Select value={action.value?.toString() || ""} onValueChange={(v) => updateAction(action.id, { value: v })}>
            <SelectTrigger className={`h-8 text-xs flex-1 ${!action.value ? "border-destructive/40" : ""}`}>
              <SelectValue placeholder={usersLoading ? "Loading..." : "Select agent..."} />
            </SelectTrigger>
            <SelectContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id?.toString()}>
                    {user.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </SelectContent>
          </Select>
        );
      case "send_message":
        return (
          <Textarea
            className={`text-xs flex-1 min-h-[32px] h-8 resize-none ${!action.value?.trim() ? "border-destructive/40" : ""}`}
            placeholder="Message text..."
            value={action.value}
            onChange={(e) => updateAction(action.id, { value: e.target.value })}
          />
        );
      case "send_template_message":
      case "send_appointment_template":
      case "send_feedback_request":
      case "send_whatsapp_reminder":
        const currentTemplate = templates.find(t =>
          (t._uid?.toString() === action.value?.toString()) ||
          (t._id?.toString() === action.value?.toString()) ||
          (t.id?.toString() === action.value?.toString())
        );
        const currentParsedData = parseTemplateData(currentTemplate);
        const currentParams = action.extra_values || {};

        return (
          <div className={`col-span-full mt-3 px-3 border rounded-lg ${!action.value ? "bg-destructive/5 border-destructive/30" : "bg-gray-50 bg-white"}`}>
            <div className="mt-6 space-y-4">
              {action.type === "send_whatsapp_reminder" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm mb-0">Select Time Before <span className="text-destructive">*</span></label>
                  <Select
                    value={action.reminder_time?.toString()}
                    onValueChange={(v) => updateAction(action.id, { reminder_time: v })}
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Select time before..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="45">45 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="90">1 hour 30 minutes before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="150">2 hours 30 minutes before</SelectItem>
                      <SelectItem value="180">3 hours before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-gray-700 text-sm mb-1 flex items-center justify-between">
                  <span>Select a Template <span className="text-destructive">*</span></span>
                  {!action.value && <span className="text-[10px] text-destructive italic">Selection required</span>}
                </label>
                {templateLoading || templatesLoading ? (
                  <div className="flex items-center justify-center py-4 bg-gray-50 rounded-md border border-dashed">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                    <span className="text-xs text-muted-foreground">Loading templates...</span>
                  </div>
                ) : (
                  <Select
                    value={action.value?.toString() || ""}
                    onValueChange={(v) => handleTemplateSelect(action.id, v)}
                  >
                    <SelectTrigger className={`h-8 text-sm w-full mb-4 ${!action.value ? "border-destructive/40 bg-destructive/5" : "border-gray-300"}`}>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter((template) => template.template_name)
                        .map((template) => {
                          const uid = (template._uid || template.id || template._id)?.toString();
                          return (
                            <SelectItem
                              key={uid}
                              value={uid}
                            >
                              {template.template_name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {currentTemplate && currentParsedData && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Template Parameters:</h4>

                  {currentParsedData.components
                    ?.filter((comp) => comp.type === "HEADER")
                    .map((comp, index) => {
                      const format = comp.format;
                      if (format !== "TEXT") {
                        return (
                          <div key={index} className="mb-4 mt-4">
                            <label className="block font-semibold mb-2">
                              Upload {format} <span className="text-destructive">*</span>
                              {!currentParams[`header_${format.toLowerCase()}`] && <span className="text-[10px] text-destructive ml-2 font-normal italic">Upload required</span>}
                            </label>
                            <div className="flex flex-col">
                              <input
                                type="file"
                                accept={
                                  format === "IMAGE" ? "image/*" :
                                    format === "VIDEO" ? "video/*" :
                                      format === "DOCUMENT" ? ".pdf,.doc,.docx,.xls,.xlsx" : undefined
                                }
                                ref={fileInputRef}
                                onChange={(event) => handleFileChange(action.id, event, format)}
                                className="hidden"
                              />
                              <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md mb-2 flex items-center gap-2 hover:bg-blue-700 transition"
                                onClick={triggerFileInput}
                              >
                                Select File
                              </button>
                            </div>
                          </div>
                        );
                      }

                      const headerText = comp.text || "";
                      const paramMatches = headerText.match(/\{\{(\d+)\}\}/g);

                      return paramMatches?.map((match, paramIndex) => {
                        const paramNum = match.replace(/\{\{(\d+)\}\}/, "$1");
                        const fieldName = `header_field_${paramNum}`;
                        let label = `Header value {{${paramNum}}}`;
                        if (comp.example?.header_text?.[0]?.[paramNum - 1]) {
                          label += ` (${comp.example.header_text[0][paramNum - 1]})`;
                        }

                        return (
                          <div key={`${index}-${paramIndex}`} className="mb-3">
                            <label className="block text-sm font-medium mb-1">{label}</label>
                            <select
                              className={`block w-full border rounded-md p-2 ${!currentParams[fieldName] ? "border-destructive/40 bg-destructive/5" : "border-gray-300"}`}
                              value={currentParams[fieldName] || ""}
                              onChange={(e) => handleParamChange(action.id, fieldName, e.target.value)}
                            >
                              <option value="">Select an option</option>
                              {Object.entries(columnData).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      });
                    })}

                  {currentParsedData.components
                    ?.filter((comp) => comp.type === "BODY")
                    .map((comp, index) => {
                      const bodyText = comp.text || "";
                      const paramMatches = bodyText.match(/\{\{(\d+)\}\}/g);

                      return paramMatches?.map((match, paramIndex) => {
                        const paramNum = match.replace(/\{\{(\d+)\}\}/, "$1");
                        const fieldName = `field_${paramNum}`;
                        let label = `Body value {{${paramNum}}}`;
                        if (comp.example?.body_text?.[0]?.[paramNum - 1]) {
                          label += ` (${comp.example.body_text[0][paramNum - 1]})`;
                        }

                        return (
                          <div key={`${index}-${paramIndex}`} className="mb-3">
                            <label className="block text-sm font-medium mb-1">{label}</label>
                            <select
                              className={`block w-full border rounded-md p-2 ${!currentParams[fieldName] ? "border-destructive/40 bg-destructive/5" : "border-gray-300"}`}
                              value={currentParams[fieldName] || ""}
                              onChange={(e) => handleParamChange(action.id, fieldName, e.target.value)}
                            >
                              <option value="">Select an option</option>
                              {Object.entries(columnData).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      });
                    })}

                  {currentParsedData.components
                    ?.filter((comp) => comp.type === "BUTTONS")
                    .map((comp, compIndex) => {
                      return comp.buttons?.map((btn, btnIndex) => {
                        const strToSearch = (btn.url || "") + " " + (btn.text || "");
                        const rawMatches = strToSearch.match(/\{\{(\d+)\}\}/g) || [];
                        const paramMatches = Array.from(new Set(rawMatches));

                        return paramMatches.map((match, paramIndex) => {
                          const paramNum = match.replace(/\{\{(\d+)\}\}/, "$1");
                          const fieldName = `button_${btnIndex}_field_${paramNum}`;
                          let label = `Button (${btn.text || btnIndex + 1}) value {{${paramNum}}}`;
                          if (btn.example?.[paramNum - 1]) {
                            label += ` (${btn.example[paramNum - 1]})`;
                          }

                          return (
                            <div key={`btn-${compIndex}-${btnIndex}-${paramIndex}`} className="mb-3">
                              <label className="block text-sm font-medium mb-1">{label}</label>
                              <Input
                                className={`h-9 w-full ${!currentParams[fieldName] ? "border-destructive/40 bg-destructive/5" : "border-gray-300"}`}
                                placeholder={`Enter value for ${label}`}
                                value={currentParams[fieldName] || ""}
                                onChange={(e) => handleParamChange(action.id, fieldName, e.target.value)}
                              />
                            </div>
                          );
                        });
                      });
                    })}

                  <h4 className="font-medium mb-2 mt-4">Template Preview:</h4>
                  <div
                    className="p-5 rounded"
                    style={{
                      backgroundImage: `url(${whatsappImage})`,
                      backgroundColor: "#e5ddd5",
                      backgroundRepeat: "repeat",
                      backgroundSize: "contain",
                      backgroundBlendMode: "overlay",
                    }}
                  >
                    <div className="bg-[#f4f4f4] p-4 rounded-lg max-w-[90%] mx-2 my-2 relative shadow border border-[#e5ddd5]">
                      {currentParsedData.components?.map((comp, index) => {
                        switch (comp.type) {
                          case "HEADER":
                            const format = comp.format;
                            switch (format) {
                              case "TEXT":
                                return <div key={index} className="mb-2"><h6 className="font-bold text-[#3b4a54] text-sm">{comp.text}</h6></div>;
                              case "IMAGE":
                                return <div key={index} className="mb-2 -mx-2 -mt-2"><img src={currentParams.header_image || placeholderImage} alt="Header" className="w-full h-auto rounded-t-lg" onError={(e) => { e.target.src = placeholderImage; }} /></div>;
                              case "VIDEO":
                                return <div key={index} className="mb-2 -mx-2 -mt-2 bg-black flex items-center justify-center rounded-t-lg overflow-hidden" style={{ minHeight: "150px" }}>{currentParams.header_video ? <video src={currentParams.header_video} className="w-full h-auto" /> : <Smartphone className="text-white h-8 w-8 opacity-50" />}</div>;
                              case "DOCUMENT":
                                return <div key={index} className="mb-2 -mx-2 -mt-2 bg-[#f0f2f5] p-3 flex items-center gap-3 rounded-t-lg border-b"><div className="bg-[#00a884] p-2 rounded"><FileText className="text-white h-5 w-5" /></div><div className="flex-1 overflow-hidden"><p className="text-xs font-semibold truncate text-[#3b4a54]">{currentParams.header_document ? currentParams.header_document.split('/').pop() : "document.pdf"}</p></div></div>;
                              default: return null;
                            }
                          case "BODY":
                            return <div key={index} className="mb-1"><p className="text-[#3b4a54] text-sm whitespace-pre-wrap leading-relaxed">{comp.text}</p></div>;
                          case "FOOTER":
                            return <div key={index} className="mt-1"><p className="text-[#667781] text-[11px]">{comp.text}</p></div>;
                          case "BUTTONS":
                            return (
                              <div key={index} className="mt-3 -mx-4 -mb-4 border-t border-[#e9edef] flex flex-col divide-y divide-[#e9edef]">
                                {comp.buttons?.map((btn, btnIdx) => (
                                  <div key={btnIdx} className="py-2 text-center text-[#008069] text-sm font-medium flex items-center justify-center gap-1.5 active:bg-[#f0f2f5] transition">
                                    {btn.type === "PHONE_NUMBER" ? <Smartphone className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5 rotate-[-45deg]" />}
                                    {btn.text}
                                  </div>
                                ))}
                              </div>
                            );
                          default: return null;
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "send_whatsapp_message":
        return (
          <div className="col-span-full mt-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Message</span>
              <Textarea
                className="text-xs flex-1 min-h-[60px] resize-none"
                placeholder="Message text..."
                value={action.value}
                onChange={(e) => updateAction(action.id, { value: e.target.value })}
              />
            </div>
            <span className="text-xs text-orange-500 mt-2 block">Free text messages will only be delivered if the customer has interacted within the last 24 hours.</span>
          </div>
        );
      case "delay":
      case "delay/time":
      case "delay_time": {
        const standardDelays = ["30", "45", "60", "90", "120", "150", "180"];
        const currentVal = action.value?.toString() || "";
        const isCustomSelected = action.extra_values?.custom_selected;
        let mainSelectValue = currentVal;

        if (isCustomSelected || (currentVal && !standardDelays.includes(currentVal))) {
          mainSelectValue = "custom";
        }

        let customNum = action.extra_values?.custom_num ?? "";
        let customUnit = action.extra_values?.custom_unit || "minutes";

        if (currentVal && !standardDelays.includes(currentVal) && !action.extra_values?.custom_selected) {
          const num = parseInt(currentVal, 10);
          if (!isNaN(num)) {
            if (num % 1440 === 0) {
              customNum = (num / 1440).toString();
              customUnit = "days";
            } else if (num % 60 === 0) {
              customNum = (num / 60).toString();
              customUnit = "hours";
            } else {
              customNum = num.toString();
              customUnit = "minutes";
            }
          }
        }

        const handleCustomChange = (num, unit) => {
          let multiplier = 1;
          if (unit === "hours") multiplier = 60;
          if (unit === "days") multiplier = 1440;

          const parsedNum = parseInt(num, 10);
          const finalValue = !isNaN(parsedNum) ? (parsedNum * multiplier).toString() : "";

          updateAction(action.id, {
            value: finalValue,
            extra_values: { ...action.extra_values, custom_selected: true, custom_num: num, custom_unit: unit }
          });
        };

        return (
          <div className="flex flex-col flex-1 gap-2">
            <Select
              value={mainSelectValue || ""}
              onValueChange={(v) => {
                if (v === "custom") {
                  updateAction(action.id, {
                    value: "",
                    extra_values: { ...action.extra_values, custom_selected: true, custom_num: "", custom_unit: "minutes" }
                  });
                } else {
                  updateAction(action.id, {
                    value: v,
                    extra_values: { ...action.extra_values, custom_selected: false }
                  });
                }
              }}
            >
              <SelectTrigger className={`h-8 text-xs flex-1 ${!mainSelectValue ? "border-destructive/40" : ""}`}>
                <SelectValue placeholder="Select time..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1 hour 30 minutes</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="150">2 hours 30 minutes</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="custom">Custom Time...</SelectItem>
              </SelectContent>
            </Select>
            {mainSelectValue === "custom" && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className={`h-8 text-xs w-20 ${!customNum ? "border-destructive/40" : ""}`}
                    value={customNum}
                    onChange={(e) => handleCustomChange(e.target.value, customUnit)}
                    placeholder="e.g. 2"
                  />
                  <Select
                    value={customUnit}
                    onValueChange={(v) => handleCustomChange(customNum, v)}
                  >
                    <SelectTrigger className="h-8 text-xs w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {customNum && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    Next action will execute after {customNum} {customUnit}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }

      case "move_lead_stage":
        return (
          <Select value={action.value} onValueChange={(v) => updateAction(action.id, { value: v })}>
            <SelectTrigger className={`h-8 text-xs flex-1 ${!action.value ? "border-destructive/40 bg-destructive/5" : ""}`}>
              <SelectValue placeholder={leadStagesLoading ? "Loading..." : "Select next stage..."} />
            </SelectTrigger>
            <SelectContent>
              {leadStagesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : leadStages.length > 0 ? (
                leadStages.sort((a, b) => a.order_menu - b.order_menu).map((stage) => (
                  <SelectItem key={stage.id} value={stage.id?.toString()}>{stage.header_name}</SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No stages found</div>
              )}
            </SelectContent>
          </Select>
        );
      case "notify_agent":
      case "notify_admin":
        return (
          <Textarea
            className={`text-xs flex-1  h-6 resize-none ${!action.value?.trim() ? "border-destructive/40" : ""}`}
            placeholder="Notification message..."
            value={action.value}
            onChange={(e) => updateAction(action.id, { value: e.target.value })}
          />
        );
      case "send_media_message": {
        const params = action.extra_values || {};
        const selectedType = params.selectedType || "";
        const nodeCaption = params.caption || "";
        const mediaUrl = params[`header_${selectedType?.toLowerCase()}`] || "";

        const handleMediaParam = (field, value) => {
          handleParamChange(action.id, field, value);
        };

        const handleTypeChange = (type) => {
          handleMediaParam("selectedType", type);
        };

        return (
          <div className="col-span-full mt-3 p-4 border rounded-lg bg-gray-50 flex flex-col w-full h-auto">
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-xs font-medium text-muted-foreground mb-1">Select File Type <span className="text-destructive">*</span></span>
              <Select
                value={selectedType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className={`w-full h-8 text-xs ${!selectedType ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedType && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Upload {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="file"
                    accept={
                      selectedType === "image" ? "image/*" :
                        selectedType === "video" ? "video/*" :
                          selectedType === "audio" ? "audio/*" :
                            ".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    }
                    className={`w-full text-xs h-8 cursor-pointer ${!mediaUrl ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                    onChange={(e) => handleFileChange(action.id, e, selectedType.toUpperCase())}
                  />
                  {!mediaUrl && <span className="text-[10px] text-destructive mt-1 block italic">Please select and wait for your file to upload</span>}
                  {mediaUrl && selectedType === "image" && (
                    <img src={mediaUrl} alt="Uploaded" className="aspect-square object-cover rounded-md mt-3 mx-auto max-h-[150px]" />
                  )}
                  {mediaUrl && selectedType === "video" && (
                    <video controls className="w-full max-h-48 mt-3 rounded">
                      <source src={mediaUrl} type="video/mp4" />
                    </video>
                  )}
                  {mediaUrl && selectedType === "audio" && (
                    <audio controls className="w-full h-[40px] mt-3 bg-white rounded-md">
                      <source src={mediaUrl} type="audio/mpeg" />
                    </audio>
                  )}
                  {mediaUrl && selectedType === "document" && (
                    <p className="text-xs text-green-600 mt-2 font-medium break-all">Uploaded: {mediaUrl.split('/').pop()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">Caption/Text</label>
                  <Textarea
                    placeholder="Enter caption..."
                    value={nodeCaption}
                    onChange={(e) => handleMediaParam("caption", e.target.value)}
                    className="text-xs w-full min-h-[60px] resize-none border-gray-300 focus:ring-primary bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        );
      }
      case "send_interactive_message": {
        const params = action.extra_values || {};
        const buttonType = params.buttonType || "reply";
        const nodeButton1 = params.button1 || "";
        const nodeButton2 = params.button2 || "";
        const nodeButton3 = params.button3 || "";
        const nodeCtaButton = params.ctaButtonText || "";
        const nodeCta = params.ctaUrl || "";
        const listButtonText = params.listButtonText || "";
        const sections = params.sections || [];

        const handleInteractiveParam = (field, value) => {
          handleParamChange(action.id, field, value);
        };

        const handleAddSection = () => {
          const newSection = { id: `${Date.now()}`, title: "", rows: [] };
          handleInteractiveParam("sections", [...sections, newSection]);
        };

        const handleRemoveSection = (secId) => {
          handleInteractiveParam("sections", sections.filter(s => s.id !== secId));
        };

        const handleSectionTitleChange = (secId, title) => {
          handleInteractiveParam("sections", sections.map(s => s.id === secId ? { ...s, title } : s));
        };

        const handleAddRow = (secId) => {
          handleInteractiveParam("sections", sections.map(s => {
            if (s.id === secId) {
              return { ...s, rows: [...(s.rows || []), { id: `${Date.now()}`, row_id: "", title: "", description: "" }] };
            }
            return s;
          }));
        };

        const handleRemoveRow = (secId, rowId) => {
          handleInteractiveParam("sections", sections.map(s => {
            if (s.id === secId) {
              return { ...s, rows: s.rows.filter(r => r.id !== rowId) };
            }
            return s;
          }));
        };

        const handleRowChange = (secId, rowId, field, value) => {
          handleInteractiveParam("sections", sections.map(s => {
            if (s.id === secId) {
              return {
                ...s,
                rows: s.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r)
              };
            }
            return s;
          }));
        };

        return (
          <div className="col-span-full mt-3 p-4 border rounded-lg bg-gray-50 flex flex-col w-full h-auto">
            <div className="flex flex-col gap-1 mb-4">

              {/* Header Type Selection */}
              <label className="block text-xs font-medium mb-0 text-muted-foreground">Header Type</label>
              <select
                className="w-full text-xs p-2 border border-gray-300 mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                value={params.headerType || ""}
                onChange={(e) => {
                  const newParams = {
                    ...(action.extra_values || {}),
                    headerType: e.target.value,
                    buttonType: "reply"
                  };
                  updateAction(action.id, { extra_values: newParams });
                }}>
                <option value="">None</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>

              {params.headerType === "text" && (
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Header Text <span className="text-destructive">*</span></label>
                  <Input
                    type="text"
                    className={`w-full text-xs h-8 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!params.headerText?.trim() ? "border-destructive/40 bg-destructive/5" : "border-gray-300"}`}
                    value={params.headerText || ""}
                    onChange={(e) => handleInteractiveParam("headerText", e.target.value)}
                  />
                  {!params.headerText?.trim() && <span className="text-[10px] text-destructive italic mt-1 block">Header text is required</span>}
                </div>
              )}

              {["image", "video", "document"].includes(params.headerType) && (
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Upload {params.headerType.charAt(0).toUpperCase() + params.headerType.slice(1)} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="file"
                    accept={
                      params.headerType === "image" ? "image/*" :
                        params.headerType === "video" ? "video/*" :
                          ".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    }
                    className={`w-full text-xs h-8 cursor-pointer bg-white border ${!params[`header_${params.headerType}`] ? "border-destructive/40 bg-destructive/5" : "border-gray-300"}`}
                    onChange={(e) => handleFileChange(action.id, e, params.headerType.toUpperCase())}
                  />
                  {!params[`header_${params.headerType}`] && <span className="text-[10px] text-destructive italic mt-1 block">Please select and wait for your file to upload</span>}
                  {params[`header_${params.headerType}`] && params.headerType === "image" && (
                    <img src={params[`header_${params.headerType}`]} alt="Uploaded" className="aspect-square object-cover rounded-md mt-3 mx-auto max-h-[150px]" />
                  )}
                  {params[`header_${params.headerType}`] && params.headerType === "video" && (
                    <video controls className="w-full max-h-48 mt-3 rounded">
                      <source src={params[`header_${params.headerType}`]} type="video/mp4" />
                    </video>
                  )}
                  {params[`header_${params.headerType}`] && params.headerType === "document" && (
                    <p className="text-xs text-green-600 mt-2 font-medium break-all">Uploaded: {params[`header_${params.headerType}`].split('/').pop()}</p>
                  )}
                </div>
              )}

              <span className="text-xs mt-5 font-medium text-muted-foreground mb-1">Body Content <span className="text-destructive">*</span></span>

              <Textarea
                className={`text-xs w-full min-h-[60px] resize-none ${!action.value?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"} focus:ring-primary`}
                placeholder="Message text..."
                value={action.value}
                onChange={(e) => updateAction(action.id, { value: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-700 mt-2">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  value="reply"
                  checked={buttonType === "reply"}
                  onChange={() => handleInteractiveParam("buttonType", "reply")}
                  className="accent-primary"
                />
                <span className="text-xs font-medium">Reply Buttons</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`buttonType_${action.id}`}
                  value="cta"
                  checked={buttonType === "cta"}
                  onChange={() => handleInteractiveParam("buttonType", "cta")}
                  className="accent-primary"
                />
                <span className="text-xs font-medium">CTA URL Button</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`buttonType_${action.id}`}
                  value="list"
                  checked={buttonType === "list"}
                  onChange={() => handleInteractiveParam("buttonType", "list")}
                  className="accent-primary cursor-pointer"
                />
                <span className="text-xs font-medium">List Message</span>
              </label>
            </div>

            <div className="w-full">
              {buttonType === "reply" && (
                <div className="grid gap-3 w-full">
                  {!(nodeButton1?.trim() || nodeButton2?.trim() || nodeButton3?.trim()) && (
                    <span className="text-[10px] text-destructive block">At least one button is required <span className="text-destructive">*</span></span>
                  )}
                  {[["Button 1", nodeButton1, "button1"], ["Button 2", nodeButton2, "button2"], ["Button 3", nodeButton3, "button3"]].map(
                    ([label, value, field]) => {
                      const hasAny = !!(nodeButton1?.trim() || nodeButton2?.trim() || nodeButton3?.trim());
                      return (
                        <div key={field} className="w-full">
                          <label className="block text-gray-700 text-xs mb-1 font-medium">{label}</label>
                          <Input
                            placeholder={`Enter ${label} text`}
                            value={value}
                            maxLength={20}
                            onChange={(e) => handleInteractiveParam(field, e.target.value)}
                            className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!hasAny ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {buttonType === "cta" && (
                <div className="space-y-4 w-full">
                  <div className="w-full">
                    <label className="block text-gray-700 text-xs mb-1 font-medium">CTA Button Display Text <span className="text-destructive">*</span></label>
                    <Input
                      type="text"
                      placeholder="e.g. Visit Website"
                      value={nodeCtaButton}
                      onChange={(e) => handleInteractiveParam("ctaButtonText", e.target.value)}
                      className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!nodeCtaButton?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-gray-700 text-xs mb-1 font-medium">CTA Button URL <span className="text-destructive">*</span></label>
                    <Input
                      type="text"
                      placeholder="e.g. https://example.com"
                      value={nodeCta}
                      onChange={(e) => handleInteractiveParam("ctaUrl", e.target.value)}
                      className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!nodeCta?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                    />
                  </div>
                </div>
              )}

              {buttonType === "list" && (
                <div className="space-y-4 w-full">
                  <div className="w-full">
                    <label className="block text-gray-700 text-xs mb-1 font-medium">List Button Label <span className="text-destructive">*</span></label>
                    <Input
                      type="text"
                      placeholder="e.g. View Options"
                      value={listButtonText}
                      maxLength={24}
                      onChange={(e) => handleInteractiveParam("listButtonText", e.target.value)}
                      className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!listButtonText?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                    />
                  </div>

                  {(!sections || sections.length === 0) && (
                    <span className="text-[10px] text-destructive block mt-2">At least one Section is required <span className="text-destructive">*</span></span>
                  )}

                  {sections.map((section, sectionIndex) => (
                    <div key={section.id} className="border border-gray-200 shadow-sm rounded-lg p-4 bg-white relative mt-6 w-full">
                      <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 text-[10px] text-primary border border-primary/20 rounded font-bold uppercase tracking-wider shadow-sm">
                        Section {sectionIndex + 1}
                      </div>
                      <button type="button" onClick={() => handleRemoveSection(section.id)} className="absolute top-2 right-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive p-1 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="mt-2 w-full">
                        <label className="block text-gray-700 text-xs mb-1 font-medium">Section Title <span className="text-destructive">*</span></label>
                        <Input
                          type="text"
                          placeholder="e.g. Choose Option"
                          value={section.title}
                          maxLength={25}
                          onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                          className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!section.title?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                        />
                      </div>

                      <div className="space-y-3 mt-4 w-full">
                        {(!section.rows || section.rows.length === 0) && (
                          <span className="text-[10px] text-destructive block mb-2">At least one Row is required per Section <span className="text-destructive">*</span></span>
                        )}
                        {section.rows?.map((row, rowIndex) => (
                          <div key={row.id} className="border border-gray-100 rounded-md p-3 bg-gray-50 relative w-full group">
                            <div className="absolute -top-2 left-4 bg-gray-50 px-1 text-[10px] text-muted-foreground font-semibold">Row {rowIndex + 1}</div>
                            <button type="button" onClick={() => handleRemoveRow(section.id, row.id)} className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:bg-destructive/10 hover:text-destructive p-1 rounded transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <div className="space-y-3 mt-2 w-full">
                              <div className="w-full">
                                <label className="block text-gray-700 text-xs mb-1">Row ID <span className="text-destructive">*</span></label>
                                <Input
                                  type="text"
                                  placeholder="e.g. opt-1"
                                  value={row.row_id || ""}
                                  maxLength={24}
                                  onChange={(e) => handleRowChange(section.id, row.id, "row_id", e.target.value)}
                                  className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!row.row_id?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                                />
                              </div>
                              <div className="w-full">
                                <label className="block text-gray-700 text-xs mb-1">Row Title <span className="text-destructive">*</span></label>
                                <Input
                                  type="text"
                                  placeholder="e.g. Option 1"
                                  value={row.title || ""}
                                  maxLength={24}
                                  onChange={(e) => handleRowChange(section.id, row.id, "title", e.target.value)}
                                  className={`w-full text-xs h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${!row.title?.trim() ? "border-destructive/40 bg-destructive/5" : "bg-white border-gray-300"}`}
                                />
                              </div>
                              <div className="w-full">
                                <label className="block text-gray-700 text-xs mb-1">Row Description (optional)</label>
                                <Textarea
                                  rows={2}
                                  placeholder="Add a description"
                                  value={row.description || ""}
                                  onChange={(e) => handleRowChange(section.id, row.id, "description", e.target.value)}
                                  className="w-full p-2 text-xs bg-white border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRow(section.id)}
                        className="mt-4 text-xs h-8 border-dashed hover:bg-gray-100 transition-all font-medium text-primary hover:text-primary">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
                      </Button>
                    </div>
                  ))}

                  <Button type="button" onClick={handleAddSection} className="mt-6 text-xs h-8 transition-all w-full sm:w-auto">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Section
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Text */}
            <label className="block text-xs font-medium mt-4 mb-0 text-muted-foreground">Footer Text <span className="text-[10px] font-normal italic">(Optional)</span></label>
            <Input
              type="text"
              className="w-full text-xs h-8 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              placeholder="Footer text..."
              value={params.footerText || ""}
              onChange={(e) => handleInteractiveParam("footerText", e.target.value)}
            />

          </div>
        );
      }
      default:
        return (
          <Input
            className={`h-8 text-xs flex-1 ${!action.value?.toString().trim() ? "border-destructive/40" : ""}`}
            placeholder="Value..."
            value={action.value}
            onChange={(e) => updateAction(action.id, { value: e.target.value })}
          />
        );
    }
  };

  const getActionMeta = (type) => {
    // Use API actions if available, otherwise fall back to static ACTION_TYPES
    const allActions = apiActions.length > 0 ? apiActions : ACTION_TYPES;
    return allActions.find((a) => a.value === type || (a.id?.toString() === type?.toString()));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions (executed in order)</span>
        <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 italic"> Note: Delay, Sent WhatsApp reminder, and Sent Feedback request cannot be edited or deleted once they are saved.</span>
      </div>

      {actions
        .sort((a, b) => a.order - b.order)
        .map((action, index) => {
          const meta = getActionMeta(action.type);
          return (
            <div key={action.id} className="grid grid-cols-[auto_180px_1fr_auto] gap-2 items-start">
              <div className="flex items-center justify-center h-8 w-6 shrink-0 text-muted-foreground">
                <span className="text-[10px] font-bold">{index + 1}</span>
              </div>

              <Select
                value={action.actionMasterId?.toString() || action.type}
                onValueChange={(v) => {
                  const allActions = apiActions.length > 0 ? apiActions : ACTION_TYPES;
                  const selected = allActions.find((a) => (a.id?.toString() === v.toString()) || (a.value === v));
                  const type = selected?.value || v;
                  updateAction(action.id, {
                    type: type,
                    actionMasterId: selected?.id || v,
                    reminder_time: type === "send_whatsapp_reminder" ? "60" : undefined,
                    extra_values: {}
                  });
                }}
                disabled={actionsLoading}
              >
                <SelectTrigger className={`h-8 text-xs shrink-0 ${!action.actionMasterId ? "border-destructive/40 bg-destructive/5" : ""}`}>
                  <SelectValue placeholder={actionsLoading ? "Loading..." : "Select action..."}>
                    {meta ? (
                      <div className="flex items-center gap-2">
                        {meta.icon}
                        {meta.label}
                      </div>
                    ) : (
                      <span className="text-destructive font-medium italic">Select action...</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {actionsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <div className="p-2">
                      {(() => {
                        const allActions = apiActions.length > 0 ? apiActions : ACTION_TYPES;
                        const groups = [...new Set(allActions.map(a => a.group))];
                        return groups.map((group) => (
                          <div key={group} className="mb-3 last:mb-0">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                              {group}
                            </div>
                            <div className="mt-2 space-y-1">
                              {allActions.filter((a) => a.group === group).map((a) => (
                                <SelectItem
                                  key={a.id || a.value}
                                  value={a.id?.toString() || a.value}
                                  className="cursor-pointer hover:bg-blue-50 rounded-md transition-colors p-2 border border-transparent hover:border-blue-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 flex items-center justify-center text-blue-600">
                                      {a.icon}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{a.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {!["send_whatsapp_message", "send_template_message", "send_appointment_template", "send_interactive_message", "send_media_message", "send_feedback_request"].includes(action.type) && renderValueInput(action)}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeAction(action.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>

              {["send_whatsapp_message", "send_template_message", "send_appointment_template", "send_interactive_message", "send_media_message", "send_feedback_request"].includes(action.type) && renderValueInput(action)}
            </div>
          );
        })}

      <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addAction}>
        <Plus className="h-3 w-3 mr-1" /> Add Action
      </Button>
    </div>
  );
}
