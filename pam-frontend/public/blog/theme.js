function applyTheme(t) {
  if (t === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', t);
  }
  localStorage.setItem('pam-theme', t);
}

document.addEventListener('DOMContentLoaded', function() {
  var placeholder = document.getElementById('profile-card-placeholder');
  if (placeholder) {
    fetch('/blog/profile.html')
      .then(function(res) {
        if (res.ok) return res.text();
        throw new Error('Failed to load profile card');
      })
      .then(function(html) {
        placeholder.innerHTML = html;
      })
      .catch(function(err) {
        console.error(err);
      });
  }
});

