/**
 * Static site build script for NAT Interpretation & Translation Services.
 *
 * Responsibilities:
 *   1. Register every Handlebars partial under `templates/partials/`.
 *   2. For each HTML page, load its JSON content from `content/`, merge with
 *      `content/global.json`, render the matching `.hbs` template and write
 *      the result into `dist/`.
 *   3. Copy every static asset (CSS, JS, logo, images, video, admin UI,
 *      robots / favicon, etc.) into `dist/` unchanged.
 *
 * Run directly:   node build.js
 * Watch mode:     node build.js --watch
 *
 * The CMS edits files in `content/`. Every edit creates a Git commit; Vercel
 * picks up the commit and re-runs this script to regenerate the live site.
 */

const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

// Minimal HTML escape. All content comes from trusted JSON files, so the
// default Handlebars escape (which also escapes ', `, =) just adds noise.
// We still escape <, >, &, and " so malformed content can never break tags
// or attribute quoting.
Handlebars.Utils.escapeExpression = function (value) {
  if (value == null) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials');
const DIST_DIR = path.join(ROOT, 'dist');

// Assets copied verbatim from repo root into dist/. Keep this list small and
// explicit so stray files don't leak into production.
const STATIC_ASSETS = [
  'assets',
  'admin',
  'updated logo.jpg',
  'Aminata picture.png',
  'video home page top.mp4',
  'robots.txt',
  'favicon.ico'
];

// Pages: template file -> output file. Content key is derived from the output
// filename (e.g. services.html -> content/services.json).
const PAGES = [
  { template: 'index.hbs', output: 'index.html', content: 'home' },
  { template: 'services.hbs', output: 'services.html', content: 'services' },
  { template: 'contact.hbs', output: 'contact.html', content: 'contact' },
  { template: 'team.hbs', output: 'team.html', content: 'team' }
];

function registerPartials() {
  if (!fs.existsSync(PARTIALS_DIR)) return;
  for (const file of fs.readdirSync(PARTIALS_DIR)) {
    if (!file.endsWith('.hbs')) continue;
    const name = path.basename(file, '.hbs');
    const source = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
    Handlebars.registerPartial(name, source);
  }
}

function registerHelpers() {
  // Compare equality in templates: {{#if (eq active 'home')}}...{{/if}}
  Handlebars.registerHelper('eq', (a, b) => a === b);
}

function loadJson(file) {
  const full = path.join(CONTENT_DIR, file);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing content file: ${full}`);
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function buildPage(page, global) {
  const templatePath = path.join(TEMPLATES_DIR, page.template);
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateSource, { noEscape: false });

  const pageContent = loadJson(`${page.content}.json`);
  const context = {
    ...pageContent,
    global,
    active: page.content
  };

  const html = template(context);
  const outputPath = path.join(DIST_DIR, page.output);
  fs.outputFileSync(outputPath, html);
  console.log(`  rendered  ${page.output}`);
}

function copyAssets() {
  for (const name of STATIC_ASSETS) {
    const src = path.join(ROOT, name);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(DIST_DIR, name);
    fs.copySync(src, dest, { overwrite: true });
    console.log(`  copied    ${name}`);
  }
}

function build() {
  const start = Date.now();
  console.log('Building dist/ …');

  fs.emptyDirSync(DIST_DIR);
  registerHelpers();
  registerPartials();

  const global = loadJson('global.json');

  for (const page of PAGES) {
    buildPage(page, global);
  }

  copyAssets();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Done in ${elapsed}s.`);
}

function watch() {
  build();
  const chokidar = require('chokidar');
  const watcher = chokidar.watch(
    [CONTENT_DIR, TEMPLATES_DIR, path.join(ROOT, 'assets'), path.join(ROOT, 'admin')],
    { ignoreInitial: true }
  );
  watcher.on('all', (event, file) => {
    console.log(`\n[${event}] ${path.relative(ROOT, file)} — rebuilding…`);
    try {
      build();
    } catch (err) {
      console.error('Build failed:', err.message);
    }
  });
  console.log('Watching for changes. Ctrl+C to stop.');
}

if (process.argv.includes('--watch')) {
  watch();
} else {
  try {
    build();
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}
