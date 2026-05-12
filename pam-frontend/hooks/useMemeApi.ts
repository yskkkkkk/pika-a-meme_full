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

  const apiResult = await apiFetch<MemeResult>(`/api/memes/compose?${query}`);

  if (apiResult?.success && apiResult.data) {
    return apiResult.data;
  }

  // 서버가 응답했지만 실패 (하트 부족, 서버 에러 등) → 에러 throw
  if (apiResult !== undefined) {
    throw new Error(apiResult?.error?.message ?? "뽑기에 실패했습니다.");
  }

  // 서버 미연결 (네트워크 오류, 로컬 개발 환경) → mock 폴백
  console.warn('API unreachable, using mock meme data');
  return getMockMeme(heartType);
}
