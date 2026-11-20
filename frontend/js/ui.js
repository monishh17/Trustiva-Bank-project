// Small helpers shared by every page.

function formatMoney(amount) {
  const value = Number(amount);
  const decimals = Number.isInteger(value) ? 0 : 2;

  return (
    "₹" +
    value.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

// kind: "error", "success" or nothing (plain message)
function showMessage(element, text, kind = "") {
  element.textContent = text;
  element.className = kind ? `form-message is-${kind}` : "form-message";
}

function clearMessage(element) {
  showMessage(element, "");
}

function setBusy(button, busy) {
  button.disabled = busy;
}

// Wires a logout button/link if the page has one.
function bindLogout() {
  const button = document.getElementById("logoutButton");

  if (button) {
    button.addEventListener("click", () => Session.logout());
  }
}
