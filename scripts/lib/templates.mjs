import path from 'node:path';
import { countExamples } from './files.mjs';
import { IMPRINT_URL, LANDING_PAGE_VERSION, PRIVACY_URL } from './registry.mjs';

export function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, (char) => {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
	});
}

export function renderLibraryIndex(lib) {
	const licenseText = lib.license ? `${lib.name} - ${lib.license} license` : `${lib.name} examples`;
	return `<!doctype html>
<html lang="en">
\t<head>
\t\t<meta charset="utf-8" />
\t\t<title>${escapeHtml(lib.name)} - examples</title>
\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />
\t\t<link rel="preconnect" href="https://fonts.googleapis.com" />
\t\t<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
\t\t<link
\t\t\thref="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
\t\t\trel="stylesheet"
\t\t/>
\t\t<link rel="stylesheet" href="../styles/library-index.css" />
\t</head>

\t<body>
\t\t<div class="examples-page">
\t\t\t<header class="examples-header">
\t\t\t\t<nav class="examples-breadcrumb" aria-label="Breadcrumb">
\t\t\t\t\t<a href="../" aria-label="Back to all example libraries">
\t\t\t\t\t\t<span aria-hidden="true">&larr;</span>
\t\t\t\t\t\t<span>all libraries</span>
\t\t\t\t\t</a>
\t\t\t\t</nav>
\t\t\t\t<div class="examples-header-primary">
\t\t\t\t\t<div class="examples-brand">
\t\t\t\t\t\t<h1>${escapeHtml(lib.name)}</h1>
\t\t\t\t\t\t<p>${escapeHtml(lib.tagline || lib.description || '')}</p>
\t\t\t\t\t</div>
\t\t\t\t\t<label class="examples-search" for="search">
\t\t\t\t\t\t<span class="examples-search-icon" aria-hidden="true">/</span>
\t\t\t\t\t\t<input
\t\t\t\t\t\t\tid="search"
\t\t\t\t\t\t\ttype="text"
\t\t\t\t\t\t\tplaceholder="filter examples..."
\t\t\t\t\t\t\taria-label="Filter examples"
\t\t\t\t\t\t\tautocomplete="off"
\t\t\t\t\t\t\tspellcheck="false"
\t\t\t\t\t\t/>
\t\t\t\t\t</label>
\t\t\t\t</div>
\t\t\t</header>

\t\t\t<main id="examples" class="examples-browser" data-manifest="./manifest.json"></main>

\t\t\t<footer class="examples-footer">
\t\t\t\t<p>${escapeHtml(licenseText)}</p>
\t\t\t\t<nav class="examples-footer-links" aria-label="Project links">
\t\t\t\t\t<a href="https://github.com/humanbydefinition" target="_blank" rel="noopener noreferrer"
\t\t\t\t\t\t><span class="footer-link-label footer-link-label-desktop">@humanbydefinition</span
\t\t\t\t\t\t><span class="footer-link-label footer-link-label-mobile">@hbd</span></a
\t\t\t\t\t>
\t\t\t\t\t<a
\t\t\t\t\t\thref="https://github.com/${escapeHtml(lib.github)}"
\t\t\t\t\t\ttarget="_blank"
\t\t\t\t\t\trel="noopener noreferrer"
\t\t\t\t\t\t>github</a
\t\t\t\t\t>
\t\t\t\t\t<a href="${escapeHtml(lib.docsUrl)}" target="_blank" rel="noopener noreferrer">docs</a>
\t\t\t\t\t<a href="${IMPRINT_URL}">imprint</a>
\t\t\t\t\t<a href="${PRIVACY_URL}">privacy</a>
\t\t\t\t</nav>
\t\t\t</footer>
\t\t</div>

\t\t<script type="module" src="../scripts/library-gallery/main.js"></script>
\t</body>
</html>
`;
}

export function renderLandingIndex(registry, publicDir) {
	const cardsHtml = registry.libraries.map((lib) => renderLandingCard(lib, publicDir)).join('\n');
	return `<!doctype html>
<html lang="en">
\t<head>
\t\t<meta charset="utf-8" />
\t\t<title>${escapeHtml(registry.site.title)}</title>
\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />
\t\t<link rel="preconnect" href="https://fonts.googleapis.com" />
\t\t<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
\t\t<link
\t\t\thref="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
\t\t\trel="stylesheet"
\t\t/>
\t\t<link rel="stylesheet" href="./styles/index.css" />
\t</head>

\t<body>
\t\t<div class="examples-page">
\t\t\t<header class="examples-header">
\t\t\t\t<div class="examples-brand">
\t\t\t\t\t<h1>${escapeHtml(registry.site.title)}</h1>
\t\t\t\t\t<p>${escapeHtml(registry.site.tagline)}</p>
\t\t\t\t</div>
\t\t\t</header>

\t\t\t<main id="libraries" class="landing-grid">
${cardsHtml}
\t\t\t</main>

\t\t\t<footer class="examples-footer">
\t\t\t\t<p>${escapeHtml(registry.site.title)}</p>
\t\t\t\t<nav class="examples-footer-links" aria-label="Project links">
\t\t\t\t\t<a href="https://github.com/humanbydefinition" target="_blank" rel="noopener noreferrer"
\t\t\t\t\t\t><span class="footer-link-label footer-link-label-desktop">@humanbydefinition</span
\t\t\t\t\t\t><span class="footer-link-label footer-link-label-mobile">@hbd</span></a
\t\t\t\t\t>
\t\t\t\t\t<a href="https://code.textmode.art" target="_blank" rel="noopener noreferrer">docs</a>
\t\t\t\t\t<a href="${IMPRINT_URL}">imprint</a>
\t\t\t\t\t<a href="${PRIVACY_URL}">privacy</a>
\t\t\t\t</nav>
\t\t\t</footer>
\t\t</div>
\t</body>
</html>
`;
}

function renderLandingCard(lib, publicDir) {
	const manifestPath = path.join(publicDir, lib.folder, 'manifest.json');
	const exampleCount = countExamples(manifestPath);
	const footerHtml = `<span class="library-card-count-badge">${exampleCount}</span>`;

	return `\t\t\t\t<a href="./${escapeHtml(lib.folder)}/?v=${LANDING_PAGE_VERSION}" class="library-card">
\t\t\t\t\t<div class="library-card-name">${escapeHtml(lib.name)}</div>
\t\t\t\t\t<div class="library-card-tagline">${escapeHtml(lib.tagline || '')}</div>
\t\t\t\t\t<div class="library-card-desc">${escapeHtml(lib.description || '')}</div>
\t\t\t\t\t<div class="library-card-footer">
\t\t\t\t\t\t<span class="library-card-count">examples</span>
\t\t\t\t\t\t${footerHtml}
\t\t\t\t\t</div>
\t\t\t\t</a>`;
}
