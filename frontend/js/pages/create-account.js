(function () {
  const form = document.getElementById("createAccountForm");
  const message = document.getElementById("createAccountMessage");
  const button = document.getElementById("createAccountButton");

  // Text of the <label> for a field, used in the "Missing: ..." message.
  function labelFor(field) {
    return form.querySelector(`label[for="${field.id}"]`).textContent.trim();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const values = {};

    for (const field of form.elements) {
      if (!field.name) continue;

      // Passwords are sent exactly as typed; everything else is trimmed.
      values[field.name] = field.type === "password" ? field.value : field.value.trim();
    }

    const missing = [...form.elements]
      .filter((field) => field.required && values[field.name] === "")
      .map(labelFor);

    if (missing.length > 0) {
      showMessage(message, "Missing: " + missing.join(", "), "error");
      return;
    }

    if (values.password.length < 8) {
      showMessage(message, "Password must be at least 8 characters.", "error");
      return;
    }

    if (values.password !== values.confirmPassword) {
      showMessage(message, "Passwords do not match.", "error");
      return;
    }

    const initialDeposit = Number(values.initialDeposit || 0);

    if (!Number.isFinite(initialDeposit) || initialDeposit < 0) {
      showMessage(message, "Enter a valid initial deposit.", "error");
      return;
    }

    // The server doesn't need the confirmation field.
    delete values.confirmPassword;
    values.initialDeposit = initialDeposit;

    setBusy(button, true);

    try {
      const data = await Api.register(values);

      showMessage(
        message,
        `Account created! Your account number is ${data.accountNumber}. Redirecting to login...`,
        "success",
      );

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 3000);
    } catch (error) {
      showMessage(message, error.message, "error");
      setBusy(button, false);
    }
  });
})();
