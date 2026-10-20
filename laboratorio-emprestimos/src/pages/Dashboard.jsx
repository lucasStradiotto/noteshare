import { useState } from "react";
import EquipmentCard from "../components/EquipmentCard";
import LoanRequestModal from "../components/LoanRequestModal";
import "./Dashboard.css";

function Dashboard({
  equipmentData,
  onEquipmentReturned,
  onUserConfirmed,
  onViewHistory,
  onRegisterEquipment,
  onViewStatus,
  onExportBackup,
  onImportBackup
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowerForReturn, setBorrowerForReturn] = useState(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);

  const defaultCategoryNames = {
    notebooks: "Notebooks",
    celulares: "Celulares",
    cameras: "Câmeras",
    caixasDeSom: "Caixas de Som",
    fonesDeOuvido: "Fones de Ouvido",
    kitsLegoSpike: "Kits LEGO SPIKE PRIME"
  };

  const defaultCategoryIcons = {
    notebooks: "💻",
    celulares: "📱",
    cameras: "📷",
    caixasDeSom: "🔊",
    fonesDeOuvido: "🎧",
    kitsLegoSpike: "🤖"
  };
  const categoryNames = Object.fromEntries(
    Object.entries(equipmentData).map(([category, items]) => [
      category,
      items?.[0]?.categoryName || defaultCategoryNames[category] || category
    ])
  );
  const categoryIcons = Object.fromEntries(
    Object.entries(equipmentData).map(([category, items]) => [
      category,
      items?.[0]?.categoryIcon || defaultCategoryIcons[category] || "📦"
    ])
  );

  const handleOpenModal = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  const handleConfirmUser = (userData) => {
    onUserConfirmed(selectedCategory, userData);
    setSelectedCategory(null);
  };

  const handleOpenReturnModal = (borrower) => {
    setBorrowerForReturn(borrower);
    setSelectedReturnItems([]);
  };

  const handleCloseReturnModal = () => {
    setBorrowerForReturn(null);
    setSelectedReturnItems([]);
  };

  const getReturnItemKey = (item) =>
    `${item.category}::${item.id}::${item.loanDate || ""}`;

  const handleToggleReturnItem = (item) => {
    const itemKey = getReturnItemKey(item);
    setSelectedReturnItems((previousItems) =>
      previousItems.includes(itemKey)
        ? previousItems.filter((key) => key !== itemKey)
        : [...previousItems, itemKey]
    );
  };

  const handleToggleAllReturnItems = () => {
    if (!borrowerForReturn) {
      return;
    }

    const allItemKeys = borrowerForReturn.equipment.map(getReturnItemKey);
    setSelectedReturnItems((previousItems) =>
      previousItems.length === allItemKeys.length ? [] : allItemKeys
    );
  };

  const handleConfirmReturn = () => {
    if (!borrowerForReturn || selectedReturnItems.length === 0) {
      return;
    }

    const itemsToReturn = borrowerForReturn.equipment
      .filter((item) => selectedReturnItems.includes(getReturnItemKey(item)))
      .map(({ category, id, loanDate }) => ({ category, id, loanDate }));
    const returned = onEquipmentReturned(
      borrowerForReturn,
      itemsToReturn,
      new Date().toISOString()
    );

    if (returned) {
      handleCloseReturnModal();
    }
  };

  const handleBackupFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      onImportBackup(file);
    }

    event.target.value = "";
  };

  const isAvailableStatus = (status) => {
    return (
      status === "available" ||
      status === "livre" ||
      status === "disponivel"
    );
  };

  const getAvailableQuantity = (category) => {
    return (equipmentData[category] || []).filter((item) =>
      isAvailableStatus(item.status)
    ).length;
  };

  const borrowerGroups = Object.entries(equipmentData).reduce(
    (groups, [category, items]) => {
      if (!Array.isArray(items)) {
        return groups;
      }

      items.forEach((item) => {
        if (
          !item ||
          !["occupied", "ocupado", "emprestado"].includes(item.status)
        ) {
          return;
        }

        const borrowerName = item.loanedTo || "Solicitante não informado";
        const borrowerType = (item.loanedByType || "").toLowerCase();
        const borrowerIdentity =
          typeof item.loanedToEmail === "string" && item.loanedToEmail
          ? item.loanedToEmail.trim().toLowerCase()
          : borrowerName;
        const key = `${borrowerType}::${borrowerIdentity}`;

        if (!groups.has(key)) {
          groups.set(key, {
            key,
            name: borrowerName,
            type: borrowerType,
            email: item.loanedToEmail,
            activity: item.activity,
            turma: item.loanedToTurma,
            disciplina: item.loanedToDisciplina,
            setor: item.loanedToSetor,
            professor: item.loanedToProfessor,
            nif: item.loanedToNif,
            quantity: 0,
            icons: new Set(),
            equipment: []
          });
        }

        const borrower = groups.get(key);
        borrower.quantity += 1;
        borrower.icons.add(categoryIcons[category] || "📦");
        borrower.turma ||= item.loanedToTurma;
        borrower.disciplina ||= item.loanedToDisciplina;
        borrower.setor ||= item.loanedToSetor;
        borrower.email ||= item.loanedToEmail;
        borrower.activity ||= item.activity;
        borrower.professor ||= item.loanedToProfessor;
        borrower.nif ||= item.loanedToNif;
        borrower.equipment.push({
          ...item,
          category,
          categoryName: categoryNames[category] || category
        });
      });

      return groups;
    },
    new Map()
  );

  return (
    <div className="dashboard-page" style={{ padding: "30px" }}>
      <div className="dashboard-header" style={headerAreaStyle}>
        <div className="dashboard-intro" style={headerIntroStyle}>
          <div>
            <h1>
              Sistema de Empréstimo de Equipamentos
            </h1>

            <p>
              Selecione abaixo o tipo de equipamento que será emprestado.
            </p>
          </div>

          <button
            type="button"
            onClick={onRegisterEquipment}
            style={registrationLinkStyle}
          >
            Cadastro de equipamento
          </button>
        </div>

        <div className="dashboard-backup-area" style={backupAreaStyle}>
        <div className="dashboard-backup-buttons" style={backupButtonsStyle}>
            <button
              type="button"
              onClick={onExportBackup}
              style={exportButtonStyle}
            >
              Exportar backup
            </button>

            <label style={importButtonStyle}>
              Importar backup
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleBackupFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onViewHistory}
            style={exportButtonStyle}
          >
            Histórico
          </button>
        </div>
      </div>

      <div
        className="dashboard-category-grid"
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >
        {Object.entries(equipmentData)
          .filter(([, items]) => Array.isArray(items))
          .map(([category]) => (
            <EquipmentCard
              key={category}
              title={categoryNames[category]}
              icon={categoryIcons[category]}
              quantity={getAvailableQuantity(category)}
              onClick={() => handleOpenModal(category)}
              onStatusClick={() => onViewStatus(category)}
            />
          ))}
      </div>

      <section style={borrowedSectionStyle}>
        <h2 className="borrowed-section-title" style={borrowedSectionTitleStyle}>
          Equipamentos Em Uso
        </h2>

        {borrowerGroups.size > 0 ? (
          <div style={borrowerGridStyle}>
            {Array.from(borrowerGroups.values()).map((borrower) => (
              <article
                key={borrower.key}
                className="borrower-card"
                style={borrowerCardStyle}
              >
                <div
                  style={borrowerIconsStyle}
                  aria-label="Equipamentos emprestados"
                >
                  {Array.from(borrower.icons).map((icon) => (
                    <span key={icon} aria-hidden="true">
                      {icon}
                    </span>
                  ))}
                </div>
                <div style={borrowerContentStyle}>
                  <div className="borrower-info-grid">
                    <div className="borrower-field">
                      <span className="borrower-field__label">QTD:</span>
                      <span className="borrower-field__value">{borrower.quantity}</span>
                    </div>
                    <div className="borrower-field">
                      <span className="borrower-field__label">NOME:</span>
                      <span className="borrower-field__value">{borrower.name}</span>
                    </div>
                    {["aluno", "professor"].includes(borrower.type) && (
                      <div className="borrower-field">
                        <span className="borrower-field__label">TURMA:</span>
                        <span className="borrower-field__value">
                          {borrower.turma || "Não informada"}
                        </span>
                      </div>
                    )}
                    {borrower.type === "aluno" && (
                      <>
                        <div className="borrower-field">
                          <span className="borrower-field__label">PROFESSOR:</span>
                          <span className="borrower-field__value">
                            {borrower.professor || "Não informado"}
                          </span>
                        </div>
                        <div className="borrower-field">
                          <span className="borrower-field__label">ATIVIDADE:</span>
                          <span className="borrower-field__value">
                            {borrower.activity || "Não informada"}
                          </span>
                        </div>
                      </>
                    )}
                    {borrower.type === "professor" && (
                      <>
                        <div className="borrower-field">
                          <span className="borrower-field__label">DISCIPLINA:</span>
                          <span className="borrower-field__value">
                            {borrower.disciplina || "Não informada"}
                          </span>
                        </div>
                        <div className="borrower-field">
                          <span className="borrower-field__label">ATIVIDADE:</span>
                          <span className="borrower-field__value">
                            {borrower.activity || "Não informada"}
                          </span>
                        </div>
                      </>
                    )}
                    {borrower.type === "colaborador" && (
                      <>
                        <div className="borrower-field">
                          <span className="borrower-field__label">SETOR:</span>
                          <span className="borrower-field__value">
                            {borrower.setor || "Não informado"}
                          </span>
                        </div>
                        <div className="borrower-field">
                          <span className="borrower-field__label">ATIVIDADE:</span>
                          <span className="borrower-field__value">
                            {borrower.activity || "Não informada"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="borrower-card__actions" style={borrowerActionsStyle}>
                  <button
                    type="button"
                    style={viewButtonStyle}
                    onClick={() => setSelectedBorrower(borrower)}
                  >
                    Visualizar
                  </button>
                  <button
                    type="button"
                    style={returnButtonStyle}
                    onClick={() => handleOpenReturnModal(borrower)}
                  >
                    Devolução
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p style={emptyBorrowersStyle}>
            Não há equipamentos emprestados no momento.
          </p>
        )}
      </section>

      {selectedCategory && (
        <LoanRequestModal
          category={selectedCategory}
          categoryName={categoryNames[selectedCategory]}
          onClose={handleCloseModal}
          onConfirm={handleConfirmUser}
        />
      )}

      {selectedBorrower && (
        <div
          style={borrowerModalOverlayStyle}
          onMouseDown={() => setSelectedBorrower(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="borrower-modal-title"
            style={borrowerModalStyle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header style={borrowerModalHeaderStyle}>
              <div>
                <p style={borrowerModalLabelStyle}>Detalhes do empréstimo</p>
                <h2 id="borrower-modal-title" style={borrowerModalTitleStyle}>
                  {selectedBorrower.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBorrower(null)}
                style={borrowerModalCloseStyle}
                aria-label="Fechar"
              >
                X
              </button>
            </header>

            <div style={borrowerModalContentStyle}>
              <section style={borrowerModalInfoCardStyle}>
                <h3 style={borrowerModalSectionTitleStyle}>Dados do solicitante</h3>
                <p><strong>Tipo:</strong> {getBorrowerTypeName(selectedBorrower.type)}</p>
                <p><strong>E-mail:</strong> {selectedBorrower.email || "Não informado"}</p>
                <p><strong>Atividade:</strong> {selectedBorrower.activity || "Não informada"}</p>
                {selectedBorrower.type === "aluno" && (
                  <>
                    <p><strong>Turma:</strong> {selectedBorrower.turma || "Não informada"}</p>
                    <p>
                      <strong>Professor responsável:</strong>{" "}
                      {selectedBorrower.professor || "Não informado"}
                    </p>
                  </>
                )}
                {selectedBorrower.type === "professor" && (
                  <>
                    <p>
                      <strong>Disciplina:</strong>{" "}
                      {selectedBorrower.disciplina || "Não informada"}
                    </p>
                    <p><strong>Turma:</strong> {selectedBorrower.turma || "Não informada"}</p>
                  </>
                )}
                {selectedBorrower.type === "colaborador" && (
                  <>
                    <p><strong>NIF:</strong> {selectedBorrower.nif || "Não informado"}</p>
                    <p><strong>Setor:</strong> {selectedBorrower.setor || "Não informado"}</p>
                  </>
                )}
              </section>

              <section style={borrowerModalInfoCardStyle}>
                <h3 style={borrowerModalSectionTitleStyle}>
                  Equipamentos emprestados ({selectedBorrower.equipment.length})
                </h3>
                <div style={borrowerModalEquipmentListStyle}>
                  {selectedBorrower.equipment.map((item) => (
                    <article key={`${item.category}-${item.id}`} style={borrowerModalEquipmentStyle}>
                      <h4 style={borrowerModalEquipmentTitleStyle}>
                        {categoryIcons[item.category] || "📦"} {item.name}
                      </h4>
                      <p><strong>Categoria:</strong> {item.categoryName}</p>
                      <p><strong>Status:</strong> Emprestado</p>
                      <p><strong>Atividade:</strong> {item.activity || "Não informada"}</p>
                      <p>
                        <strong>Data do empréstimo:</strong>{" "}
                        {formatLoanDate(item.loanDate)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      {borrowerForReturn && (
        <div
          style={borrowerModalOverlayStyle}
          onMouseDown={handleCloseReturnModal}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            style={borrowerModalStyle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header style={borrowerModalHeaderStyle}>
              <div>
                <p style={borrowerModalLabelStyle}>Confirmação de devolução</p>
                <h2 id="return-modal-title" style={borrowerModalTitleStyle}>
                  {borrowerForReturn.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseReturnModal}
                style={borrowerModalCloseStyle}
                aria-label="Fechar"
              >
                X
              </button>
            </header>

            <div style={borrowerModalContentStyle}>
              <section style={borrowerModalInfoCardStyle}>
                <h3 style={borrowerModalSectionTitleStyle}>
                  Dados do solicitante
                </h3>
                <p>
                  <strong>Tipo:</strong>{" "}
                  {getBorrowerTypeName(borrowerForReturn.type)}
                </p>
                <p>
                  <strong>E-mail:</strong>{" "}
                  {borrowerForReturn.email || "Não informado"}
                </p>
                <p>
                  <strong>Atividade:</strong>{" "}
                  {borrowerForReturn.activity || "Não informada"}
                </p>
                {borrowerForReturn.type === "aluno" && (
                  <>
                    <p><strong>Turma:</strong> {borrowerForReturn.turma || "Não informada"}</p>
                    <p>
                      <strong>Professor responsável:</strong>{" "}
                      {borrowerForReturn.professor || "Não informado"}
                    </p>
                  </>
                )}
                {borrowerForReturn.type === "professor" && (
                  <>
                    <p><strong>Turma:</strong> {borrowerForReturn.turma || "Não informada"}</p>
                    <p>
                      <strong>Disciplina:</strong>{" "}
                      {borrowerForReturn.disciplina || "Não informada"}
                    </p>
                  </>
                )}
                {borrowerForReturn.type === "colaborador" && (
                  <>
                    <p><strong>NIF:</strong> {borrowerForReturn.nif || "Não informado"}</p>
                    <p><strong>Setor:</strong> {borrowerForReturn.setor || "Não informado"}</p>
                  </>
                )}
              </section>

              <section style={borrowerModalInfoCardStyle}>
                <div style={returnItemsHeaderStyle}>
                  <h3 style={borrowerModalSectionTitleStyle}>
                    Equipamentos sob custódia ({borrowerForReturn.equipment.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleToggleAllReturnItems}
                    style={viewButtonStyle}
                  >
                    {selectedReturnItems.length === borrowerForReturn.equipment.length
                      ? "Desselecionar todos"
                      : "Selecionar todos"}
                  </button>
                </div>
                <div style={borrowerModalEquipmentListStyle}>
                  {borrowerForReturn.equipment.map((item) => (
                    <label
                      key={getReturnItemKey(item)}
                      style={returnEquipmentStyle}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReturnItems.includes(getReturnItemKey(item))}
                        onChange={() => handleToggleReturnItem(item)}
                      />
                      <span style={returnEquipmentInfoStyle}>
                        <strong>
                          {categoryIcons[item.category] || "📦"} {item.name}
                        </strong>
                        <br />
                        {item.categoryName}
                        <br />
                        Retirada: {formatLoanDate(item.loanDate)}
                      </span>
                    </label>
                  ))}
                </div>
                <div style={returnConfirmAreaStyle}>
                  <button
                    type="button"
                    onClick={handleConfirmReturn}
                    disabled={selectedReturnItems.length === 0}
                    style={{
                      ...confirmReturnButtonStyle,
                      opacity: selectedReturnItems.length === 0 ? 0.5 : 1,
                      cursor: selectedReturnItems.length === 0
                        ? "not-allowed"
                        : "pointer"
                    }}
                  >
                    Confirmar devolução ({selectedReturnItems.length})
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function getBorrowerTypeName(type) {
  const typeNames = {
    aluno: "Aluno",
    professor: "Professor",
    colaborador: "Colaborador"
  };

  return typeNames[type] || "Não informado";
}

function formatLoanDate(value) {
  if (!value) {
    return "Não informada";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

const headerAreaStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const headerIntroStyle = {
  flex: "1 1 100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap"
};

const registrationLinkStyle = {
  flexShrink: 0,
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#0f172a",
  color: "#fff",
  fontWeight: "bold",
  textDecoration: "none",
  cursor: "pointer"
};

const backupAreaStyle = {
  flex: "1 1 100%",
  background: "#fff",
  borderRadius: "12px",
  padding: "14px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
  boxSizing: "border-box"
};

const backupButtonsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap"
};

const backupButtonBaseStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  lineHeight: "20px",
  width: "140px",
  boxSizing: "border-box",
  textAlign: "center"
};

const exportButtonStyle = {
  ...backupButtonBaseStyle,
  background: "#2563eb"
};

const importButtonStyle = {
  ...backupButtonBaseStyle,
  background: "#16a34a",
  display: "inline-block"
};

const borrowedSectionStyle = {
  marginTop: "32px"
};

const borrowedSectionTitleStyle = {
  color: "#0f172a",
  marginBottom: "16px"
};

const borrowerGridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const borrowerCardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "14px 20px",
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  minHeight: "88px"
};

const borrowerContentStyle = {
  flex: "1 1 auto",
  minWidth: 0
};

const borrowerIconsStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
  fontSize: "26px",
  minWidth: "42px",
  flexShrink: 0
};

const borrowerActionsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  flexShrink: 0
};

const viewButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#0f172a",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const returnButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#dc2626",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const emptyBorrowersStyle = {
  color: "#4b5563",
  background: "#fff",
  borderRadius: "12px",
  padding: "18px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const borrowerModalOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: "rgba(15, 23, 42, 0.6)"
};

const borrowerModalStyle = {
  width: "min(900px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "24px",
  borderRadius: "16px",
  background: "#f3f4f6",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const borrowerModalHeaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px",
  textAlign: "center",
  position: "relative"
};

const borrowerModalLabelStyle = {
  margin: "0 0 6px",
  color: "#1d4ed8",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.06em"
};

const borrowerModalTitleStyle = {
  margin: 0,
  color: "#0f172a"
};

const borrowerModalCloseStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  padding: "8px 12px",
  border: "none",
  borderRadius: "8px",
  background: "#ef4444",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const borrowerModalContentStyle = {
  display: "grid",
  gap: "16px"
};

const borrowerModalInfoCardStyle = {
  padding: "20px",
  borderRadius: "12px",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const borrowerModalSectionTitleStyle = {
  margin: "0 0 14px",
  color: "#0f172a"
};

const borrowerModalEquipmentListStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px"
};

const borrowerModalEquipmentStyle = {
  padding: "14px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  background: "#f9fafb",
  textAlign: "center"
};

const borrowerModalEquipmentTitleStyle = {
  margin: "0 0 10px",
  color: "#0f172a"
};

const returnItemsHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap"
};

const returnEquipmentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "14px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  background: "#f9fafb",
  cursor: "pointer"
};

const returnEquipmentInfoStyle = {
  textAlign: "center"
};

const returnConfirmAreaStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "18px"
};

const confirmReturnButtonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#16a34a",
  color: "#fff",
  fontWeight: "bold"
};

export default Dashboard;