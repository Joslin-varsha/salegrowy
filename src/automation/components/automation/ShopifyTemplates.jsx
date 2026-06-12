import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ShoppingCart, PackageCheck, CreditCard, Truck, ArrowRight, Copy } from "lucide-react";
import React from "react";

export const shopifyTemplates = [
  {
    id: "tpl-order-placed",
    name: "Order Placed",
    description: "Auto-create lead, tag, and send order confirmation via WhatsApp when a Shopify order is placed.",
    icon: <ShoppingCart className="h-5 w-5" />,
    color: "hsl(142 64% 40%)",
    webhookEndpoint: "https://api.mycrm.com/webhook/shopify/order-created",
    messagePreview: "Hi {{name}} 👋\n\nThank you for your order!\n\nProduct: {{product}}\nOrder Value: ₹{{order_value}}\n\nOur team will process your order soon.",
    rule: {
      name: "Shopify — Order Placed",
      active: true,
      triggerType: "webhook",
      triggerValue: "",
      conditionLogic: "AND",
      conditions: [],
      actions: [
        { id: "ta1", type: "move_stage", value: "new-order", order: 1 },
        { id: "ta2", type: "add_tag", value: "Shopify Order", order: 2 },
        { id: "ta3", type: "assign_agent", value: "a1", order: 3 },
        { id: "ta4", type: "send_message", value: "Hi {{name}} 👋\n\nThank you for your order!\n\nProduct: {{product}}\nOrder Value: ₹{{order_value}}\n\nOur team will process your order soon.", order: 4 },
      ],
      webhookConfig: {
        source: "shopify",
        event: "order_created",
        webhookUrl: "https://api.mycrm.com/webhook/shopify/order-created",
        fieldMappings: [
          { id: "fm1", webhookField: "customer.first_name", crmField: "name" },
          { id: "fm2", webhookField: "customer.phone", crmField: "phone" },
          { id: "fm3", webhookField: "email", crmField: "email" },
          { id: "fm4", webhookField: "line_items.title", crmField: "notes" },
          { id: "fm5", webhookField: "total_price", crmField: "lead_value" },
        ],
      },
    },
  },
  {
    id: "tpl-abandoned-cart",
    name: "Abandoned Cart Recovery",
    description: "Send a recovery WhatsApp message when a customer abandons their cart with value > ₹500.",
    icon: <PackageCheck className="h-5 w-5" />,
    color: "hsl(30 90% 50%)",
    webhookEndpoint: "https://api.mycrm.com/webhook/shopify/abandoned-cart",
    messagePreview: "Hi {{name}} 👋\n\nYou left something in your cart 🛒\n\nProduct: {{product}}\nCart Value: ₹{{cart_value}}\n\nComplete your order here:\n{{checkout_url}}",
    rule: {
      name: "Shopify — Abandoned Cart Recovery",
      active: true,
      triggerType: "webhook",
      triggerValue: "",
      conditionLogic: "AND",
      conditions: [
        { id: "tc1", field: "lead_value", operator: "greater_than", value: "500" },
      ],
      actions: [
        { id: "ta5", type: "move_stage", value: "cart-recovery", order: 1 },
        { id: "ta6", type: "add_tag", value: "Abandoned Cart", order: 2 },
        { id: "ta7", type: "send_message", value: "Hi {{name}} 👋\n\nYou left something in your cart 🛒\n\nProduct: {{product}}\nCart Value: ₹{{cart_value}}\n\nComplete your order here:\n{{checkout_url}}", order: 3 },
      ],
      webhookConfig: {
        source: "shopify",
        event: "abandoned_cart",
        webhookUrl: "https://api.mycrm.com/webhook/shopify/abandoned-cart",
        fieldMappings: [
          { id: "fm6", webhookField: "name", crmField: "name" },
          { id: "fm7", webhookField: "phone", crmField: "phone" },
          { id: "fm8", webhookField: "product", crmField: "notes" },
          { id: "fm9", webhookField: "cart_value", crmField: "lead_value" },
        ],
      },
    },
  },
  {
    id: "tpl-cod-confirmation",
    name: "COD Order Confirmation",
    description: "Send interactive WhatsApp buttons for COD order confirmation with Confirm / Cancel options.",
    icon: <CreditCard className="h-5 w-5" />,
    color: "hsl(45 90% 48%)",
    webhookEndpoint: "https://api.mycrm.com/webhook/shopify/order-created",
    messagePreview: "Hi {{name}} 👋\n\nYour order has been placed successfully.\n\nProduct: {{product}}\nOrder Value: ₹{{order_value}}\n\nPlease confirm your order.\n\n1️⃣ Confirm Order\n2️⃣ Cancel Order",
    rule: {
      name: "Shopify — COD Confirmation",
      active: true,
      triggerType: "webhook",
      triggerValue: "",
      conditionLogic: "AND",
      conditions: [
        { id: "tc2", field: "message", operator: "equals", value: "COD" },
      ],
      actions: [
        { id: "ta8", type: "move_stage", value: "cod-confirmation", order: 1 },
        { id: "ta9", type: "add_tag", value: "COD Order", order: 2 },
        { id: "ta10", type: "send_buttons", value: "Hi {{name}} 👋\n\nYour order has been placed.\n\nProduct: {{product}}\nOrder Value: ₹{{order_value}}\n\nPlease confirm:\n[Confirm Order] [Cancel Order]", order: 3 },
      ],
      webhookConfig: {
        source: "shopify",
        event: "order_created",
        webhookUrl: "https://api.mycrm.com/webhook/shopify/order-created",
        fieldMappings: [
          { id: "fm10", webhookField: "name", crmField: "name" },
          { id: "fm11", webhookField: "phone", crmField: "phone" },
          { id: "fm12", webhookField: "product", crmField: "notes" },
          { id: "fm13", webhookField: "order_value", crmField: "lead_value" },
          { id: "fm14", webhookField: "payment_method", crmField: "tags" },
        ],
      },
    },
  },
  {
    id: "tpl-order-shipped",
    name: "Order Delivery Notification",
    description: "Notify customers via WhatsApp when their Shopify order has been shipped with tracking details.",
    icon: <Truck className="h-5 w-5" />,
    color: "hsl(220 70% 55%)",
    webhookEndpoint: "https://api.mycrm.com/webhook/shopify/order-shipped",
    messagePreview: "Hi {{name}} 👋\n\nYour order has been shipped 🚚\n\nProduct: {{product}}\n\nTracking ID: {{tracking_id}}\n\nTrack your order here:\nhttps://trackinglink.com/{{tracking_id}}",
    rule: {
      name: "Shopify — Order Shipped",
      active: true,
      triggerType: "webhook",
      triggerValue: "",
      conditionLogic: "AND",
      conditions: [],
      actions: [
        { id: "ta11", type: "add_tag", value: "Order Shipped", order: 1 },
        { id: "ta12", type: "move_stage", value: "order-shipped", order: 2 },
        { id: "ta13", type: "send_message", value: "Hi {{name}} 👋\n\nYour order has been shipped 🚚\n\nProduct: {{product}}\n\nTracking ID: {{tracking_id}}\n\nTrack your order here:\nhttps://trackinglink.com/{{tracking_id}}", order: 3 },
      ],
      webhookConfig: {
        source: "shopify",
        event: "fulfillment_update",
        webhookUrl: "https://api.mycrm.com/webhook/shopify/order-shipped",
        fieldMappings: [
          { id: "fm15", webhookField: "name", crmField: "name" },
          { id: "fm16", webhookField: "phone", crmField: "phone" },
          { id: "fm17", webhookField: "product", crmField: "notes" },
          { id: "fm18", webhookField: "tracking_id", crmField: "notes" },
        ],
      },
    },
  },
];

export function ShopifyTemplates({ onUseTemplate }) {
  const copyEndpoint = (url, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Shopify eCommerce Templates</h3>
        <p className="text-xs text-muted-foreground">
          Pre-built automations for Shopify stores. Each template generates a webhook URL, maps incoming fields, and sends WhatsApp messages automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shopifyTemplates.map((tpl) => (
          <Card key={tpl.id} className="p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-primary-foreground"
                style={{ backgroundColor: tpl.color }}
              >
                {tpl.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">{tpl.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{tpl.description}</p>
              </div>
            </div>

            {/* Webhook endpoint */}
            <div className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1.5 border border-border">
              <code className="text-[10px] text-foreground truncate flex-1">{tpl.webhookEndpoint}</code>
              <button
                className="shrink-0 p-1 rounded hover:bg-background transition-colors"
                onClick={(e) => copyEndpoint(tpl.webhookEndpoint, e)}
                title="Copy URL"
              >
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {/* Message preview */}
            <pre className="bg-muted rounded-md p-2.5 text-[10px] leading-relaxed text-muted-foreground whitespace-pre-wrap border border-border max-h-28 overflow-y-auto">
              {tpl.messagePreview}
            </pre>

            {/* Field mappings badge row */}
            <div className="flex flex-wrap gap-1">
              {tpl.rule.webhookConfig?.fieldMappings.map((m) => (
                <Badge key={m.id} variant="outline" className="text-[9px] gap-0.5">
                  {m.webhookField} <ArrowRight className="h-2.5 w-2.5" /> {m.crmField}
                </Badge>
              ))}
            </div>

            {/* Actions summary */}
            <div className="flex flex-wrap gap-1">
              {tpl.rule.actions.map((a) => (
                <Badge key={a.id} variant="secondary" className="text-[9px]">
                  {a.type.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>

            <Button size="sm" className="w-full mt-auto" onClick={() => onUseTemplate(tpl)}>
              Use This Template
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
