// Keeps the login token and basic user details for the current browser tab.
// sessionStorage is cleared when the tab is closed.
const Session = {
  TOKEN_KEY: "trustiva.token",
  USER_KEY: "trustiva.user",

  // Every page that needs a login lives in /pages, so this path is the same.
  LOGIN_URL: "../index.html",

  save({ token, user }) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(this.USER_KEY));
    } catch {
      return null;
    }
  },

  clear() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  },

  // Call first on every private page. Returns false (and redirects) if
  // nobody is logged in, so the page script can stop.
  requireLogin() {
    if (this.getToken()) {
      return true;
    }

    window.location.replace(this.LOGIN_URL);
    return false;
  },

  logout() {
    this.clear();
    window.location.replace(this.LOGIN_URL);
  },
};
