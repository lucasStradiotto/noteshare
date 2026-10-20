import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import EquipmentSelectionPage from "./pages/EquipmentSelectionPage";
import EquipmentStatusPage from "./pages/EquipmentStatusPage";
import EquipmentRegistrationPage from "./pages/EquipmentRegistrationPage";
import LoanHistoryPage from "./pages/LoanHistoryPage";
import { equipment } from "./data/equipment";

const STORAGE_KEY = "lab-loan-system-equipment-data";
const USERS_STORAGE_KEY = "lab-loan-system-users";
const TEST_DATA_RESET_KEY = "lab-loan-system-test-data-reset-v1";
const AVAILABILITY_RESET_KEY = "lab-loan-system-availability-reset-v1";
const LOANED_TO_CLEAR_KEY = "lab-loan-system-loaned-to-clear-v1";
const USER_TYPES = ["aluno", "professor", "colaborador"];
const DEFAULT_CATEGORY_METADATA = {
  notebooks: { name: "Notebooks", icon: "💻" },
  celulares: { name: "Celulares", icon: "📱" },
  cameras: { name: "Câmeras", icon: "📷" },
  caixasDeSom: { name: "Caixas de Som", icon: "🔊" },
  fonesDeOuvido: { name: "Fones de Ouvido", icon: "🎧" },
  kitsLegoSpike: { name: "Kits LEGO SPIKE PRIME", icon: "🤖" }
};

const REQUIRED_CATEGORIES = [
  "notebooks",
  "celulares",
  "cameras",
  "caixasDeSom",
  "fonesDeOuvido",
  "kitsLegoSpike"
];

function App() {
  const [usersByType, setUsersByType] = useState(() => {
    resetDataForTest();
    return loadUsers();
  });
  const [equipmentData, setEquipmentData] = useState(() => {
    const savedEquipmentData = localStorage.getItem(STORAGE_KEY);

    if (savedEquipmentData) {
      try {
        const parsedEquipmentData = JSON.parse(savedEquipmentData);

        if (localStorage.getItem(AVAILABILITY_RESET_KEY) !== "true") {
          const resetEquipmentData = { ...parsedEquipmentData };

          REQUIRED_CATEGORIES.forEach((category) => {
            if (Array.isArray(resetEquipmentData[category])) {
              resetEquipmentData[category] = resetEquipmentData[category].map(
                (item) => ({ ...item, status: "available" })
              );
            }
          });

          const equipmentWithoutLoanedTo = clearLoanedTo(resetEquipmentData);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(equipmentWithoutLoanedTo)
          );
          localStorage.setItem(AVAILABILITY_RESET_KEY, "true");
          localStorage.setItem(LOANED_TO_CLEAR_KEY, "true");
          return equipmentWithoutLoanedTo;
        }

        if (localStorage.getItem(LOANED_TO_CLEAR_KEY) !== "true") {
          const equipmentWithoutLoanedTo = clearLoanedTo(parsedEquipmentData);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(equipmentWithoutLoanedTo)
          );
          localStorage.setItem(LOANED_TO_CLEAR_KEY, "true");
          return equipmentWithoutLoanedTo;
        }

        return parsedEquipmentData;
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error);
        console.warn("Usando dados padrão do equipment.js.");
        return equipment;
      }
    }

    localStorage.setItem(LOANED_TO_CLEAR_KEY, "true");
    return equipment;
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmedUser, setConfirmedUser] = useState(null);
  const [statusCategory, setStatusCategory] = useState(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isRegisteringEquipment, setIsRegisteringEquipment] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equipmentData));
    } catch (error) {
      console.error("Erro ao salvar dados no localStorage:", error);
    }
  }, [equipmentData]);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersByType));
    } catch (error) {
      console.error("Erro ao salvar usuários no localStorage:", error);
    }
  }, [usersByType]);

  const validateEquipmentData = (data) => {
    if (!data || typeof data !== "object") {
      return false;
    }

    return REQUIRED_CATEGORIES.every((category) => Array.isArray(data[category]));
  };

  const handleExportBackup = () => {
    try {
      const now = new Date();

      const backupData = {
        app: "Sistema de Empréstimo de Equipamentos",
        version: "1.0.0",
        exportedAt: now.toISOString(),
        equipmentData
      };

      const backupContent = JSON.stringify(backupData, null, 2);

      const blob = new Blob([backupContent], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);

      const formattedDate = now
        .toLocaleDateString("pt-BR")
        .replaceAll("/", "-");

      const formattedTime = now
        .toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        })
        .replace(":", "h");

      const fileName = `backup-emprestimos-laboratorio-${formattedDate}-${formattedTime}.json`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar backup:", error);
      alert("Não foi possível exportar o backup.");
    }
  };

  const handleImportBackup = (file) => {
    if (!file) {
      console.warn("Nenhum arquivo de backup selecionado.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileContent = event.target.result;
        const importedBackup = JSON.parse(fileContent);

        const importedEquipmentData =
          importedBackup.equipmentData || importedBackup;

        if (!validateEquipmentData(importedEquipmentData)) {
          console.error("Arquivo de backup inválido:", importedBackup);
          alert(
            "Arquivo de backup inválido. Verifique se este arquivo pertence ao sistema de empréstimos."
          );
          return;
        }

        setEquipmentData(importedEquipmentData);

        alert("Backup importado com sucesso!");
      } catch (error) {
        console.error("Erro ao importar backup:", error);
        alert("Não foi possível importar o backup. Verifique o arquivo selecionado.");
      }
    };

    reader.onerror = () => {
      console.error("Erro ao ler o arquivo de backup.");
      alert("Erro ao ler o arquivo de backup.");
    };

    reader.readAsText(file);
  };

  const handleUserConfirmed = (category, userData) => {
    setSelectedCategory(category);
    setConfirmedUser(userData);
  };

  const handleLoanConfirmed = (userData, category, equipmentItems, loanDate) => {
    const type = userData.type;

    if (!USER_TYPES.includes(type)) {
      console.error("Tipo de usuário inválido ao registrar empréstimo:", type);
      alert("Não foi possível registrar o usuário do empréstimo.");
      return false;
    }

    const normalizedEmail =
      typeof userData.email === "string" ? userData.email.trim().toLowerCase() : "";
    const allowedEmailDomains = {
      aluno: ["@portalsesisp.org.br"],
      professor: ["@portalsesisp.org.br", "@sesisp.org.br"],
      colaborador: ["@sesisp.org.br"]
    };

    if (
      !allowedEmailDomains[type].some((domain) => normalizedEmail.endsWith(domain))
    ) {
      console.warn(
        `Cadastro recusado para usuário do tipo "${type}": domínio de e-mail não permitido.`
      );
      return false;
    }

    const currentUsers = usersByType[type];
    const existingUserIndex = currentUsers.findIndex(
      (user) =>
        typeof user.email === "string" &&
        user.email.trim().toLowerCase() === normalizedEmail
    );
    const existingUser = existingUserIndex >= 0
      ? currentUsers[existingUserIndex]
      : null;
    const userId = existingUser?.id || createUserId(type, currentUsers);
    const existingHistory = Array.isArray(existingUser?.loanHistory)
      ? existingUser.loanHistory
      : [];
    const loanNumber = existingHistory.length + 1;
    const historyEntry = {
      id: `${userId}-EMP-${String(loanNumber).padStart(4, "0")}`,
      category,
      categoryName:
        equipmentData[category]?.[0]?.categoryName ||
        DEFAULT_CATEGORY_METADATA[category]?.name ||
        category,
      categoryIcon:
        equipmentData[category]?.[0]?.categoryIcon ||
        DEFAULT_CATEGORY_METADATA[category]?.icon ||
        "📦",
      quantity: equipmentItems.length,
      withdrawalDate: loanDate,
      returnDate: null,
      status: "active",
      requester: { ...userData },
      equipment: equipmentItems.map(({ id, name }) => ({ id, name }))
    };
    const savedUser = {
      ...existingUser,
      ...userData,
      id: userId,
      loanHistory: [...existingHistory, historyEntry]
    };
    const updatedUsers = [...currentUsers];

    if (existingUserIndex >= 0) {
      updatedUsers[existingUserIndex] = savedUser;
    } else {
      updatedUsers.push(savedUser);
    }

    const updatedUsersByType = {
      ...usersByType,
      [type]: updatedUsers
    };

    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsersByType));
      setUsersByType(updatedUsersByType);
      return true;
    } catch (error) {
      console.error("Erro ao registrar empréstimo do usuário:", error);
      alert("Não foi possível salvar os dados do usuário no navegador.");
      return false;
    }
  };

  const handleEquipmentReturned = (borrower, returnedItems, returnDate) => {
    const type = borrower.type;
    const normalizedEmail = borrower.email?.trim().toLowerCase();

    if (!USER_TYPES.includes(type) || returnedItems.length === 0) {
      console.error("Solicitação de devolução inválida.", {
        type,
        returnedItems
      });
      return false;
    }

    const currentUserIndex = usersByType[type].findIndex((user) =>
      normalizedEmail
        ? user.email?.trim().toLowerCase() === normalizedEmail
        : user.nome === borrower.name
    );

    if (currentUserIndex < 0) {
      console.error("Não foi possível localizar o usuário para a devolução.", borrower);
      alert("Não foi possível localizar o cadastro do solicitante.");
      return false;
    }

    const returnedKeys = new Set(
      returnedItems.map((item) =>
        getEquipmentKey(item.category, item.id, item.loanDate)
      )
    );
    const updatedEquipmentData = { ...equipmentData };
    let equipmentUpdated = false;

    Object.keys(updatedEquipmentData).forEach((category) => {
      const categoryItems = updatedEquipmentData[category];
      if (!Array.isArray(categoryItems)) {
        return;
      }

      updatedEquipmentData[category] = categoryItems.map((item) => {
        const key = getEquipmentKey(category, item.id, item.loanDate);
        const matchesBorrower = normalizedEmail
          ? item.loanedToEmail?.trim().toLowerCase() === normalizedEmail
          : item.loanedTo === borrower.name &&
            (item.loanedByType || "").toLowerCase() === type;

        if (
          !returnedKeys.has(key) ||
          !matchesBorrower ||
          !["occupied", "ocupado", "emprestado"].includes(item.status)
        ) {
          return item;
        }

        equipmentUpdated = true;
        const availableItem = { ...item, status: "available" };
        [
          "loanedTo",
          "loanedByType",
          "loanedToEmail",
          "loanedToTurma",
          "loanedToDisciplina",
          "loanedToSetor",
          "loanedToProfessor",
          "loanedToNif",
          "activity",
          "loanDate"
        ].forEach((field) => delete availableItem[field]);

        return availableItem;
      });
    });

    if (!equipmentUpdated) {
      console.error("Nenhum equipamento emprestado correspondente foi encontrado.", {
        borrower,
        returnedItems
      });
      alert("Os equipamentos selecionados não estão mais emprestados para este solicitante.");
      return false;
    }

    const user = usersByType[type][currentUserIndex];
    const returnedByKey = new Map(
      returnedItems.map((item) => [`${item.category}::${item.id}`, item])
    );
    const loanHistory = (user.loanHistory || []).map((loan) => {
      const matchingItems = (loan.equipment || []).filter((item) => {
        const returnedItem = returnedByKey.get(`${loan.category}::${item.id}`);
        return (
          returnedItem &&
          (!returnedItem.loanDate || returnedItem.loanDate === loan.withdrawalDate)
        );
      });

      if (matchingItems.length === 0) {
        return loan;
      }

      const returnedEquipment = [...(loan.returnedEquipment || [])];
      matchingItems.forEach((item) => {
        const alreadyReturned = returnedEquipment.some(
          (returned) =>
            returned.category === loan.category &&
            String(returned.id) === String(item.id)
        );
        if (!alreadyReturned) {
          returnedEquipment.push({
            ...item,
            category: loan.category,
            returnDate
          });
        }
      });

      const allItemsReturned = (loan.equipment || []).every((item) =>
        returnedEquipment.some(
          (returned) =>
            returned.category === loan.category &&
            String(returned.id) === String(item.id)
        )
      );

      return {
        ...loan,
        returnedEquipment,
        status: allItemsReturned ? "returned" : "partial",
        returnDate: allItemsReturned ? returnDate : null
      };
    });
    const updatedUser = { ...user, loanHistory };
    const updatedUsersByType = { ...usersByType };
    updatedUsersByType[type] = [...usersByType[type]];
    updatedUsersByType[type][currentUserIndex] = updatedUser;

    const previousEquipmentData = localStorage.getItem(STORAGE_KEY);
    const previousUsers = localStorage.getItem(USERS_STORAGE_KEY);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEquipmentData));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsersByType));
      setEquipmentData(updatedEquipmentData);
      setUsersByType(updatedUsersByType);
      return true;
    } catch (error) {
      console.error("Erro ao salvar a devolução:", error);
      try {
        if (previousEquipmentData === null) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, previousEquipmentData);
        }

        if (previousUsers === null) {
          localStorage.removeItem(USERS_STORAGE_KEY);
        } else {
          localStorage.setItem(USERS_STORAGE_KEY, previousUsers);
        }
      } catch (rollbackError) {
        console.error("Erro ao restaurar os dados após falha na devolução:", rollbackError);
      }
      alert("Não foi possível salvar a devolução. Tente novamente.");
      return false;
    }
  };

  const handleBackToDashboard = () => {
    setSelectedCategory(null);
    setConfirmedUser(null);
    setStatusCategory(null);
    setIsViewingHistory(false);
    setIsRegisteringEquipment(false);
  };

  const handleViewHistory = () => {
    setSelectedCategory(null);
    setConfirmedUser(null);
    setStatusCategory(null);
    setIsViewingHistory(true);
  };

  const handleRegisterEquipment = (categories) => {
    const updatedEquipmentData = { ...equipmentData };

    categories.forEach(({ key, name, icon, quantity }) => {
      const existingCategory =
        key !== "outro" && Array.isArray(updatedEquipmentData[key])
          ? [key, updatedEquipmentData[key]]
          : Object.entries(updatedEquipmentData).find(
              ([, items]) =>
                Array.isArray(items) &&
                items[0]?.categoryName?.trim().toLocaleLowerCase("pt-BR") ===
                  name.trim().toLocaleLowerCase("pt-BR")
            );
      let categoryKey = existingCategory?.[0] || key;

      if (!existingCategory && key === "outro") {
        const normalizedName = name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        const baseKey = `custom_${normalizedName || "equipamento"}`;
        categoryKey = baseKey;
        let suffix = 2;

        while (Object.hasOwn(updatedEquipmentData, categoryKey)) {
          categoryKey = `${baseKey}_${suffix}`;
          suffix += 1;
        }
      }

      const existingItems = Array.isArray(updatedEquipmentData[categoryKey])
        ? updatedEquipmentData[categoryKey]
        : [];
      const existingIcon = existingItems[0]?.categoryIcon || icon;
      const firstId = existingItems.reduce(
        (highestId, item) => Math.max(highestId, Number(item.id) || 0),
        0
      ) + 1;

      const newItems = Array.from({ length: quantity }, (_, index) => ({
        id: firstId + index,
        name: `${name} ${String(firstId + index).padStart(2, "0")}`,
        status: "available",
        categoryName: name,
        categoryIcon: existingIcon
      }));

      updatedEquipmentData[categoryKey] = [...existingItems, ...newItems];
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEquipmentData));
      setEquipmentData(updatedEquipmentData);
      alert("Equipamentos cadastrados com sucesso e disponíveis para empréstimo.");
      return true;
    } catch (error) {
      console.error("Erro ao cadastrar equipamentos:", error);
      alert("Não foi possível salvar os equipamentos no navegador.");
      return false;
    }
  };

  const handleRemoveEquipment = (categoriesToRemove) => {
    if (categoriesToRemove.length === 0) {
      return false;
    }

    const unavailableForRemoval = categoriesToRemove.filter((category) =>
      (equipmentData[category] || []).some((item) =>
        ["occupied", "ocupado", "emprestado"].includes(
          (item?.status || "").toLowerCase()
        )
      )
    );

    if (unavailableForRemoval.length > 0) {
      alert("Não é possível excluir tipos de equipamento que possuem itens emprestados.");
      return false;
    }

    const updatedEquipmentData = { ...equipmentData };
    categoriesToRemove.forEach((category) => {
      delete updatedEquipmentData[category];
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEquipmentData));
      setEquipmentData(updatedEquipmentData);
      alert("Os equipamentos selecionados foram excluídos. O histórico foi mantido.");
      return true;
    } catch (error) {
      console.error("Erro ao remover equipamentos:", error);
      alert("Não foi possível excluir os equipamentos do navegador.");
      return false;
    }
  };

  return (
    <>
      {isRegisteringEquipment ? (
        <EquipmentRegistrationPage
          equipmentData={equipmentData}
          onBack={handleBackToDashboard}
          onRegister={handleRegisterEquipment}
          onRemove={handleRemoveEquipment}
        />
      ) : isViewingHistory ? (
        <LoanHistoryPage
          usersByType={usersByType}
          onBack={handleBackToDashboard}
        />
      ) : statusCategory ? (
        <EquipmentStatusPage
          category={statusCategory}
          equipmentData={equipmentData}
          setEquipmentData={setEquipmentData}
          onBack={handleBackToDashboard}
        />
      ) : selectedCategory && confirmedUser ? (
        <EquipmentSelectionPage
          category={selectedCategory}
          user={confirmedUser}
          equipmentData={equipmentData}
          setEquipmentData={setEquipmentData}
          onLoanConfirmed={handleLoanConfirmed}
          onBack={handleBackToDashboard}
        />
      ) : (
        <Dashboard
          equipmentData={equipmentData}
          onViewHistory={handleViewHistory}
          onRegisterEquipment={() => {
            setSelectedCategory(null);
            setConfirmedUser(null);
            setStatusCategory(null);
            setIsRegisteringEquipment(true);
          }}
          onEquipmentReturned={handleEquipmentReturned}
          onUserConfirmed={handleUserConfirmed}
          onViewStatus={setStatusCategory}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />
      )}
      <InstallAppButton />
    </>
  );
}

function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      window.alert(
        "Para instalar, abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”."
      );
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } catch (error) {
      console.error("Não foi possível iniciar a instalação do app:", error);
      window.alert("Não foi possível instalar o app. Tente novamente pelo menu do navegador.");
    }
  };

  if (isInstalled || window.desktopApp?.isDesktopApp) {
    return null;
  }

  return (
    <button
      type="button"
      className="install-app-button"
      onClick={handleInstall}
    >
      {installPrompt ? "Instalar app" : "Como instalar"}
    </button>
  );
}

function getEquipmentKey(category, id, loanDate) {
  return `${category}::${id}::${loanDate || ""}`;
}

function resetDataForTest() {
  if (localStorage.getItem(TEST_DATA_RESET_KEY) === "true") {
    return;
  }

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const existingEquipment = savedData ? JSON.parse(savedData) : equipment;
    const resetEquipment = { ...existingEquipment };

    REQUIRED_CATEGORIES.forEach((category) => {
      const items = Array.isArray(resetEquipment[category])
        ? resetEquipment[category]
        : equipment[category];

      resetEquipment[category] = items.map((item) => {
        if (!item || typeof item !== "object") {
          return item;
        }

        const availableItem = { ...item, status: "available" };
        [
          "loanedTo",
          "loanedByType",
          "loanedToEmail",
          "loanedToTurma",
          "loanedToDisciplina",
          "loanedToSetor",
          "loanedToProfessor",
          "loanedToNif",
          "activity",
          "loanDate"
        ].forEach((field) => delete availableItem[field]);

        return availableItem;
      });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetEquipment));
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(createEmptyUserRegistry())
    );
    localStorage.setItem(AVAILABILITY_RESET_KEY, "true");
    localStorage.setItem(LOANED_TO_CLEAR_KEY, "true");
    localStorage.setItem(TEST_DATA_RESET_KEY, "true");

  } catch (error) {
    console.error("Erro ao limpar os dados de empréstimos para os testes:", error);
    throw error;
  }
}

function createEmptyUserRegistry() {
  return {
    aluno: [],
    professor: [],
    colaborador: []
  };
}

function loadUsers() {
  try {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    if (!savedUsers) {
      return createEmptyUserRegistry();
    }

    const parsedUsers = JSON.parse(savedUsers);
    return USER_TYPES.reduce((registry, type) => {
      registry[type] = Array.isArray(parsedUsers[type])
        ? parsedUsers[type]
            .filter((user) => user && typeof user === "object")
            .map((user) => {
              const priorHistory = Array.isArray(user.loanHistory)
                ? user.loanHistory
                : Array.isArray(user.loans)
                  ? user.loans
                  : [];

              return {
                ...user,
                loanHistory: priorHistory.map((entry) => ({
                  ...entry,
                  quantity:
                    typeof entry.quantity === "number"
                      ? entry.quantity
                      : Array.isArray(entry.equipment)
                        ? entry.equipment.length
                        : 0,
                  withdrawalDate: entry.withdrawalDate || entry.date || null,
                  returnDate: entry.returnDate || null,
                  requester: entry.requester || {
                    type: user.type,
                    nome: user.nome,
                    email: user.email,
                    ...getUserAdditionalData(user)
                  },
                  equipment: Array.isArray(entry.equipment)
                    ? entry.equipment
                    : []
                }))
              };
            })
        : [];
      return registry;
    }, createEmptyUserRegistry());
  } catch (error) {
    console.error("Erro ao carregar usuários salvos:", error);
    return createEmptyUserRegistry();
  }
}

function getUserAdditionalData(user) {
  return Object.fromEntries(
    Object.entries(user).filter(
      ([key]) => !["id", "loans", "loanHistory"].includes(key)
    )
  );
}

function createUserId(type, users) {
  const prefixes = {
    aluno: "ALU",
    professor: "PRO",
    colaborador: "COL"
  };
  const nextNumber = users.reduce((highestId, user) => {
    const idNumber =
      typeof user.id === "string"
        ? Number(user.id.match(/\d+$/)?.[0] || 0)
        : 0;
    return Math.max(highestId, idNumber);
  }, 0) + 1;

  return `${prefixes[type]}-${String(nextNumber).padStart(4, "0")}`;
}

function clearLoanedTo(data) {
  const cleanedData = { ...data };

  REQUIRED_CATEGORIES.forEach((category) => {
    if (Array.isArray(cleanedData[category])) {
      cleanedData[category] = cleanedData[category].map((item) => {
        if (!item || typeof item !== "object") {
          return item;
        }

        const itemWithoutLoanedTo = { ...item };
        delete itemWithoutLoanedTo.loanedTo;
        return itemWithoutLoanedTo;
      });
    }
  });

  return cleanedData;
}

export default App;