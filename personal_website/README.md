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

The repo deploys `personal_website/` to GitHub Pages on every push to `main` (see `.github/workflows/pages.yml`).

Public URL after Pages is enabled:

`https://zsmith-analytics.github.io/general_analytics/`

### First-time setup

1. Push `main` to GitHub.
2. In the repo: **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Re-run the **Deploy personal website** workflow if it did not start on its own.

### Custom domain (optional)

1. Buy a domain (Namecheap, Google Domains, Cloudflare, etc.).
2. In Pages settings, add the domain (e.g. `zacksmith.com`).
3. At your DNS host, add a `CNAME` for `www` pointing at `zsmith-analytics.github.io`, and `A` records for the apex as GitHub lists in the Pages docs.
4. Put the same hostname in `personal_website/CNAME` if you use an apex or www host.

You can also drag the `personal_website` folder onto Netlify or Cloudflare Pages for a one-click public URL.
