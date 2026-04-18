const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof payload === "object"
        ? payload.message || payload.response || "Request failed."
        : payload || "Request failed."
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (typeof payload === "object" && payload?.status === "error") {
    const error = new Error(payload.message || payload.response || "Request failed.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  getAcademy() {
    return request("/api/academy");
  },

  getAcademyModule(moduleId) {
    return request(`/api/academy/${moduleId}`);
  },

  setModuleComplete(moduleId, status) {
    return request("/api/complete", {
      method: "POST",
      body: JSON.stringify({ id: moduleId, status }),
    });
  },

  rateModule(moduleId, score) {
    return request("/api/rate", {
      method: "POST",
      body: JSON.stringify({ id: moduleId, score }),
    });
  },

  postComment(moduleId, text, parentId) {
    return request("/api/comment", {
      method: "POST",
      body: JSON.stringify({ id: moduleId, text, parentId }),
    });
  },

  likeComment(courseId, commentId, action) {
    return request("/api/comment/like", {
      method: "POST",
      body: JSON.stringify({ courseId, commentId, action }),
    });
  },

  likeReply(courseId, commentId, replyId, action) {
    return request("/api/comment/reply/like", {
      method: "POST",
      body: JSON.stringify({ courseId, commentId, replyId, action }),
    });
  },

  getStockPool() {
    return request("/api/lab/stocks");
  },

  getQuotes(symbols) {
    return request(`/api/lab/quote?symbols=${encodeURIComponent(symbols.join(","))}`);
  },

  getKline(symbol, days = 60) {
    return request(`/api/lab/kline?symbol=${encodeURIComponent(symbol)}&days=${days}`);
  },

  getPortfolio() {
    return request("/api/lab/portfolio");
  },

  trade({ action, symbol, shares, price }) {
    return request("/api/lab/trade", {
      method: "POST",
      body: JSON.stringify({ action, symbol, shares, price }),
    });
  },

  resetPortfolio() {
    return request("/api/lab/reset", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getStockNews(symbol) {
    return request(`/api/lab/news?symbol=${encodeURIComponent(symbol)}`);
  },

  getAgentSessions() {
    return request("/api/agent/sessions");
  },

  getAgentHistory(sessionId) {
    return request(`/api/agent/history?session_id=${encodeURIComponent(sessionId)}`);
  },

  sendAgentMessage(message, sessionId) {
    return request("/api/agent/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  },

  clearAgentSession(sessionId) {
    return request("/api/agent/clear", {
      method: "POST",
      body: JSON.stringify(sessionId ? { session_id: sessionId } : {}),
    });
  },

  submitInquiry(payload) {
    return request("/api/inquiry", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function formatIsoTime(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatIsoDate(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString([], { month: "short", day: "numeric" });
}
