import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getVendorId } from "../../utils/getVendorId";


const BASE_URI = import.meta.env.VITE_BASE_URI;


// Base CRM fields always available (will be replaced by API data)
const CRM_FIELDS = [];

const flattenObjectKeys = (obj, prefix = "") => {
  let keys = [];
  if (typeof obj !== "object" || obj === null) return keys;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      keys.push(fullPath);
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(flattenObjectKeys(obj[key], fullPath));
      }
    }
  }
  return keys;
};

const EXAMPLE_PAYLOADS = {
  shopify: {
    id: 820982911946154500,
    email: "customer@example.com",
    created_at: "2026-03-18T10:15:30+05:30",
    updated_at: "2026-03-18T10:15:30+05:30",
    number: 234,
    note: null,
    token: "abc123xyz",
    gateway: "cod",
    test: false,
    total_price: "1500.00",
    subtotal_price: "1400.00",
    total_tax: "100.00",
    currency: "INR",
    financial_status: "pending",
    confirmed: true,
    total_discounts: "0.00",
    buyer_accepts_marketing: true,
    name: "#234",
    order_number: 234,
    customer: {
      id: 1234567890,
      email: "customer@example.com",
      first_name: "Arun",
      last_name: "Kumar",
      phone: "+919876543210"
    },
    billing_address: {
      first_name: "Arun",
      last_name: "Kumar",
      address1: "12 MG Road",
      city: "Chennai",
      province: "Tamil Nadu",
      country: "India",
      zip: "600001",
      phone: "+919876543210"
    },
    shipping_address: {
      first_name: "Arun",
      last_name: "Kumar",
      address1: "12 MG Road",
      city: "Chennai",
      province: "Tamil Nadu",
      country: "India",
      zip: "600001",
      phone: "+919876543210"
    },
    line_items: [
      {
        id: 123456789,
        title: "T-Shirt",
        quantity: 2,
        price: "700.00",
        sku: "TSHIRT-001",
        vendor: "MyStore"
      }
    ],
    shipping_lines: [
      {
        title: "Standard Shipping",
        price: "100.00"
      }
    ]
  },
  woocommerce: {
    id: 1234,
    parent_id: 0,
    status: "processing",
    currency: "INR",
    version: "8.0.0",
    prices_include_tax: false,
    date_created: "2026-03-18T10:30:00",
    total: "1500.00",
    customer_id: 45,
    billing: {
      first_name: "Arun",
      last_name: "Kumar",
      email: "customer@example.com",
      phone: "+919876543210",
      address_1: "12 MG Road",
      city: "Chennai",
      state: "TN",
      country: "IN",
      postcode: "600001"
    },
    shipping: {
      first_name: "Arun",
      last_name: "Kumar",
      address_1: "12 MG Road",
      city: "Chennai",
      state: "TN",
      country: "IN",
      postcode: "600001"
    },
    line_items: [
      {
        id: 567,
        name: "T-Shirt",
        product_id: 111,
        quantity: 2,
        price: 700,
        total: "1400.00",
        sku: "TSHIRT-001"
      }
    ],
    shipping_lines: [
      {
        method_title: "Flat Rate",
        total: "100.00"
      }
    ]
  },
  google_forms: {
    form_id: "form_123",
    form_title: "New Lead Form",
    submission_id: "sub_456",
    timestamp: "2026-03-18 10:45:00",
    fields: {
      "Name": "John Doe",
      "Email": "john@example.com",
      "Phone": "+1234567890",
      "Interest": "Product Inquiry"
    }
  },
  custom: {
    name: "Rahul",
    phone: "+919876543210",
    email: "rahul@example.com",
    product: "Leather Wallet",
    order_value: "2500"
  }
};

// System fields for webhook triggers
const SYSTEM_FIELDS = [
  { value: "sys_webhook_event", label: "Webhook Event Type", group: "System" },
  { value: "sys_lead_exists", label: "Lead Exists", group: "System" },
  { value: "sys_is_new_lead", label: "New Lead", group: "System" },
  { value: "sys_is_existing_lead", label: "Existing Lead", group: "System" },
  { value: "sys_country", label: "Country", group: "System" },
  { value: "sys_city", label: "City", group: "System" },
  { value: "sys_time_of_day", label: "Time of Day", group: "System" },
  { value: "sys_day_of_week", label: "Day of Week", group: "System" },
];

// Extract dynamic fields from webhook field mappings
function getWebhookPayloadFields(webhookConfig) {
  if (!webhookConfig?.fieldMappings?.length) {
    // Default common webhook payload fields
    return [
      { value: "wh_name", label: "name", group: "Webhook Payload" },
      { value: "wh_phone", label: "phone", group: "Webhook Payload" },
      { value: "wh_email", label: "email", group: "Webhook Payload" },
      { value: "wh_product", label: "product", group: "Webhook Payload" },
      { value: "wh_order_value", label: "order_value", group: "Webhook Payload" },
      { value: "wh_payment_method", label: "payment_method", group: "Webhook Payload" },
      { value: "wh_city", label: "city", group: "Webhook Payload" },
      { value: "wh_cart_value", label: "cart_value", group: "Webhook Payload" },
      { value: "wh_tracking_id", label: "tracking_id", group: "Webhook Payload" },
      { value: "wh_delivery_status", label: "delivery_status", group: "Webhook Payload" },
    ];
  }
  return webhookConfig.fieldMappings.map((m) => ({
    value: `wh_${m.webhookField}`,
    label: m.webhookField,
    group: "Webhook Payload",
  }));
}

// Full operator set
const ALL_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "gte", label: "Greater than or equal" },
  { value: "lte", label: "Less than or equal" },
  { value: "exists", label: "Exists" },
  { value: "not_exists", label: "Does not exist" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "exact_match", label: "Exact match" },
  { value: "is_empty", label: "Is empty" },
  { value: "is", label: "Is" },
  { value: "is_not", label: "Is not" },
];

// Operators by field type
function getOperatorsForField(field) {
  // Numeric fields
  if (["lead_score", "total_orders", "total_order_value", "wh_order_value", "wh_cart_value"].includes(field)) {
    return ALL_OPERATORS.filter((o) =>
      ["equals", "not_equals", "greater_than", "less_than", "gte", "lte", "exists", "not_exists", "is", "is_not", "does_not_exist"].includes(o.value)
    );
  }
  // Boolean-like system fields
  if (["sys_lead_exists", "lead_exists", "sys_is_new_lead", "is_new_lead", "sys_is_existing_lead", "is_existing_lead"].includes(field)) {
    return [
      { value: "equals", label: "Is" },
      { value: "not_equals", label: "Is not" },
      { value: "is", label: "Is" },
      { value: "is_not", label: "Is not" },
    ];
  }
  // Stage/source/agent — discrete values
  if (["stage", "source", "agent", "lead_status", "sys_webhook_event", "appointment_status"].includes(field)) {
    return ALL_OPERATORS.filter((o) =>
      ["equals", "not_equals", "exists", "not_exists", "is", "is_not", "does_not_exist"].includes(o.value)
    );
  }
  // Tag
  if (field === "tag") {
    return [
      { value: "contains", label: "Has tag" },
      { value: "not_contains", label: "Does not have tag" },
    ];
  }
  // Date fields
  if (["created_date", "last_interaction", "sys_time_of_day", "sys_day_of_week"].includes(field)) {
    return ALL_OPERATORS.filter((o) =>
      ["equals", "not_equals", "greater_than", "less_than", "gte", "lte", "is", "is_not", "does_not_exist"].includes(o.value)
    );
  }
  // Text fields (message, email, phone, webhook strings)
  return ALL_OPERATORS.filter((o) =>
    ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "exists", "not_exists", "is", "is_not", "does_not_exist"].includes(o.value)
  );
}

const NO_VALUE_OPERATORS = ["exists", "not_exists", "is_empty", "is", "is_not", "does_not_exist"];

export function ConditionBuilder({ conditions, logic, onChange, triggerType, webhookConfig, triggerMasterId }) {
  const [VENDOR_ID, setVendorId] = useState(null);
  const [apiFields, setApiFields] = useState([]);

  // Fetch real vendor ID (vendors__id) from profile API on mount
  useEffect(() => {
    getVendorId().then(id => {
      if (id) setVendorId(id);
    });
  }, []);

  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [conditionOperators, setConditionOperators] = useState({}); // Map of conditionId -> operators[]
  const latestConditions = useRef(conditions);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [sources, setSources] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [columnsLoading, setColumnsLoading] = useState(false);

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

    const fetchColumns = async () => {
      if (!VENDOR_ID) return;

      try {
        setColumnsLoading(true);
        const response = await axios.post(`${BASE_URI}/api/get-columns`, {
          vendorId: VENDOR_ID
        });

        if (response.data.status === "success") {
          if (response.data.data) {
            const stageData = response.data.data.map(stage => ({
              id: stage.id,
              name: stage.header_name
            }));
            setStages(stageData);
          }
          if (response.data.source) {
            setSources(response.data.source);
          }
          if (response.data.priority) {
            setPriorities(response.data.priority);
          }
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      } finally {
        setColumnsLoading(false);
      }
    };

    fetchUsers();
    fetchColumns();
  }, [VENDOR_ID]);

  useEffect(() => {
    latestConditions.current = conditions;
  }, [conditions]);

  // Fetch condition fields from API
  useEffect(() => {
    const fetchConditionFields = async () => {
      if (!triggerMasterId) return;

      try {
        setFieldsLoading(true);
        const response = await axios.post(`${BASE_URI}/api/automationRuleCondititonMasterList`, {
          vendorId: VENDOR_ID,
          masterId: triggerMasterId
        });

        if (response.data.status && response.data.data?.automationMaster) {
          const apiData = response.data.data.automationMaster;
          const transformedFields = apiData.map(field => ({
            value: field.name.toLowerCase().replace(/\s+/g, '_'),
            label: field.name,
            group: field.group || "Workflow Fields",
            id: field._id || field.id
          }));
          setApiFields(transformedFields);
        }
      } catch (error) {
        console.error("Error fetching condition fields:", error);
      } finally {
        setFieldsLoading(false);
      }
    };

    fetchConditionFields();
  }, [triggerMasterId]);

  const loadOperators = async (conditionId, fieldName, fieldId, currentCondition) => {
    if (!fieldName || !triggerMasterId || !fieldId) return;

    try {
      const response = await axios.post(`${BASE_URI}/api/automationRuleCondititonMasterValue`, {
        vendorId: VENDOR_ID,
        masterId: triggerMasterId,
        conditionId: fieldId
      });

      if (response.data.status && response.data.data?.automationMaster) {
        const apiData = response.data.data.automationMaster;
        const transformedOperators = apiData.map(op => ({
          value: op.name.toLowerCase().replace(/\s+/g, '_'),
          label: op.name,
          id: op._id || op.id
        }));
        setConditionOperators(prev => ({
          ...prev,
          [conditionId]: transformedOperators
        }));

        // Automatically patch the missing master IDs using secure functional update
        if (currentCondition && (!currentCondition.conditionMasterId || !currentCondition.conditionMasterValueId)) {
          const selectedOp = transformedOperators.find(o => o.value === currentCondition.operator);
          onChange((prevConditions) => {
            const freshConditions = [...prevConditions];
            const targetIndex = freshConditions.findIndex(c => c.id === conditionId);
            if (targetIndex !== -1) {
              freshConditions[targetIndex] = {
                ...freshConditions[targetIndex],
                conditionMasterId: fieldId,
                conditionMasterValueId: selectedOp?.id || selectedOp?._id || 1
              };
            }
            return freshConditions;
          }, logic);
        }
      }
    } catch (error) {
      console.error("Error fetching operators for field:", fieldName, error);
    }
  };

  // Pre-load operators for existing conditions when fields are loaded
  useEffect(() => {
    if (apiFields.length > 0 && conditions.length > 0) {
      conditions.forEach(c => {
        if (c.field && !conditionOperators[c.id]) {
          const fieldMeta = [...apiFields, ...CRM_FIELDS, ...SYSTEM_FIELDS,].find(f => f.value === c.field);
          if (fieldMeta?.id) {
            loadOperators(c.id, c.field, fieldMeta.id, c);
          }
        }
      });
    }
  }, [apiFields, conditions.length]);

  // Sync agent names to IDs for edit mapping
  useEffect(() => {
    if (usersLoading || conditions.length === 0 || users.length === 0) return;

    let hasChanges = false;
    const updatedConditions = conditions.map(c => {
      let newValue = c.value;

      if ((c.field === "assigned_agent" || c.field === "agent") && newValue && !/^\d+$/.test(String(newValue))) {
        const matchingUser = users.find(u => u.name === newValue || u.username === newValue);
        if (matchingUser) {
          newValue = matchingUser.id?.toString();
        }
      }

      if (newValue !== c.value) {
        hasChanges = true;
        return { ...c, value: newValue };
      }
      return c;
    });

    if (hasChanges) {
      onChange(updatedConditions, logic);
    }
  }, [users, usersLoading, conditions, onChange, logic]);

  const isWebhook = triggerType === "webhook_trigger";

  // Build available fields based on trigger type
  const availableFields = (() => {
    let fields = [];

    // Use API fields if available, otherwise fall back to CRM_FIELDS
    if (apiFields.length > 0) {
      fields = [...apiFields];
    } else {
      fields = [...CRM_FIELDS];
    }

    if (isWebhook) {
      //  fields.unshift(...getWebhookPayloadFields(webhookConfig));

      let parsedPayload = EXAMPLE_PAYLOADS[webhookConfig?.source] || EXAMPLE_PAYLOADS.custom;
      if (webhookConfig?.source === "custom" && webhookConfig?.customPayload) {
        try { parsedPayload = JSON.parse(webhookConfig.customPayload); } catch (e) { }
      }
      // const pKeys = flattenObjectKeys(parsedPayload);
      // const allPayloadFields = pKeys.map(k => ({
      //   value: k,
      //   label: k,
      //   group: "Webhook Payload"
      // }));
      // fields.push(...allPayloadFields);

      // fields.push(...SYSTEM_FIELDS);
    }
    return fields;
  })();

  // Group fields
  const groupedFields = availableFields.reduce((acc, f) => {
    (acc[f.group] ??= []).push(f);
    return acc;
  }, {});

  const addCondition = () => {
    const defaultField = isWebhook ? "wh_order_value" : "message";
    const ops = getOperatorsForField(defaultField);
    const meta = availableFields.find(f => f.value === defaultField);
    onChange(
      (prev) => [...prev, {
        id: `c${Date.now()}`,
        field: defaultField,
        conditionMasterId: meta?.id || null,
        conditionMasterValueId: null,
        operator: ops[0].value,
        value: ""
      }],
      logic
    );
  };

  const removeCondition = (id) => {
    onChange((prev) => prev.filter((c) => c.id !== id), logic);
  };

  const updateCondition = (id, updates) => {
    onChange((prevConditions) => {
      return prevConditions.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };

        if (updates.field && updates.field !== c.field) {
          const meta = availableFields.find(f => f.value === updates.field);
          updated.conditionMasterId = meta?.id || 1;

          // Load operators for the newly selected field
          if (meta?.id) {
            loadOperators(c.id, updates.field, meta.id, updated);
          }

          const ops = getOperatorsForField(updates.field);
          updated.operator = ops[0].value;
          updated.conditionMasterValueId = ops[0]?.id || null;
          updated.value = "";
        }
        return updated;
      });
    }, logic);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conditions</span>
          {isWebhook && (
            <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium">
              Webhook
            </span>
          )}
        </div>
        {conditions.length > 1 && (
          <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
            <button
              type="button"
              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${logic === "AND" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => onChange(conditions, "AND")}
            >
              ALL (AND)
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${logic === "OR" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => onChange(conditions, "OR")}
            >
              ANY (OR)
            </button>
          </div>
        )}
      </div>

      {conditions.map((condition, index) => {
        // Use dynamic operators if available, otherwise fall back to static operators
        const availableOperators = conditionOperators[condition.id]?.length > 0
          ? conditionOperators[condition.id]
          : getOperatorsForField(condition.field);
        const isBooleanField = ["sys_lead_exists", "lead_exists", "sys_is_new_lead", "is_new_lead", "sys_is_existing_lead", "is_existing_lead"].includes(condition.field);
        const needsValue = !NO_VALUE_OPERATORS.includes(condition.operator) && !isBooleanField;
        const fieldLabel = availableFields.find((f) => f.value === condition.field)?.label ?? condition.field;

        const isDate = condition.field?.includes('date');
        const isTime = condition.field?.includes('time');
        const isDayOfWeek = condition.field?.includes('day_of_week');
        const isDateOrTime = isDate || isTime;

        return (
          <div key={condition.id}>
            {index > 0 && (
              <div className="flex items-center justify-center my-1">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {logic === "AND" ? "AND" : "OR"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Select
                value={condition.field}
                onValueChange={(v) => updateCondition(condition.id, { field: v })}
                disabled={fieldsLoading}
              >
                <SelectTrigger className={`h-8 text-xs w-[150px] ${!condition.field ? "border-destructive/40" : ""}`}>
                  <SelectValue placeholder={fieldsLoading ? "Loading fields..." : "Select field"} />
                </SelectTrigger>
                <SelectContent>
                  {fieldsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : (
                    Object.entries(groupedFields).map(([group, fields]) => (
                      <SelectGroup key={group}>
                        <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">{group}</SelectLabel>
                        {fields.map((f) => (
                          <SelectItem key={f.value} value={f.value} className="text-xs">
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Select
                value={condition.operator}
                onValueChange={(v) => {
                  const availableOperators = conditionOperators[condition.id]?.length > 0
                    ? conditionOperators[condition.id]
                    : getOperatorsForField(condition.field);
                  const selectedOp = availableOperators.find(o => o.value === v);

                  updateCondition(condition.id, {
                    operator: v,
                    conditionMasterValueId: selectedOp?.id || 1
                  });
                }}
              >
                <SelectTrigger className={`h-8 text-xs w-[150px] ${!condition.operator ? "border-destructive/40" : ""}`}>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {(conditionOperators[condition.id]?.length > 0 ? conditionOperators[condition.id] : getOperatorsForField(condition.field)).map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {needsValue && (
                <div className="flex-1 flex items-center gap-2">
                  {isDayOfWeek ? (
                    <div className="flex-1">
                      <Select
                        value={condition.value || ""}
                        onValueChange={(v) => updateCondition(condition.id, { value: v })}
                      >
                        <SelectTrigger className={`h-8 text-xs w-full ${!condition.value ? "border-destructive/40" : ""}`}>
                          <SelectValue placeholder="Select day..." />
                        </SelectTrigger>
                        <SelectContent>
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                            <SelectItem key={day} value={day} className="h-8 text-xs">
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : condition.field === "assigned_agent" || condition.field === "agent" ? (
                    <div className="flex-1">
                      <Select
                        value={condition.value?.toString() || ""}
                        onValueChange={(v) => updateCondition(condition.id, { value: v })}
                      >
                        <SelectTrigger className={`h-8 text-xs w-full ${!condition.value ? "border-destructive/40" : ""}`}>
                          <SelectValue placeholder={usersLoading ? "Loading users..." : "Select user..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id?.toString()} className="h-8 text-xs">
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : condition.field === "appointment_status" ? (
                    <div className="flex-1">
                      <Select
                        value={condition.value?.toString() || ""}
                        onValueChange={(v) => updateCondition(condition.id, { value: v })}
                      >
                        <SelectTrigger className={`h-8 text-xs w-full ${!condition.value ? "border-destructive/40" : ""}`}>
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0" className="h-8 text-xs">Pending</SelectItem>
                          <SelectItem value="1" className="h-8 text-xs">Completed</SelectItem>
                          <SelectItem value="2" className="h-8 text-xs">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : condition.field?.toLowerCase().includes('meeting_duration') ? (
                    <div className="flex-1">
                      <Input
                        type="number"
                        className={`h-8 text-xs w-full ${!condition.value?.toString().trim() ? "border-destructive/40 bg-destructive/5" : ""}`}
                        placeholder="Please enter Minutes"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      />
                    </div>
                  ) : condition.field === "stage" || condition.field === "lead_stage" ? (
                    <div className="flex-1">
                      <Select
                        value={condition.value?.toString() || ""}
                        onValueChange={(v) => updateCondition(condition.id, { value: v })}
                      >
                        <SelectTrigger className={`h-8 text-xs w-full ${!condition.value ? "border-destructive/40" : ""}`}>
                          <SelectValue placeholder={columnsLoading ? "Loading stages..." : "Select stage..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage, idx) => (
                            <SelectItem key={stage.id || idx} value={stage.name} className="h-8 text-xs">
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : condition.field === "source" ? (
                    <div className="flex-1">
                      <Select
                        value={condition.value?.toString() || ""}
                        onValueChange={(v) => updateCondition(condition.id, { value: v })}
                      >
                        <SelectTrigger className={`h-8 text-xs w-full ${!condition.value ? "border-destructive/40" : ""}`}>
                          <SelectValue placeholder={columnsLoading ? "Loading..." : "Select source..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((src, idx) => (
                            <SelectItem key={idx} value={src} className="h-8 text-xs">
                              {src}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : condition.field === "priority" ? (
                    <div className="flex-1">
                      <Select
                        value={condition.value?.toString() || ""}
                        onValueChange={(v) => updateCondition(condition.id, { value: v })}
                      >
                        <SelectTrigger className={`h-8 text-xs w-full ${!condition.value ? "border-destructive/40" : ""}`}>
                          <SelectValue placeholder={columnsLoading ? "Loading..." : "Select priority..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((pri, idx) => (
                            <SelectItem key={idx} value={pri} className="h-8 text-xs">
                              {pri}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="relative flex-1">
                      <Input
                        type={isDate ? "date" : isTime ? "time" : "text"}
                        className={`h-8 text-xs w-full ${isDateOrTime ? "pr-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0" : ""} ${!condition.value?.toString().trim() ? "border-destructive/40 bg-destructive/5" : ""}`}
                        placeholder={isDate ? "Select date..." : isTime ? "Select time..." : "Value..."}
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      />
                      {isDate && (
                        <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      )}
                      {isTime && (
                        <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      )}
                    </div>
                  )}
                  {isWebhook && (
                    <Select
                      value={condition.webhookField || ""}
                      onValueChange={(v) => updateCondition(condition.id, { webhookField: v })}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px] shrink-0">
                        <SelectValue placeholder="Payload key" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          let parsedPayload = EXAMPLE_PAYLOADS[webhookConfig?.source] || EXAMPLE_PAYLOADS.custom;
                          if (webhookConfig?.source === "custom" && webhookConfig?.customPayload) {
                            try {
                              parsedPayload = JSON.parse(webhookConfig.customPayload);
                            } catch (e) { }
                          }
                          const pKeys = flattenObjectKeys(parsedPayload);
                          return pKeys.map((k) => (
                            <SelectItem key={k} value={k} className="h-8 text-xs">
                              {k}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeCondition(condition.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addCondition}>
        <Plus className="h-3 w-3 mr-1" /> Add Condition
      </Button>
    </div>
  );
}
