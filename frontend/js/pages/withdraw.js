(function () {
  if (!Session.requireLogin()) return;

  const form = document.getElementById("withdrawForm");
  const input = document.getElementById("withdrawAmount");
  const balance = document.getElementById("withdrawBalance");
  const message = document.getElementById("withdrawMessage");
  const button = document.getElementById("withdrawButton");

  // Show the real balance as soon as the page opens.
  Api.getBalance()
    .then((data) => {
      balance.textContent = formatMoney(data.balance);
    })
    .catch((error) => showMessage(message, error.message, "error"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const amount = Number(input.value);

    if (!amount || amount <= 0) {
      showMessage(message, "Enter a valid amount.", "error");
      return;
    }

    setBusy(button, true);

    try {
      const data = await Api.withdraw(amount);

      balance.textContent = formatMoney(data.balance);
      showMessage(message, `${formatMoney(amount)} withdrawn successfully.`, "success");
      input.value = "";
    } catch (error) {
      showMessage(message, error.message, "error");
    } finally {
      setBusy(button, false);
    }
  });
})();
