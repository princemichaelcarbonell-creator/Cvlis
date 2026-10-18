// Client para sa login/sign up. Ang session ay nakasave sa localStorage.
// Kapag ibang domain ang site (hal. GitHub Pages), itakda bago i-load ito:
//   window.CVLIS_API_BASE = 'https://ang-server-mo.example.com';
(function () {
  var API_BASE = window.CVLIS_API_BASE || '';
  var KEY = 'cvlis_session';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
  }
  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  async function call(path, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json' };
    var session = read();
    if (session && session.token) headers.Authorization = 'Bearer ' + session.token;
    var res;
    try {
      res = await fetch(API_BASE + path, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
    } catch (e) {
      throw new Error('Hindi makakonekta sa server. Tiyaking tumatakbo ito.');
    }
    var data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(data.error || 'May error na nangyari.');
    return data;
  }

  window.CvlisAuth = {
    register: async function (name, email, password) {
      var data = await call('/api/register', { method: 'POST', body: { name: name, email: email, password: password } });
      write({ token: data.token, user: data.user });
      return data.user;
    },
    login: async function (email, password) {
      var data = await call('/api/login', { method: 'POST', body: { email: email, password: password } });
      write({ token: data.token, user: data.user });
      return data.user;
    },
    logout: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
    },
    getUser: function () {
      var s = read();
      return s ? s.user : null;
    },
    isLoggedIn: function () {
      var s = read();
      return !!(s && s.token);
    },
    // Tinitiyak sa server na valid pa ang session
    refresh: async function () {
      try {
        var data = await call('/api/me');
        var s = read() || {};
        write({ token: s.token, user: data.user });
        return data.user;
      } catch (e) {
        this.logout();
        return null;
      }
    }
  };
})();
