import { useEffect, useState } from "react";
import logoSesi from "../assets/logo_sesi.png";

const USER_TYPES = [
  { key: "aluno", label: "Alunos" },
  { key: "professor", label: "Professores" },
  { key: "colaborador", label: "Colaboradores" }
];

const CATEGORY_NAMES = {
  notebooks: "Notebooks",
  celulares: "Celulares",
  cameras: "Câmeras",
  caixasDeSom: "Caixas de Som",
  fonesDeOuvido: "Fones de Ouvido",
  kitsLegoSpike: "Kits LEGO SPIKE PRIME"
};

const CATEGORY_ICONS = {
  notebooks: "💻",
  celulares: "📱",
  cameras: "📷",
  caixasDeSom: "🔊",
  fonesDeOuvido: "🎧",
  kitsLegoSpike: "🤖"
};

function LoanHistoryPage({ usersByType, onBack }) {
  const [selectedType, setSelectedType] = useState("aluno");
  const [today, setToday] = useState(() => new Date());
  const [followsCurrentMonth, setFollowsCurrentMonth] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    const intervalId = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const currentMonth = startOfMonth(today);
  const displayedMonth = followsCurrentMonth ? currentMonth : selectedMonth;
  const daysInMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth() + 1,
    0
  ).getDate();
  const monthTitle = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(displayedMonth);
  const users = Array.isArray(usersByType[selectedType]) ? usersByType[selectedType] : [];
  const loansByDay = new Map();

  users.forEach((user) => {
    (Array.isArray(user.loanHistory) ? user.loanHistory : []).forEach((loan) => {
      const date = parseLoanDate(loan.withdrawalDate || loan.date);
      if (
        !date ||
        date.getFullYear() !== displayedMonth.getFullYear() ||
        date.getMonth() !== displayedMonth.getMonth()
      ) {
        return;
      }

      const day = date.getDate();
      loansByDay.set(day, [
        ...(loansByDay.get(day) || []),
        { loan, user }
      ]);
    });
  });

  const showPreviousMonth = () => {
    const baseMonth = followsCurrentMonth ? currentMonth : selectedMonth;
    setSelectedMonth(
      new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1)
    );
    setFollowsCurrentMonth(false);
  };

  const showCurrentMonth = () => {
    setSelectedMonth(currentMonth);
    setFollowsCurrentMonth(true);
  };

  return (
    <main className="loan-history-page" style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Sistema de Empréstimo de Equipamentos</p>
          <h1 style={titleStyle}>Histórico de Empréstimos</h1>
          <p style={subtitleStyle}>
            Selecione o perfil e consulte os empréstimos organizados por data.
          </p>
        </div>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          Voltar ao Dashboard
        </button>
      </header>

      <nav style={tabsStyle} aria-label="Tipo de usuário">
        {USER_TYPES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={selectedType === key}
            onClick={() => setSelectedType(key)}
            style={{
              ...tabStyle,
              ...(selectedType === key ? activeTabStyle : {})
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <section style={tableSectionStyle}>
        <header style={tableHeaderStyle}>
          <h2 style={monthTitleStyle}>{capitalize(monthTitle)}</h2>
          <div style={monthActionsStyle}>
            <button type="button" onClick={showPreviousMonth} style={monthButtonStyle}>
              Mês anterior
            </button>
            {!followsCurrentMonth && (
              <button
                type="button"
                onClick={showCurrentMonth}
                style={currentMonthButtonStyle}
              >
                Mês atual
              </button>
            )}
          </div>
        </header>

        <div style={tableScrollStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th scope="col" style={dateColumnHeaderStyle}>Data</th>
                <th scope="col" style={loansColumnHeaderStyle}>Empréstimos</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const rowDate = new Date(
                  displayedMonth.getFullYear(),
                  displayedMonth.getMonth(),
                  day
                );
                const dayLoans = loansByDay.get(day) || [];

                return (
                  <tr key={day}>
                    <th
                      scope="row"
                      style={{
                        ...dateCellStyle,
                        ...(dayLoans.length === 0 ? compactDateCellStyle : {}),
                        ...(day % 2 === 0 ? alternateDayStyle : regularDayStyle)
                      }}
                    >
                      <strong>{day}</strong>
                      <span>{new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(rowDate)}</span>
                    </th>
                    <td
                      style={{
                        ...loansCellStyle,
                        ...(dayLoans.length === 0 ? compactLoansCellStyle : {}),
                        ...(day % 2 === 0 ? alternateDayStyle : regularDayStyle)
                      }}
                    >
                      {dayLoans.length > 0 ? (
                        <div className="daily-loans-grid" style={dailyLoansStyle}>
                          {dayLoans.map(({ loan, user }) => (
                            <LoanCard
                              key={`${user.id}-${loan.id}`}
                              loan={loan}
                              user={user}
                            />
                          ))}
                        </div>
                      ) : (
                        <span style={noLoanForDayStyle}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loansByDay.size === 0 && (
          <p style={emptyMonthNoteStyle}>
            Nenhum empréstimo de {getTypeLabel(selectedType).toLowerCase()}{" "}
            registrado em {monthTitle}.
          </p>
        )}
      </section>
    </main>
  );
}

function LoanCard({ loan, user }) {
  const icon = loan.categoryIcon || CATEGORY_ICONS[loan.category] || "📦";
  const quantity = loan.quantity ?? loan.equipment?.length ?? 0;

  return (
    <article className="loan-history-card" style={loanCardStyle}>
      <span aria-hidden="true" style={equipmentIconStyle}>
        {icon}
      </span>
      <div style={loanCardUserStyle}>
        <strong style={loanCardNameStyle}>{user.nome || "Usuário sem nome"}</strong>
        {user.turma && <span style={loanCardClassStyle}>{user.turma}</span>}
      </div>
      <span style={loanCardQuantityStyle}>
        {quantity} {quantity === 1 ? "item" : "itens"}
      </span>
      <button
        type="button"
        onClick={() => generateLoanPdf(loan, user)}
        style={pdfButtonStyle}
      >
        Gerar PDF
      </button>
    </article>
  );
}

function generateLoanPdf(loan, user) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    window.alert("O navegador bloqueou a janela do comprovante. Permita pop-ups e tente novamente.");
    return;
  }

  printWindow.opener = null;

  const requester = loan.requester || user;
  const category =
    loan.categoryName ||
    CATEGORY_NAMES[loan.category] ||
    loan.category ||
    "Não informada";
  const equipment = Array.isArray(loan.equipment) ? loan.equipment : [];
  const returnedEquipment = Array.isArray(loan.returnedEquipment)
    ? loan.returnedEquipment
    : [];
  const statusLabels = {
    active: "Em andamento",
    partial: "Devolução parcial",
    returned: "Devolvido"
  };
  const equipmentRows = equipment.length > 0
    ? equipment.map((item) => {
        const returnedItem = returnedEquipment.find(
          (returned) => String(returned.id) === String(item.id)
        );
        const returnDate = returnedItem?.returnDate || loan.returnDate;

        return `<tr>
          <td>${escapeHtml(item.name || `Item ${item.id}`)}</td>
          <td>${returnDate ? `Devolvido em ${escapeHtml(formatDateTime(returnDate))}` : "Ainda não devolvido"}</td>
        </tr>`;
      }).join("")
    : '<tr><td colspan="2">Itens não detalhados neste registro.</td></tr>';
  const requesterRows = Object.entries(requester)
    .filter(([field, value]) => field !== "type" && value)
    .map(([field, value]) => `<div><strong>${escapeHtml(getFieldLabel(field, user.type))}:</strong> ${escapeHtml(value)}</div>`)
    .join("");
  const filename = `comprovante-${sanitizeFilename(loan.id || "emprestimo")}`;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(filename)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 32px; color: #0f172a; font: 14px Arial, sans-serif; }
          main { max-width: 800px; margin: 0 auto; }
          header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 18px; border-bottom: 2px solid #2563eb; }
          .brand { min-width: 0; }
          .logo { display: block; width: 110px; height: auto; object-fit: contain; }
          h1 { margin: 0 0 6px; font-size: 24px; }
          h2 { margin: 24px 0 10px; font-size: 17px; }
          p { margin: 6px 0; color: #475569; }
          .meta, .requester { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px 18px; }
          .meta { margin-top: 18px; padding: 14px; border-radius: 8px; background: #f1f5f9; }
          .requester { padding: 14px; border: 1px solid #cbd5e1; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
          th { background: #e2e8f0; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 80px; text-align: center; }
          .signature { padding-top: 8px; border-top: 1px solid #475569; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <main>
          <header>
            <div class="brand">
              <h1>Comprovante de empréstimo</h1>
              <p>Sistema de Empréstimo de Equipamentos · SESI - Noteshare</p>
            </div>
            <img class="logo" src="${escapeHtml(logoSesi)}" alt="Logo SESI">
          </header>
          <section class="meta">
            <div><strong>Registro:</strong> ${escapeHtml(loan.id || "Não informado")}</div>
            <div><strong>Status:</strong> ${escapeHtml(statusLabels[loan.status] || "Não informado")}</div>
            <div><strong>Categoria:</strong> ${escapeHtml(category)}</div>
            <div><strong>Quantidade:</strong> ${equipment.length || loan.quantity || 0} itens</div>
            <div><strong>Data de retirada:</strong> ${escapeHtml(formatDateTime(loan.withdrawalDate || loan.date))}</div>
            <div><strong>Data de devolução:</strong> ${escapeHtml(loan.returnDate ? formatDateTime(loan.returnDate) : "Pendente ou parcial")}</div>
          </section>
          <h2>Dados do solicitante</h2>
          <section class="requester">${requesterRows || "<div>Dados não informados.</div>"}</section>
          <h2>Itens do empréstimo</h2>
          <table>
            <thead><tr><th>Equipamento</th><th>Devolução</th></tr></thead>
            <tbody>${equipmentRows}</tbody>
          </table>
          <div class="signatures">
            <div class="signature">Assinatura do solicitante</div>
            <div class="signature">Responsável pela entrega</div>
          </div>
        </main>
        <script>
          window.addEventListener("load", () => window.setTimeout(() => window.print(), 250));
        </script>
      </body>
    </html>`);
  printWindow.document.close();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function sanitizeFilename(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function formatDateTime(value) {
  if (!value) return "Não registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function getFieldLabel(field, userType) {
  const labels = {
    nome: "Nome",
    email: "E-mail",
    turma: "Turma",
    professor: userType === "aluno" ? "Professor responsável" : "Professor",
    disciplina: "Disciplina",
    setor: "Setor",
    nif: "NIF",
    atividade: "Atividade"
  };

  return labels[field] || field;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseLoanDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1);
}

function getTypeLabel(type) {
  return USER_TYPES.find(({ key }) => key === type)?.label || "Usuários";
}

const pageStyle = {
  minHeight: "100vh",
  padding: "30px",
  background: "#f3f4f6",
  boxSizing: "border-box"
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "24px"
};
const eyebrowStyle = {
  margin: "0 0 6px",
  color: "#1d4ed8",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.06em"
};
const titleStyle = { margin: 0, color: "#0f172a" };
const subtitleStyle = { margin: "8px 0 0", color: "#4b5563" };
const backButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#374151",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};
const tabsStyle = {
  display: "flex",
  alignItems: "flex-end",
  gap: "6px",
  borderBottom: "2px solid #cbd5e1",
  marginBottom: "18px"
};
const tabStyle = {
  padding: "11px 18px",
  border: "1px solid #cbd5e1",
  borderBottom: "none",
  borderRadius: "10px 10px 0 0",
  background: "#e2e8f0",
  color: "#334155",
  fontWeight: "bold",
  cursor: "pointer"
};
const activeTabStyle = {
  position: "relative",
  zIndex: 1,
  marginBottom: "-2px",
  borderColor: "#2563eb",
  background: "#fff",
  color: "#1d4ed8"
};
const tableSectionStyle = {
  padding: "18px",
  borderRadius: "0 14px 14px",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};
const tableHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "14px"
};
const monthTitleStyle = { margin: 0, color: "#0f172a" };
const monthActionsStyle = { display: "flex", gap: "8px", flexWrap: "wrap" };
const monthButtonStyle = {
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#f8fafc",
  color: "#0f172a",
  fontWeight: "bold",
  cursor: "pointer"
};
const currentMonthButtonStyle = {
  ...monthButtonStyle,
  borderColor: "#2563eb",
  background: "#eff6ff",
  color: "#1d4ed8"
};
const tableScrollStyle = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #cbd5e1",
  borderRadius: "10px"
};
const tableStyle = {
  width: "100%",
  minWidth: "620px",
  borderCollapse: "separate",
  borderSpacing: 0,
  color: "#0f172a"
};
const dateColumnHeaderStyle = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  width: "130px",
  minWidth: "130px",
  padding: "10px",
  borderBottom: "1px solid #cbd5e1",
  background: "#e2e8f0",
  textAlign: "left"
};
const loansColumnHeaderStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #cbd5e1",
  background: "#e2e8f0",
  textAlign: "left"
};
const dateCellStyle = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  width: "130px",
  minWidth: "130px",
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
  background: "#f8fafc",
  textAlign: "left",
  verticalAlign: "middle"
};
const compactDateCellStyle = {
  paddingTop: "3px",
  paddingBottom: "3px",
  flexDirection: "row",
  alignItems: "center",
  gap: "7px",
  fontSize: "12px"
};
const loansCellStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "top"
};
const compactLoansCellStyle = { paddingTop: "2px", paddingBottom: "2px" };
const regularDayStyle = { background: "#fff" };
const alternateDayStyle = { background: "#f1f5f9" };
const dailyLoansStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 280px)",
  gridAutoRows: "max-content",
  justifyContent: "space-between",
  gap: "8px"
};
const loanCardStyle = {
  display: "grid",
  gridTemplateColumns: "24px minmax(0, 1fr) auto auto",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: "7px",
  width: "280px",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "7px 9px",
  border: "1px solid #bfdbfe",
  borderRadius: "9px",
  background: "#eff6ff"
};
const equipmentIconStyle = { fontSize: "20px", flexShrink: 0 };
const loanCardUserStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  gap: "4px",
  minWidth: 0,
  overflow: "hidden",
  textAlign: "center"
};
const loanCardNameStyle = {
  display: "block",
  alignSelf: "center",
  minWidth: 0,
  color: "#0f172a",
  fontSize: "13px",
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};
const loanCardClassStyle = {
  flexShrink: 1,
  alignSelf: "center",
  minWidth: 0,
  color: "#475569",
  fontSize: "11px",
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};
const loanCardQuantityStyle = {
  flexShrink: 0,
  alignSelf: "center",
  color: "#334155",
  fontSize: "12px",
  textAlign: "center",
  whiteSpace: "nowrap"
};
const pdfButtonStyle = {
  whiteSpace: "nowrap",
  padding: "6px 9px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "bold",
  cursor: "pointer"
};
const noLoanForDayStyle = { color: "#cbd5e1" };
const emptyMonthNoteStyle = { margin: "14px 0 0", color: "#64748b" };

export default LoanHistoryPage;
