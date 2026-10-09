export const equipment = {
  notebooks: Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Notebook ${String(i + 1).padStart(2, "0")}`,
    status: "available"
  })),

  celulares: Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    name: `Celular ${String(i + 1).padStart(2, "0")}`,
    status: "available"
  })),

  cameras: Array.from({ length: 2 }, (_, i) => ({
    id: i + 1,
    name: `Câmera ${String(i + 1).padStart(2, "0")}`,
    status: "available"
  })),

  caixasDeSom: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Caixa de Som ${String(i + 1).padStart(2, "0")}`,
    status: "available"
  })),

  fonesDeOuvido: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Fone de Ouvido ${String(i + 1).padStart(2, "0")}`,
    status: "available"
  })),

  kitsLegoSpike: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Kit LEGO SPIKE PRIME ${String(i + 1).padStart(2, "0")}`,
    status: "available"
  }))
};