function applyTheme(t) {
  if (t === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', t);
  }
  localStorage.setItem('pam-theme', t);
}

function applyConfigLinks(container) {
  var root = container || document;
  if (window.PAM_CONFIG && window.PAM_CONFIG.urls) {
    var links = root.querySelectorAll('[data-config-link]');
    links.forEach(function(el) {
      var key = el.getAttribute('data-config-link');
      if (window.PAM_CONFIG.urls[key]) {
        el.setAttribute('href', window.PAM_CONFIG.urls[key]);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // 1. 공통 헤더 동적 로드 (Outer HTML 대체 방식)
  var headerPlaceholder = document.getElementById('blog-header-placeholder');
  if (headerPlaceholder) {
    fetch('/blog/header.html')
      .then(function(res) {
        if (res.ok) return res.text();
        throw new Error('Failed to load header');
      })
      .then(function(html) {
        headerPlaceholder.outerHTML = html;
      })
      .catch(function(err) {
        console.error(err);
      });
  }

  // 2. 공통 프로필 카드 동적 로드 및 설정 링크 매핑
  var profilePlaceholder = document.getElementById('profile-card-placeholder');
  if (profilePlaceholder) {
    fetch('/blog/profile.html')
      .then(function(res) {
        if (res.ok) return res.text();
        throw new Error('Failed to load profile card');
      })
      .then(function(html) {
        profilePlaceholder.innerHTML = html;
        applyConfigLinks(profilePlaceholder);
      })
      .catch(function(err) {
        console.error(err);
      });
  }

  // 3. 본문 내 정적 설정 링크 일괄 매핑
  applyConfigLinks(document);
});


