(function () {
  if (!Session.requireLogin()) return;

  const amount = document.getElementById("balanceAmount");

  Api.getBalance()
    .then((data) => {
      amount.textContent = formatMoney(data.balance);
    })
    .catch((error) => {
      amount.textContent = "—";
      showMessage(document.getElementById("balanceMessage"), error.message, "error");
    });
})();
