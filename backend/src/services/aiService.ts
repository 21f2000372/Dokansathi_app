// ==========================================
// AI SERVICE (GROQ)
//
// Generates a short, plain-language analysis of
// a shop's sales performance using Groq's
// OpenAI-compatible chat completions API.
//
// The API key is read from process.env.GROQ_API_KEY
// and never leaves the server. If the key is
// missing or the request fails, callers get a
// clear error so the feature degrades gracefully
// (the analytics page still works without AI).
// ==========================================

const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

// Model confirmed available on the current key.
// gpt-oss models emit hidden reasoning tokens, so
// max_tokens is set generously to avoid truncation.
const GROQ_MODEL = "openai/gpt-oss-20b";

interface AnalyticsProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  productCount: number;
  products: AnalyticsProduct[];
}

/*
 * Build a compact prompt from the analytics
 * summary. We only send aggregated numbers
 * (no customer data) to keep the payload small
 * and privacy-friendly.
 */
const buildPrompt = (
  analytics: AnalyticsSummary,
): string => {
  const topProducts = analytics.products
    .slice(0, 5)
    .map(
      (product, index) =>
        `${index + 1}. ${product.name}: ${product.unitsSold} units, ₹${product.revenue} revenue, ${product.orderCount} orders`,
    )
    .join("\n");

  const bottomProducts = analytics.products
    .slice(-5)
    .reverse()
    .map(
      (product) =>
        `- ${product.name}: ${product.unitsSold} units, ₹${product.revenue} revenue`,
    )
    .join("\n");

  return [
    "You are a helpful retail business analyst for a small neighbourhood shop.",
    "Based ONLY on the sales data below, write a short, friendly analysis for the shop owner.",
    "",
    `Total revenue: ₹${analytics.totalRevenue}`,
    `Total orders: ${analytics.totalOrders}`,
    `Number of products sold: ${analytics.productCount}`,
    "",
    "Top products by revenue:",
    topProducts || "No sales yet.",
    "",
    "Lowest performing products:",
    bottomProducts || "No sales yet.",
    "",
    "In 4-6 short sentences: highlight the best performers, point out weak performers,",
    "and give one or two practical suggestions (e.g. promote, bundle, restock, or reconsider).",
    "Use rupee (₹) amounts. Do not invent data that is not provided. Keep it concise and plain.",
  ].join("\n");
};

export const generateShopInsights = async (
  analytics: AnalyticsSummary,
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("AI is not configured");
  }

  // Nothing to analyse yet.
  if (
    !analytics.products ||
    analytics.products.length === 0
  ) {
    return "There are no sales yet, so there's nothing to analyse. Once you start receiving orders, insights will appear here.";
  }

  const prompt = buildPrompt(analytics);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    let detail = "";

    try {
      const errorBody = await response.json();
      detail = errorBody?.error?.message || "";
    } catch {
      // Ignore body parse errors.
    }

    throw new Error(
      `AI request failed (${response.status}). ${detail}`.trim(),
    );
  }

  const data = await response.json();

  const message =
    data?.choices?.[0]?.message?.content?.trim();

  if (!message) {
    throw new Error(
      "AI returned an empty response",
    );
  }

  return message;
};
