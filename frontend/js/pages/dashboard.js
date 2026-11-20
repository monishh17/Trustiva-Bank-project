(function () {
  if (!Session.requireLogin()) return;

  const user = Session.getUser();

  if (user && user.fullName) {
    document.getElementById("welcomeText").textContent =
      `Welcome back, ${user.fullName}!`;
  }

  bindLogout();
})();
