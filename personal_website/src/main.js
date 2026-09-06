const SUBSTACK_FEED = "https://zjsmith.substack.com/feed";
const SUBSTACK_NOTES = "https://zjsmith.substack.com/api/v1/notes?limit=20";
const SUBSTACK_PROFILE = "https://substack.com/@zjsmith";

const tickerTrack = document.getElementById("ticker-track");
const articleList = document.getElementById("article-list");

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

function truncate(text, length = 110) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

async function fetchJsonThroughProxy(url) {
  const endpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data.contents ? JSON.parse(data.contents) : data;
      } catch {
        continue;
      }
    } catch {
      continue;
    }
  }

  try {
    const response = await fetch(url);
    if (response.ok) return response.json();
  } catch {
    /* CORS or network */
  }
  return null;
}

async function fetchRss(url) {
  const endpoints = [
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;
      const data = await response.json();
      if (Array.isArray(data.items)) {
        return data.items.map((item) => ({
          title: item.title,
          url: item.link || item.url,
          date: item.pubDate,
          summary: stripHtml(item.description || item.content || ""),
        }));
      }
      if (data.contents) {
        return parseRssXml(data.contents);
      }
    } catch {
      continue;
    }
  }
  return [];
}

function parseRssXml(xmlString) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");
  return [...xml.querySelectorAll("item")].map((item) => ({
    title: item.querySelector("title")?.textContent ?? "Untitled",
    url: item.querySelector("link")?.textContent ?? "#",
    date: item.querySelector("pubDate")?.textContent ?? "",
    summary: stripHtml(item.querySelector("description")?.textContent ?? ""),
  }));
}

function parseNotes(payload) {
  const items = payload?.items ?? [];
  return items
    .map((item) => {
      const comment = item.comment ?? {};
      const body = stripHtml(comment.body || "");
      if (!body) return null;
      const id = comment.id || String(item.entity_key || "").replace(/^c-/, "");
      return {
        title: truncate(body, 90),
        url: id ? `https://substack.com/@zjsmith/note/c-${id}` : SUBSTACK_PROFILE,
        date: comment.date || item.context?.timestamp,
      };
    })
    .filter(Boolean);
}

function renderArticles(items) {
  if (!items.length) {
    articleList.innerHTML = `
      <div class="empty-folio">
        <p class="empty-kicker">The folio is open</p>
        <p>No published articles yet. When the first essay ships on Substack, it will be recorded here.</p>
      </div>`;
    return;
  }

  articleList.innerHTML = items
    .map(
      (item) => `
        <article class="article-card">
          <div class="feed-meta">${formatDate(item.date)}</div>
          <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
          <p>${truncate(item.summary, 180)}</p>
        </article>`
    )
    .join("");
}

function renderTicker(items) {
  const fallback = [
    { title: "Notes from @zjsmith · tech, economics, public office", url: SUBSTACK_PROFILE },
  ];
  const source = items.length ? items : fallback;
  const doubled = [...source, ...source];
  tickerTrack.innerHTML = doubled
    .map(
      (item) =>
        `<a href="${item.url}" target="_blank" rel="noopener noreferrer">Note · ${item.title}</a><span aria-hidden="true">◆</span>`
    )
    .join("");
}

function showPage(name) {
  const pageName = name || "about";
  document.querySelectorAll("[data-page]").forEach((page) => {
    const active = page.dataset.page === pageName;
    page.classList.toggle("is-active", active);
    page.hidden = !active;
  });
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === pageName);
    link.setAttribute("aria-current", link.dataset.nav === pageName ? "page" : "false");
  });
}

function pageFromHash() {
  const hash = (location.hash || "#about").replace("#", "");
  const known = ["about", "public-service", "data-science", "contact"];
  return known.includes(hash) ? hash : "about";
}

window.addEventListener("hashchange", () => showPage(pageFromHash()));
showPage(pageFromHash());

async function loadFeeds() {
  const [notesPayload, articles] = await Promise.all([
    fetchJsonThroughProxy(SUBSTACK_NOTES),
    fetchRss(SUBSTACK_FEED),
  ]);
  renderTicker(parseNotes(notesPayload));
  renderArticles(articles);
}

loadFeeds();
