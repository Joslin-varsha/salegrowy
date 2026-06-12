export const stages = [
  { id: "new", name: "New Lead", color: "210 100% 52%", order: 0 },
  { id: "contacted", name: "Contacted", color: "38 92% 50%", order: 1 },
  { id: "interested", name: "Interested", color: "142 64% 40%", order: 2 },
  { id: "follow-up", name: "Follow-up", color: "270 60% 55%", order: 3 },
  { id: "negotiation", name: "Negotiation", color: "20 90% 50%", order: 4 },
  { id: "won", name: "Won", color: "142 72% 35%", order: 5 },
  { id: "lost", name: "Lost", color: "0 72% 51%", order: 6 },
  { id: "new-order", name: "New Order", color: "200 80% 50%", order: 7 },
  { id: "cart-recovery", name: "Cart Recovery", color: "30 90% 50%", order: 8 },
  { id: "cod-confirmation", name: "COD Confirmation", color: "45 90% 48%", order: 9 },
  { id: "order-confirmed", name: "Order Confirmed", color: "160 70% 40%", order: 10 },
  { id: "order-cancelled", name: "Order Cancelled", color: "0 60% 50%", order: 11 },
  { id: "order-shipped", name: "Order Shipped", color: "220 70% 55%", order: 12 },
];

export const agents = [
  { id: "a1", name: "Sarah Chen", email: "sarah@company.com", role: "admin", avatar: "SC", leadCount: 12, status: "online" },
  { id: "a2", name: "Mike Rivera", email: "mike@company.com", role: "agent", avatar: "MR", leadCount: 8, status: "online" },
  { id: "a3", name: "Priya Sharma", email: "priya@company.com", role: "agent", avatar: "PS", leadCount: 15, status: "away" },
  { id: "a4", name: "James Lee", email: "james@company.com", role: "agent", avatar: "JL", leadCount: 6, status: "offline" },
];

export const leads = [
  { id: "l1", name: "Alex Thompson", phone: "+1 555-0101", email: "alex@email.com", source: "WhatsApp", tags: ["hot", "enterprise"], stage: "interested", assignedAgent: "a1", leadScore: 85, lastContacted: "2026-03-05T10:30:00", nextFollowUp: "2026-03-06T14:00:00", createdAt: "2026-03-01T09:00:00", lastActivity: "2026-03-05T10:30:00", lastMessage: "Yes, I'd love to see the enterprise pricing" },
  { id: "l2", name: "Maria Garcia", phone: "+1 555-0102", email: "maria@startup.io", source: "Campaign", tags: ["startup"], stage: "new", assignedAgent: "a2", leadScore: 45, lastContacted: "2026-03-05T08:15:00", nextFollowUp: null, createdAt: "2026-03-05T08:15:00", lastActivity: "2026-03-05T08:15:00", lastMessage: "Hi, I saw your ad about the CRM tool" },
  { id: "l3", name: "David Kim", phone: "+1 555-0103", email: "david@corp.com", source: "Website", tags: ["enterprise", "demo"], stage: "negotiation", assignedAgent: "a1", leadScore: 92, lastContacted: "2026-03-04T16:00:00", nextFollowUp: "2026-03-05T11:00:00", createdAt: "2026-02-20T10:00:00", lastActivity: "2026-03-04T16:00:00", lastMessage: "Can we discuss the annual plan discount?" },
  { id: "l4", name: "Emma Wilson", phone: "+1 555-0104", email: "emma@design.co", source: "WhatsApp", tags: ["smb"], stage: "contacted", assignedAgent: "a3", leadScore: 60, lastContacted: "2026-03-04T14:20:00", nextFollowUp: "2026-03-06T10:00:00", createdAt: "2026-03-02T11:30:00", lastActivity: "2026-03-04T14:20:00", lastMessage: "Thanks for reaching out! Let me check with my team" },
  { id: "l5", name: "Ryan Patel", phone: "+1 555-0105", email: "ryan@tech.io", source: "Campaign", tags: ["hot", "tech"], stage: "follow-up", assignedAgent: "a2", leadScore: 78, lastContacted: "2026-03-03T09:45:00", nextFollowUp: "2026-03-05T15:00:00", createdAt: "2026-02-28T14:00:00", lastActivity: "2026-03-03T09:45:00", lastMessage: "I need to compare with our current solution first" },
  { id: "l6", name: "Sophie Brown", phone: "+1 555-0106", email: "sophie@retail.com", source: "WhatsApp", tags: ["retail"], stage: "won", assignedAgent: "a3", leadScore: 98, lastContacted: "2026-03-04T11:00:00", nextFollowUp: null, createdAt: "2026-02-15T08:00:00", lastActivity: "2026-03-04T11:00:00", lastMessage: "Great, let's go with the Pro plan!" },
  { id: "l7", name: "Chris Johnson", phone: "+1 555-0107", email: "chris@agency.com", source: "Website", tags: ["agency"], stage: "new", assignedAgent: "a4", leadScore: 35, lastContacted: "2026-03-05T07:30:00", nextFollowUp: null, createdAt: "2026-03-05T07:30:00", lastActivity: "2026-03-05T07:30:00", lastMessage: "What integrations do you support?" },
  { id: "l8", name: "Lisa Chang", phone: "+1 555-0108", email: "lisa@health.org", source: "Campaign", tags: ["healthcare"], stage: "interested", assignedAgent: "a2", leadScore: 72, lastContacted: "2026-03-04T13:00:00", nextFollowUp: "2026-03-07T09:00:00", createdAt: "2026-02-25T10:00:00", lastActivity: "2026-03-04T13:00:00", lastMessage: "Do you have HIPAA compliance?" },
  { id: "l9", name: "Tom Martinez", phone: "+1 555-0109", email: "tom@food.co", source: "WhatsApp", tags: ["smb", "food"], stage: "lost", assignedAgent: "a1", leadScore: 20, lastContacted: "2026-03-01T10:00:00", nextFollowUp: null, createdAt: "2026-02-18T09:00:00", lastActivity: "2026-03-01T10:00:00", lastMessage: "We decided to go with another solution" },
  { id: "l10", name: "Nina Volkov", phone: "+1 555-0110", email: "nina@finance.com", source: "Website", tags: ["enterprise", "finance"], stage: "contacted", assignedAgent: "a3", leadScore: 55, lastContacted: "2026-03-05T09:00:00", nextFollowUp: "2026-03-06T16:00:00", createdAt: "2026-03-04T15:00:00", lastActivity: "2026-03-05T09:00:00", lastMessage: "I'd like to schedule a demo with my CFO" },
];

export const messages = [
  { id: "m1", leadId: "l1", content: "Hi! I'm interested in your CRM platform", sender: "lead", timestamp: "2026-03-05T10:00:00", type: "text" },
  { id: "m2", leadId: "l1", content: "Welcome Alex! I'd be happy to help. What size is your team?", sender: "agent", timestamp: "2026-03-05T10:05:00", type: "text", agentName: "Sarah Chen" },
  { id: "m3", leadId: "l1", content: "We have about 50 people. Looking for enterprise features", sender: "lead", timestamp: "2026-03-05T10:15:00", type: "text" },
  { id: "m4", leadId: "l1", content: "Perfect! Let me send you our enterprise pricing details", sender: "agent", timestamp: "2026-03-05T10:20:00", type: "text", agentName: "Sarah Chen" },
  { id: "m5", leadId: "l1", content: "Yes, I'd love to see the enterprise pricing", sender: "lead", timestamp: "2026-03-05T10:30:00", type: "text" },
  { id: "m6", leadId: "l2", content: "Hi, I saw your ad about the CRM tool", sender: "lead", timestamp: "2026-03-05T08:15:00", type: "text" },
  { id: "m7", leadId: "l3", content: "Can we discuss the annual plan discount?", sender: "lead", timestamp: "2026-03-04T16:00:00", type: "text" },
  { id: "m8", leadId: "l3", content: "Of course David! For annual plans we offer 20% off", sender: "agent", timestamp: "2026-03-04T16:10:00", type: "text", agentName: "Sarah Chen" },
];

export const automationRules = [
  {
    id: "r1", name: "Price Inquiry Auto-Route", active: true,
    triggerType: "keyword", triggerValue: "price",
    conditionLogic: "AND",
    conditions: [
      { id: "c1", field: "message", operator: "contains", value: "price" },
      { id: "c2", field: "stage", operator: "equals", value: "new" },
    ],
    actions: [
      { id: "a1", type: "move_stage", value: "interested", order: 1 },
      { id: "a2", type: "assign_agent", value: "a1", order: 2 },
      { id: "a3", type: "send_message", value: "Our team will share pricing shortly.", order: 3 },
    ],
    createdAt: "2026-02-01",
  },
  {
    id: "r2", name: "Demo Request Handler", active: true,
    triggerType: "button_click", triggerValue: "Book Demo",
    conditionLogic: "AND",
    conditions: [
      { id: "c3", field: "stage", operator: "equals", value: "new" },
    ],
    actions: [
      { id: "a4", type: "move_stage", value: "interested", order: 1 },
      { id: "a5", type: "assign_agent", value: "a2", order: 2 },
      { id: "a6", type: "send_message", value: "Your demo has been booked! We'll be in touch.", order: 3 },
      { id: "a7", type: "add_tag", value: "demo-requested", order: 4 },
    ],
    createdAt: "2026-02-10",
  },
  {
    id: "r3", name: "No Response Follow-up", active: false,
    triggerType: "no_response", triggerValue: "120",
    conditionLogic: "AND",
    conditions: [
      { id: "c4", field: "stage", operator: "equals", value: "new" },
    ],
    actions: [
      { id: "a8", type: "move_stage", value: "contacted", order: 1 },
      { id: "a9", type: "notify_agent", value: "Lead has not been responded to in 2 hours", order: 2 },
    ],
    createdAt: "2026-02-15",
  },
  {
    id: "r4", name: "Inactive Lead Reminder", active: true,
    triggerType: "lead_inactive", triggerValue: "1440",
    conditionLogic: "AND",
    conditions: [
      { id: "c5", field: "stage", operator: "not_equals", value: "won" },
      { id: "c6", field: "stage", operator: "not_equals", value: "lost" },
    ],
    actions: [
      { id: "a10", type: "move_stage", value: "follow-up", order: 1 },
      { id: "a11", type: "notify_agent", value: "Lead inactive for 24 hours", order: 2 },
    ],
    createdAt: "2026-02-20",
  },
];

export const automationLogs = [
  { id: "log1", ruleId: "r1", ruleName: "Price Inquiry Auto-Route", leadId: "l1", leadName: "Alex Thompson", status: "success", executionTime: "2026-03-05T10:30:05", details: "Moved to Interested, assigned to Sarah Chen, sent message" },
  { id: "log2", ruleId: "r2", ruleName: "Demo Request Handler", leadId: "l3", leadName: "David Kim", status: "success", executionTime: "2026-03-04T16:05:00", details: "Moved to Interested, assigned to Mike Rivera, sent confirmation" },
  { id: "log3", ruleId: "r3", ruleName: "No Response Follow-up", leadId: "l7", leadName: "Chris Johnson", status: "skipped", executionTime: "2026-03-05T09:30:00", details: "Rule is inactive" },
  { id: "log4", ruleId: "r1", ruleName: "Price Inquiry Auto-Route", leadId: "l8", leadName: "Lisa Chang", status: "failed", executionTime: "2026-03-04T13:05:00", details: "Condition mismatch: stage was not New Lead" },
];

export const activities = [
  { id: "act1", leadId: "l1", type: "message_in", description: "Incoming message: 'Yes, I'd love to see the enterprise pricing'", timestamp: "2026-03-05T10:30:00" },
  { id: "act2", leadId: "l1", type: "stage_change", description: "Stage changed from Contacted → Interested", timestamp: "2026-03-05T10:25:00", agent: "Sarah Chen" },
  { id: "act3", leadId: "l1", type: "message_out", description: "Sent enterprise pricing details", timestamp: "2026-03-05T10:20:00", agent: "Sarah Chen" },
  { id: "act4", leadId: "l1", type: "assignment", description: "Lead assigned to Sarah Chen", timestamp: "2026-03-01T09:05:00", agent: "System" },
  { id: "act5", leadId: "l1", type: "automation", description: "Automation triggered: Price Inquiry Auto-Route", timestamp: "2026-03-01T09:02:00" },
];
