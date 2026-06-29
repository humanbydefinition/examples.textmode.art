const LIBRARIES_URL = './libraries.json';
const LIBRARY_PAGE_VERSION = 'portal-2';

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (char) => {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
	});
}

function getManifestExampleCount(manifest) {
	if (!Array.isArray(manifest.groups)) return 0;
	let count = 0;
	for (const group of manifest.groups) {
		if (Array.isArray(group.subgroups)) {
			for (const subgroup of group.subgroups) {
				count += (subgroup.examples || []).length;
			}
		} else {
			count += (group.examples || []).length;
		}
	}
	return count;
}

async function loadLibraryInfo(lib) {
	let exampleCount = null;
	let error = null;
	try {
		const res = await fetch(`./${lib.folder}/manifest.json`);
		if (res.ok) {
			const manifest = await res.json();
			exampleCount = getManifestExampleCount(manifest);
		}
	} catch (e) {
		error = 'manifest not found';
	}
	return { ...lib, exampleCount, error };
}

function renderCard(lib) {
	const name = escapeHtml(lib.name);
	const tagline = escapeHtml(lib.tagline || '');
	const desc = escapeHtml(lib.description || '');
	const href = `./${escapeHtml(lib.folder)}/?v=${LIBRARY_PAGE_VERSION}`;

	let footerHtml = '';
	if (lib.exampleCount !== null) {
		footerHtml = `<span class="library-card-count-badge">${lib.exampleCount}</span>`;
	} else if (lib.error) {
		footerHtml = `<span class="library-card-status">${escapeHtml(lib.error)}</span>`;
	} else {
		footerHtml = `<span class="library-card-status">loading...</span>`;
	}

	return `
		<a href="${href}" class="library-card">
			<div class="library-card-name">${name}</div>
			<div class="library-card-tagline">${tagline}</div>
			<div class="library-card-desc">${desc}</div>
			<div class="library-card-footer">
				<span class="library-card-count">examples</span>
				${footerHtml}
			</div>
		</a>
	`;
}

function renderLoading() {
	return '<p style="color: var(--text-muted); font-size: 0.8rem; padding: 2rem 0;">loading libraries...</p>';
}

function renderError(message) {
	return `<p style="color: var(--danger-color); font-size: 0.8rem; padding: 2rem 0;">${escapeHtml(message)}</p>`;
}

async function bootstrap() {
	const container = document.getElementById('libraries');
	container.innerHTML = renderLoading();

	let registry;
	try {
		const res = await fetch(LIBRARIES_URL);
		if (!res.ok) throw new Error(`Unable to load ${LIBRARIES_URL}: ${res.status}`);
		registry = await res.json();
	} catch (e) {
		container.innerHTML = renderError('Unable to load library registry.');
		console.error(e);
		return;
	}

	const infos = await Promise.all(registry.libraries.map(loadLibraryInfo));
	container.innerHTML = infos.map(renderCard).join('');
}

bootstrap();
