(function () {
  if (!Session.requireLogin()) return;

  const list = document.getElementById("transactionList");

  // Money coming in. Everything else (withdrawal, fixed deposit) is going out.
  const CREDIT_TYPES = ["Deposit", "Initial Deposit"];

  function showEmpty(text) {
    list.replaceChildren();

    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = text;
    list.appendChild(empty);
  }

  function buildItem(transaction) {
    const isCredit = CREDIT_TYPES.includes(transaction.type);

    const item = document.createElement("div");
    item.className = "transaction-item";

    const details = document.createElement("div");
    const type = document.createElement("strong");
    const date = document.createElement("small");

    type.textContent = transaction.type;
    date.textContent = new Date(transaction.transaction_date).toLocaleString("en-IN");
    details.append(type, date);

    const amount = document.createElement("strong");
    amount.className = isCredit ? "credit" : "debit";
    amount.textContent = (isCredit ? "+" : "−") + formatMoney(transaction.amount);

    item.append(details, amount);
    return item;
  }

  Api.getTransactions()
    .then((data) => {
      if (data.transactions.length === 0) {
        showEmpty("No transactions yet.");
        return;
      }

      list.replaceChildren(...data.transactions.map(buildItem));
    })
    .catch((error) => showEmpty(error.message));
})();
