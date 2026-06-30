export interface SourceConfig {
	repository: string;
	ref?: string;
	prepare?: 'build' | 'prebuilt';
}

export interface LibraryConfig {
	name: string;
	repo: string;
	folder: string;
	bundle: string;
	description?: string;
	tagline?: string;
	license: string;
	docsUrl?: string;
	github: string;
	source: SourceConfig;
}

export interface LibraryRegistry {
	site: {
		title: string;
		tagline: string;
	};
	libraries: LibraryConfig[];
}

export interface ManifestExample {
	title?: string;
	sourceFile: string;
}

export interface ManifestSubgroup {
	name?: string;
	description?: string;
	examples?: ManifestExample[];
}

export interface ManifestGroup {
	name?: string;
	description?: string;
	examples?: ManifestExample[];
	subgroups?: ManifestSubgroup[];
}

export interface ExampleManifest {
	version?: number;
	description?: string;
	groups: ManifestGroup[];
}

export interface NormalizedLibrary extends LibraryConfig {
	docsUrl: string;
}

export interface NormalizedExample {
	name: string;
	path: string;
	title: string;
	group: string;
	groupDescription: string;
	subgroup: string | null;
	searchText: string;
}

export interface NormalizedExampleSubgroup {
	name: string | null;
	description: string;
	entries: NormalizedExample[];
}

export interface NormalizedExampleGroup {
	name: string;
	description: string;
	entries: NormalizedExample[];
	subgroups: NormalizedExampleSubgroup[];
}

export interface NormalizedRegistry {
	site: LibraryRegistry['site'];
	libraries: NormalizedLibrary[];
}
