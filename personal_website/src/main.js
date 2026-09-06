const SUBSTACK_FEED = "https://zjsmith.substack.com/feed";
const SUBSTACK_NOTES = "https://zjsmith.substack.com/api/v1/notes?limit=20";
const SUBSTACK_PROFILE = "https://substack.com/@zjsmith";

const articleList = document.getElementById("article-list");
const notesList = document.getElementById("notes-list");

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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
        body,
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
          <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(truncate(item.summary, 180))}</p>
        </article>`
    )
    .join("");
}

function renderNotes(items) {
  if (!notesList) return;
  if (!items.length) {
    notesList.innerHTML = `
      <div class="empty-folio">
        <p class="empty-kicker">No notes yet</p>
        <p>When new notes ship on Substack, they will show up here.</p>
      </div>`;
    return;
  }

  notesList.innerHTML = items
    .slice(0, 8)
    .map(
      (item) => `
        <article class="note-card">
          <div class="feed-meta on-dark">${formatDate(item.date)}</div>
          <p><a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(truncate(item.body, 240))}</a></p>
        </article>`
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
  const known = ["about", "resume", "public-service", "data-science", "contact"];
  return known.includes(hash) ? hash : "about";
}

window.addEventListener("hashchange", () => showPage(pageFromHash()));
showPage(pageFromHash());

async function loadFeeds() {
  const [notesPayload, articles] = await Promise.all([
    fetchJsonThroughProxy(SUBSTACK_NOTES),
    fetchRss(SUBSTACK_FEED),
  ]);
  renderNotes(parseNotes(notesPayload));
  renderArticles(articles);
}

loadFeeds();
