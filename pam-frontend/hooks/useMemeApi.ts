import { apiFetch } from '@/lib/api';
import { getMockMeme, MockMemeResponse } from '@/hooks/useMockMemeApi';

export type MemeResult = MockMemeResponse; // reuse same shape

export interface PendingMeme {
  memeId?: string;
  imagePresignedUrl: string;
  subjectPosition: string;
  phrase: string;
  imageId: string;
  phraseId: string;
  heartType: 'BASIC' | 'SPECIAL';
  selectedTag?: string;
  _savedAt: number;
  _fromResult: true;
}

export async function saveComposition(pending: PendingMeme): Promise<string> {
  const result = await apiFetch<{ memeId: string }>('/api/memes/save-composition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageId: pending.imageId,
      phraseId: pending.phraseId,
      heartType: pending.heartType,
      imageUrl: pending.imagePresignedUrl,
      subjectPosition: pending.subjectPosition,
      phrase: pending.phrase,
      selectedTag: pending.selectedTag ?? null,
    }),
  });
  if (!result?.success || !result.data?.memeId) throw new Error('save failed');
  return result.data.memeId;
}

/**
 * Compose a meme using backend API. Falls back to mock data on failure.
 */
export async function composeMeme(
  heartType: 'BASIC' | 'SPECIAL',
  tags?: string[],
  drawFailedMessage = 'Failed to draw.'
): Promise<MemeResult> {
  const query = new URLSearchParams({ heartType });
  if (tags && tags.length) query.append('tags', tags.join(','));

  const apiResult = await apiFetch<MemeResult>(`/api/memes/compose?${query}`);

  if (apiResult?.success && apiResult.data) {
    return apiResult.data;
  }

  // 서버가 응답했지만 실패 (하트 부족, 서버 에러 등) → 에러 throw
  if (apiResult !== undefined) {
    throw new Error(apiResult?.error?.message ?? drawFailedMessage);
  }

  // 서버 미연결 (네트워크 오류, 로컬 개발 환경) → mock 폴백
  console.warn('API unreachable, using mock meme data');
  return getMockMeme(heartType);
}
