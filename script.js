const runAutomationButton = document.getElementById("runAutomationButton");
const lastRunLabel = document.getElementById("lastRunLabel");
const invoiceList = document.getElementById("invoiceList");
const activityList = document.getElementById("activityList");

const summaryFields = {
  total: document.getElementById("totalInvoices"),
  pending: document.getElementById("pendingInvoices"),
  overdue: document.getElementById("overdueInvoices"),
  collected: document.getElementById("collectedAmount")
};

const today = new Date("2026-03-26T09:00:00");

const invoices = [
  {
    id: "INV-3012",
    client: "Aster Labs",
    amount: 1240,
    dueDate: "2026-03-22",
    autopay: true,
    status: "pending"
  },
  {
    id: "INV-3013",
    client: "Nexa Retail",
    amount: 890,
    dueDate: "2026-03-26",
    autopay: false,
    status: "pending"
  },
  {
    id: "INV-3014",
    client: "Orbit Studio",
    amount: 430,
    dueDate: "2026-03-19",
    autopay: false,
    status: "pending"
  },
  {
    id: "INV-3015",
    client: "Bluewave Tech",
    amount: 1675,
    dueDate: "2026-03-28",
    autopay: true,
    status: "scheduled"
  }
];

let automationLog = [
  "Sistem siap memproses billing harian.",
  "Auto-pay aktif untuk 2 akun prioritas."
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "RP",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getDaysLate(dueDate) {
  const due = new Date(`${dueDate}T00:00:00`);
  const diff = today - due;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStatusTone(status) {
  if (status === "paid") {
    return "is-paid";
  }

  if (status === "overdue") {
    return "is-overdue";
  }

  if (status === "scheduled") {
    return "is-scheduled";
  }

  return "is-pending";
}

function renderInvoices() {
  invoiceList.innerHTML = invoices.map((invoice) => `
    <article class="invoice-item">
      <div>
        <div class="invoice-title-row">
          <h3>${invoice.client}</h3>
          <span class="status-badge ${getStatusTone(invoice.status)}">${invoice.status}</span>
        </div>
        <p class="invoice-meta">${invoice.id} - Due ${formatDate(invoice.dueDate)}</p>
      </div>
      <div class="invoice-side">
        <strong>${formatCurrency(invoice.amount)}</strong>
        <span>${invoice.autopay ? "Auto-pay on" : "Manual follow-up"}</span>
      </div>
    </article>
  `).join("");
}

function renderActivity() {
  activityList.innerHTML = automationLog.map((item) => `<li>${item}</li>`).join("");
}

function renderSummary() {
  const pendingCount = invoices.filter((invoice) => invoice.status === "pending" || invoice.status === "scheduled").length;
  const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;
  const collectedAmount = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  summaryFields.total.textContent = String(invoices.length);
  summaryFields.pending.textContent = String(pendingCount);
  summaryFields.overdue.textContent = String(overdueCount);
  summaryFields.collected.textContent = formatCurrency(collectedAmount);
}

function runAutomation() {
  const newEntries = [];

  invoices.forEach((invoice) => {
    const daysLate = getDaysLate(invoice.dueDate);

    if (invoice.autopay && (invoice.status === "pending" || invoice.status === "scheduled") && daysLate >= 0) {
      invoice.status = "paid";
      newEntries.push(`${invoice.id} berhasil ditagih otomatis untuk ${invoice.client}.`);
      return;
    }

    if (!invoice.autopay && daysLate > 0 && invoice.status !== "paid") {
      invoice.status = "overdue";
      newEntries.push(`${invoice.id} melewati jatuh tempo ${daysLate} hari dan ditandai overdue.`);
      return;
    }

    if (!invoice.autopay && daysLate === 0 && invoice.status !== "paid") {
      invoice.status = "pending";
      newEntries.push(`${invoice.id} jatuh tempo hari ini dan masuk antrean reminder manual.`);
    }
  });

  if (!newEntries.length) {
    newEntries.push("Tidak ada perubahan status pada siklus automation ini.");
  }

  automationLog = [
    `Run ${new Date(today).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} selesai.`,
    ...newEntries
  ];

  lastRunLabel.textContent = "Automation terakhir dijalankan pada 26 Mar 2026, 09:00";
  renderSummary();
  renderInvoices();
  renderActivity();
}

runAutomationButton.addEventListener("click", runAutomation);

renderSummary();
renderInvoices();
renderActivity();
