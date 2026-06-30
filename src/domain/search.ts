import type { NormalizedExampleGroup } from './types';

export function filterExampleGroups(groups: NormalizedExampleGroup[], query: string): NormalizedExampleGroup[] {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return groups;

	return groups
		.map((group) => {
			const subgroups = group.subgroups
				.map((subgroup) => ({
					...subgroup,
					entries: subgroup.entries.filter((entry) => entry.searchText.includes(normalizedQuery)),
				}))
				.filter((subgroup) => subgroup.entries.length > 0);

			const entries = subgroups.flatMap((subgroup) => subgroup.entries);
			return { ...group, subgroups, entries };
		})
		.filter((group) => group.entries.length > 0);
}
