import { fetchJsonWithRetry } from '@/utils/apiClient';

import { normalizeBranch, type Branch, type BranchApiRecord } from './branchData';

export const getBranches = async () => {
  const response = await fetchJsonWithRetry<unknown[]>('/branches');

  if (!Array.isArray(response)) {
    return [] as Branch[];
  }

  return response
    .map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>;
      const id = Number(row.id);

      if (!Number.isFinite(id) || id <= 0) {
        return null;
      }

      const branch: BranchApiRecord = {
        id,
        name: String(row.name ?? `Branch ${id}`),
        address: String(row.address ?? 'Address unavailable'),
        phone: typeof row.phone === 'string' ? row.phone : undefined,
        opening_time: String(row.opening_time ?? '08:00').slice(0, 5),
        closing_time: String(row.closing_time ?? '20:00').slice(0, 5),
        is_active: row.is_active !== false,
      };

      return normalizeBranch(branch);
    })
    .filter((branch): branch is Branch => branch !== null);
};
