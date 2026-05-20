/**
 * pick-a-meme Dev Blog - 환경설정 및 상수 관리
 * - 외부 유입 채널 도메인 및 링크들을 한 곳에서 중앙 관리합니다.
 */
var PAM_CONFIG = {
  domain: "pick-a-me.me",
  urls: {
    github: "https://github.com/yskkkkkk",
    petpassBlog: "https://pet-pass-web.vercel.app/blog",
    mainApp: "https://pick-a-me.me"
  }
};

// 글로벌 스코프에 등록
window.PAM_CONFIG = PAM_CONFIG;
