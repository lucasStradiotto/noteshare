import { useState } from "react";

function EquipmentStatusPage({ category, equipmentData, setEquipmentData, onBack }) {
    const categoryNames = {
        notebooks: "Notebooks",
        celulares: "Celulares",
        cameras: "Câmeras",
        caixasDeSom: "Caixas de Som",
        fonesDeOuvido: "Fones de Ouvido",
        kitsLegoSpike: "Kits LEGO SPIKE PRIME"
    };

    const selectedEquipmentList = equipmentData[category] || [];
    const categoryName =
        selectedEquipmentList[0]?.categoryName ||
        categoryNames[category] ||
        category;

    const [maintenanceItem, setMaintenanceItem] = useState(null);

    const isAvailableStatus = (status) => {
        return (
            status === "available" ||
            status === "livre" ||
            status === "disponivel"
        );
    };

    const isOccupiedStatus = (status) => {
        return (
            status === "occupied" ||
            status === "ocupado" ||
            status === "emprestado"
        );
    };

    const isMaintenanceStatus = (status) => {
        return (
            status === "maintenance" ||
            status === "inativo" ||
            status === "manutencao"
        );
    };

    const getStatusLabel = (status) => {
        if (isAvailableStatus(status)) return "Livre";
        if (isOccupiedStatus(status)) return "Ocupado";
        if (isMaintenanceStatus(status)) return "Manutenção";
        return "Indefinido";
    };

    const getStatusStyle = (status) => {
        if (isAvailableStatus(status)) {
            return {
                background: "#dcfce7",
                color: "#166534",
                border: "2px solid #22c55e"
            };
        }

        if (isOccupiedStatus(status)) {
            return {
                background: "#fee2e2",
                color: "#991b1b",
                border: "2px solid #ef4444"
            };
        }

        if (isMaintenanceStatus(status)) {
            return {
                background: "#fef3c7",
                color: "#92400e",
                border: "2px solid #f59e0b"
            };
        }

        return {
            background: "#e5e7eb",
            color: "#374151",
            border: "2px solid #9ca3af"
        };
    };

    const availableCount = selectedEquipmentList.filter((item) =>
        isAvailableStatus(item.status)
    ).length;

    const occupiedCount = selectedEquipmentList.filter((item) =>
        isOccupiedStatus(item.status)
    ).length;

    const maintenanceCount = selectedEquipmentList.filter((item) =>
        isMaintenanceStatus(item.status)
    ).length;

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";

        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date(dateString));
    };

    const handleOpenMaintenanceModal = (item) => {
        setMaintenanceItem(item);
    };

    const handleCloseMaintenanceModal = () => {
        setMaintenanceItem(null);
    };

    const handleConfirmMaintenance = () => {
        if (!maintenanceItem) {
            console.error("Nenhum item foi selecionado para manutenção.");
            return;
        }

        const now = new Date();

        const updatedCategoryItems = selectedEquipmentList.map((item) => {
            if (item.id === maintenanceItem.id) {
                return {
                    ...item,
                    status: "maintenance",
                    maintenanceStatus: "movido para manutenção",
                    movedToMaintenanceAt: now.toISOString(),
                    movedToMaintenanceFromStatus: item.status,
                    maintenanceObservation:
                        item.status === "occupied" ||
                            item.status === "ocupado" ||
                            item.status === "emprestado"
                            ? "Item estava emprestado e foi movido para manutenção."
                            : "Item foi movido para manutenção."
                };
            }

            return item;
        });

        setEquipmentData((previousEquipmentData) => {
            return {
                ...previousEquipmentData,
                [category]: updatedCategoryItems
            };
        });

        handleCloseMaintenanceModal();
    };

    const handleRemoveFromMaintenance = (item) => {
        const shouldRemove = window.confirm(
            `Deseja retirar "${item.name}" da manutenção e deixar o equipamento livre?`
        );

        if (!shouldRemove) {
            return;
        }

        const updatedCategoryItems = selectedEquipmentList.map((categoryItem) => {
            if (categoryItem.id !== item.id) {
                return categoryItem;
            }

            const availableItem = { ...categoryItem, status: "available" };
            [
                "maintenanceStatus",
                "movedToMaintenanceAt",
                "movedToMaintenanceFromStatus",
                "maintenanceObservation"
            ].forEach((field) => delete availableItem[field]);

            return availableItem;
        });

        setEquipmentData((previousEquipmentData) => ({
            ...previousEquipmentData,
            [category]: updatedCategoryItems
        }));
    };

    return (
        <div className="equipment-status-page" style={pageStyle}>
            <button onClick={onBack} style={backButtonStyle}>
                Voltar para o início
            </button>

            <div style={headerStyle}>
                <div>
                    <p style={smallLabelStyle}>Visualização dos equipamentos</p>

                    <h1 style={{ margin: "6px 0", color: "#0f172a" }}>
                        Status de {categoryName}
                    </h1>

                    <p style={{ margin: 0 }}>
                        Acompanhe abaixo quais equipamentos estão livres, ocupados ou em manutenção.
                    </p>
                </div>
            </div>

            <div style={summaryAreaStyle}>
                <div style={summaryCardStyle}>
                    <strong>{selectedEquipmentList.length}</strong>
                    <span>Total</span>
                </div>

                <div style={summaryCardStyle}>
                    <strong style={{ color: "#166534" }}>{availableCount}</strong>
                    <span>Livres</span>
                </div>

                <div style={summaryCardStyle}>
                    <strong style={{ color: "#991b1b" }}>{occupiedCount}</strong>
                    <span>Ocupados</span>
                </div>

                <div style={summaryCardStyle}>
                    <strong style={{ color: "#92400e" }}>{maintenanceCount}</strong>
                    <span>Manutenção</span>
                </div>
            </div>

            <div style={legendStyle}>
                <span style={legendItemStyle}>
                    <span style={{ ...legendDotStyle, background: "#22c55e" }}></span>
                    Livre
                </span>

                <span style={legendItemStyle}>
                    <span style={{ ...legendDotStyle, background: "#ef4444" }}></span>
                    Ocupado
                </span>

                <span style={legendItemStyle}>
                    <span style={{ ...legendDotStyle, background: "#f59e0b" }}></span>
                    Manutenção
                </span>
            </div>

            <div style={gridStyle}>
                {selectedEquipmentList.map((item) => {
                    const statusStyle = getStatusStyle(item.status);

                    return (
                        <div
                            key={item.id}
                            style={{
                                ...equipmentBoxStyle,
                                ...statusStyle
                            }}
                        >
                            <div style={equipmentNumberStyle}>
                                {String(item.id).padStart(2, "0")}
                            </div>

                            <h3 style={{ margin: "8px 0" }}>{item.name}</h3>

                            <p style={statusTextStyle}>
                                {getStatusLabel(item.status)}
                            </p>

                            {isOccupiedStatus(item.status) && (
                                <div style={detailsBoxStyle}>
                                    <p>
                                        Emprestado para: <strong>{item.loanedTo || "-"}</strong>
                                    </p>

                                    <p>
                                        Atividade: <strong>{item.activity || "-"}</strong>
                                    </p>

                                    <p>
                                        Retirada: <strong>{formatDateTime(item.loanDate)}</strong>
                                    </p>
                                </div>
                            )}

                            {isMaintenanceStatus(item.status) && (
                                <>
                                    <div style={detailsBoxStyle}>
                                        <p>
                                            Item indisponível para empréstimo.
                                        </p>

                                        <p>
                                            Situação: <strong>{item.maintenanceStatus || "em manutenção"}</strong>
                                        </p>

                                        <p>
                                            Movido em: <strong>{formatDateTime(item.movedToMaintenanceAt)}</strong>
                                        </p>

                                        {item.maintenanceObservation && (
                                            <p>
                                                Observação: <strong>{item.maintenanceObservation}</strong>
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFromMaintenance(item)}
                                        style={removeMaintenanceButtonStyle}
                                    >
                                        Retirar da manutenção
                                    </button>
                                </>
                            )}
                            {!isMaintenanceStatus(item.status) && (
                                <button
                                    type="button"
                                    onClick={() => handleOpenMaintenanceModal(item)}
                                    style={maintenanceButtonStyle}
                                >
                                    Enviar para manutenção
                                </button>
                            )}
                            {maintenanceItem && (
                                <div style={overlayStyle} onMouseDown={handleCloseMaintenanceModal}>
                                    <div
                                        style={modalStyle}
                                        onMouseDown={(event) => event.stopPropagation()}
                                    >
                                        <h2>Enviar item para manutenção</h2>

                                        <p>
                                            Você está prestes a mover o item abaixo para manutenção:
                                        </p>

                                        <div style={summaryBoxStyle}>
                                            <p>
                                                Item: <strong>{maintenanceItem.name}</strong>
                                            </p>

                                            <p>
                                                Número: <strong>{String(maintenanceItem.id).padStart(2, "0")}</strong>
                                            </p>

                                            <p>
                                                Status atual: <strong>{getStatusLabel(maintenanceItem.status)}</strong>
                                            </p>

                                            {isOccupiedStatus(maintenanceItem.status) && (
                                                <>
                                                    <p>
                                                        Emprestado para: <strong>{maintenanceItem.loanedTo || "-"}</strong>
                                                    </p>

                                                    <p>
                                                        Atividade: <strong>{maintenanceItem.activity || "-"}</strong>
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div style={buttonAreaStyle}>
                                            <button
                                                type="button"
                                                onClick={handleCloseMaintenanceModal}
                                                style={cancelButtonStyle}
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleConfirmMaintenance}
                                                style={confirmMaintenanceButtonStyle}
                                            >
                                                Confirmar manutenção
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const pageStyle = {
    padding: "30px",
    background: "#f3f4f6",
    minHeight: "100vh"
};

const backButtonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#374151",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "20px"
};

const headerStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const smallLabelStyle = {
    textTransform: "uppercase",
    color: "#2563eb",
    fontWeight: "bold",
    letterSpacing: "0.08em",
    margin: 0
};

const summaryAreaStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
};

const summaryCardStyle = {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "center",
    fontSize: "18px"
};

const legendStyle = {
    background: "#fff",
    borderRadius: "14px",
    padding: "14px 18px",
    marginBottom: "20px",
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold"
};

const legendDotStyle = {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    display: "inline-block"
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px"
};

const equipmentBoxStyle = {
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
};

const equipmentNumberStyle = {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "18px"
};

const statusTextStyle = {
    fontWeight: "bold",
    fontSize: "18px",
    margin: "6px 0"
};

const detailsBoxStyle = {
    background: "rgba(255,255,255,0.65)",
    borderRadius: "10px",
    padding: "10px",
    marginTop: "12px",
    fontSize: "14px"
};

const maintenanceButtonStyle = {
    width: "100%",
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
};

const removeMaintenanceButtonStyle = {
    ...maintenanceButtonStyle,
    background: "#16a34a"
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
    maxWidth: "560px",
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

const confirmMaintenanceButtonStyle = {
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
};

export default EquipmentStatusPage;