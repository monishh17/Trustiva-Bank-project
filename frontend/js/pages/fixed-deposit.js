(function () {
  if (!Session.requireLogin()) return;

  const form = document.getElementById("fixedDepositForm");
  const amountInput = document.getElementById("fdAmount");
  const yearsInput = document.getElementById("fdYears");
  const message = document.getElementById("fdMessage");
  const button = document.getElementById("fdButton");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);

    const amount = Number(amountInput.value);
    const years = Number(yearsInput.value);

    if (!amount || amount <= 0) {
      showMessage(message, "Enter a valid amount.", "error");
      return;
    }

    if (!Number.isInteger(years) || years < 1 || years > 10) {
      showMessage(message, "Duration must be a whole number from 1 to 10 years.", "error");
      return;
    }

    setBusy(button, true);

    try {
      const data = await Api.createFixedDeposit(amount, years);

      showMessage(
        message,
        `${formatMoney(amount)} fixed deposit created for ${years} year(s). ` +
          `Remaining balance: ${formatMoney(data.balance)}.`,
        "success",
      );

      amountInput.value = "";
      yearsInput.value = "";
    } catch (error) {
      showMessage(message, error.message, "error");
    } finally {
      setBusy(button, false);
    }
  });
})();
