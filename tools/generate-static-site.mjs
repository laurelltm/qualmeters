import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sitemapPath = path.join(root, 'qualmeters_website_sitemap.md');
const markdown = await readFile(sitemapPath, 'utf8');

const pages = [
  { route: '/', title: 'Home', section: '4.1', image: 'hero-smart-water-network.svg' },
  { route: '/platform', title: 'Platform overview', section: '4.2', image: 'system-architecture.svg' },
  { route: '/platform/connectivity', title: 'Connectivity', section: '4.3', image: 'connectivity-protocols.svg' },
  { route: '/meters', title: 'Ultrasonic water meters', section: '4.4', image: 'ultrasonic-meter-pair.svg' },
  { route: '/gateway', title: 'Building gateway', section: '4.5', image: 'system-architecture.svg' },
  { route: '/cloud-platform', title: 'Cloud data platform', section: '4.6', image: 'utility-dashboard-api.svg' },
  { route: '/rest-api', title: 'REST API', section: '4.7', image: 'utility-dashboard-api.svg' },
  { route: '/resident-portal', title: 'Resident portal', section: '4.8', image: 'resident-portal-qr.svg' },
  { route: '/leak-guard', title: 'Leak Guard', section: '4.9', image: 'leak-guard.svg' },
  { route: '/sustainability', title: 'Sustainability', section: '4.10', image: 'sustainability-benchmarking.svg' },
  { route: '/solutions', title: 'Solutions', custom: 'solutions' },
  { route: '/solutions/housing-companies', title: 'Housing companies', section: '4.11', image: 'ultrasonic-meter-pair.svg' },
  { route: '/solutions/cities-municipalities', title: 'Cities and municipalities', section: '4.12', image: 'utility-dashboard-api.svg' },
  { route: '/solutions/new-developments', title: 'New apartment buildings', section: '4.13', image: 'ultrasonic-meter-pair.svg' },
  { route: '/solutions/property-portfolios', title: 'Property portfolios', section: '4.14', image: 'sustainability-benchmarking.svg' },
  { route: '/resources', title: 'Resources', custom: 'resources' },
  { route: '/deployment', title: 'Deployment and operations', section: '4.15', image: 'deployment-lifecycle.svg' },
  { route: '/security', title: 'Security and governance', section: '4.16', image: 'security-governance.svg' },
  { route: '/company', title: 'Company', custom: 'company' },
  { route: '/about', title: 'About QualMeters', section: '4.17', image: 'qualmeters-logo-horizontal.svg' },
  { route: '/contact', title: 'Contact', custom: 'company' },
  { route: '/request-demo', title: 'Request demo', custom: 'company' },
  { route: '/faq', title: 'FAQ', section: '4.19', image: 'system-architecture.svg' },
];

const nav = [
  { label: 'Platform', href: '/platform/', children: [
    ['Platform overview', '/platform/'],
    ['Connectivity', '/platform/connectivity/'],
    ['Building gateway', '/gateway/'],
    ['Cloud platform', '/cloud-platform/'],
    ['Security', '/security/'],
    ['Deployment', '/deployment/'],
  ] },
  { label: 'Meters', href: '/meters/' },
  { label: 'Solutions', href: '/solutions/', children: [
    ['Solutions overview', '/solutions/'],
    ['Housing companies', '/solutions/housing-companies/'],
    ['Cities and municipalities', '/solutions/cities-municipalities/'],
    ['New apartment buildings', '/solutions/new-developments/'],
    ['Property portfolios', '/solutions/property-portfolios/'],
  ] },
  { label: 'Resources', href: '/resources/', children: [
    ['Resources overview', '/resources/'],
    ['Deployment', '/deployment/'],
    ['Security', '/security/'],
    ['Sustainability', '/sustainability/'],
    ['FAQ', '/faq/'],
  ] },
  { label: 'Company', href: '/company/' },
];

const footerColumns = [
  ['Platform', [['Overview', '/platform/'], ['Connectivity', '/platform/connectivity/'], ['Gateway', '/gateway/'], ['Cloud', '/cloud-platform/'], ['API', '/rest-api/']]],
  ['Solutions', [['Overview', '/solutions/'], ['Housing', '/solutions/housing-companies/'], ['Municipalities', '/solutions/cities-municipalities/'], ['New builds', '/solutions/new-developments/'], ['Portfolios', '/solutions/property-portfolios/']]],
  ['Resources', [['Overview', '/resources/'], ['FAQ', '/faq/'], ['Deployment', '/deployment/'], ['Security', '/security/'], ['Sustainability', '/sustainability/']]],
  ['Company', [['About', '/company/'], ['Demo', '/request-demo/'], ['Contact', '/contact/']]],
];

function escapeHtml(value = '') {
  return value
    .replace(/—/g, ':')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(value = '') {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function sectionBlock(sectionNumber) {
  const escaped = sectionNumber.replace('.', '\\.');
  const start = new RegExp(`^## ${escaped} `, 'm');
  const startMatch = markdown.match(start);
  if (!startMatch) throw new Error(`Missing section ${sectionNumber}`);
  const startIndex = startMatch.index;
  const rest = markdown.slice(startIndex);
  const nextMatch = rest.slice(1).match(/^## 4\.\d+ |^# 5\.|^# 6\.|^# 7\.|^# 8\.|^# 9\.|^# 10\./m);
  const endIndex = nextMatch ? startIndex + 1 + nextMatch.index : markdown.length;
  return markdown.slice(startIndex, endIndex).trim();
}

function extractMeta(block) {
  const seo = block.match(/\*\*SEO title:\*\*\s*(.+)/);
  const desc = block.match(/\*\*Meta description:\*\*\s*(.+)/);
  const h1 = block.match(/\*\*H1:\*\*\s*(.+)/);
  const eyebrow = block.match(/\*\*Eyebrow:\*\*\s*(.+)/);
  const heroBody = block.match(/\*\*Hero body:\*\*\s*(.+)/);
  const primary = block.match(/\*\*Primary CTA:\*\*\s*(.+)/);
  const secondary = block.match(/\*\*Secondary CTA:\*\*\s*(.+)/);
  return {
    seoTitle: seo?.[1]?.trim() || 'QualMeters Oy',
    description: desc?.[1]?.trim() || 'QualMeters smart water metering platform.',
    h1: h1?.[1]?.trim() || block.match(/^## [^`]+`[^`]+` [—-]\s*(.+)$/m)?.[1]?.trim() || 'QualMeters',
    eyebrow: eyebrow?.[1]?.trim() || 'QualMeters Oy',
    heroBody: heroBody?.[1]?.trim() || '',
    primary: primary?.[1]?.trim() || 'Request a demo',
    secondary: secondary?.[1]?.trim() || '',
  };
}

function extractHeroProofs(block) {
  const proofMatch = block.match(/\*\*Hero proof points:\*\*\n\n([\s\S]*?)(?=\n### |\n## |$)/);
  if (!proofMatch) return [];
  return proofMatch[1]
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

function splitContentSections(block) {
  const parts = [];
  const lines = block.split('\n');
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^### (?:Section:\s*)?(.+)/);
    if (heading) {
      const title = heading[1].trim();
      if (['Hero', 'Contact form fields', 'Contact details', 'CTA button', 'Sales page supporting copy'].includes(title) && title === 'Hero') {
        current = null;
      } else {
        current = { title, body: [] };
        parts.push(current);
      }
      continue;
    }
    if (current) current.body.push(line);
  }
  return parts
    .map((part) => ({ ...part, body: cleanSectionBody(part.body.join('\n').trim()) }))
    .filter((part) => part.body && !part.title.startsWith('Hero'));
}

function cleanSectionBody(text) {
  return text
    .split('\n')
    .filter((line) => !/^---\s*$/.test(line.trim()))
    .filter((line) => !/^!\[.*\]\(assets\/.+\)$/.test(line.trim()))
    .join('\n')
    .trim();
}

function renderParagraphs(text, currentRoute = '/') {
  const blocks = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const html = [];
  for (const block of blocks) {
    if (block === '---' || /^#\s/.test(block)) continue;
    if (/^```/.test(block)) {
      const lines = block.split('\n');
      const language = lines[0].replace(/^```/, '').trim();
      const code = lines.slice(1, lines.at(-1) === '```' ? -1 : undefined).join('\n');
      html.push(`<pre class="mini-card"><code${language ? ` data-language="${escapeHtml(language)}"` : ''}>${escapeHtml(code)}</code></pre>`);
      continue;
    }
    if (/^\*\*H2:\*\*/.test(block)) {
      html.push(`<p class="section-lead">${inlineMarkdown(block.replace(/^\*\*H2:\*\*\s*/, ''))}</p>`);
      continue;
    }
    if (/^\*\*(CTA block|Website feature copy|Website copy|Feature copy|Feature cards):\*\*$/.test(block)) continue;
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.some((line) => /^\*\*(Headline|Body|Button):\*\*/.test(line))) {
      const headline = lines.find((line) => line.startsWith('**Headline:**'))?.replace(/^\*\*Headline:\*\*\s*/, '');
      const body = lines.find((line) => line.startsWith('**Body:**'))?.replace(/^\*\*Body:\*\*\s*/, '');
      const button = lines.find((line) => line.startsWith('**Button:**'))?.replace(/^\*\*Button:\*\*\s*/, '') || 'Request a demo';
      html.push(renderInlineCta(headline, body, button, currentRoute));
      continue;
    }
    if (lines.length === 1 && /^\*\*CTA:\*\*/.test(lines[0])) {
      html.push(renderInlineCta('Ready to plan the next step?', '', lines[0].replace(/^\*\*CTA:\*\*\s*/, ''), currentRoute));
      continue;
    }
    if (lines.every((line) => line.startsWith('- '))) {
      html.push(`<ul class="check-list">${lines.map((line) => `<li>${inlineMarkdown(line.slice(2))}</li>`).join('')}</ul>`);
      continue;
    }
    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      html.push(`<ol>${lines.map((line) => `<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`);
      continue;
    }
    if (lines.length >= 2 && lines.every((line) => /^\*\*.+?\*\*\s+.+/.test(line))) {
      html.push(`<div class="card-grid">${lines.map((line) => {
        const [, title, copy] = line.match(/^\*\*(.+?)\*\*\s+(.+)$/);
        return `<article class="mini-card"><h3>${inlineMarkdown(title)}</h3><p>${inlineMarkdown(copy)}</p></article>`;
      }).join('')}</div>`);
      continue;
    }
    if (lines.length === 1 && lines[0].startsWith('**') && lines[0].endsWith('**')) {
      html.push(`<h3>${inlineMarkdown(lines[0].replace(/^\*\*|\*\*$/g, ''))}</h3>`);
      continue;
    }
    if (lines.length >= 2 && /^\*\*.+\*\*/.test(lines[0])) {
      const title = lines[0].replace(/^\*\*(.+?)\*\*.*/, '$1');
      const rest = lines.join(' ').replace(/^\*\*.+?\*\*\s*/, '');
      html.push(`<article class="mini-card"><h3>${inlineMarkdown(title)}</h3><p>${inlineMarkdown(rest)}</p></article>`);
      continue;
    }
    html.push(`<p>${inlineMarkdown(lines.join(' '))}</p>`);
  }
  return html.join('\n');
}

function renderInlineCta(headline, body, button, currentRoute = '/') {
  return `<div class="inline-cta"><h3>${inlineMarkdown(headline || 'Ready to talk?')}</h3>${body ? `<p>${inlineMarkdown(body)}</p>` : ''}<a class="button button-secondary" href="${relativeUrl(currentRoute, '/company/')}">${inlineMarkdown(button)}</a></div>`;
}

function renderSections(page, sections) {
  if (page.route === '/faq') {
    return `<section class="section section-muted"><div class="section-inner narrow"><div class="section-heading"><p class="eyebrow">FAQ</p><h2>Common questions before a rollout</h2></div><div class="faq-list">${sections.map((section, index) => `<details ${index === 0 ? 'open' : ''}><summary>${escapeHtml(section.title)}</summary>${renderParagraphs(section.body, page.route)}</details>`).join('')}</div></div></section>`;
  }
  if (page.route === '/contact') {
    const supporting = sections.find((section) => section.title === 'Sales page supporting copy');
    return `<section class="section"><div class="section-inner contact-grid"><div>${supporting ? `<div class="section-heading"><p class="eyebrow">Sales channel</p><h2>Start with your buildings and requirements.</h2></div>${renderParagraphs(supporting.body, page.route)}` : ''}<div class="contact-details"><h3>QualMeters Oy</h3><p>[Street Address]<br>[Postal Code] [City], Finland</p><p><strong>Email:</strong> sales@qualmeters.example<br><strong>Phone:</strong> +358 [phone number]</p></div></div>${contactForm()}</div></section>`;
  }
  return sections.map((section, index) => {
    const accent = index % 2 === 1 ? ' section-muted' : '';
    const body = renderParagraphs(section.body, page.route);
    const miniCards = (body.match(/class="mini-card"/g) || []).length;
    const bodyClass = miniCards >= 2 && !body.includes('class="card-grid"') ? 'section-copy card-grid' : 'section-copy';
    const sectionTitle = section.title === 'CTA' ? 'Next step' : section.title;
    return `<section class="section${accent}"><div class="section-inner split-section"><div class="section-heading"><p class="eyebrow">${escapeHtml(page.title)}</p><h2>${escapeHtml(sectionTitle)}</h2></div><div class="${bodyClass}">${body}</div></div></section>`;
  }).join('\n');
}

function contactForm() {
  return `<form class="contact-form" data-contact-form>
    <label>Name<input name="name" autocomplete="name" required></label>
    <label>Organization<input name="organization" autocomplete="organization"></label>
    <label>Email<input name="email" type="email" autocomplete="email" required></label>
    <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
    <label>Organization type<select name="organizationType"><option>Housing company</option><option>Municipality</option><option>City</option><option>Developer</option><option>Property portfolio</option><option>Other</option></select></label>
    <label>Number of buildings<input name="buildings" type="number" min="0" inputmode="numeric"></label>
    <label>Estimated number of apartments or meters<input name="meterCount" type="number" min="0" inputmode="numeric"></label>
    <label>Current meter type or protocol<input name="currentProtocol" placeholder="Wireless M-Bus, Modbus, NB-IoT or not known"></label>
    <label>Preferred deployment<select name="deployment"><option>Not sure</option><option>Building gateway</option><option>NB-IoT</option><option>Mixed deployment</option></select></label>
    <label>Message<textarea name="message" rows="5" required placeholder="Meter count, building type, communication needs and timeline"></textarea></label>
    <button class="button button-primary" type="submit">Request a demo</button>
    <p class="form-status" aria-live="polite"></p>
  </form>`;
}

function renderHomeExtras() {
  const cards = [
    ['Meters', 'MID-certified ultrasonic meters for cold and warm water applications.', '/meters/'],
    ['Connectivity', 'Wireless M-Bus, Modbus, gateway collection and NB-IoT direct-to-cloud models.', '/platform/connectivity/'],
    ['Resident portal', 'QR-based access, consumption views and leak notifications for residents.', '/resident-portal/'],
    ['REST API', 'Organization-grade access to readings, alerts, metadata and device health.', '/rest-api/'],
  ];
  return `<section class="trust-strip" aria-label="Primary audiences"><span>Housing companies</span><span>Municipalities</span><span>Cities</span><span>Property portfolios</span><span>Developers</span></section>
  <section class="section section-showcase"><div class="section-inner showcase-grid">${cards.map(([title, copy, href]) => `<a class="showcase-card" href="${relativeUrl('/', href)}"><span>${title}</span><p>${copy}</p></a>`).join('')}</div></section>`;
}

function normalizeRoute(route) {
  if (route === '/') return '/';
  return route.replace(/\/$/, '');
}

function pageDepth(route) {
  if (route === '/') return 0;
  return route.replace(/^\/|\/$/g, '').split('/').filter(Boolean).length;
}

function relativeUrl(currentRoute, target) {
  if (/^(?:[a-z]+:|#)/i.test(target)) return target;
  const prefix = '../'.repeat(pageDepth(currentRoute));
  const normalized = target.replace(/^\/+/, '');
  if (!normalized) return prefix || './';
  return `${prefix}${normalized}`;
}

function isExactRoute(activeRoute, href) {
  return normalizeRoute(activeRoute) === normalizeRoute(href);
}

function isRouteFamily(activeRoute, href) {
  const normalizedActive = normalizeRoute(activeRoute);
  const normalizedHref = normalizeRoute(href);
  if (normalizedHref === '/') return normalizedActive === '/';
  return normalizedActive === normalizedHref || normalizedActive.startsWith(`${normalizedHref}/`);
}

function navAnchor(label, href, currentRoute, activeRoute = currentRoute, extraClass = '') {
  const active = isExactRoute(activeRoute, href);
  const className = `${extraClass}${active ? `${extraClass ? ' ' : ''}is-active` : ''}`;
  return `<a${className ? ` class="${className}"` : ''} href="${relativeUrl(currentRoute, href)}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

function renderHeader(currentRoute, activeRoute = currentRoute) {
  const items = nav.map((item) => {
    const active = isRouteFamily(activeRoute, item.href);
    if (item.children) {
      return `<div class="nav-item has-menu"><button class="nav-link${active ? ' is-active' : ''}" type="button" aria-expanded="false">${item.label}</button><div class="nav-menu">${item.children.map(([label, href]) => navAnchor(label, href, currentRoute, activeRoute)).join('')}</div></div>`;
    }
    return `<a class="nav-link${active ? ' is-active' : ''}" href="${relativeUrl(currentRoute, item.href)}"${active ? ' aria-current="page"' : ''}>${item.label}</a>`;
  }).join('');
  return `<header class="site-header"><a class="brand" href="${relativeUrl(currentRoute, '/')}" aria-label="QualMeters home"><img src="${relativeUrl(currentRoute, '/assets/qualmeters-logo-horizontal.svg')}" alt="QualMeters Oy"></a><nav class="desktop-nav" aria-label="Main navigation">${items}</nav><a class="button button-small button-primary header-cta" href="${relativeUrl(currentRoute, '/company/')}">Request a demo</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span><span class="sr-only">Menu</span></button></header><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">${nav.map((item) => `${navAnchor(item.label, item.href, currentRoute, activeRoute)}${item.children ? item.children.map(([label, href]) => navAnchor(label, href, currentRoute, activeRoute, 'mobile-sub')).join('') : ''}`).join('')}<a class="button button-primary" href="${relativeUrl(currentRoute, '/company/')}">Request a demo</a></nav>`;
}

function renderFooter(currentRoute) {
  return `<section class="global-cta"><div><p class="eyebrow">Sales consultation</p><h2>Ready to see what your water data could become?</h2><p>Share your building type, meter count, communication requirements and integration needs. QualMeters will help you map the right deployment model and next steps.</p><p class="microcopy">No obligation. We will start by understanding your existing meters, buildings and goals.</p></div><img src="${relativeUrl(currentRoute, '/assets/contact-sales-channel.svg')}" alt="QualMeters sales consultation channel"><a class="button button-primary" href="${relativeUrl(currentRoute, '/company/')}">Request a demo</a></section><footer class="site-footer"><div class="footer-brand"><img src="${relativeUrl(currentRoute, '/assets/qualmeters-logo-horizontal.svg')}" alt="QualMeters Oy"><p>Managed smart water metering for buildings, municipalities and property portfolios.</p><p>QualMeters Oy<br>[Street Address]<br>[Postal Code] [City], Finland</p></div>${footerColumns.map(([heading, links]) => `<nav class="footer-links" aria-label="${heading} footer links"><h2>${heading}</h2>${links.map(([label, href]) => `<a href="${relativeUrl(currentRoute, href)}">${label}</a>`).join('')}</nav>`).join('')}</footer>`;
}

function renderShell({ title, description, route, bodyClass = 'inner-page', main }) {
  const activeRoute = route === '/contact' || route === '/request-demo' ? '/company' : route;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="icon" href="${relativeUrl(route, '/assets/qualmeters-logo.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${relativeUrl(route, '/styles.css')}">
</head>
<body class="${bodyClass}">
  ${renderHeader(route, activeRoute)}
  <main>${main}</main>
  ${renderFooter(route)}
  <script src="${relativeUrl(route, '/script.js')}" defer></script>
</body>
</html>`;
}

function renderCustomPage(page) {
  const renderers = {
    solutions: renderSelectedSolutionsPage,
    resources: renderSelectedResourcesPage,
    company: renderSelectedCompanyPage,
  };
  return renderers[page.custom](page);
}

function renderSelectedSolutionsPage(page) {
  const link = (target) => relativeUrl(page.route, target);
  const solutionCards = [
    ['Housing Companies', 'Automate apartment sub-metering, resident transparency and billing-ready exports for property managers.', '/solutions/housing-companies/'],
    ['Cities & Municipalities', 'District-wide monitoring, REST API access and leak awareness for public water operations.', '/solutions/cities-municipalities/'],
    ['New Developments', 'Specify meter pairs, communication plans, gateways and commissioning data before handover.', '/solutions/new-developments/'],
    ['Property Portfolios', 'Standardize water intelligence across buildings and prioritize action with comparable data.', '/solutions/property-portfolios/'],
  ];
  const main = `
    <section class="hero selected-hero">
      <div class="hero-copy">
        <p class="eyebrow">Solutions</p>
        <h1>Infrastructure <span>Authority.</span></h1>
        <p class="hero-body">High-precision water management solutions designed for massive scale. Secure, reliable, and engineered for Finnish municipal standards.</p>
        <div class="hero-actions"><a class="button button-primary" href="${link('/company/')}">Explore Technical Specs</a><a class="button button-secondary" href="${link('/resources/')}">Review governance</a></div>
      </div>
      <div class="hero-visual"><img src="${link('/assets/system-architecture.svg')}" alt="QualMeters infrastructure architecture"></div>
    </section>
    <section class="section section-muted">
      <div class="section-inner">
        <div class="section-heading selected-heading"><p class="eyebrow">Infrastructure Authority</p><h2>Engineered for Scale</h2><p>Uncompromising accuracy and security for critical water infrastructure.</p></div>
        <div class="selected-card-grid">
          <article class="authority-card"><span>01</span><h3>MID-Certified Precision</h3><p>Ultrasonic measurement technology supports compliant billing and stable long-term performance across apartment and municipal deployments.</p></article>
          <article class="authority-card"><span>02</span><h3>REST API Access</h3><p>Consumption data, alert states and device health can flow into ERP, billing and smart city platforms through secure endpoints.</p></article>
          <article class="authority-card"><span>03</span><h3>Bank-Grade Security</h3><p>Encrypted transport, role-aware access and tenant separation help protect water data from meter to cloud.</p></article>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="section-inner">
        <div class="section-heading selected-heading centered"><p class="eyebrow">Solutions</p><h2>Tailored Solutions</h2><p>From single housing companies to municipal grids, the platform adapts to your infrastructure needs.</p></div>
        <div class="solution-grid">${solutionCards.map(([title, copy, href]) => `<a class="solution-card" href="${link(href)}"><h3>${title}</h3><p>${copy}</p><span>View architecture</span></a>`).join('')}</div>
      </div>
    </section>`;
  return renderShell({
    title: 'Solutions - QualMeters Oy',
    description: 'Infrastructure-grade QualMeters solutions for housing companies, cities, municipalities, developers and property portfolios.',
    route: page.route,
    main,
  });
}

function renderSelectedResourcesPage(page) {
  const link = (target) => relativeUrl(page.route, target);
  const steps = [
    ['01', 'Site Survey', 'Analyze existing infrastructure, network coverage and structural constraints across deployment zones.'],
    ['02', 'Meter Plan', 'Specify meter types, telemetry configurations and physical placement strategies based on survey data.'],
    ['03', 'Installation', 'Coordinate physical deployment with clear safety standards and minimal disruption protocols.'],
    ['04', 'Validation', 'Test data transmission, encryption integrity and backend integration before commissioning.'],
  ];
  const main = `
    <section class="hero selected-hero centered-hero">
      <div class="hero-copy">
        <p class="eyebrow">Resources</p>
        <h1>Enterprise Readiness & Operations</h1>
        <p class="hero-body">A precise, end-to-end governance framework designed for large-scale Finnish utility deployments. Engineered for reliability, structured for compliance.</p>
      </div>
    </section>
    <section class="section section-muted">
      <div class="section-inner">
        <div class="section-heading selected-heading"><p class="eyebrow">Lifecycle</p><h2>The Deployment Lifecycle</h2><p>A methodical approach to rolling out smart meter infrastructure.</p></div>
        <div class="timeline-grid">${steps.map(([number, title, copy]) => `<article class="step-card"><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
      </div>
    </section>
    <section class="section">
      <div class="section-inner">
        <div class="section-heading selected-heading centered"><p class="eyebrow">Governance</p><h2>Security Foundation</h2><p>Built on zero-trust principles to safeguard critical water infrastructure.</p></div>
        <div class="governance-grid">
          <article class="governance-card wide"><p class="eyebrow">Data in transit & rest</p><h3>AES-256 Encryption</h3><p>Telemetry data is protected across device, gateway, cloud and API surfaces.</p></article>
          <article class="governance-card dark"><p class="eyebrow">Compliance</p><h3>GDPR Ready</h3><p>Data minimization and anonymized benchmarking patterns are part of the operating model.</p></article>
          <article class="governance-card"><h3>Strict Tenant Separation</h3><p>Logical isolation keeps each organization’s buildings, meters and residents in the correct data boundary.</p></article>
          <article class="governance-card"><h3>Operations Library</h3><p><a href="${link('/deployment/')}">Deployment</a>, <a href="${link('/security/')}">security</a>, <a href="${link('/sustainability/')}">sustainability</a> and <a href="${link('/faq/')}">FAQ</a> resources support procurement review.</p></article>
        </div>
      </div>
    </section>`;
  return renderShell({
    title: 'Enterprise Readiness & Operations - QualMeters Oy',
    description: 'QualMeters deployment, security and governance resources for enterprise water metering programs.',
    route: page.route,
    main,
  });
}

function strategicPartnershipForm() {
  return `<form class="contact-form strategic-form" data-contact-form>
    <label>First Name<input name="firstName" autocomplete="given-name" placeholder="Matti" required></label>
    <label>Last Name<input name="lastName" autocomplete="family-name" placeholder="Meikalainen" required></label>
    <label>Work Email<input name="email" type="email" autocomplete="email" placeholder="matti@utility.fi" required></label>
    <label>Utility / Organization Name<input name="organization" autocomplete="organization" placeholder="Helsingin Vesi" required></label>
    <label>Estimated Deployment Scale<select name="deploymentScale"><option>Select scale...</option><option>Pilot Phase (100 - 1,000)</option><option>District Level (1,000 - 10,000)</option><option>Municipal Wide (10,000 - 50,000)</option><option>Regional/National (50,000+)</option></select></label>
    <label>Primary Analytical Objectives<textarea name="objectives" rows="5" placeholder="Describe your infrastructure challenges, integration needs or efficiency goals." required></textarea></label>
    <button class="button button-primary" type="submit">Request Architecture Review</button>
    <p class="form-status" aria-live="polite"></p>
  </form>`;
}

function renderSelectedCompanyPage(page) {
  const main = `
    <section class="hero selected-hero centered-hero compact-hero">
      <div class="hero-copy">
        <p class="eyebrow">Company & Demo</p>
        <h1>Strategic Water Management Partnerships</h1>
        <p class="hero-body">Initiate a dialogue with our senior engineering team to map your utility infrastructure, assess telemetry needs and architect a customized deployment strategy.</p>
      </div>
    </section>
    <section class="section">
      <div class="section-inner partnership-grid">
        <div class="partnership-stack">
          <article class="mini-card selected-panel">
            <h2>What we map in the first call</h2>
            <ul class="check-list">
              <li><strong>Current Telemetry Infrastructure:</strong> existing legacy systems and integration pathways.</li>
              <li><strong>Deployment Scale & Topography:</strong> geographic challenges, node density and environmental factors.</li>
              <li><strong>Efficiency Benchmarking:</strong> baseline metrics for non-revenue water reduction and pressure optimization.</li>
            </ul>
          </article>
          <article class="mini-card selected-panel">
            <h3>Regional offices</h3>
            <p><strong>Helsinki Headquarters</strong><br>Muonamiehentie 11<br>00390 Helsinki, Finland<br><span class="linkish">+358 40 580 4819</span></p>
          </article>
        </div>
        <div class="form-panel">
          <div class="section-heading"><p class="eyebrow">Architecture review</p><h2>Schedule an Architecture Review</h2><p>Please provide structural details so we can assign the right engineering specialists to your initial session.</p></div>
          ${strategicPartnershipForm()}
        </div>
      </div>
    </section>`;
  return renderShell({
    title: 'QualMeters - Strategic Partnership Contact',
    description: 'Schedule a QualMeters architecture review for smart water metering, telemetry, integrations and deployment planning.',
    route: page.route,
    main,
  });
}

function renderPage(page) {
  if (page.custom) return renderCustomPage(page);

  const block = sectionBlock(page.section);
  const meta = extractMeta(block);
  const sections = splitContentSections(block);
  const proofs = extractHeroProofs(block);
  const isHome = page.route === '/';
  const bodyClass = isHome ? 'home-page' : 'inner-page';
  const activeRoute = page.route === '/' ? '/' : page.route;
  const heroBodyHtml = meta.heroBody ? `\n        <p class="hero-body">${inlineMarkdown(meta.heroBody)}</p>` : '';
  const proofHtml = proofs.length ? `\n        <ul class="hero-proof">${proofs.map((proof) => `<li>${inlineMarkdown(proof)}</li>`).join('')}</ul>` : '';
  const homeExtrasHtml = isHome ? `\n    ${renderHomeExtras()}` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(meta.seoTitle)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="icon" href="${relativeUrl(page.route, '/assets/qualmeters-logo.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${relativeUrl(page.route, '/styles.css')}">
</head>
<body class="${bodyClass}">
  ${renderHeader(page.route, activeRoute)}
  <main>
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${inlineMarkdown(meta.eyebrow)}</p>
        <h1>${inlineMarkdown(meta.h1)}</h1>${heroBodyHtml}
        <div class="hero-actions"><a class="button button-primary" href="${relativeUrl(page.route, '/company/')}">${escapeHtml(meta.primary)}</a>${meta.secondary ? `<a class="button button-secondary" href="${relativeUrl(page.route, page.route === '/' ? '/platform/' : '/company/')}">${escapeHtml(meta.secondary)}</a>` : ''}</div>${proofHtml}
      </div>
      <div class="hero-visual"><img src="${relativeUrl(page.route, `/assets/${page.image}`)}" alt="${escapeHtml(page.title)} illustration"></div>
    </section>${homeExtrasHtml}
    ${renderSections(page, sections)}
  </main>
  ${renderFooter(page.route)}
  <script src="${relativeUrl(page.route, '/script.js')}" defer></script>
</body>
</html>`;
}

for (const page of pages) {
  const targetDir = page.route === '/' ? root : path.join(root, page.route.replace(/^\//, ''));
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, 'index.html'), renderPage(page));
}

console.log(`Generated ${pages.length} pages.`);
