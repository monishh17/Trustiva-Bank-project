(function () {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  const button = document.getElementById("loginButton");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === "" || password === "") {
      showMessage(message, "Please enter username and password.", "error");
      return;
    }

    setBusy(button, true);

    try {
      const data = await Api.login(username, password);

      Session.save(data);
      showMessage(message, "Login successful!", "success");
      window.location.href = "pages/dashboard.html";
    } catch (error) {
      showMessage(message, error.message, "error");
      setBusy(button, false);
    }
  });
})();
