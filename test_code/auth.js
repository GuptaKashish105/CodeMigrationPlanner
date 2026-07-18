// auth.js
var currentUser = null;

function login(username, password) {
  $.ajax({
    url: '/api/login',
    method: 'POST',
    data: { username: username, password: password },
    success: function(user) {
      currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/dashboard';
    }
  });
}

function logout() {
  currentUser = null;
  localStorage.removeItem('user');
  $.get('/api/logout', function() {
    window.location.href = '/login';
  });
}

export { login, logout };