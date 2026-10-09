import { useState } from "react";
import logoSesi from "../assets/logo_sesi.png";

function EquipmentSelectionPage({
    category,
    user,
    equipmentData,
    setEquipmentData,
    onLoanConfirmed,
    onBack
}) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const categoryNames = {
        notebooks: "Notebooks",
        celulares: "Celulares",
        cameras: "Câmeras",
        caixasDeSom: "Caixas de Som",
        fonesDeOuvido: "Fones de Ouvido",
        kitsLegoSpike: "Kits LEGO SPIKE PRIME"
    };

    const getUserTypeLabel = (type) => {
        if (type === "aluno") return "Aluno";
        if (type === "professor") return "Professor";
        if (type === "colaborador") return "Colaborador";
        return "";
    };

    const selectedEquipmentList = equipmentData[category] || [];
    const categoryName =
        selectedEquipmentList[0]?.categoryName ||
        categoryNames[category] ||
        category;

    const isAvailableStatus = (status) => {
        return status === "available" || status === "livre" || status === "disponivel";
    };

    const isOccupiedStatus = (status) => {
        return status === "occupied" || status === "ocupado" || status === "emprestado";
    };

    const isMaintenanceStatus = (status) => {
        return status === "maintenance" || status === "inativo" || status === "manutencao";
    };

    const availableItems = selectedEquipmentList.filter((item) =>
        isAvailableStatus(item.status)
    );

    const visibleEquipmentList = availableItems;

    const selectedEquipmentObjects = selectedEquipmentList.filter((item) =>
        selectedItems.includes(item.id)
    );

    const handleToggleItem = (itemId) => {
        setSelectedItems((previousSelectedItems) => {
            if (previousSelectedItems.includes(itemId)) {
                return previousSelectedItems.filter((id) => id !== itemId);
            }

            return [...previousSelectedItems, itemId];
        });
    };

    const handleSelectAll = () => {
        const allAvailableIds = availableItems.map((item) => item.id);
        setSelectedItems(allAvailableIds);
    };

    const handleClearSelection = () => {
        setSelectedItems([]);
    };

    const handleSelectQuantity = (quantity) => {
        const firstAvailableItems = availableItems.slice(0, quantity);
        const firstAvailableIds = firstAvailableItems.map((item) => item.id);

        setSelectedItems(firstAvailableIds);
    };

    const handleOpenConfirmModal = () => {
        if (selectedItems.length === 0) {
            return;
        }

        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const handleConfirmLoan = () => {
        const now = new Date();
        const loanedItems = selectedEquipmentObjects.map(({ id, name }) => ({
            id,
            name
        }));

        const userSaved = onLoanConfirmed(
            user,
            category,
            loanedItems,
            now.toISOString()
        );

        if (!userSaved) {
            return;
        }

        const updatedCategoryItems = selectedEquipmentList.map((item) => {
            if (selectedItems.includes(item.id)) {
                return {
                    ...item,
                    status: "occupied",
                    loanedTo: user.nome,
                    loanedByType: user.type,
                    loanedToEmail: user.email,
                    loanedToTurma: user.turma,
                    loanedToDisciplina: user.disciplina,
                    loanedToSetor: user.setor,
                    loanedToProfessor: user.professor,
                    loanedToNif: user.nif,
                    activity: user.atividade,
                    loanDate: now.toISOString()
                };
            }

            return item;
        });

        setEquipmentData((previousEquipmentData) => ({
            ...previousEquipmentData,
            [category]: updatedCategoryItems
        }));

        setSelectedItems([]);
        setShowConfirmModal(false);
    };

    const formatDateTime = (date) => {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(date);
    };

    return (
        <div style={{ padding: "30px", background: "#f3f4f6", minHeight: "100vh" }}>
            <button onClick={onBack} style={backButtonStyle}>
                Voltar para o início
            </button>

            <div style={userHeaderStyle}>
                <div>
                    <p style={smallLabelStyle}>Solicitante confirmado</p>

                    <h1 style={{ margin: "5px 0", color: "#0f172a" }}>{user.nome}</h1>

                    <p style={infoTextStyle}>
                        Tipo: <strong>{getUserTypeLabel(user.type)}</strong>
                    </p>

                    <p style={infoTextStyle}>
                        E-mail: <strong>{user.email}</strong>
                    </p>

                    <p style={infoTextStyle}>
                        Atividade: <strong>{user.atividade}</strong>
                    </p>
                </div>

                <div style={secondaryInfoStyle}>
                    <img
                        src={logoSesi}
                        alt="Logo SESI"
                        style={logoStyle}
                    />

                    {user.type === "aluno" && (
                        <>
                            <p>
                                Turma: <strong>{user.turma}</strong>
                            </p>

                            <p>
                                Professor Responsável: <strong>{user.professor}</strong>
                            </p>
                        </>
                    )}

                    {user.type === "professor" && (
                        <>
                            <p>
                                Disciplina: <strong>{user.disciplina}</strong>
                            </p>

                            <p>
                                Turma: <strong>{user.turma}</strong>
                            </p>
                        </>
                    )}

                    {user.type === "colaborador" && (
                        <>
                            <p>
                                NIF: <strong>{user.nif}</strong>
                            </p>

                            <p>
                                Setor: <strong>{user.setor}</strong>
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div style={contentCardStyle}>
                <div style={titleAreaStyle}>
                    <div>
                        <h2 style={{ color: "#0f172a" }}>
                            Seleção de {categoryName}
                        </h2>

                        <p>
                            Escolha abaixo os equipamentos numerados que serão emprestados.
                        </p>

                        <p>
                            Disponíveis: <strong>{availableItems.length}</strong>
                        </p>

                        <p>
                            Selecionados: <strong>{selectedItems.length}</strong>
                        </p>
                    </div>

                    <button
                        onClick={handleOpenConfirmModal}
                        disabled={selectedItems.length === 0}
                        style={{
                            ...confirmLoanButtonStyle,
                            opacity: selectedItems.length === 0 ? 0.5 : 1,
                            cursor: selectedItems.length === 0 ? "not-allowed" : "pointer"
                        }}
                    >
                        Confirmar Empréstimo
                    </button>
                </div>

                <div style={actionButtonsAreaStyle}>
                    <button onClick={handleSelectAll} style={actionButtonStyle}>
                        Selecionar todos disponíveis
                    </button>

                    {selectedItems.length > 0 && (
                        <button onClick={handleClearSelection} style={secondaryButtonStyle}>
                            Desselecionar todos
                        </button>
                    )}

                    <button
                        onClick={() => handleSelectQuantity(8)}
                        disabled={selectedItems.length === 8 || availableItems.length < 8}
                        style={{
                            ...actionButtonStyle,
                            opacity: selectedItems.length === 8 || availableItems.length < 8 ? 0.5 : 1,
                            cursor:
                                selectedItems.length === 8 || availableItems.length < 8
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >
                        Selecionar 8 unidades
                    </button>

                    <button
                        onClick={() => handleSelectQuantity(16)}
                        disabled={selectedItems.length === 16 || availableItems.length < 16}
                        style={{
                            ...actionButtonStyle,
                            opacity: selectedItems.length === 16 || availableItems.length < 16 ? 0.5 : 1,
                            cursor:
                                selectedItems.length === 16 || availableItems.length < 16
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >
                        Selecionar 16 unidades
                    </button>
                </div>

                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Selecionar</th>
                            <th style={thStyle}>Número</th>
                            <th style={thStyle}>Equipamento</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Emprestado para</th>
                        </tr>
                    </thead>

                    <tbody>
                        {visibleEquipmentList.map((item) => {
                            const isAvailable = isAvailableStatus(item.status);
                            const isSelected = selectedItems.includes(item.id);

                            return (
                                <tr
                                    key={item.id}
                                    style={{
                                        background: isSelected ? "#dbeafe" : "#fff",
                                        opacity: isAvailable ? 1 : 0.6
                                    }}
                                >
                                    <td style={tdStyle}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={!isAvailable}
                                            onChange={() => handleToggleItem(item.id)}
                                        />
                                    </td>

                                    <td style={tdStyle}>{String(item.id).padStart(2, "0")}</td>

                                    <td style={tdStyle}>{item.name}</td>

                                    <td style={tdStyle}>
                                        <span style={availableStatusStyle}>Livre</span>
                                    </td>

                                    <td style={tdStyle}>
                                        {item.loanedTo ? item.loanedTo : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showConfirmModal && (
                <div style={overlayStyle} onMouseDown={handleCloseConfirmModal}>
                    <div
                        style={modalStyle}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <h2>Confirmar Empréstimo</h2>

                        <p>
                            Confira os dados antes de finalizar o empréstimo.
                        </p>

                        <div style={summaryBoxStyle}>
                            <h3>Solicitante</h3>

                            <p>
                                Nome: <strong>{user.nome}</strong>
                            </p>

                            <p>
                                Tipo: <strong>{getUserTypeLabel(user.type)}</strong>
                            </p>

                            <p>
                                E-mail: <strong>{user.email}</strong>
                            </p>

                            <p>
                                Atividade: <strong>{user.atividade}</strong>
                            </p>

                            <p>
                                Data e hora da retirada:{" "}
                                <strong>{formatDateTime(new Date())}</strong>
                            </p>
                        </div>

                        <div style={summaryBoxStyle}>
                            <h3>Equipamentos selecionados</h3>

                            <p>
                                Quantidade: <strong>{selectedItems.length}</strong>
                            </p>

                            <ul>
                                {selectedEquipmentObjects.map((item) => (
                                    <li key={item.id}>{item.name}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={buttonAreaStyle}>
                            <button
                                type="button"
                                onClick={handleCloseConfirmModal}
                                style={cancelButtonStyle}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmLoan}
                                style={confirmButtonStyle}
                            >
                                Finalizar Empréstimo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const backButtonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#374151",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "20px"
};

const userHeaderStyle = {
    background: "#dbeafe",
    border: "2px solid #2563eb",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "25px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap"
};

const smallLabelStyle = {
    textTransform: "uppercase",
    color: "#1d4ed8",
    fontWeight: "bold",
    letterSpacing: "0.08em",
    margin: 0
};

const infoTextStyle = {
    fontSize: "18px",
    margin: "8px 0"
};

const secondaryInfoStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    minWidth: "260px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const logoStyle = {
    display: "block",
    width: "160px",
    maxWidth: "100%",
    height: "auto",
    margin: "4px auto 16px"
};

const contentCardStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
};

const titleAreaStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap"
};

const actionButtonsAreaStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
    marginBottom: "20px"
};

const actionButtonStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
};

const secondaryButtonStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#6b7280",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
};

const confirmLoanButtonStyle = {
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "bold"
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
};

const thStyle = {
    borderBottom: "2px solid #d1d5db",
    padding: "12px",
    textAlign: "left",
    background: "#f9fafb"
};

const tdStyle = {
    borderBottom: "1px solid #e5e7eb",
    padding: "12px"
};

const availableStatusStyle = {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "bold"
};

const occupiedStatusStyle = {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "bold"
};

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

const summaryBoxStyle = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px"
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
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
};

export default EquipmentSelectionPage;