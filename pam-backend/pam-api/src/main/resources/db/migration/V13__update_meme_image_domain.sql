-- V10: meme_images.image_url의 R2 public 도메인을 커스텀 도메인으로 교체
UPDATE meme_images
SET image_url = REPLACE(
    image_url,
    'https://pub-761f76d40dc1499fa680fef2271b9d75.r2.dev',
    'https://img.pick-a-me.me'
)
WHERE image_url LIKE 'https://pub-761f76d40dc1499fa680fef2271b9d75.r2.dev%';
