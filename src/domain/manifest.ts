import { getExampleDocsHref } from './docs';
import type {
	ExampleManifest,
	ManifestExample,
	NormalizedExample,
	NormalizedExampleGroup,
	NormalizedLibrary,
	NormalizedExampleSubgroup,
} from './types';

const VALID_PATH_SEGMENT = /^[A-Za-z0-9_.-]+$/;

export function getExamplePath(sourceFile: string): string {
	if (typeof sourceFile !== 'string' || !sourceFile.startsWith('examples/') || !sourceFile.endsWith('/sketch.js')) {
		throw new Error(`Invalid example source file: ${sourceFile}`);
	}

	const examplePath = sourceFile.slice('examples/'.length, -'/sketch.js'.length);
	if (!isValidExamplePath(examplePath)) {
		throw new Error(`Invalid example path: ${examplePath}`);
	}

	return examplePath;
}

export function isValidExamplePath(examplePath: string): boolean {
	const segments = examplePath.split('/');
	return (
		segments.length > 0 &&
		segments.every(
			(segment) => segment.length > 0 && segment !== '.' && segment !== '..' && VALID_PATH_SEGMENT.test(segment)
		)
	);
}

export function getExampleName(examplePath: string): string {
	const segments = examplePath.split('/');
	return segments[segments.length - 1] || examplePath;
}

export function normalizeManifest(manifest: ExampleManifest, library?: NormalizedLibrary): NormalizedExampleGroup[] {
	if (!manifest || !Array.isArray(manifest.groups)) {
		throw new Error('Examples manifest is missing a groups array.');
	}

	return manifest.groups.map((group) => {
		const groupName = group.name || 'Examples';
		const groupDescription = group.description || '';
		const subgroups: NormalizedExampleSubgroup[] = [];

		if (Array.isArray(group.subgroups)) {
			for (const subgroup of group.subgroups) {
				const subgroupName = subgroup.name || null;
				const entries = Array.isArray(subgroup.examples)
					? subgroup.examples.map((example) =>
							normalizeExample(example, groupName, groupDescription, subgroupName, library)
						)
					: [];
				subgroups.push({ name: subgroupName, description: subgroup.description || '', entries });
			}
		} else if (Array.isArray(group.examples)) {
			subgroups.push({
				name: null,
				description: '',
				entries: group.examples.map((example) =>
					normalizeExample(example, groupName, groupDescription, null, library)
				),
			});
		}

		const entries = subgroups.flatMap((subgroup) => subgroup.entries);
		return { name: groupName, description: groupDescription, entries, subgroups };
	});
}

export function flattenGroups(groups: NormalizedExampleGroup[]): NormalizedExample[] {
	return groups.flatMap((group) => group.entries);
}

function normalizeExample(
	example: ManifestExample,
	group: string,
	groupDescription: string,
	subgroup: string | null,
	library?: NormalizedLibrary
): NormalizedExample {
	const path = getExamplePath(example.sourceFile);
	const name = getExampleName(path);
	const title = example.title || name;
	const searchText = [name, title, group, subgroup].filter(Boolean).join(' ').toLowerCase();

	return {
		name,
		path,
		title,
		docsUrl: library ? getExampleDocsHref(library, { title }) : '',
		group,
		groupDescription,
		subgroup,
		searchText,
	};
}
