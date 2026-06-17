import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Trash2, Copy, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import Pusher from "pusher-js";
import { getVendorId } from "../../utils/getVendorId";
import { decryptData } from "../../../utils/encryption";

const WEBHOOK_SOURCES = [
  { value: "shopify", label: "Shopify" },
  // { value: "woocommerce", label: "WooCommerce" },
  // { value: "google_forms", label: "Google Forms" },
  // { value: "custom", label: "Custom Webhook" },
];

const WEBHOOK_EVENTS = {
  shopify: [
    { value: "order_created", label: "Order Created" },
    { value: "abandoned_cart", label: "Abandoned Cart" },
    { value: "customer_created", label: "Customer Created" },
    { value: "customer_updated", label: "Customer Updated" },
  ],
  woocommerce: [
    { value: "order_created", label: "Order Created" },
    { value: "abandoned_cart", label: "Abandoned Cart" },
    { value: "fulfillment_update", label: "Fulfillment Update" },
    { value: "custom_event", label: "Custom Event" },
  ],
  google_forms: [
    { value: "form_submitted", label: "Form Submitted" },
    { value: "custom_event", label: "Custom Event" },
  ],
  custom: [
    { value: "order_created", label: "Order Created" },
    { value: "abandoned_cart", label: "Abandoned Cart" },
    { value: "form_submitted", label: "Form Submitted" },
    { value: "fulfillment_update", label: "Fulfillment Update" },
    { value: "custom_event", label: "Custom Event" },
  ],
};

const CRM_FIELDS = [
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone Number" },
  { value: "email", label: "Email" },
  // { value: "notes", label: "Notes" },
  // { value: "tags", label: "Tags" },
  // { value: "lead_value", label: "Lead Value" },
  // { value: "source", label: "Source" },
];

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
export function WebhookConfigPanel({ config, ruleId, onChange }) {
  const [testStatus, setTestStatus] = useState("idle");
  const [copied, setCopied] = useState(false);
  const [pusherInstance, setPusherInstance] = useState(null);
  const [shopifyWebhooks, setShopifyWebhooks] = useState([]);
  const textareaRef = useRef(null);

  const prevConfig = useRef(config);
  const currentOnChange = useRef(onChange);
  const currentSetTestStatus = useRef(setTestStatus);

  useEffect(() => {
    prevConfig.current = config;
    currentOnChange.current = onChange;
    currentSetTestStatus.current = setTestStatus;
  }, [config, onChange, testStatus]);

  useEffect(() => {
    const fetchShopifyWebhooks = async () => {
      try {
        const response = await fetch('https://ecomapi.salegrowy.com/api/vendor/shopify-webhooks/list', {
          method: 'POST', // Trying GET first, can be changed to POST if required
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        let result = await response.json();
        
        if (result.payload) {
          result = decryptData(result.payload);
        }

        if (result.success && result.data) {
          setShopifyWebhooks(result.data);
        } else if (!response.ok || !result.success) {
           // Fallback to POST if GET fails
           const postResponse = await fetch('https://ecomapi.salegrowy.com/api/vendor/shopify-webhooks/list', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
             }
           });
           let postResult = await postResponse.json();
           if (postResult.payload) postResult = decryptData(postResult.payload);
           if (postResult.success && postResult.data) {
             setShopifyWebhooks(postResult.data);
           }
        }
      } catch (err) {
        console.error('Error fetching Shopify webhooks:', err);
      }
    };

    fetchShopifyWebhooks();
  }, []);

  useEffect(() => {
    let channel;

    const initializePusher = async () => {
      try {
        const pusher = new Pusher("543b3f19bae874fac5e3", {
          cluster: "ap2",
          forceTLS: true,
          enabledTransports: ["ws", "wss"],
        });

        setPusherInstance(pusher);

        pusher.connection.bind('connected', () => {
          console.log("Pusher connected successfully on cluster:", pusher.connection.options.cluster);
        });

        pusher.bind_global((eventName, data) => {
          console.log("Global Pusher Event ->", eventName, data);
        });

        channel = pusher.subscribe("automation-webhook");

        const processPayload = async () => {
          try {
            const currentWebhookUrl = prevConfig.current.webhookUrl;
            if (!currentWebhookUrl) return;

            const res = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/getWebhookData`, {
              webhookUrl: currentWebhookUrl
            });

            if (res.data?.status && res.data?.data?.response) {
              let payloadData = res.data.data.response;
              try {
                if (typeof payloadData === 'string') {
                  const parsed = JSON.parse(payloadData);
                  payloadData = JSON.stringify(parsed, null, 2);
                } else if (typeof payloadData === 'object') {
                  payloadData = JSON.stringify(payloadData, null, 2);
                }
              } catch (e) {
                // Keep it as is if it can't be parsed
              }

              // Update the payload config
              currentOnChange.current({
                ...prevConfig.current,
                customPayload: payloadData
              });

              // Update UI status to show success
              if (currentSetTestStatus.current) {
                currentSetTestStatus.current("success");
                setTimeout(() => {
                  if (currentSetTestStatus.current) currentSetTestStatus.current("idle");
                }, 5000);
              }

              toast.success("Webhook Payload Received & Parsed!");
            }
          } catch (error) {
            console.error("Error fetching webhook data from server:", error);
          }
        };

        const handleWebhookData = (data) => {
          console.log("Webhook data received:", data);

          processPayload();
        };

        // Listen for the webhook events
        channel.bind("automation-webhook-received", handleWebhookData);

      } catch (error) {
        console.error("Pusher init error:", error);
      }
    };

    initializePusher();

    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      setPusherInstance((prevPusher) => {
        if (prevPusher) {
          prevPusher.disconnect();
        }
        return null;
      });
    };
  }, [config.source]);

  useEffect(() => {
    if (textareaRef.current && config.source === "custom") {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [config.source, config.customPayload]);

  const webhookUrl = config.webhookUrl || "";

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isUrlValid = isValidUrl(webhookUrl);

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const [data, setData] = useState(null);
  const generateWebhookUrl = async () => {
    try {
      const vendorId = await getVendorId();
      const res = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/generate-webhook-url`, { vendorId });
      if (res.data?.status && res.data?.data?.webhook_url) {
        onChange({
          ...config,
          webhookUrl: res.data.data.webhook_url,
        });
        toast.success("Webhook URL generated successfully");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate webhook URL");
    }
  };

  const formatShopifyEventValue = (event) => {
    if (!event) return "";
    let e = event.toLowerCase();
    
    // Specific legacy mappings
    if (e === "orders_create") return "order_created";
    if (e === "customers_create") return "customer_created";
    if (e === "products_create") return "product_created";
    if (e === "checkouts_create") return "abandoned_cart";
    

    // Generic fallback for plurals like "SOMETHINGS_CREATE" -> "something_created"
    if (e.endsWith("s_create")) return e.replace(/s_create$/, "_created");
    if (e.endsWith("_create")) return e.replace(/_create$/, "_created");
    if (e.endsWith("s_update")) return e.replace(/s_update$/, "_updated");
    if (e.endsWith("_update")) return e.replace(/_update$/, "_updated");

    return e;
  };

  const getDynamicEvents = (source) => {
    if (source === "shopify" && shopifyWebhooks.length > 0) {
      return shopifyWebhooks.map(wh => ({
        value: formatShopifyEventValue(wh.event),
        label: wh.event ? wh.event.replace(/_/g, ' ') : "",
        webhookurl: wh.webhookurl
      }));
    }
    return WEBHOOK_EVENTS[source] || WEBHOOK_EVENTS.custom;
  };

  const updateSource = async (source) => {
    const sourceEvents = getDynamicEvents(source);
    const newEvent = sourceEvents[0].value;
    const examplePayload = EXAMPLE_PAYLOADS[source] || EXAMPLE_PAYLOADS.custom;
    const customPayload = JSON.stringify(examplePayload, null, 2);

    let newUrl = config.webhookUrl;
    if (sourceEvents[0] && sourceEvents[0].webhookurl) {
      newUrl = sourceEvents[0].webhookurl;
    }

    onChange({
      ...config,
      source,
      event: newEvent,
      webhookUrl: newUrl,
      customPayload,
    });
  };

  const updateEvent = async (event) => {
    const sourceEvents = getDynamicEvents(config.source);
    const selectedEvent = sourceEvents.find(e => e.value === event);
    
    let newUrl = config.webhookUrl;
    if (selectedEvent && selectedEvent.webhookurl) {
      newUrl = selectedEvent.webhookurl;
      console.log("Using dynamic webhook URL for event:", newUrl);
    }

    const examplePayload = EXAMPLE_PAYLOADS[config.source] || EXAMPLE_PAYLOADS.custom;
    const customPayload = JSON.stringify(examplePayload, null, 2);

    onChange({
      ...config,
      event,
      webhookUrl: newUrl,
      customPayload,
    });
  };

  const addMapping = () => {
    onChange({
      ...config,
      fieldMappings: [
        ...config.fieldMappings,
        { id: `fm${Date.now()}`, webhookField: "", crmField: "name" },
      ],
    });
  };

  const removeMapping = (id) => {
    onChange({
      ...config,
      fieldMappings: config.fieldMappings.filter((m) => m.id !== id),
    });
  };

  const updateMapping = (id, updates) => {
    onChange({
      ...config,
      fieldMappings: config.fieldMappings.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    });
  };

  const events = getDynamicEvents(config.source);
  const currentExample = EXAMPLE_PAYLOADS[config.source] || EXAMPLE_PAYLOADS.custom;

  let parsedPayload = currentExample;
  if (config.customPayload) {
    try {
      parsedPayload = JSON.parse(config.customPayload);
    } catch (e) {
      // Keep default if invalid JSON
    }
  }

  const payloadKeys = flattenObjectKeys(parsedPayload);

  return (
    <div className="space-y-5">
      {/* Source & Event */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Webhook Source</Label>
          <Select value={config.source} onValueChange={(v) => updateSource(v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEBHOOK_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Event Type</Label>
          <Select value={config.event} onValueChange={(v) => updateEvent(v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Webhook URL section is commented out as URLs are managed automatically */}
      {/* 
      <div className="space-y-1.5">
        <Label className="text-xs">Webhook URL</Label>
        <div className="flex items-center gap-2">
          <Input
            value={webhookUrl}
            disabled={true}
            readOnly
            placeholder="https://your-domain.com/webhook/endpoint"
            className={`h-8 text-xs font-mono flex-1 ${!webhookUrl ? "" : isUrlValid ? "border-green-500 focus-visible:ring-green-500" : "border-destructive focus-visible:ring-destructive"}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={copyUrl}
            title="Copy Webhook URL"
          >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 shrink-0 text-xs px-3"
            onClick={generateWebhookUrl}
          >
            Generate
          </Button>
        </div>
        {webhookUrl && (
          <p className={`text-[10px] font-medium ${isUrlValid ? "text-green-600" : "text-destructive"}`}>
            {isUrlValid ? "✓ Valid HTTP/HTTPS URL" : "✕ Please enter a valid URL"}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          Send HTTP POST requests to this URL from your {WEBHOOK_SOURCES.find(s => s.value === config.source)?.label || "external"} platform.
        </p>
      </div> 
      */}

      {/* Listen for Payload */}
      {/* 
      <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/30">
        <div className="flex-1">
          <p className="text-xs font-medium">Listen for Live Payload</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Click 'Listen' and then send a POST request to your webhook URL above to capture the actual payload in real-time.
          </p>
        </div>
        <Button
          type="button"
          variant={testStatus === "success" ? "outline" : testStatus === "loading" ? "secondary" : "default"}
          size="sm"
          className={`gap-2 shrink-0 h-8 text-xs px-3 ${testStatus === "success" ? "border-green-500 text-green-600" : ""}`}
          onClick={() => {
            setTestStatus("loading");
            toast.info("Listening for incoming webhook data...");
          }}
          disabled={testStatus === "loading" || testStatus === "success"}
        >
          {testStatus === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {testStatus === "success" && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
          {testStatus === "idle" && "Listen for Payload"}
          {testStatus === "loading" && "Listening..."}
          {testStatus === "success" && "Payload Received"}
        </Button>
      </div>
      */}




      {/* Sample Payload */}
      <div className="space-y-1.5">
        <Label className="text-xs">
          Example Payload (
          {WEBHOOK_SOURCES.find(s => s.value === config.source)?.label}
          )
        </Label>

        {config.source === "custom" ? (
          <textarea
            ref={textareaRef}
            rows={10}
            className="w-full min-h-[250px] bg-muted rounded-lg p-3 text-[10px] leading-relaxed text-foreground border border-border font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary overflow-hidden"
            value={
              config.customPayload !== undefined
                ? typeof config.customPayload === 'object' ? JSON.stringify(config.customPayload, null, 2) : config.customPayload
                : JSON.stringify(EXAMPLE_PAYLOADS.custom, null, 2)
            }
            onChange={(e) => {
              onChange({ ...config, customPayload: e.target.value });
            }}
            placeholder="Paste your custom JSON payload here..."
          />
        ) : (
          <pre className="bg-muted rounded-lg p-3 text-[10px] leading-relaxed text-muted-foreground border border-border whitespace-pre-wrap break-words">
            {config.customPayload ? (typeof config.customPayload === 'object' ? JSON.stringify(config.customPayload, null, 2) : config.customPayload) : JSON.stringify(currentExample, null, 2)}
          </pre>
        )}
      </div>

      {/* Field Mapping */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Field Mapping</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Map incoming webhook fields to CRM lead fields.</p>
          </div>
        </div>

        {/* {config.fieldMappings.length > 0 && (
          <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center text-[10px] font-medium text-muted-foreground uppercase px-1">
            <span>CRM Field</span>
            <span></span>
            <span>Payload Data</span>
            <span></span>
          </div>
        )} */}

        {config.fieldMappings.map((mapping) => (
          <div key={mapping.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
            <Select
              value={mapping.crmField}
              disabled={true}
              onValueChange={(v) => updateMapping(mapping.id, { crmField: v })}
            >
              <SelectTrigger className="h-8 text-xs text-black opacity-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRM_FIELDS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="h-8 text-xs text-black opacity-100">{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground font-medium">=</span>
            <Select
              value={mapping.webhookField}
              onValueChange={(v) => updateMapping(mapping.id, { webhookField: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select payload key..." />
              </SelectTrigger>
              <SelectContent>
                {payloadKeys.map((k) => (
                  <SelectItem key={k} value={k} className="h-8 text-xs">
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeMapping(mapping.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button> */}
          </div>
        ))}
        {/* 
        <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addMapping}>
          <Plus className="h-3 w-3 mr-1" /> Add Field Mapping
        </Button> */}
      </div>
    </div>
  );
}

