/**
 * Simple keyword-based chatbot for JSK Handloom support.
 * Returns a reply string when user message matches an intent, else null.
 */

const intents = [
  {
    keywords: ["hi", "hello", "hey", "good morning", "good evening", "namaste", "start"],
    reply: "Hello! 👋 Welcome to JSK Handloom. I can help with shipping, sizes, price requests, or you can type your question. Our team will also reply when they’re online.",
  },
  {
    keywords: ["ship", "shipping", "delivery", "deliver", "how long", "when will", "days", "india"],
    reply: "We ship all over India. Approximate delivery time is 7 days from order confirmation. You’ll get updates on your order status.",
  },
  {
    keywords: ["size", "sizes", "dimension", "dimensions", "measurement", "available size"],
    reply: "We offer tapestries in multiple dimensions. Exact size options are listed on each product page. Need a custom size? Mention it in the message—we may be able to help with custom orders.",
  },
  {
    keywords: ["price", "request price", "price approval", "approval", "quote", "cost", "how much"],
    reply: "To get a price: add items to your cart, then click “Request price approval”. We’ll call or message you as soon as possible to discuss the product and prices.",
  },
  {
    keywords: ["contact", "phone", "email", "call", "whatsapp", "number", "reach"],
    reply: "You can reach us at:\n• Phone: +91 9305058581\n• Email: swapnilmauryavidhay@gmail.com\n• WhatsApp: same number. We typically reply within 24–48 hours.",
  },
  {
    keywords: ["address", "location", "where", "varanasi"],
    reply: "We’re at: Bhawanipur Shivpur, Varanasi, Uttar Pradesh, India – 221003.",
  },
  {
    keywords: ["custom", "bulk", "order in bulk", "custom order", "custom design"],
    reply: "We welcome custom and bulk orders! Share your requirement here or via the Contact page, and we’ll get back to you with details.",
  },
  {
    keywords: ["hang", "care", "framing", "frame", "maintain", "clean"],
    reply: "Framing is ideal for hanging and protects the tapestry. Avoid direct sunlight to prevent fading, and dust gently. Need more care tips? Just ask!",
  },
  {
    keywords: ["return", "exchange", "refund", "cancel"],
    reply: "Currently we don’t offer returns or refunds. If you have a concern about your order, please message us and we’ll try to help.",
  },
  {
    keywords: ["order status", "my order", "track", "where is my order"],
    reply: "For order status or tracking, share your order details here and our team will update you when they’re online, or you can check the Orders page in your account.",
  },
  {
    keywords: ["thank", "thanks", "bye", "goodbye", "ok", "okay"],
    reply: "You’re welcome! If you need anything else, we’re here. Happy shopping! 🙏",
  },
];

/**
 * Normalize user input for matching: lowercase, trim, collapse spaces.
 */
function normalize(text) {
  if (!text || typeof text !== "string") return "";
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Returns a bot reply string if the user message matches an intent, else null.
 */
export function getBotReply(userMessage) {
  const normalized = normalize(userMessage);
  if (!normalized) return null;

  for (const { keywords, reply } of intents) {
    const matched = keywords.some((kw) => {
      const k = normalize(kw);
      return normalized.includes(k) || normalized === k;
    });
    if (matched) return reply;
  }

  return "Thanks for your message. Our team will get back to you soon. Meanwhile, you can ask about shipping, sizes, price requests, or contact details.";
}

/**
 * Returns quick-reply options for the chat UI (label only; frontend sends as message).
 */
export function getQuickReplies() {
  return [
    "Hi, I need help",
    "Shipping & delivery?",
    "What sizes do you offer?",
    "How does price approval work?",
    "Contact / WhatsApp",
  ];
}
