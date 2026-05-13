-- user_memes.composition JSONB 내 imageUrl의 R2 public 도메인을 커스텀 도메인으로 교체
-- V13은 meme_images만 업데이트했으나, compose 시점에 이미 스냅샷으로 저장된 URL은 별도 처리 필요
UPDATE user_memes
SET composition = jsonb_set(
    composition,
    '{imageUrl}',
    to_jsonb(replace(
        composition->>'imageUrl',
        'https://pub-761f76d40dc1499fa680fef2271b9d75.r2.dev',
        'https://img.pick-a-me.me'
    ))
)
WHERE composition->>'imageUrl' LIKE 'https://pub-761f76d40dc1499fa680fef2271b9d75.r2.dev%';
