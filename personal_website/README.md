# Zack Smith — personal site

Static site for [zacksmith](index.html). No build step. Edit the files, refresh the browser.

## Preview locally

From this folder:

```bash
python3 -m http.server 5173
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). If you start the server from the repo root instead, use [http://127.0.0.1:5173/personal_website/](http://127.0.0.1:5173/personal_website/).

## Files

| File | What it is |
| --- | --- |
| `index.html` | All page copy, navigation, motif SVG, contact links |
| `resume.html` | Print-friendly resume for copy/paste |
| `src/styles.css` | Colors, type, layout |
| `src/main.js` | Tab routing plus Substack notes ticker and article list |

## Change copy and tabs

The header tabs are hash links. Matching sections live in `index.html`:

- `#about` — bio, portrait, published articles
- `#resume` — resume (also `resume.html` for print/paste)
- `#public-service` — Beacon council
- `#data-science` — Uber work and GitHub
- `#contact` — emails and socials

Edit the text inside those `<section data-page="…">` blocks. Keep the `id`, `data-page`, and `data-nav` values in sync if you add or rename a tab.

The rising-sun mark is the inline SVG in `.hero-ornament`. The tagline under it is the `.eyebrow` paragraph (`Forging a better future`).

## Contact and socials

Update emails, GitHub, LinkedIn, X, Substack, and the City of Beacon YouTube link in `index.html` (About ticker is separate; Contact is the source of truth for addresses).

## Notes ticker and articles

`src/main.js` pulls two public feeds:

- **Notes** (the gold ticker under the nav) from `https://zjsmith.substack.com/api/v1/notes`
- **Published articles** (the folio on About) from `https://zjsmith.substack.com/feed`

Until you publish an essay, the articles section stays empty on purpose. Notes appear as soon as they exist on Substack.

If you change Substack handles, update `SUBSTACK_FEED`, `SUBSTACK_NOTES`, and `SUBSTACK_PROFILE` at the top of `src/main.js`.

Feeds are loaded in the browser (with a CORS proxy fallback). A live server is required; opening `index.html` as a `file://` page will not load notes or articles.

## Look and feel

Palette and fonts are CSS variables at the top of `src/styles.css`:

- `--navy`, `--ink`, `--gold`, `--gold-bright`, `--burgundy`

Headings use Cinzel; body uses Cormorant Garamond; labels use Josefin Sans (loaded from Google Fonts in `index.html`).

## Ship / host

GitHub Actions cannot turn Pages on for this account (`Resource not accessible by integration`). Publish from the `docs/` folder instead.

Public URL:

`https://zacksmith-analytics.com`

GitHub Pages settings for this repo:

`https://github.com/ZSmith-Analytics/personal/settings/pages`

### Turn on Pages (do this once)

1. Open **this repo** (not your profile):  
   [https://github.com/ZSmith-Analytics/personal/settings/pages](https://github.com/ZSmith-Analytics/personal/settings/pages)
2. Under **Build and deployment**, set:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/docs`
3. Under **Custom domain**, enter `zacksmith-analytics.com` and **Save**.
4. After DNS checks pass, enable **Enforce HTTPS**.

If that settings page only shows **Verified domains**, you are on account settings. The address bar must contain `ZSmith-Analytics/personal/settings/pages`.

Edit the site in `personal_website/`, then copy the same files into `docs/` before you push (or edit both). `docs/` is what GitHub actually serves. The file `docs/CNAME` must stay `zacksmith-analytics.com`.

### Cloudflare DNS

Use **DNS only** (grey cloud), not proxied:

- A `@` → `185.199.108.153`
- A `@` → `185.199.109.153`
- A `@` → `185.199.110.153`
- A `@` → `185.199.111.153`
- CNAME `www` → `zsmith-analytics.github.io`
