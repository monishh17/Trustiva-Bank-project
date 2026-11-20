(function () {
  const form = document.getElementById("forgotPasswordForm");
  const message = document.getElementById("forgotPasswordMessage");
  const button = document.getElementById("resetPasswordButton");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const username = document.getElementById("forgotUsername").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dob").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!username || !phone || !dob || !newPassword || !confirmNewPassword) {
      showMessage(message, "Please fill in all the details.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showMessage(message, "Password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessage(message, "Passwords do not match.", "error");
      return;
    }

    setBusy(button, true);

    try {
      await Api.resetPassword({ username, phone, dob, newPassword });

      showMessage(message, "Password reset successfully! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    } catch (error) {
      showMessage(message, error.message, "error");
      setBusy(button, false);
    }
  });
})();
