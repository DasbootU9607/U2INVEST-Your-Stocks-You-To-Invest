const memoryStore = new Map();

const DEMO_STORAGE_KEYS = {
  academy: "u2invest.demo.academy",
  comments: "u2invest.demo.comments",
  portfolio: "u2invest.demo.portfolio",
  chat: "u2invest.demo.chat",
  inquiries: "u2invest.demo.inquiries",
};

const DEMO_STOCK_META = {
  AAPL: { name: "Apple", basePrice: 212, sector: "Mega Cap", assetType: "equity", aliases: ["apple"] },
  MSFT: { name: "Microsoft", basePrice: 428, sector: "Mega Cap", assetType: "equity", aliases: ["microsoft"] },
  NVDA: { name: "NVIDIA", basePrice: 134, sector: "Mega Cap", assetType: "equity", aliases: ["nvidia"] },
  AMZN: { name: "Amazon", basePrice: 186, sector: "Mega Cap", assetType: "equity", aliases: ["amazon"] },
  META: { name: "Meta", basePrice: 498, sector: "Mega Cap", assetType: "equity", aliases: ["meta platforms", "facebook"] },
  TSLA: { name: "Tesla", basePrice: 196, sector: "Growth", assetType: "equity", aliases: ["tesla"] },
  AMD: { name: "AMD", basePrice: 168, sector: "Growth", assetType: "equity", aliases: ["advanced micro devices"] },
  PLTR: { name: "Palantir", basePrice: 28, sector: "Growth", assetType: "equity", aliases: ["palantir"] },
  COIN: { name: "Coinbase", basePrice: 238, sector: "Growth", assetType: "equity", aliases: ["coinbase"] },
  SPY: { name: "SPDR S&P 500 ETF", basePrice: 518, sector: "ETFs", assetType: "etf", aliases: ["s&p 500", "spdr s&p 500 etf"] },
  QQQ: { name: "Invesco QQQ", basePrice: 443, sector: "ETFs", assetType: "etf", aliases: ["nasdaq 100", "invesco qqq"] },
  IWM: { name: "iShares Russell 2000 ETF", basePrice: 204, sector: "ETFs", assetType: "etf", aliases: ["russell 2000", "ishares russell 2000 etf"] },
  GLD: { name: "SPDR Gold Shares", basePrice: 216, sector: "ETFs", assetType: "etf", aliases: ["gold etf", "spdr gold shares"] },
  "BTC-USD": { name: "Bitcoin", basePrice: 84200, sector: "Crypto", assetType: "crypto", aliases: ["bitcoin", "btc"] },
  "ETH-USD": { name: "Ethereum", basePrice: 3980, sector: "Crypto", assetType: "crypto", aliases: ["ethereum", "eth"] },
  "SOL-USD": { name: "Solana", basePrice: 176, sector: "Crypto", assetType: "crypto", aliases: ["solana", "sol"] },
};

const DEMO_STOCK_POOL = {
  "Mega Cap": ["AAPL", "MSFT", "NVDA", "AMZN", "META"],
  Growth: ["TSLA", "AMD", "PLTR", "COIN"],
  ETFs: ["SPY", "QQQ", "IWM", "GLD"],
  Crypto: ["BTC-USD", "ETH-USD", "SOL-USD"],
};

const DEMO_MODULES = [
  {
    id: 1,
    parent: null,
    cat: "Foundations",
    difficulty: 1,
    name: "Time Value of Money",
    video: "cy4PiY5ERTI",
    source: "Patrick Boyle",
    views: "280k",
    completed: false,
    ratings: [5, 4, 5, 5],
    video_intro: "The foundation behind discounting, compounding, and every serious valuation model.",
    outcomes: ["Calculate present and future value", "Understand discount rates", "Explain compounding"],
    takeaways: ["Money today is worth more than money later", "Compounding changes outcomes non-linearly"],
  },
  {
    id: 2,
    parent: 1,
    cat: "Foundations",
    difficulty: 1,
    name: "What Is a Stock?",
    video: "C_3f_3_J_00",
    source: "Khan Academy",
    views: "850k",
    completed: false,
    ratings: [5, 5, 4],
    video_intro: "Understand what ownership means when you buy a share in a listed company.",
    outcomes: ["Define equity ownership", "Differentiate common and preferred shares"],
    takeaways: ["A share is a slice of a business", "Ownership and risk move together"],
  },
  {
    id: 3,
    parent: 2,
    cat: "Economics",
    difficulty: 1,
    name: "How the Stock Market Works",
    video: "p7HKvqRI_Bo",
    source: "TED-Ed",
    views: "2.1M",
    completed: false,
    ratings: [4, 4, 5],
    video_intro: "A practical overview of exchanges, matching, liquidity, and price discovery.",
    outcomes: ["Explain exchange mechanics", "Understand supply and demand in pricing"],
    takeaways: ["Price is where buyers and sellers meet", "Liquidity changes execution quality"],
  },
  {
    id: 4,
    parent: 3,
    cat: "Analysis",
    difficulty: 2,
    name: "Reading Financial Statements",
    video: "21STUhQ-iP0",
    source: "The Plain Bagel",
    views: "450k",
    completed: false,
    ratings: [5, 4, 5],
    video_intro: "Work through the balance sheet, income statement, and cash flow statement.",
    outcomes: ["Read the big three statements", "Spot quality and risk signals"],
    takeaways: ["Cash flow often tells the cleaner story", "Margins matter only in context"],
  },
  {
    id: 5,
    parent: 4,
    cat: "Analysis",
    difficulty: 2,
    name: "P/E Ratio Explained",
    video: "4KkTGx2bK_4",
    source: "Investopedia",
    views: "300k",
    completed: false,
    ratings: [4, 4, 5],
    video_intro: "A grounded explanation of earnings multiples and when they break down.",
    outcomes: ["Calculate P/E", "Compare multiples across businesses"],
    takeaways: ["A high multiple is not automatically expensive", "Expectations are embedded in valuation"],
  },
  {
    id: 6,
    parent: 5,
    cat: "Strategy",
    difficulty: 2,
    name: "Portfolio Management",
    video: "f5px_b_y_1Q",
    source: "The Plain Bagel",
    views: "200k",
    completed: false,
    ratings: [4, 5, 4],
    video_intro: "How to size positions, diversify, and manage exposure over time.",
    outcomes: ["Construct a balanced portfolio", "Understand rebalancing discipline"],
    takeaways: ["Asset allocation drives a large part of outcomes", "Concentration increases both upside and fragility"],
  },
  {
    id: 7,
    parent: 6,
    cat: "Psychology",
    difficulty: 2,
    name: "Behavioral Finance",
    video: "p7HKvqRI_Bo",
    source: "TED-Ed",
    views: "100k",
    completed: false,
    ratings: [5, 5, 5],
    video_intro: "Study the biases that distort judgment when money is at risk.",
    outcomes: ["Identify common investor biases", "Reduce emotional decision-making"],
    takeaways: ["Good process beats reactive behavior", "FOMO and panic selling are usually expensive"],
  },
  {
    id: 8,
    parent: 7,
    cat: "Advanced",
    difficulty: 3,
    name: "Risk Management",
    video: "p7HKvqRI_Bo",
    source: "TED-Ed",
    views: "180k",
    completed: false,
    ratings: [5, 4, 5],
    video_intro: "A practical introduction to volatility, drawdowns, and position-level risk.",
    outcomes: ["Estimate downside scenarios", "Understand volatility and drawdown"],
    takeaways: ["Protecting capital matters", "Position sizing is a core risk tool"],
  },
];

const DEMO_COMMENTS = {
  1: [
    {
      id: "c1",
      user: "Mia",
      text: "This is the first concept that made discounted cash flow click for me.",
      likes: 4,
      timestamp: 1714100400,
      replies: [
        {
          id: "r1",
          user: "Leo",
          text: "Same here. The compounding examples are much clearer than a formula-only explanation.",
          likes: 2,
          timestamp: 1714104000,
        },
      ],
    },
  ],
  4: [
    {
      id: "c2",
      user: "Ava",
      text: "Helpful reminder that revenue growth alone is not enough without cash conversion.",
      likes: 3,
      timestamp: 1714186800,
      replies: [],
    },
  ],
};

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStore(key, fallbackValue) {
  const serialized = canUseStorage() ? window.localStorage.getItem(key) : memoryStore.get(key);
  if (!serialized) {
    return clone(fallbackValue);
  }

  try {
    return JSON.parse(serialized);
  } catch (error) {
    return clone(fallbackValue);
  }
}

function writeStore(key, value) {
  const serialized = JSON.stringify(value);

  if (canUseStorage()) {
    window.localStorage.setItem(key, serialized);
    return;
  }

  memoryStore.set(key, serialized);
}

function readAcademyModules() {
  return readStore(DEMO_STORAGE_KEYS.academy, DEMO_MODULES);
}

function writeAcademyModules(modules) {
  writeStore(DEMO_STORAGE_KEYS.academy, modules);
}

function readComments() {
  return readStore(DEMO_STORAGE_KEYS.comments, DEMO_COMMENTS);
}

function writeComments(comments) {
  writeStore(DEMO_STORAGE_KEYS.comments, comments);
}

function defaultPortfolio() {
  return {
    cash: 100000,
    holdings: {},
    history: [],
  };
}

function readPortfolio() {
  return readStore(DEMO_STORAGE_KEYS.portfolio, defaultPortfolio());
}

function writePortfolio(portfolio) {
  writeStore(DEMO_STORAGE_KEYS.portfolio, portfolio);
}

function readChatState() {
  return readStore(DEMO_STORAGE_KEYS.chat, { sessions: {} });
}

function writeChatState(chatState) {
  writeStore(DEMO_STORAGE_KEYS.chat, chatState);
}

function readInquiries() {
  return readStore(DEMO_STORAGE_KEYS.inquiries, []);
}

function writeInquiries(inquiries) {
  writeStore(DEMO_STORAGE_KEYS.inquiries, inquiries);
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function round(value) {
  return Number(value.toFixed(2));
}

function parseBody(options) {
  if (!options?.body) return {};

  try {
    return JSON.parse(options.body);
  } catch (error) {
    return {};
  }
}

function symbolSeed(symbol) {
  return String(symbol)
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

function generateKline(symbol, days = 60) {
  const meta = DEMO_STOCK_META[symbol] || { name: symbol, basePrice: 100, sector: "General", assetType: "equity" };
  const seed = symbolSeed(symbol);
  const today = new Date();
  const isCrypto = meta.assetType === "crypto";
  let close = meta.basePrice + (seed % 11) * 1.25;
  const points = [];

  for (let index = 0; index < days; index += 1) {
    const dayIndex = days - index;
    const date = new Date(today);
    date.setDate(today.getDate() - dayIndex);

    const trend = Math.sin((index + seed) / 6) * 1.6 + Math.cos((index + seed) / 13) * 0.9;
    const drift = ((seed % 7) - 3) * 0.08;
    const open = close + Math.sin((index + seed) / 4) * (isCrypto ? 1.2 : 0.8);
    const nextClose = Math.max(meta.basePrice * 0.25, open + trend * (isCrypto ? 0.99 : 0.45) + drift * (isCrypto ? 1.5 : 1));
    const wick = isCrypto ? 1.5 : 0.6;
    const high = Math.max(open, nextClose) + wick + ((seed + index) % 5) * 0.12;
    const low = Math.min(open, nextClose) - wick - ((seed + index) % 4) * 0.1;
    const volumeBase = isCrypto ? 900000000 : 3000000;
    const volumeSpan = isCrypto ? 800000000 : 5000000;
    const volume = volumeBase + ((seed * 113) + (index * 9173)) % volumeSpan;

    points.push({
      date: date.toISOString().slice(0, 10),
      open: round(open),
      close: round(nextClose),
      high: round(high),
      low: round(low),
      volume,
    });

    close = nextClose;
  }

  return points;
}

function buildQuotes(symbols) {
  return symbols.map((symbol) => {
    const series = generateKline(symbol, 61);
    const latest = series[series.length - 1];
    const previous = series[series.length - 2] || latest;
    const change = latest.close - previous.close;

    return {
      symbol,
      name: DEMO_STOCK_META[symbol]?.name || symbol,
      price: latest.close,
      change: round(change),
      change_pct: round(previous.close > 0 ? (change / previous.close) * 100 : 0),
      high: latest.high,
      low: latest.low,
      open: latest.open,
      volume: latest.volume,
      turnover: round(latest.volume * latest.close),
    };
  });
}

function buildNews(symbol) {
  const meta = DEMO_STOCK_META[symbol] || { name: symbol, sector: "Market", assetType: "equity" };
  const marketLens = meta.assetType === "crypto"
    ? "crypto market leadership"
    : meta.assetType === "etf"
      ? "ETF flows and index leadership"
      : `${meta.sector.toLowerCase()} leadership`;
  const researchFocus = meta.assetType === "crypto"
    ? "Focus on network activity, market structure, liquidity, and volatility management before sizing a position."
    : meta.assetType === "etf"
      ? "Focus on index exposure, fund flows, macro drivers, and how the asset fits into a broader portfolio."
      : "Focus on earnings quality, cash generation, margin stability, and where the asset sits in its broader sector cycle.";

  return [
    {
      title: `${meta.name} remains on the watchlist as investors track ${marketLens}`,
      source: "U2INVEST Demo Feed",
      time: "Today 09:10",
      summary: "This static preview uses demo headlines so the app stays usable on GitHub Pages without a live backend.",
    },
    {
      title: `${meta.name} price action highlights how sentiment and fundamentals can diverge`,
      source: "Market Note",
      time: "Today 11:45",
      summary: "Use the Trading Lab chart tools and U2CHAT to compare price movement with valuation and risk signals.",
    },
    {
      title: `What to monitor before researching ${meta.name} in depth`,
      source: "Learning Desk",
      time: "Today 14:20",
      summary: researchFocus,
    },
  ];
}

function compareSnapshot(symbols) {
  const quotes = buildQuotes(symbols);

  return {
    labels: quotes.map((quote) => quote.symbol),
    data: quotes.map((quote) => Number(quote.change_pct.toFixed(2))),
  };
}

function buildChartBlock(symbol, days = 7) {
  const series = generateKline(symbol, days);

  return {
    type: "line",
    title: `${symbol} closing trend`,
    labels: series.map((point) => point.date.slice(5)),
    data: series.map((point) => point.close),
  };
}

function findMentionedSymbols(message) {
  const lower = String(message || "").toLowerCase();

  return Object.entries(DEMO_STOCK_META)
    .filter(([symbol, meta]) => {
      const aliases = meta.aliases || [];
      const tokens = [symbol.toLowerCase(), meta.name.toLowerCase(), ...aliases.map((alias) => alias.toLowerCase())];
      return tokens.some((token) => token && lower.includes(token));
    })
    .map(([symbol]) => symbol);
}

function buildAssistantResponse(message) {
  const lower = String(message || "").toLowerCase();
  const symbols = findMentionedSymbols(message);

  if (lower.includes("compare") && symbols.length >= 2) {
    const comparison = compareSnapshot(symbols.slice(0, 2));

    return {
      tools_used: [{ tool: "quote_lookup" }, { tool: "comparison_view" }],
      response: `### Market Overview\nThis GitHub Pages preview is using demo market data to compare ${symbols[0]} and ${symbols[1]}.\n\n### Key Data\n\`\`\`json-chart\n${JSON.stringify(
        {
          type: "bar",
          title: "Daily change (%)",
          labels: comparison.labels,
          data: comparison.data,
        },
        null,
        2
      )}\n\`\`\`\n\n### Technical Analysis\n- Compare valuation, margin quality, and balance-sheet strength before focusing on short-term movement.\n- Use the Trading Lab chart and the Academy modules together when deciding which metrics matter most.\n\n### Visual Trend\n- Relative momentum is shown in the chart above.\n- Treat this static preview as a workflow demo, not a live recommendation.`,
    };
  }

  if (lower.includes("k-line") || lower.includes("chart") || lower.includes("trend")) {
    const symbol = symbols[0] || "AAPL";
    const chart = buildChartBlock(symbol);

    return {
      tools_used: [{ tool: "kline_history" }],
      response: `### Market Overview\nThe static preview can still demonstrate how U2CHAT presents a short K-line-style trend for ${symbol}.\n\n### Key Data\n\`\`\`json-chart\n${JSON.stringify(chart, null, 2)}\n\`\`\`\n\n### Technical Analysis\n- Look for trend direction first, then check whether swings are getting wider or narrower.\n- Combine price action with risk metrics and business fundamentals before drawing conclusions.\n\n### Visual Trend\n- Short-term structure is visualised in the line chart.\n- A real cloud backend will replace this demo series with live agent output.`,
    };
  }

  if (lower.includes("risk") || lower.includes("balance sheet")) {
    return {
      tools_used: [{ tool: "knowledge_base" }],
      response: `### Market Overview\nRisk usually hides in leverage, weak cash conversion, or valuation assumptions that leave no room for error.\n\n### Key Data\n- Balance-sheet checks: debt load, interest coverage, liquidity, and working-capital pressure.\n- Behaviour checks: concentration, position sizing, and whether the thesis depends on a perfect scenario.\n\n### Technical Analysis\n- Review debt versus cash first.\n- Check whether earnings convert into operating cash flow.\n- Stress-test what happens if growth slows or margins compress.\n\n### Visual Trend\n- Strong thesis: durable cash flow + manageable debt.\n- Weak thesis: thin cash generation + heavy leverage.`,
    };
  }

  if (symbols.length > 0) {
    const [quote] = buildQuotes([symbols[0]]);
    const chart = buildChartBlock(symbols[0]);

    return {
      tools_used: [{ tool: "quote_lookup" }, { tool: "kline_history" }],
      response: `### Market Overview\nThis static preview is showing a demo snapshot for ${quote.symbol} (${quote.name}).\n\n### Key Data\n- Last price: USD ${quote.price.toFixed(2)}\n- Daily move: ${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} (${quote.change_pct.toFixed(2)}%)\n\n\`\`\`json-chart\n${JSON.stringify(chart, null, 2)}\n\`\`\`\n\n### Technical Analysis\n- Start with trend, then confirm the story with fundamentals, risk, and asset-specific context.\n- If the move is sharp, check whether the volatility profile still matches your time horizon.\n\n### Visual Trend\n- The chart above shows the recent closing path.\n- Deploy the backend later to replace this preview with live DeepSeek analysis.`,
    };
  }

  return {
    tools_used: [{ tool: "knowledge_base" }],
    response: `### Market Overview\nThis GitHub Pages build is running in demo mode so the app remains usable without a cloud backend.\n\n### Key Data\n- Academy: available with local demo progress and comments.\n- Trading Lab: available with demo quotes, K-line data, and a local portfolio simulator.\n- U2CHAT: available with demo responses that preserve the original UI flow.\n\n### Technical Analysis\n- Ask about a ticker or asset like AAPL, NVDA, SPY, or BTC-USD.\n- Ask for a comparison, K-line trend, or risk explanation.\n\n### Visual Trend\n- Static site now works without raw GitHub Pages errors.\n- Add a real backend later when you are ready for live agent output.`,
  };
}

function getAcademy() {
  return clone(readAcademyModules());
}

function getAcademyModule(moduleId) {
  const modules = readAcademyModules();
  const comments = readComments();
  const module = modules.find((item) => String(item.id) === String(moduleId));

  if (!module) {
    throw new Error("Module not found.");
  }

  return {
    ...clone(module),
    comments: clone(comments[moduleId] || []),
  };
}

function setModuleComplete(moduleId, status) {
  const modules = readAcademyModules().map((module) =>
    String(module.id) === String(moduleId) ? { ...module, completed: Boolean(status) } : module
  );

  writeAcademyModules(modules);
  return { status: "success" };
}

function rateModule(moduleId, score) {
  const modules = readAcademyModules();
  const nextModules = modules.map((module) => {
    if (String(module.id) !== String(moduleId)) {
      return module;
    }

    return {
      ...module,
      ratings: [...(module.ratings || []), Number(score)],
    };
  });

  writeAcademyModules(nextModules);

  const updated = nextModules.find((module) => String(module.id) === String(moduleId));
  const ratings = updated?.ratings || [];
  const avg = ratings.length > 0
    ? ratings.reduce((sum, value) => sum + Number(value || 0), 0) / ratings.length
    : 0;

  return { status: "success", avg: Number(avg.toFixed(1)) };
}

function postComment(moduleId, text, parentId) {
  const commentsByModule = readComments();
  const nextComments = clone(commentsByModule[moduleId] || []);
  const timestamp = Math.floor(Date.now() / 1000);

  if (parentId) {
    nextComments.forEach((comment) => {
      if (String(comment.id) === String(parentId)) {
        comment.replies = comment.replies || [];
        comment.replies.unshift({
          id: createId("reply"),
          user: "You",
          text,
          likes: 0,
          timestamp,
        });
      }
    });
  } else {
    nextComments.unshift({
      id: createId("comment"),
      user: "You",
      text,
      likes: 0,
      timestamp,
      replies: [],
    });
  }

  commentsByModule[moduleId] = nextComments;
  writeComments(commentsByModule);

  return { status: "success", comments: clone(nextComments) };
}

function likeComment(moduleId, commentId, action) {
  const commentsByModule = readComments();
  const nextComments = clone(commentsByModule[moduleId] || []);
  let likes = 0;

  nextComments.forEach((comment) => {
    if (String(comment.id) === String(commentId)) {
      comment.likes = Math.max(0, Number(comment.likes || 0) + (action === "inc" ? 1 : -1));
      likes = comment.likes;
    }
  });

  commentsByModule[moduleId] = nextComments;
  writeComments(commentsByModule);
  return { status: "success", likes };
}

function likeReply(moduleId, commentId, replyId, action) {
  const commentsByModule = readComments();
  const nextComments = clone(commentsByModule[moduleId] || []);

  nextComments.forEach((comment) => {
    if (String(comment.id) !== String(commentId)) return;

    comment.replies = comment.replies || [];
    comment.replies.forEach((reply) => {
      if (String(reply.id) === String(replyId)) {
        reply.likes = Math.max(0, Number(reply.likes || 0) + (action === "inc" ? 1 : -1));
      }
    });
  });

  commentsByModule[moduleId] = nextComments;
  writeComments(commentsByModule);

  return { status: "success", comments: clone(nextComments) };
}

function getStockPool() {
  return clone(DEMO_STOCK_POOL);
}

function getQuotes(symbols) {
  return {
    status: "success",
    data: buildQuotes(symbols),
  };
}

function getKline(symbol, days) {
  return {
    status: "success",
    symbol,
    data: generateKline(symbol, Number(days || 60)),
  };
}

function getPortfolio() {
  return clone(readPortfolio());
}

function trade({ action, symbol, shares, price }) {
  const portfolio = readPortfolio();
  const nextShares = Number(shares || 0);
  const nextPrice = Number(price || 0);

  if (nextShares <= 0 || nextPrice <= 0) {
    throw new Error("Invalid trade input.");
  }

  const total = nextShares * nextPrice;

  if (action === "buy") {
    if (portfolio.cash < total) {
      throw new Error("Insufficient cash.");
    }

    portfolio.cash = round(portfolio.cash - total);
    const current = portfolio.holdings[symbol];

    if (current) {
      const combinedShares = Number(current.shares || 0) + nextShares;
      const combinedCost = Number(current.cost_basis || 0) + total;
      portfolio.holdings[symbol] = {
        shares: combinedShares,
        avg_price: round(combinedCost / combinedShares),
        cost_basis: round(combinedCost),
      };
    } else {
      portfolio.holdings[symbol] = {
        shares: nextShares,
        avg_price: round(nextPrice),
        cost_basis: round(total),
      };
    }
  } else if (action === "sell") {
    const current = portfolio.holdings[symbol];

    if (!current || Number(current.shares || 0) < nextShares) {
      throw new Error("Insufficient shares.");
    }

    portfolio.cash = round(portfolio.cash + total);
    const remainingShares = Number(current.shares || 0) - nextShares;
    const costReduction = nextShares * Number(current.avg_price || 0);

    if (remainingShares <= 0) {
      delete portfolio.holdings[symbol];
    } else {
      portfolio.holdings[symbol] = {
        shares: remainingShares,
        avg_price: Number(current.avg_price || 0),
        cost_basis: round(Number(current.cost_basis || 0) - costReduction),
      };
    }
  } else {
    throw new Error("Unsupported trade action.");
  }

  portfolio.history.unshift({
    id: createId("trade"),
    timestamp: new Date().toISOString(),
    action: action.toUpperCase(),
    symbol,
    shares: nextShares,
    price: round(nextPrice),
    total: round(total),
  });

  writePortfolio(portfolio);
  return { status: "success", message: "Trade recorded." };
}

function resetPortfolio() {
  writePortfolio(defaultPortfolio());
  return { status: "success" };
}

function getStockNews(symbol) {
  return {
    status: "success",
    symbol,
    data: buildNews(symbol),
  };
}

function getAgentSessions() {
  const chatState = readChatState();
  const sessions = Object.values(chatState.sessions).sort((left, right) =>
    String(right.timestamp).localeCompare(String(left.timestamp))
  );

  return {
    status: "success",
    sessions: sessions.map(({ id, title, timestamp }) => ({ id, title, timestamp })),
  };
}

function getAgentHistory(sessionId) {
  const chatState = readChatState();
  const session = chatState.sessions[sessionId];

  if (!session) {
    return { status: "success", history: [] };
  }

  return {
    status: "success",
    history: clone(session.messages || []),
  };
}

function sendAgentMessage(message, sessionId) {
  const chatState = readChatState();
  const nextSessionId = sessionId || createId("chat");
  const timestamp = new Date().toISOString();
  const assistant = buildAssistantResponse(message);

  if (!chatState.sessions[nextSessionId]) {
    chatState.sessions[nextSessionId] = {
      id: nextSessionId,
      title: message.length > 30 ? `${message.slice(0, 30)}...` : message,
      timestamp,
      messages: [],
    };
  }

  chatState.sessions[nextSessionId].timestamp = timestamp;
  chatState.sessions[nextSessionId].messages.push({
    role: "user",
    content: message,
    timestamp,
  });
  chatState.sessions[nextSessionId].messages.push({
    role: "assistant",
    content: assistant.response,
    timestamp: new Date().toISOString(),
    tools_used: assistant.tools_used,
  });

  writeChatState(chatState);

  return {
    status: "success",
    session_id: nextSessionId,
    response: assistant.response,
    tools_used: assistant.tools_used,
  };
}

function clearAgentSession(sessionId) {
  const chatState = readChatState();

  if (sessionId) {
    delete chatState.sessions[sessionId];
  } else {
    chatState.sessions = {};
  }

  writeChatState(chatState);
  return { status: "success" };
}

function submitInquiry(payload) {
  const inquiries = readInquiries();
  const record = {
    id: createId("inq"),
    timestamp: new Date().toISOString(),
    ...payload,
  };

  inquiries.unshift(record);
  writeInquiries(inquiries.slice(0, 50));

  return { status: "success", id: record.id };
}

export async function requestDemoApi(path, options = {}) {
  await wait(140);

  const [pathname, queryString = ""] = path.split("?");
  const params = new URLSearchParams(queryString);
  const body = parseBody(options);
  const method = String(options.method || "GET").toUpperCase();

  if (pathname === "/api/academy" && method === "GET") return getAcademy();
  if (pathname.startsWith("/api/academy/") && method === "GET") {
    return getAcademyModule(pathname.split("/").pop());
  }
  if (pathname === "/api/complete" && method === "POST") return setModuleComplete(body.id, body.status);
  if (pathname === "/api/rate" && method === "POST") return rateModule(body.id, body.score);
  if (pathname === "/api/comment" && method === "POST") return postComment(body.id, body.text, body.parentId);
  if (pathname === "/api/comment/like" && method === "POST") return likeComment(body.courseId, body.commentId, body.action);
  if (pathname === "/api/comment/reply/like" && method === "POST") {
    return likeReply(body.courseId, body.commentId, body.replyId, body.action);
  }
  if (pathname === "/api/lab/stocks" && method === "GET") return getStockPool();
  if (pathname === "/api/lab/quote" && method === "GET") {
    const symbols = String(params.get("symbols") || "")
      .split(",")
      .map((symbol) => symbol.trim())
      .filter(Boolean);
    return getQuotes(symbols);
  }
  if (pathname === "/api/lab/kline" && method === "GET") {
    return getKline(params.get("symbol") || "AAPL", params.get("days") || 60);
  }
  if (pathname === "/api/lab/portfolio" && method === "GET") return getPortfolio();
  if (pathname === "/api/lab/trade" && method === "POST") return trade(body);
  if (pathname === "/api/lab/reset" && method === "POST") return resetPortfolio();
  if (pathname === "/api/lab/news" && method === "GET") return getStockNews(params.get("symbol") || "AAPL");
  if (pathname === "/api/agent/sessions" && method === "GET") return getAgentSessions();
  if (pathname === "/api/agent/history" && method === "GET") return getAgentHistory(params.get("session_id"));
  if (pathname === "/api/agent/chat" && method === "POST") return sendAgentMessage(body.message || "", body.session_id);
  if (pathname === "/api/agent/clear" && method === "POST") return clearAgentSession(body.session_id);
  if (pathname === "/api/inquiry" && method === "POST") return submitInquiry(body);

  throw new Error("This demo endpoint is not implemented.");
}
