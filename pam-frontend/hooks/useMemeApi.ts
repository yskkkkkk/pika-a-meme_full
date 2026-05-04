import { apiFetch } from '@/lib/api';
import { getMockMeme, MockMemeResponse } from '@/hooks/useMockMemeApi';

export type MemeResult = MockMemeResponse; // reuse same shape

/**
 * Compose a meme using backend API. Falls back to mock data on failure.
 */
export async function composeMeme(
  heartType: 'BASIC' | 'SPECIAL',
  tags?: string[]
): Promise<MemeResult> {
  const query = new URLSearchParams({ heartType });
  if (tags && tags.length) query.append('tags', tags.join(','));

  // Try real API first
  const apiResult = await apiFetch<MemeResult>(`/api/memes/compose?${query}`);
  if (apiResult) {
    return apiResult;
  }

  // Fallback to mock data for development / when backend unavailable
  console.warn('API call failed, using mock meme data');
  return getMockMeme(heartType);
}
