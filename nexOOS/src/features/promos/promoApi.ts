import type { PromoValidationResult } from '@/types';
import { fetchJson } from '@/utils/apiClient';

export const validatePromo = (code: string, subtotal: number) =>
  fetchJson<PromoValidationResult>('/promos/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
