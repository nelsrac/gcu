# Gravel Club Ulm — Website

Static club website plus a blog/news section, built with [Astro](https://astro.build).
Everything is static except the contact form, which is handled by a single
server-rendered API route (`src/pages/api/contact.ts`).

## Project structure

```text
/
├── src/
│   ├── content/blog/       # Blog posts (Markdown, one file per post)
│   ├── content.config.ts   # Blog collection schema
│   ├── layouts/            # BaseLayout.astro (header/footer/meta)
│   ├── components/         # Header, Footer
│   ├── pages/               # Home, Über uns, Touren, Kontakt, Blog
│   │   └── api/contact.ts  # Contact form submission handler (server-rendered)
│   └── styles/global.css   # All design tokens (colors, spacing) live here
├── astro.config.mjs
├── Dockerfile
└── docker-compose.yml
```

## Content

- **Static pages** (Home, Über uns, Touren, Kontakt) currently contain
  placeholder text marked with `TODO` comments — replace with real club copy
  whenever it's ready.
- **Blog posts** live in `src/content/blog/` as Markdown files with
  frontmatter:

  ```md
  ---
  title: "Titel des Beitrags"
  description: "Kurze Beschreibung (optional, für Übersicht/SEO)."
  pubDate: 2026-10-01
  tags: ["tour"]       # optional
  draft: false          # optional, set true to hide from listings
  ---

  Inhalt des Beitrags in Markdown...
  ```

  Add a new file, commit, and it appears in `/blog` automatically.

## Development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # production build to ./dist
npm run preview   # run the built server locally
```

## Contact form (current state & fast-follow)

Submissions are validated (name, email format, message required, plus a
honeypot field for basic spam filtering) and appended as JSON lines to
`data/contact-submissions.jsonl` (mounted as a Docker volume in production,
see below). **No email is sent yet** — check the file on the server for new
messages for now.

Planned fast-follow: wire up real SMTP delivery once a mailbox/relay is
chosen, so submissions arrive by email instead of only being logged.

## Deployment

The site runs as a single Docker container (static assets + the one
server-rendered contact endpoint) behind an existing Traefik reverse proxy.

**On the host** (`/srv/container/gcu`), Traefik is already running with:
- an external Docker network named `traefik`
- a certresolver named `myresolver` for Let's Encrypt

`docker-compose.yml` joins that network and adds routers for
`gravelclub-ulm.de` (main site) and `www.gravelclub-ulm.de` (redirects to the
bare domain).

Deploy flow (manual, no CI/CD for now):

```sh
# on the host, in /srv/container/gcu
git pull
docker compose up -d --build
```

Contact form submissions persist across rebuilds in the `gcu-data` named
volume, mounted at `/app/data` inside the container.

## Explicitly out of scope for v1

Comments, event calendar/ride sign-ups, member accounts, bilingual (EN)
content, analytics/tracking, RSS feed, CI/CD, real email delivery for the
contact form, real branding (logo/colors), and real page copy. These are
intentional cuts to get a working v1 live quickly — see project history for
context.
