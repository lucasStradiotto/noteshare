import { useState } from "react";

function LoanRequestModal({ category, categoryName, onClose, onConfirm }) {
  const [userType, setUserType] = useState("");
  const [hoveredUserType, setHoveredUserType] = useState(null);
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const categoryIcons = {
    notebooks: "💻",
    celulares: "📱",
    cameras: "📷",
    caixasDeSom: "🔊",
    fonesDeOuvido: "🎧",
    kitsLegoSpike: "🤖"
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({});
    setErrorMessage("");
  };

  const handleChange = (field, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value
    }));
  };

  const isEmpty = (value) => {
    return !value || value.trim() === "";
  };

  const validateEmail = () => {
    const email = formData.email?.trim().toLowerCase();

    if (!email) {
      return "O campo E-mail é obrigatório.";
    }

    if (userType === "aluno") {
      if (!email.endsWith("@portalsesisp.org.br")) {
        return "Aluno deve utilizar obrigatoriamente o e-mail @portalsesisp.org.br.";
      }
    }

    if (userType === "professor") {
      const validProfessorEmail =
        email.endsWith("@sesisp.org.br") ||
        email.endsWith("@portalsesisp.org.br");

      if (!validProfessorEmail) {
        return "Professor deve utilizar e-mail @sesisp.org.br ou @portalsesisp.org.br.";
      }
    }

    if (userType === "colaborador") {
      if (!email.endsWith("@sesisp.org.br")) {
        return "Colaborador deve utilizar obrigatoriamente o e-mail @sesisp.org.br.";
      }
    }

    return "";
  };

  const validateForm = () => {
    if (!userType) {
      return "Selecione o tipo de solicitante.";
    }

    if (userType === "aluno") {
      if (
        isEmpty(formData.nome) ||
        isEmpty(formData.turma) ||
        isEmpty(formData.email) ||
        isEmpty(formData.atividade) ||
        isEmpty(formData.professor)
      ) {
        return "Todos os campos do aluno são obrigatórios.";
      }
    }

    if (userType === "professor") {
      if (
        isEmpty(formData.nome) ||
        isEmpty(formData.email) ||
        isEmpty(formData.disciplina) ||
        isEmpty(formData.turma) ||
        isEmpty(formData.atividade)
      ) {
        return "Todos os campos do professor são obrigatórios.";
      }
    }

    if (userType === "colaborador") {
      if (
        isEmpty(formData.nome) ||
        isEmpty(formData.nif) ||
        isEmpty(formData.email) ||
        isEmpty(formData.setor) ||
        isEmpty(formData.atividade)
      ) {
        return "Todos os campos do colaborador são obrigatórios.";
      }
    }

    const emailError = validateEmail();

    if (emailError) {
      return emailError;
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const userData = {
      type: userType,
      ...formData
    };

    setErrorMessage("");
    onConfirm(userData);
  };

  return (
    <div style={overlayStyle} onMouseDown={onClose}>
      <div style={modalStyle} onMouseDown={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span aria-hidden="true" style={{ fontSize: "24px" }}>
                {categoryIcons[category]}
              </span>
              <h2 style={{ margin: 0, color: "#0f172a" }}>
                Solicitação de Empréstimo
              </h2>
            </div>

            <p style={{ margin: "6px 0 0" }}>
              Equipamento selecionado: <strong>{categoryName}</strong>
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            X
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={userTypeAreaStyle}>
            <h3 style={{ margin: "0 0 16px", textAlign: "center" }}>
              Tipo de Solicitante
            </h3>

            <div style={userTypeOptionsStyle} role="group" aria-label="Tipo de solicitante">
              {[
                ["aluno", "Aluno"],
                ["professor", "Professor"],
                ["colaborador", "Colaborador"]
              ].map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={userType === type}
                  onClick={() => handleUserTypeChange(type)}
                  onMouseEnter={() => setHoveredUserType(type)}
                  onMouseLeave={() => setHoveredUserType(null)}
                  style={{
                    ...userTypeOptionStyle,
                    ...(userType === type || hoveredUserType === type
                      ? selectedUserTypeOptionStyle
                      : unselectedUserTypeOptionStyle)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {userType === "aluno" && (
            <>
              <h3>Dados do Aluno</h3>

              <input
                type="text"
                placeholder="Nome"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Turma"
                value={formData.turma || ""}
                onChange={(e) => handleChange("turma", e.target.value)}
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="E-mail @portalsesisp.org.br"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Atividade"
                value={formData.atividade || ""}
                onChange={(e) => handleChange("atividade", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Professor Responsável"
                value={formData.professor || ""}
                onChange={(e) => handleChange("professor", e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          {userType === "professor" && (
            <>
              <h3>Dados do Professor</h3>

              <input
                type="text"
                placeholder="Nome"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="E-mail institucional"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Disciplina"
                value={formData.disciplina || ""}
                onChange={(e) => handleChange("disciplina", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Turma"
                value={formData.turma || ""}
                onChange={(e) => handleChange("turma", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Atividade"
                value={formData.atividade || ""}
                onChange={(e) => handleChange("atividade", e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          {userType === "colaborador" && (
            <>
              <h3>Dados do Colaborador</h3>

              <input
                type="text"
                placeholder="Nome"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="NIF"
                value={formData.nif || ""}
                onChange={(e) => handleChange("nif", e.target.value)}
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="E-mail @sesisp.org.br"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Setor"
                value={formData.setor || ""}
                onChange={(e) => handleChange("setor", e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Atividade"
                value={formData.atividade || ""}
                onChange={(e) => handleChange("atividade", e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

          <div style={buttonAreaStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancelar
            </button>

            <button type="submit" style={confirmButtonStyle}>
              Confirmar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "#fff",
  width: "90%",
  maxWidth: "650px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "20px"
};

const userTypeAreaStyle = {
  background: "#f1f5f9",
  borderRadius: "12px",
  padding: "18px",
  marginBottom: "20px"
};

const userTypeOptionsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "12px"
};

const userTypeOptionStyle = {
  padding: "10px 14px",
  border: "1px solid transparent",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "bold",
  textAlign: "center",
  cursor: "pointer",
  transition: "background-color 0.15s ease, color 0.15s ease"
};

const selectedUserTypeOptionStyle = {
  background: "#1e293b",
  color: "#fff"
};

const unselectedUserTypeOptionStyle = {
  background: "#fff",
  borderColor: "#cbd5e1",
  color: "#0f172a"
};

const closeButtonStyle = {
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "8px",
  padding: "8px 12px",
  cursor: "pointer"
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#000",
  fontSize: "16px",
  boxSizing: "border-box"
};

const errorStyle = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "12px",
  borderRadius: "8px",
  marginTop: "15px",
  fontWeight: "bold"
};

const buttonAreaStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "20px"
};

const cancelButtonStyle = {
  padding: "12px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#6b7280",
  color: "#fff",
  cursor: "pointer"
};

const confirmButtonStyle = {
  padding: "12px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold"
};

export default LoanRequestModal;