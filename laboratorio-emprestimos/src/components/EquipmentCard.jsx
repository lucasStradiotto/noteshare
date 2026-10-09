function EquipmentCard({ title, quantity, icon, onClick, onStatusClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        margin: "10px",
        width: "250px",
        cursor: "pointer",
        background: "#fff",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}
    >
      <h1>{icon}</h1>
      <h2 style={{ color: "#0f172a" }}>{title}</h2>
      <p>{quantity} disponíveis</p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onStatusClick();
        }}
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: "#374151",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Ver status
      </button>
    </div>
  );
}

export default EquipmentCard;