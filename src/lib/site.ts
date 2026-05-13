import {
  BarChart3,
  Bot,
  CreditCard,
  Handshake,
  Home,
  Inbox,
  Megaphone,
  MessageSquareText,
  Settings,
  ShoppingBag,
  Sparkles,
  Truck,
  Utensils,
  Users,
  Workflow,
  Rocket,
  CircleHelp,
} from "lucide-react";

export const appName = "ServeFlow";

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const dashboardLinks = [
  { label: "Launch", href: "/dashboard/launch", icon: Rocket },
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Onboarding", href: "/dashboard/onboarding", icon: Sparkles },
  { label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { label: "Automations", href: "/dashboard/automations", icon: Workflow },
  { label: "Menu", href: "/dashboard/menu", icon: Utensils },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Pilots", href: "/dashboard/pilots", icon: Handshake },
  { label: "Outreach", href: "/dashboard/outreach", icon: Megaphone },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings/business", icon: Settings },
  { label: "Delivery", href: "/dashboard/settings/delivery", icon: Truck },
  { label: "FAQs", href: "/dashboard/automations/faqs", icon: CircleHelp },
];

export const features = [
  {
    title: "Instant WhatsApp Replies",
    description:
      "Reply to menu, price, delivery, location, and opening-hour questions automatically.",
    icon: MessageSquareText,
  },
  {
    title: "Smart Restaurant Automations",
    description:
      "Create simple rules like ‘menu’ → send menu, or ‘order’ → start order flow.",
    icon: Workflow,
  },
  {
    title: "Human Takeover",
    description:
      "Pause automation and reply manually whenever a customer needs personal attention.",
    icon: Bot,
  },
  {
    title: "Simple Analytics",
    description:
      "Track messages, common questions, customer interest, and order activity.",
    icon: BarChart3,
  },
];

export const stats = [
  { label: "Messages today", value: "248" },
  { label: "Orders started", value: "42" },
  { label: "Auto replies", value: "189" },
  { label: "Response rate", value: "94%" },
];

export const recentMessages = [
  {
    name: "Amaka",
    message: "Hello, do you have fried rice and chicken?",
    time: "2 min ago",
  },
  {
    name: "Daniel",
    message: "Please send your menu and delivery fee.",
    time: "8 min ago",
  },
  {
    name: "Ruth",
    message: "Are you open this evening?",
    time: "15 min ago",
  },
];

export const quickRules = [
  {
    trigger: "menu",
    response: "Send full food menu with prices.",
  },
  {
    trigger: "delivery",
    response: "Share delivery areas and estimated fees.",
  },
  {
    trigger: "order",
    response: "Start order collection flow.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "₦10k",
    description: "For small food vendors testing automation.",
    features: ["Basic auto replies", "Menu link", "Simple dashboard"],
  },
  {
    name: "Growth",
    price: "₦25k",
    description: "For restaurants handling daily WhatsApp orders.",
    features: ["Automation rules", "Inbox", "Analytics", "Human takeover"],
    popular: true,
  },
  {
    name: "Premium",
    price: "₦50k",
    description: "For busy restaurants needing stronger workflows.",
    features: ["Multi-agent support", "Advanced analytics", "Priority setup"],
  },
];

export const onboardingSteps = [
  {
    title: "Restaurant profile",
    description: "Add your business name, phone number, location, and brand details.",
    status: "In progress",
  },
  {
    title: "Opening hours",
    description: "Tell customers when your restaurant is available.",
    status: "Pending",
  },
  {
    title: "Menu setup",
    description: "Add food items, prices, categories, and availability.",
    status: "Pending",
  },
  {
    title: "FAQs",
    description: "Add common answers for delivery, payment, location, and ordering.",
    status: "Pending",
  },
];

export const menuCategories = ["Rice", "Swallow", "Shawarma", "Chicken", "Drinks"];

export const sampleMenuItems = [
  {
    name: "Jollof Rice & Chicken",
    category: "Rice",
    price: "₦3,500",
    status: "Available",
  },
  {
    name: "Beef Shawarma",
    category: "Shawarma",
    price: "₦2,800",
    status: "Available",
  },
  {
    name: "Egusi Soup with Pounded Yam",
    category: "Swallow",
    price: "₦4,000",
    status: "Available",
  },
];

export const sampleFaqs = [
  {
    question: "Do you deliver?",
    answer: "Yes, we deliver within selected areas. Delivery fee depends on location.",
  },
  {
    question: "What time do you open?",
    answer: "We open from 9:00 AM to 9:00 PM every day.",
  },
  {
    question: "Can I pay on delivery?",
    answer: "Yes, payment on delivery is available for selected locations.",
  },
];

export const automationTemplates = [
  {
    title: "Send menu",
    trigger: "menu",
    response: "Send today’s menu with prices and available items.",
    category: "Menu",
  },
  {
    title: "Delivery info",
    trigger: "delivery",
    response: "Share delivery areas, estimated time, and delivery fees.",
    category: "Delivery",
  },
  {
    title: "Start order",
    trigger: "order",
    response: "Ask customer what they want, quantity, address, and payment method.",
    category: "Orders",
  },
  {
    title: "Opening hours",
    trigger: "open",
    response: "Tell customers today’s opening and closing time.",
    category: "Business",
  },
];

export const activeAutomations = [
  {
    name: "Menu request",
    trigger: "menu, food, price list",
    action: "Send menu items",
    status: "Active",
    used: "86 times",
  },
  {
    name: "Delivery question",
    trigger: "delivery, location, fee",
    action: "Send delivery information",
    status: "Active",
    used: "43 times",
  },
  {
    name: "Order starter",
    trigger: "order, buy, make order",
    action: "Start order collection",
    status: "Draft",
    used: "12 times",
  },
];

export const inboxCustomers = [
  {
    name: "Amaka Okafor",
    phone: "+234 801 234 5678",
    lastMessage: "Please send your menu",
    time: "2 min ago",
    status: "Bot active",
    unread: 2,
  },
  {
    name: "Daniel Musa",
    phone: "+234 809 555 0101",
    lastMessage: "How much is delivery to Wuse?",
    time: "8 min ago",
    status: "Needs human",
    unread: 1,
  },
  {
    name: "Ruth James",
    phone: "+234 706 222 9090",
    lastMessage: "Are you open this evening?",
    time: "15 min ago",
    status: "Bot active",
    unread: 0,
  },
  {
    name: "Kelvin Ade",
    phone: "+234 813 111 4455",
    lastMessage: "I want to order shawarma",
    time: "25 min ago",
    status: "Human takeover",
    unread: 0,
  },
];

export const activeChatMessages = [
  {
    sender: "customer",
    message: "Hello, please send your menu.",
    time: "12:40 PM",
  },
  {
    sender: "bot",
    message:
      "Sure 😊 Here is today’s menu: Jollof Rice ₦3,500, Beef Shawarma ₦2,800, Egusi & Pounded Yam ₦4,000.",
    time: "12:40 PM",
  },
  {
    sender: "customer",
    message: "Do you deliver to Kubwa?",
    time: "12:42 PM",
  },
  {
    sender: "bot",
    message:
      "Yes, we deliver to Kubwa. Delivery fee starts from ₦1,000 depending on your exact location.",
    time: "12:42 PM",
  },
  {
    sender: "customer",
    message: "Okay, I want jollof rice and chicken.",
    time: "12:43 PM",
  },
];

export const analyticsStats = [
  {
    label: "Total messages",
    value: "1,248",
    change: "+18%",
    description: "Compared to last week",
  },
  {
    label: "Auto replies sent",
    value: "934",
    change: "+24%",
    description: "Handled by assistant",
  },
  {
    label: "Orders started",
    value: "186",
    change: "+12%",
    description: "From WhatsApp chats",
  },
  {
    label: "Human takeovers",
    value: "37",
    change: "-8%",
    description: "Manual replies needed",
  },
];

export const popularQuestions = [
  {
    question: "Please send menu",
    count: "386",
    percentage: "31%",
  },
  {
    question: "How much is delivery?",
    count: "214",
    percentage: "17%",
  },
  {
    question: "Are you open?",
    count: "148",
    percentage: "12%",
  },
  {
    question: "Do you have shawarma?",
    count: "103",
    percentage: "8%",
  },
];

export const busiestHours = [
  { time: "9 AM", messages: 42 },
  { time: "12 PM", messages: 118 },
  { time: "3 PM", messages: 76 },
  { time: "6 PM", messages: 164 },
  { time: "9 PM", messages: 89 },
];

export const automationPerformance = [
  {
    name: "Menu request",
    triggered: "386",
    success: "92%",
  },
  {
    name: "Delivery info",
    triggered: "214",
    success: "88%",
  },
  {
    name: "Opening hours",
    triggered: "148",
    success: "95%",
  },
  {
    name: "Order starter",
    triggered: "186",
    success: "73%",
  },
];

export const growthTips = [
  "Customers ask for menu the most. Keep menu prices updated daily.",
  "Most chats happen around 6 PM. Make sure human takeover is available then.",
  "Order starter has lower success. Add clearer payment and delivery instructions.",
];

export const whatsappSetupSteps = [
  {
    title: "Create Meta developer app",
    description: "Create or open your Meta app and add WhatsApp product.",
    status: "Pending",
  },
  {
    title: "Add callback URL",
    description: "Use your deployed webhook URL inside WhatsApp configuration.",
    status: "Pending",
  },
  {
    title: "Set verify token",
    description: "Use the same token saved in your environment variables.",
    status: "Pending",
  },
  {
    title: "Subscribe to messages",
    description: "Subscribe your app to WhatsApp message webhook events.",
    status: "Pending",
  },
];

export const firstTimeSetupGuide = [
  {
    title: "Complete restaurant profile",
    description:
      "Add restaurant name, WhatsApp number, location, and opening hours.",
    href: "/dashboard/settings/business",
  },
  {
    title: "Add menu items",
    description: "Add foods, prices, and categories customers can request.",
    href: "/dashboard/menu",
  },
  {
    title: "Add delivery zones",
    description: "Set delivery areas, fees, and estimated delivery time.",
    href: "/dashboard/settings/delivery",
  },
  {
    title: "Create automations",
    description:
      "Create replies for menu, delivery, order, and opening hours.",
    href: "/dashboard/automations",
  },
  {
    title: "Test WhatsApp webhook",
    description: "Send a mock webhook message before going live.",
    href: "/dashboard/settings/whatsapp",
  },
];

export const outreachScripts = [
  {
    title: "First message",
    channel: "WhatsApp / Instagram DM",
    message:
      "Hi, I noticed your food business handles customer orders and questions on WhatsApp. I am building a WhatsApp assistant that can automatically reply to menu, delivery, price, and order questions for restaurants. I made a quick demo and would love to show you.",
  },
  {
    title: "Soft follow-up",
    channel: "WhatsApp / Instagram DM",
    message:
      "Hi again. Just checking if you would like to see the WhatsApp assistant demo. It can help reduce missed customer messages and make ordering easier for your food business.",
  },
  {
    title: "Pilot offer",
    channel: "WhatsApp / Instagram DM",
    message:
      "I am currently selecting a few food businesses for early pilot setup. I can help set up your menu, delivery replies, and order flow so customers get instant WhatsApp responses. Would you like me to show you how it works?",
  },
  {
    title: "After demo",
    channel: "WhatsApp / Instagram DM",
    message:
      "Thanks for checking the demo. If you are interested, I can help set up a simple version for your business with your menu, delivery areas, and common customer questions.",
  },
];

export const billingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "₦10,000",
    amount: 1000000,
    description: "For small food vendors testing WhatsApp automation.",
    features: ["Basic auto replies", "Menu setup", "Simple dashboard"],
    planCodeEnv: "PAYSTACK_STARTER_PLAN_CODE",
  },
  {
    id: "growth",
    name: "Growth",
    price: "₦25,000",
    amount: 2500000,
    description: "For restaurants handling daily WhatsApp orders.",
    features: ["Automation rules", "Inbox", "Analytics", "Human takeover"],
    popular: true,
    planCodeEnv: "PAYSTACK_GROWTH_PLAN_CODE",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦50,000",
    amount: 5000000,
    description: "For busy restaurants needing stronger workflows.",
    features: ["Multi-agent support", "Advanced analytics", "Priority setup"],
    planCodeEnv: "PAYSTACK_PREMIUM_PLAN_CODE",
  },
];

export const billingHistory = [
  {
    invoice: "INV-001",
    plan: "Growth",
    amount: "₦25,000",
    status: "Paid",
    date: "May 12, 2026",
  },
  {
    invoice: "INV-002",
    plan: "Growth",
    amount: "₦25,000",
    status: "Paid",
    date: "Apr 12, 2026",
  },
];

export const launchChecklist = [
  {
    title: "Landing page completed",
    status: "Done",
  },
  {
    title: "Dashboard shell completed",
    status: "Done",
  },
  {
    title: "Restaurant onboarding completed",
    status: "Done",
  },
  {
    title: "Automation builder completed",
    status: "Done",
  },
  {
    title: "Inbox UI completed",
    status: "Done",
  },
  {
    title: "Analytics UI completed",
    status: "Done",
  },
  {
    title: "WhatsApp API foundation completed",
    status: "Done",
  },
  {
    title: "Billing foundation completed",
    status: "Done",
  },
  {
    title: "Database and auth connection",
    status: "Next",
  },
  {
    title: "Deploy to Vercel",
    status: "Next",
  },
];

export const sparklesIcon = Sparkles;
