let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let netIncome = parseFloat(localStorage.getItem("netIncome")) || 0;

const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("transaction-list");
const incomeDisplay = document.getElementById("income-display");
const catEl = document.getElementById("cat-message");
const timeFilter = document.getElementById("time-filter");
const goalList = document.getElementById("goal-list");

// --- Income ---
document.getElementById("set-income").addEventListener("click", () => {
  netIncome = parseFloat(document.getElementById("net-income").value) || 0;
  localStorage.setItem("netIncome", netIncome);
  updateUI();
});

// --- Add Transaction ---
document.getElementById("add-btn").addEventListener("click", () => {
  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (description && !isNaN(amount) && amount > 0) {
    const transaction = { 
      id: Date.now(), 
      description, 
      amount, 
      category, 
      date: new Date().toISOString() 
    };
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
  }
});

// --- Remove Transaction ---
function removeTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

// --- Add Goal ---
document.getElementById("add-goal").addEventListener("click", () => {
  const name = document.getElementById("goal-name").value.trim();
  const amount = parseFloat(document.getElementById("goal-amount").value);

  if (name && !isNaN(amount) && amount > 0) {
    const goal = { id: Date.now(), name, amount };
    goals.push(goal);
    localStorage.setItem("goals", JSON.stringify(goals));
    updateUI();
    document.getElementById("goal-name").value = "";
    document.getElementById("goal-amount").value = "";
  }
});

// --- Remove Goal ---
function removeGoal(id) {
  goals = goals.filter(goal => goal.id !== id);
  localStorage.setItem("goals", JSON.stringify(goals));
  updateUI();
}

// --- Filter Transactions by Time ---
timeFilter.addEventListener("change", updateUI);

function filterTransactions() {
  const filter = timeFilter.value;
  const now = new Date();

  return transactions.filter(tx => {
    const txDate = new Date(tx.date);
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return txDate >= weekAgo;
    } else if (filter === "month") {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    } else if (filter === "year") {
      return txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

// --- Update UI ---
function updateUI() {
  incomeDisplay.textContent = `₹${netIncome}`;
  listEl.innerHTML = "";
  let balance = netIncome;

  const filtered = filterTransactions();
  filtered.forEach(tx => {
    balance -= tx.amount;
    const li = document.createElement("li");
    li.innerHTML = `
      ${tx.description} (${tx.category}) : ₹${tx.amount}
      <button onclick="removeTransaction(${tx.id})">Remove</button>
    `;
    listEl.appendChild(li);
  });

  balanceEl.textContent = `₹${balance}`;

  // Goals with progress bars
  goalList.innerHTML = "";
  goals.forEach(goal => {
    const progress = Math.min((balance / goal.amount) * 100, 100);
    const li = document.createElement("li");
    li.innerHTML = `
      ${goal.name} - Target: ₹${goal.amount}
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      <button onclick="removeGoal(${goal.id})">Remove</button>
    `;
    goalList.appendChild(li);
  });

  // Cat feedback
  if (balance < 0) {
    catEl.textContent = "Oh no! You overspent. Try to cut back.";
  } else if (balance < netIncome * 0.2) {
    catEl.textContent = "Careful, you’re close to overspending.";
  } else if (balance > netIncome * 0.5) {
    catEl.textContent = "Great job! You’ve saved a lot this month.";
  } else {
    catEl.textContent = "Keep it up, your savings are growing!";
  }
}

// Initial load
updateUI();
