# NAT Interpretation & Translation Services, LLC — Website

Static site with a content-managed admin panel.

- **Production**: hosted on Vercel at the domain connected in the Vercel project.
- **Content editing**: the owner (or any authorized GitHub user) logs in at `/admin/` to edit every piece of text on the site through simple form fields. Saving a change commits it to `main` on GitHub, and Vercel auto-deploys within ~30 seconds.
- **Contact form**: submissions are emailed via [Web3Forms](https://web3forms.com) to `contact@nattranslation.com`.

---

## Project structure

```
.
├── admin/                     # Decap CMS admin panel (served at /admin/)
│   ├── index.html
│   └── config.yml             # Every editable field, with friendly labels
├── api/                       # Vercel serverless functions (GitHub OAuth)
│   ├── auth.js
│   └── callback.js
├── assets/                    # Static CSS / JS / images
│   ├── css/styles.css
│   └── js/main.js
├── content/                   # All editable text (the CMS edits these)
│   ├── global.json            # Nav, footer, phone, email, logo alt, etc.
│   ├── home.json
│   ├── services.json
│   ├── contact.json
│   └── team.json
├── templates/                 # Handlebars templates, one per page
│   ├── index.hbs
│   ├── services.hbs
│   ├── contact.hbs
│   ├── team.hbs
│   └── partials/
│       ├── head.hbs
│       ├── header.hbs
│       ├── footer.hbs
│       ├── scripts.hbs
│       └── service_icon.hbs
├── build.js                   # Renders templates × content → dist/
├── package.json
├── vercel.json                # Vercel build config (outputs to dist/)
├── updated logo.jpg
├── Aminata picture.png
└── video home page top.mp4
```

At build time, `node build.js` merges each page's JSON with `global.json`, renders the matching `.hbs` template, and writes the final HTML (plus all static assets) into `dist/`, which Vercel serves.

---

## For the owner: how to edit text

1. Go to `https://<your-domain>/admin/`.
2. Click **Login with GitHub** and approve the app once.
3. You'll see five sections in the left sidebar:
   - **Site-wide settings** — phone, email, nav labels, footer.
   - **Home page**, **Services page**, **Contact page**, **Team page** — every heading, paragraph, list item, and button label on that page.
4. Click a section, edit the fields, and hit **Publish → Publish now** at the top right.
5. Your change is live within about 30 seconds (Vercel rebuilds automatically).

If a change ever looks wrong, the site history is on GitHub — every edit is a commit that can be reverted from the **Deployments** tab in Vercel with one click.

---

## For developers

### Local development

```bash
npm install
npm run build          # one-shot build into dist/
npm run dev            # build + serve dist/ at http://localhost:5173
npm run watch          # auto-rebuild on file changes
```

### Where to edit what

| Want to change | Edit |
|---|---|
| Text (any heading, paragraph, list, button label) | `content/*.json` (or use the CMS) |
| Layout / markup | `templates/*.hbs` |
| Shared header / footer / nav | `templates/partials/*.hbs` |
| Styling | `assets/css/styles.css` |
| Client-side behavior | `assets/js/main.js` |
| Build logic | `build.js` |

### Deployment

Every push to `main` triggers a Vercel build that runs `npm run build` and serves `dist/`. No manual deploy step.

---

## One-time Vercel setup for the admin panel

The admin panel needs a GitHub OAuth app so owners can log in. Do this once, then never again:

1. **Create a GitHub OAuth App**
   Go to https://github.com/settings/developers → **New OAuth App**.
   - Application name: `NAT Interpretation Admin`
   - Homepage URL: `https://<your-production-domain>` (e.g. `https://nattranslation.com`)
   - Authorization callback URL: `https://<your-production-domain>/api/callback`
   Click **Register application**, then **Generate a new client secret**. Copy the **Client ID** and the **Client Secret** — you'll paste them into Vercel next.

2. **Add the secrets to Vercel**
   In the Vercel dashboard → project → **Settings → Environment Variables**, add:
   - `GITHUB_CLIENT_ID` = the Client ID from step 1
   - `GITHUB_CLIENT_SECRET` = the Client Secret from step 1
   Apply to *Production*, *Preview*, and *Development*.

3. **Confirm the domain in `admin/config.yml`**
   Open `admin/config.yml` in the repo. The `base_url` at the top must match your production domain, including the `https://`. Update and commit if needed.

4. **Redeploy once**
   Trigger a redeploy from the Vercel dashboard so the new environment variables take effect. After that, `https://<your-domain>/admin/` is ready.

---

## Contact form

The contact/quote form on `contact.html` posts to Web3Forms, which forwards every submission to `contact@nattranslation.com`. The access key lives in `templates/contact.hbs` (line with `access_key`). To change the destination email or regenerate the key, get a new key at [web3forms.com](https://web3forms.com) and update that line.
