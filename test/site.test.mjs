import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

const expectedRoutes = [
  'index.html',
  'platform/index.html',
  'platform/connectivity/index.html',
  'meters/index.html',
  'gateway/index.html',
  'cloud-platform/index.html',
  'rest-api/index.html',
  'resident-portal/index.html',
  'leak-guard/index.html',
  'sustainability/index.html',
  'solutions/index.html',
  'solutions/housing-companies/index.html',
  'solutions/cities-municipalities/index.html',
  'solutions/new-developments/index.html',
  'solutions/property-portfolios/index.html',
  'resources/index.html',
  'deployment/index.html',
  'security/index.html',
  'company/index.html',
  'about/index.html',
  'contact/index.html',
  'request-demo/index.html',
  'faq/index.html'
];

const expectedAssets = [
  'assets/qualmeters-logo.svg',
  'assets/qualmeters-logo-horizontal.svg',
  'assets/hero-smart-water-network.svg',
  'assets/system-architecture.svg',
  'assets/connectivity-protocols.svg',
  'assets/ultrasonic-meter-pair.svg',
  'assets/resident-portal-qr.svg',
  'assets/utility-dashboard-api.svg',
  'assets/leak-guard.svg',
  'assets/sustainability-benchmarking.svg',
  'assets/deployment-lifecycle.svg',
  'assets/security-governance.svg',
  'assets/contact-sales-channel.svg'
];

async function readSiteFile(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

test('generates every sitemap route as a folder-based static page', async () => {
  for (const route of expectedRoutes) {
    await access(path.join(root, route));
  }
});

test('home page carries the Stitch-selected content and hydro-precision styling hooks', async () => {
  const html = await readSiteFile('index.html');
  const css = await readSiteFile('styles.css');

  assert.match(html, /Water intelligence from every meter to every decision\./);
  assert.match(html, /MID-certified ultrasonic water meters/);
  assert.match(html, /Request a demo/);
  assert.match(html, /href="platform\/"/);
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com/);
  assert.match(css, /--primary:\s*#004367/i);
  assert.match(css, /--surface-container-low:\s*#f2f4f5/i);
  assert.match(css, /backdrop-filter:\s*blur\(24px\)/i);
});

test('static pages reference local assets, shared CSS and shared JavaScript', async () => {
  for (const asset of expectedAssets) {
    await access(path.join(root, asset));
  }

  for (const route of expectedRoutes) {
    const html = await readSiteFile(route);
    assert.match(html, /href="(?:\.\.\/)*styles\.css"/, `${route} should load shared CSS`);
    assert.match(html, /src="(?:\.\.\/)*script\.js"/, `${route} should load shared JS`);
    assert.doesNotMatch(html, /(?:href|src)="\//, `${route} should use project-page-safe relative URLs`);
    assert.doesNotMatch(html, /https:\/\/lh3\.googleusercontent\.com/, `${route} should not depend on Stitch image CDN`);
  }
});

test('company/contact page preserves the selected strategic partnership inquiry fields', async () => {
  const html = await readSiteFile('contact/index.html');
  for (const label of [
    'First Name',
    'Last Name',
    'Work Email',
    'Utility / Organization Name',
    'Estimated Deployment Scale',
    'Primary Analytical Objectives'
  ]) {
    assert.match(html, new RegExp(label));
  }
});

test('strategic partnership pages list only the Helsinki headquarters office', async () => {
  for (const route of ['company/index.html', 'contact/index.html', 'request-demo/index.html']) {
    const html = await readSiteFile(route);

    assert.match(html, /Helsinki Headquarters/);
    assert.match(html, /Keilaranta 16/);
    assert.match(html, /02150 Espoo, Finland/);
    assert.match(html, /\+358 20 123 4567/);
    assert.doesNotMatch(html, /Stockholm Office/);
    assert.doesNotMatch(html, /Sveavägen 9/);
    assert.doesNotMatch(html, /111 57 Stockholm, Sweden/);
    assert.doesNotMatch(html, /\+46 8 123 45 67/);
  }
});

test('selected Stitch routes are represented as top-level pages', async () => {
  const solutions = await readSiteFile('solutions/index.html');
  const resources = await readSiteFile('resources/index.html');
  const company = await readSiteFile('company/index.html');
  const contact = await readSiteFile('contact/index.html');
  const requestDemo = await readSiteFile('request-demo/index.html');

  assert.match(solutions, /Infrastructure Authority/);
  assert.match(solutions, /Tailored Solutions/);
  assert.match(solutions, /MID-Certified Precision/);
  assert.match(resources, /Enterprise Readiness/);
  assert.match(resources, /The Deployment Lifecycle/);
  assert.match(resources, /Security Foundation/);
  assert.match(company, /Strategic Water Management Partnerships/);
  assert.match(company, /Schedule an Architecture Review/);
  assert.match(company, /What we map in the first call/);
  assert.match(contact, /Strategic Water Management Partnerships/);
  assert.match(requestDemo, /Strategic Water Management Partnerships/);
});

test('global navigation uses the selected company page for demo and contact intent', async () => {
  const html = await readSiteFile('index.html');

  assert.match(html, /href="solutions\/"/);
  assert.match(html, /href="resources\/"/);
  assert.match(html, /href="company\/"/);
  assert.doesNotMatch(html, /href="contact\/">Request a demo/);
});

test('footer links render as separated link groups instead of inline text runs', async () => {
  const html = await readSiteFile('index.html');
  const css = await readSiteFile('styles.css');

  assert.match(html, /<nav class="footer-links" aria-label="Platform footer links">/);
  assert.match(css, /\.footer-links\s*{[^}]*display:\s*grid;/s);
  assert.match(css, /\.site-footer a\s*{[^}]*display:\s*block;/s);
});

test('footer uses short user-friendly link labels', async () => {
  const html = await readSiteFile('index.html');
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0] ?? '';

  for (const label of ['Overview', 'Cloud', 'API', 'Housing', 'Municipalities', 'New builds', 'Portfolios', 'About', 'Demo']) {
    assert.match(footer, new RegExp(`>${label}<`));
  }

  for (const longLabel of ['Platform overview', 'Cloud platform', 'REST API', 'Cities and municipalities', 'New developments', 'Property portfolios', 'Request a demo']) {
    assert.doesNotMatch(footer, new RegExp(`>${longLabel}<`));
  }
});
