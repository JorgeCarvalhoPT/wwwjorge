# Terminal CV — 0xB@ne

An interactive, terminal-style CV website inspired by Claude Code / iTerm.
Type commands (`help`, `about`, `experience`, `neofetch`, …) or click them.

## Run locally

It's a static site — no build step. Just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly works too, but a server avoids browser quirks.)

## Edit your content

**All content lives in [`data.js`](data.js).** Update the `CV` object there —
name, experience, skills, projects, contact, etc. Fields marked `// TODO` are
placeholders/guesses I couldn't pull from LinkedIn (it blocks scraping), so
replace those with your real info. You don't need to touch `terminal.js`.

## Files

| File          | Purpose                                            |
|---------------|----------------------------------------------------|
| `index.html`  | Markup + terminal window chrome                    |
| `styles.css`  | Theme (Claude-coral on dark, macOS window chrome)  |
| `data.js`     | **Your CV content — edit this**                    |
| `terminal.js` | Terminal engine (commands, history, completion)    |

## Commands

`help` · `about` · `experience` (`exp`) · `skills` · `projects` ·
`education` (`edu`) · `languages` · `contact` · `resume` (`cv`) ·
`neofetch` · `cat <section>` · `theme` · `fx` · `download` (`pdf`) ·
`whoami` · `ls` · `clear` · plus a couple of easter eggs.

- **`theme`** cycles green / amber / coral (saved to localStorage).
- **`fx`** toggles the CRT scanlines + Matrix rain + glow (readability / a11y).
- **`download`** opens the print dialog → *Save as PDF* (a print stylesheet
  reflows the CV into a clean black-on-white document).
- Supports **Tab** completion, **↑/↓** history, **Ctrl-L** to clear, a sticky
  quick-nav bar, and click-to-copy on the Discord ID.

All animations honor `prefers-reduced-motion`.

## Social preview

`og.svg` is the Open Graph / share image referenced in `index.html`. SVG works
on many platforms; for maximum compatibility (some scrapers want raster),
convert it once to `og.png` (e.g. `rsvg-convert og.svg > og.png`) and point the
`og:image` / `twitter:image` meta tags at it.

## Deploy

Push to GitHub and enable Pages, or drop the folder on Netlify / Vercel /
Cloudflare Pages — no configuration needed.
