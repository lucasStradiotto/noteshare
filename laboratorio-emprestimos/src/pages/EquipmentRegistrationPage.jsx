import { useState } from "react";

const DEFAULT_CATEGORIES = [
  { key: "notebooks", name: "Notebooks", icon: "💻" },
  { key: "celulares", name: "Celulares", icon: "📱" },
  { key: "cameras", name: "Câmeras", icon: "📷" },
  { key: "caixasDeSom", name: "Caixas de Som", icon: "🔊" },
  { key: "fonesDeOuvido", name: "Fones de Ouvido", icon: "🎧" },
  { key: "kitsLegoSpike", name: "Kits LEGO SPIKE PRIME", icon: "🤖" }
];

const ICON_OPTIONS = [
  "💻", "📱", "📷", "🔊", "🎧", "🤖", "📦", "🖨️", "🎮", "📟", "🔌",
  "🧰", "🖥️", "🧪", "📡", "🎹", "📚", "🔧"
];

function EquipmentRegistrationPage({
  equipmentData,
  onBack,
  onRegister,
  onRemove
}) {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [otherName, setOtherName] = useState("");
  const [otherIcon, setOtherIcon] = useState(ICON_OPTIONS[0]);
  const [error, setError] = useState("");
  const [selectedRemovalKeys, setSelectedRemovalKeys] = useState([]);
  const [showRemovalConfirmation, setShowRemovalConfirmation] = useState(false);

  const equipmentCategories = Object.entries(equipmentData)
    .filter(([, items]) => Array.isArray(items))
    .map(([key, items]) => {
      const fallback = DEFAULT_CATEGORIES.find((category) => category.key === key);
      const name = items[0]?.categoryName || fallback?.name || key;
      const icon = items[0]?.categoryIcon || fallback?.icon || "📦";
      const hasBorrowedItems = items.some((item) =>
        ["occupied", "ocupado", "emprestado"].includes(
          (item?.status || "").toLowerCase()
        )
      );

      return { key, name, icon, count: items.length, hasBorrowedItems };
    });

  const selectedRemovalCategories = equipmentCategories.filter((category) =>
    selectedRemovalKeys.includes(category.key)
  );

  const toggleCategory = (key) => {
    setSelectedCategories((selected) =>
      selected.includes(key)
        ? selected.filter((category) => category !== key)
        : [...selected, key]
    );
    setError("");
  };

  const selectedDefinitions = selectedCategories.map((key) =>
    key === "outro"
      ? { key, name: otherName.trim(), icon: otherIcon }
      : DEFAULT_CATEGORIES.find((category) => category.key === key)
  );

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      setError("Selecione pelo menos um tipo de equipamento.");
      return;
    }

    if (selectedCategories.includes("outro") && !otherName.trim()) {
      setError("Informe o nome do novo tipo de equipamento.");
      return;
    }

    setQuantities((current) => {
      const next = { ...current };
      selectedCategories.forEach((key) => {
        if (!next[key]) next[key] = "1";
      });
      return next;
    });
    setError("");
    setStep(2);
  };

  const handleReview = () => {
    const invalidQuantity = selectedCategories.some((key) => {
      const quantity = Number(quantities[key]);
      return !Number.isInteger(quantity) || quantity < 1;
    });

    if (invalidQuantity) {
      setError("Informe uma quantidade inteira maior que zero para cada tipo.");
      return;
    }

    setError("");
    setStep(3);
  };

  const handleConfirm = () => {
    const result = onRegister(
      selectedDefinitions.map((category) => ({
        ...category,
        quantity: Number(quantities[category.key])
      }))
    );

    if (result) onBack();
  };

  const toggleRemovalCategory = (key) => {
    setSelectedRemovalKeys((selected) =>
      selected.includes(key)
        ? selected.filter((categoryKey) => categoryKey !== key)
        : [...selected, key]
    );
  };

  const handleConfirmRemoval = () => {
    const result = onRemove(selectedRemovalCategories.map(({ key }) => key));

    if (result) {
      setSelectedRemovalKeys([]);
      setShowRemovalConfirmation(false);
    } else {
      setShowRemovalConfirmation(false);
    }
  };

  return (
    <main className="equipment-registration-page" style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Sistema de Empréstimo de Equipamentos</p>
          <h1 style={titleStyle}>Cadastro de equipamento</h1>
          <p style={subtitleStyle}>
            {step === 1 && "Escolha os tipos de equipamento que deseja cadastrar."}
            {step === 2 && "Informe a quantidade de itens de cada tipo selecionado."}
            {step === 3 && "Confira os dados antes de confirmar o cadastro."}
          </p>
        </div>
        <button type="button" onClick={onBack} style={secondaryButtonStyle}>
          Voltar ao Dashboard
        </button>
      </header>

      <section style={formCardStyle}>
        <div style={stepIndicatorStyle}>Etapa {step} de 3</div>

        {step === 1 && (
          <div style={categoryGridStyle}>
            {DEFAULT_CATEGORIES.map((category) => (
              <label key={category.key} style={choiceCardStyle}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.key)}
                  onChange={() => toggleCategory(category.key)}
                />
                <span style={categoryIconStyle}>{category.icon}</span>
                <span>{category.name}</span>
              </label>
            ))}

            <label style={choiceCardStyle}>
              <input
                type="checkbox"
                checked={selectedCategories.includes("outro")}
                onChange={() => toggleCategory("outro")}
              />
              <span style={categoryIconStyle}>{otherIcon}</span>
              <span>Outro</span>
            </label>

            {selectedCategories.includes("outro") && (
              <div style={otherFieldsStyle}>
                <label style={fieldLabelStyle} htmlFor="other-equipment-name">
                  Nome do equipamento
                </label>
                <input
                  id="other-equipment-name"
                  type="text"
                  value={otherName}
                  onChange={(event) => setOtherName(event.target.value)}
                  placeholder="Ex.: Impressoras"
                  style={inputStyle}
                  maxLength={60}
                />
                <span style={fieldLabelStyle}>Escolha um ícone</span>
                <div style={iconOptionsStyle}>
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setOtherIcon(icon)}
                      aria-label={`Selecionar ícone ${icon}`}
                      aria-pressed={otherIcon === icon}
                      style={{
                        ...iconButtonStyle,
                        ...(otherIcon === icon ? selectedIconButtonStyle : {})
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={quantityListStyle}>
            {selectedDefinitions.map((category) => (
              <label key={category.key} style={quantityRowStyle}>
                <span style={quantityNameStyle}>
                  <span style={categoryIconStyle}>{category.icon}</span>
                  {category.name || "Outro"}
                </span>
                <div style={quantityFieldStyle}>
                  <span style={fieldLabelStyle}>Quantidade</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantities[category.key] || ""}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [category.key]: event.target.value
                      }))
                    }
                    style={quantityInputStyle}
                  />
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div style={reviewListStyle}>
            {selectedDefinitions.map((category) => (
              <article key={category.key} style={reviewCardStyle}>
                <span style={categoryIconStyle}>{category.icon}</span>
                <div>
                  <strong style={reviewNameStyle}>{category.name}</strong>
                  <p style={reviewTextStyle}>
                    {quantities[category.key]} itens · Todos iniciarão com status Livre
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {error && <p role="alert" style={errorStyle}>{error}</p>}

        <footer style={actionsStyle}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
              style={secondaryButtonStyle}
            >
              Anterior
            </button>
          )}
          {step === 1 && (
            <button type="button" onClick={handleNext} style={primaryButtonStyle}>
              Próximo
            </button>
          )}
          {step === 2 && (
            <button type="button" onClick={handleReview} style={primaryButtonStyle}>
              Revisar cadastro
            </button>
          )}
          {step === 3 && (
            <button type="button" onClick={handleConfirm} style={primaryButtonStyle}>
              Confirmar cadastro
            </button>
          )}
        </footer>
      </section>

      <section style={removalSectionStyle}>
        <div>
          <h2 style={removalTitleStyle}>Remover equipamentos</h2>
          <p style={subtitleStyle}>
            Selecione os tipos que deseja excluir do inventário. Os registros do
            histórico de empréstimos serão mantidos.
          </p>
        </div>

        {equipmentCategories.length > 0 ? (
          <>
            <div style={removalGridStyle}>
              {equipmentCategories.map((category) => (
                <label
                  key={category.key}
                  style={{
                    ...removalCardStyle,
                    ...(category.hasBorrowedItems ? disabledRemovalCardStyle : {})
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRemovalKeys.includes(category.key)}
                    disabled={category.hasBorrowedItems}
                    onChange={() => toggleRemovalCategory(category.key)}
                  />
                  <span style={categoryIconStyle}>{category.icon}</span>
                  <span style={removalCategoryInfoStyle}>
                    <strong>{category.name}</strong>
                    <span>{category.count} itens cadastrados</span>
                    {category.hasBorrowedItems && (
                      <span style={borrowedNoticeStyle}>
                        Há itens emprestados; não é possível excluir.
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>

            <div style={removalActionsStyle}>
              <button
                type="button"
                onClick={() => {
                  setShowRemovalConfirmation(true);
                }}
                disabled={selectedRemovalKeys.length === 0}
                style={{
                  ...dangerButtonStyle,
                  ...(selectedRemovalKeys.length === 0 ? disabledButtonStyle : {})
                }}
              >
                Confirmar exclusão
              </button>
            </div>
          </>
        ) : (
          <p style={emptyRemovalStyle}>Não há equipamentos cadastrados.</p>
        )}
      </section>

      {showRemovalConfirmation && (
        <div
          role="presentation"
          style={confirmationOverlayStyle}
          onMouseDown={() => setShowRemovalConfirmation(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-equipment-title"
            style={confirmationModalStyle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="remove-equipment-title" style={removalTitleStyle}>
              Confirmar exclusão de equipamentos
            </h2>
            <p style={subtitleStyle}>
              Os tipos abaixo e todos os seus itens serão removidos do inventário.
              O histórico de empréstimos permanecerá salvo.
            </p>
            <div style={confirmationListStyle}>
              {selectedRemovalCategories.map((category) => (
                <div key={category.key} style={confirmationItemStyle}>
                  <span style={categoryIconStyle}>{category.icon}</span>
                  <strong>{category.name}</strong>
                  <span>{category.count} itens</span>
                </div>
              ))}
            </div>
            <footer style={actionsStyle}>
              <button
                type="button"
                onClick={() => setShowRemovalConfirmation(false)}
                style={secondaryButtonStyle}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoval}
                style={dangerButtonStyle}
              >
                Excluir equipamentos
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "30px",
  boxSizing: "border-box",
  background: "#f3f4f6"
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
  color: "#2563eb",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};
const titleStyle = { margin: "0 0 8px", color: "#0f172a" };
const subtitleStyle = { margin: 0, color: "#475569" };
const formCardStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "24px",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};
const removalSectionStyle = {
  maxWidth: "900px",
  margin: "24px auto 0",
  padding: "24px",
  display: "grid",
  gap: "18px",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};
const removalTitleStyle = { margin: "0 0 8px", color: "#0f172a" };
const removalGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "12px"
};
const removalCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  color: "#0f172a",
  cursor: "pointer"
};
const disabledRemovalCardStyle = {
  background: "#f8fafc",
  cursor: "not-allowed",
  opacity: 0.75
};
const removalCategoryInfoStyle = { display: "grid", gap: "4px" };
const borrowedNoticeStyle = { color: "#b45309", fontSize: "13px", fontWeight: "bold" };
const removalActionsStyle = { display: "flex", justifyContent: "flex-end" };
const dangerButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#b91c1c",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};
const disabledButtonStyle = { background: "#94a3b8", cursor: "not-allowed" };
const emptyRemovalStyle = { margin: 0, color: "#64748b" };
const confirmationOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: "rgba(15,23,42,0.6)"
};
const confirmationModalStyle = {
  width: "min(100%, 560px)",
  maxHeight: "85vh",
  overflowY: "auto",
  padding: "24px",
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
};
const confirmationListStyle = { display: "grid", gap: "10px", marginTop: "18px" };
const confirmationItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  borderRadius: "10px",
  background: "#f8fafc",
  color: "#0f172a"
};
const stepIndicatorStyle = {
  marginBottom: "20px",
  color: "#2563eb",
  fontWeight: "bold"
};
const categoryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px"
};
const choiceCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minHeight: "60px",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  color: "#0f172a",
  fontWeight: "bold",
  cursor: "pointer",
  boxSizing: "border-box"
};
const categoryIconStyle = { fontSize: "26px", lineHeight: 1 };
const otherFieldsStyle = {
  gridColumn: "1 / -1",
  display: "grid",
  gap: "10px",
  padding: "16px",
  borderRadius: "10px",
  background: "#f8fafc"
};
const fieldLabelStyle = { color: "#334155", fontWeight: "bold" };
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  font: "inherit",
  boxSizing: "border-box"
};
const iconOptionsStyle = { display: "flex", flexWrap: "wrap", gap: "8px" };
const iconButtonStyle = {
  width: "44px",
  height: "44px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#fff",
  fontSize: "24px",
  cursor: "pointer"
};
const selectedIconButtonStyle = { border: "2px solid #2563eb", background: "#eff6ff" };
const quantityListStyle = { display: "grid", gap: "12px" };
const quantityRowStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 120px",
  alignItems: "center",
  gap: "14px",
  padding: "14px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px"
};
const quantityFieldStyle = { display: "grid", gap: "5px" };
const quantityNameStyle = { display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold" };
const quantityInputStyle = {
  width: "100%",
  padding: "9px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  font: "inherit",
  boxSizing: "border-box"
};
const reviewListStyle = { display: "grid", gap: "12px" };
const reviewCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "16px",
  borderRadius: "10px",
  background: "#f8fafc"
};
const reviewNameStyle = { color: "#0f172a", fontSize: "17px" };
const reviewTextStyle = { margin: "5px 0 0", color: "#475569" };
const errorStyle = { color: "#b91c1c", fontWeight: "bold" };
const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "24px"
};
const primaryButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};
const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#374151",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

export default EquipmentRegistrationPage;
