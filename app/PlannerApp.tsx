"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CreditCard,
  Download,
  Edit3,
  FileJson,
  Gauge,
  Goal as GoalIcon,
  Landmark,
  LayoutDashboard,
  Menu,
  PiggyBank,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  LogOut,
  UserRound,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "./components/BrandMark";
import { EntryModal, type FormValues, type ModalState } from "./components/EntryModal";
import { ProgressBar } from "./components/ProgressBar";
import { createBackup, parseBackup } from "./lib/backup";
import {
  accountBalance,
  budgetProgress,
  categoryTotals,
  comparisonPercent,
  currentMonth,
  formatBRL,
  formatDate,
  goalProgress,
  parseMoney,
  previousMonth,
  summarizeMonth,
  totalBalance,
  transactionsInMonth,
} from "./lib/calculations";
import {
  clearPlannerData,
  putRecord,
  readPlannerState,
  removeRecord,
  replacePlannerState,
} from "./lib/plannerGateway";
import type { AppUserProfile } from "./lib/profile";
import {
  emptyState,
  type Account,
  type BackupData,
  type Budget,
  type Category,
  type CreditCard as CreditCardRecord,
  type Goal,
  type NavKey,
  type PlannerState,
  type Transaction,
} from "./lib/types";

interface NavItem {
  id: NavKey;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { id: "transactions", label: "Transações", icon: ReceiptText },
  { id: "accounts", label: "Contas e cartões", icon: WalletCards },
  { id: "budgets", label: "Orçamentos", icon: Gauge },
  { id: "goals", label: "Metas", icon: GoalIcon },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
];

const accountLabels: Record<Account["type"], string> = {
  checking: "Conta-corrente",
  digital: "Conta digital",
  savings: "Poupança",
  wallet: "Carteira",
  cash: "Dinheiro",
  investment: "Investimentos",
  other: "Outros",
};

const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
};

const escapeCsv = (value: string | number): string =>
  '"' + String(value).replace(/"/g, '""') + '"';

const monthLabel = (month: string): string => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
};

const makeId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);

const sortTransactions = (items: Transaction[]): Transaction[] =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

interface PlannerAppProps {
  profile: AppUserProfile;
  online: boolean;
  onSignOut: () => Promise<void>;
  onReplayTour: () => void;
  onDeleteAccount: () => Promise<void>;
  initialNav?: NavKey;
}

export default function PlannerApp({
  profile,
  online,
  onSignOut,
  onReplayTour,
  onDeleteAccount,
  initialNav = "dashboard",
}: PlannerAppProps) {
  const [state, setState] = useState<PlannerState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeNav, setActiveNav] = useState<NavKey>(initialNav);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deleteIntent, setDeleteIntent] = useState<{
    table: "accounts" | "cards" | "categories" | "transactions" | "budgets" | "goals";
    id: string;
    label: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [reportMonth, setReportMonth] = useState(currentMonth());
  const [reportCategory, setReportCategory] = useState("");
  const [reportAccount, setReportAccount] = useState("");
  const [reportCard, setReportCard] = useState("");
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [pendingCsv, setPendingCsv] = useState<Transaction[]>([]);

  const refresh = useCallback(async () => {
    try {
      setLoadError("");
      setState(await readPlannerState());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível acessar os dados locais.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refresh();
    }, 0);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register(basePath + "/sw.js").catch(() => undefined);
    return () => window.clearTimeout(initialLoad);
  }, [refresh]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const requireOnline = (): boolean => {
    if (online) return true;
    setNotice(
      "Edições ficam desativadas offline para evitar conflitos. Reconecte e tente novamente.",
    );
    return false;
  };

  const summary = useMemo(
    () => summarizeMonth(state.transactions, month),
    [state.transactions, month],
  );
  const previousSummary = useMemo(
    () => summarizeMonth(state.transactions, previousMonth(month)),
    [state.transactions, month],
  );
  const balance = useMemo(
    () => totalBalance(state.accounts, state.transactions),
    [state.accounts, state.transactions],
  );
  const expensesByCategory = useMemo(
    () => categoryTotals(state.transactions, state.categories, month),
    [state.transactions, state.categories, month],
  );
  const selectedMonthTransactions = useMemo(
    () => transactionsInMonth(state.transactions, month),
    [state.transactions, month],
  );
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return sortTransactions(state.transactions).filter((item) => {
      const matchesSearch =
        !query ||
        item.description.toLocaleLowerCase("pt-BR").includes(query) ||
        item.notes?.toLocaleLowerCase("pt-BR").includes(query);
      const matchesType =
        transactionFilter === "all" || item.type === transactionFilter;
      return matchesSearch && matchesType;
    });
  }, [search, state.transactions, transactionFilter]);
  const upcoming = useMemo(
    () =>
      sortTransactions(
        state.transactions.filter(
          (item) => item.status === "pending" || item.recurrence !== "none",
        ),
      ).slice(0, 4),
    [state.transactions],
  );

  const saveModal = async (values: FormValues) => {
    if (!requireOnline()) return;
    if (!modal) return;
    const now = new Date().toISOString();
    const base = {
      id: modal.item?.id ?? makeId(),
      createdAt: modal.item?.createdAt ?? now,
      updatedAt: now,
    };
    if (modal.kind === "transaction") {
      const record: Transaction = {
        ...base,
        type: values.type as Transaction["type"],
        description: values.description.trim(),
        amountCents: parseMoney(values.amount),
        date: values.date,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId || undefined,
        destinationAccountId: values.destinationAccountId || undefined,
        creditCardId: values.creditCardId || undefined,
        paymentMethod: values.creditCardId ? "Crédito" : "Conta",
        notes: values.notes.trim() || undefined,
        tags: [],
        recurrence: values.recurrence as Transaction["recurrence"],
        status: values.status as Transaction["status"],
        demo: false,
      };
      await putRecord("transactions", record);
    }
    if (modal.kind === "account") {
      const previous = modal.item as Account | undefined;
      const record: Account = {
        ...base,
        name: values.name.trim(),
        type: values.type as Account["type"],
        institution: values.institution.trim() || undefined,
        initialBalanceCents: parseMoney(values.initialBalance),
        color: values.color,
        archived: previous?.archived ?? false,
      };
      await putRecord("accounts", record);
    }
    if (modal.kind === "card") {
      const previous = modal.item as CreditCardRecord | undefined;
      const record: CreditCardRecord = {
        ...base,
        name: values.name.trim(),
        limitCents: parseMoney(values.limit),
        closingDay: Number(values.closingDay),
        dueDay: Number(values.dueDay),
        paymentAccountId: values.accountId || undefined,
        color: values.color,
        archived: previous?.archived ?? false,
      };
      await putRecord("cards", record);
    }
    if (modal.kind === "budget") {
      const record: Budget = {
        ...base,
        categoryId: values.categoryId,
        month: values.month,
        limitCents: parseMoney(values.limit),
      };
      await putRecord("budgets", record);
    }
    if (modal.kind === "goal") {
      const record: Goal = {
        ...base,
        name: values.name.trim(),
        targetCents: parseMoney(values.target),
        currentCents: parseMoney(values.current),
        targetDate: values.targetDate || undefined,
        accountId: values.accountId || undefined,
        color: values.color,
        icon: "meta",
      };
      await putRecord("goals", record);
    }
    if (modal.kind === "category") {
      const previous = modal.item as Category | undefined;
      const record: Category = {
        ...base,
        name: values.name.trim(),
        kind: values.kind as Category["kind"],
        color: values.color,
        icon: previous?.icon ?? "categoria",
        archived: previous?.archived ?? false,
      };
      await putRecord("categories", record);
    }
    setModal(null);
    await refresh();
    setNotice("Alteração salva no seu navegador.");
  };

  const confirmDelete = async () => {
    if (!requireOnline()) return;
    if (!deleteIntent) return;
    await removeRecord(deleteIntent.table, deleteIntent.id);
    setDeleteIntent(null);
    await refresh();
    setNotice("Registro excluído.");
  };

  const toggleArchive = async (
    table: "accounts" | "cards" | "categories",
    record: Account | CreditCardRecord | Category,
  ) => {
    if (!requireOnline()) return;
    await putRecord(table, {
      ...record,
      archived: !record.archived,
      updatedAt: new Date().toISOString(),
    });
    await refresh();
  };

  const duplicateTransaction = async (record: Transaction) => {
    if (!requireOnline()) return;
    await putRecord("transactions", {
      ...record,
      id: makeId(),
      description: record.description + " (cópia)",
      demo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await refresh();
    setNotice("Transação duplicada.");
  };

  const exportJson = () => {
    downloadFile(
      JSON.stringify(createBackup(state), null, 2),
      "colmeia-backup-" + new Date().toISOString().slice(0, 10) + ".json",
      "application/json",
    );
  };

  const exportCsv = () => {
    const header = [
      "tipo",
      "descricao",
      "valor",
      "data",
      "categoria",
      "conta",
      "cartao",
      "status",
      "recorrencia",
      "observacao",
    ];
    const rows = state.transactions.map((item) => [
      item.type,
      item.description,
      (item.amountCents / 100).toFixed(2).replace(".", ","),
      item.date,
      state.categories.find((category) => category.id === item.categoryId)?.name ?? "",
      state.accounts.find((account) => account.id === item.accountId)?.name ?? "",
      state.cards.find((card) => card.id === item.creditCardId)?.name ?? "",
      item.status,
      item.recurrence,
      item.notes ?? "",
    ]);
    downloadFile(
      [header, ...rows].map((row) => row.map(escapeCsv).join(";")).join("\r\n"),
      "colmeia-transacoes-" + new Date().toISOString().slice(0, 10) + ".csv",
      "text/csv;charset=utf-8",
    );
  };

  const selectBackup = async (file: File) => {
    try {
      setPendingImport(parseBackup(await file.text()));
      setNotice("Backup validado. Revise o resumo antes de importar.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível ler o backup.",
      );
    }
  };

  const confirmImport = async () => {
    if (!requireOnline()) return;
    if (!pendingImport) return;
    await replacePlannerState(pendingImport.data);
    setPendingImport(null);
    await refresh();
    setNotice("Backup importado com sucesso.");
  };

  const selectCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setNotice("O CSV não possui linhas para importar.");
      return;
    }
    const separator = lines[0].includes(";") ? ";" : ",";
    const columns = lines[0]
      .split(separator)
      .map((column) => column.replace(/"/g, "").trim().toLowerCase());
    const index = (name: string) => columns.indexOf(name);
    if (index("descricao") < 0 || index("valor") < 0 || index("data") < 0) {
      setNotice("CSV inválido: descrição, valor e data são obrigatórios.");
      return;
    }
    const now = new Date().toISOString();
    const records = lines.slice(1).flatMap((line) => {
      const fields = line
        .split(separator)
        .map((field) => field.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
      const description = fields[index("descricao")] ?? "";
      const amount = parseMoney(fields[index("valor")] ?? "");
      const date = fields[index("data")] ?? "";
      if (!description || !amount || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
      const categoryName = fields[index("categoria")] ?? "";
      const accountName = fields[index("conta")] ?? "";
      const cardName = fields[index("cartao")] ?? "";
      const record: Transaction = {
        id: makeId(),
        type: (fields[index("tipo")] || "expense") as Transaction["type"],
        description,
        amountCents: amount,
        date,
        categoryId: state.categories.find(
          (item) => item.name.toLowerCase() === categoryName.toLowerCase(),
        )?.id,
        accountId: state.accounts.find(
          (item) => item.name.toLowerCase() === accountName.toLowerCase(),
        )?.id,
        creditCardId: state.cards.find(
          (item) => item.name.toLowerCase() === cardName.toLowerCase(),
        )?.id,
        tags: [],
        recurrence: "none",
        status: fields[index("status")] === "pending" ? "pending" : "paid",
        demo: false,
        createdAt: now,
        updatedAt: now,
      };
      return [record];
    });
    setPendingCsv(records);
    setNotice(
      records.length
        ? "CSV validado. Confirme antes de adicionar os registros."
        : "Nenhuma linha válida foi encontrada.",
    );
  };

  const confirmCsvImport = async () => {
    if (!requireOnline()) return;
    await Promise.all(pendingCsv.map((record) => putRecord("transactions", record)));
    setPendingCsv([]);
    await refresh();
    setNotice("Transações do CSV adicionadas sem apagar os dados existentes.");
  };

  const goTo = (nav: NavKey) => {
    setActiveNav(nav);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <main className="loading-screen">
        <BrandMark />
        <span className="loading-hive" aria-hidden="true" />
        <p>Preparando sua visão financeira...</p>
      </main>
    );

  if (loadError)
    return (
      <main className="error-screen">
        <ShieldCheck size={42} />
        <h1>Não foi possível abrir seus dados</h1>
        <p>{loadError}</p>
        <button className="button" type="button" onClick={refresh}>
          <RefreshCcw size={18} /> Tentar novamente
        </button>
      </main>
    );

  const renderDashboard = () => {
    const maxCategory = Math.max(...expensesByCategory.map((item) => item.value), 1);
    const budgets = state.budgets.filter((item) => item.month === month);
    return (
      <>
        <section className="hero-summary">
          <div className="hero-copy">
            <p className="eyebrow">SUA COLMEIA FINANCEIRA</p>
            <h1>Seu dinheiro, com mais clareza.</h1>
            <p>
              Uma leitura simples de {monthLabel(month)} para você decidir o próximo
              passo com tranquilidade.
            </p>
            <div className="hero-actions">
              <button
                className="button"
                type="button"
                onClick={() =>
                  setModal({ kind: "transaction", transactionType: "expense" })
                }
              >
                <ArrowUpRight size={18} /> Adicionar despesa
              </button>
              <button
                className="button button--dark"
                type="button"
                onClick={() =>
                  setModal({ kind: "transaction", transactionType: "income" })
                }
              >
                <ArrowDownLeft size={18} /> Adicionar receita
              </button>
            </div>
          </div>
          <div className="balance-panel">
            <span>Saldo total</span>
            <strong>{formatBRL(balance)}</strong>
            <small>
              Somando {state.accounts.filter((item) => !item.archived).length} conta(s)
              ativa(s)
            </small>
            <div className="balance-cells" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className="metric-grid" aria-label="Resumo do mês">
          <article className="metric-card">
            <span className="metric-icon metric-icon--income">
              <TrendingUp size={20} />
            </span>
            <p>Receitas</p>
            <strong>{formatBRL(summary.income)}</strong>
            <small>
              {comparisonPercent(summary.income, previousSummary.income) >= 0
                ? "+"
                : ""}
              {comparisonPercent(summary.income, previousSummary.income)}% vs. mês
              anterior
            </small>
          </article>
          <article className="metric-card">
            <span className="metric-icon metric-icon--expense">
              <TrendingDown size={20} />
            </span>
            <p>Despesas</p>
            <strong>{formatBRL(summary.expense)}</strong>
            <small>{summary.committed}% da renda do mês comprometida</small>
          </article>
          <article className="metric-card metric-card--featured">
            <span className="metric-icon">
              <CircleDollarSign size={20} />
            </span>
            <p>Resultado do mês</p>
            <strong>{formatBRL(summary.result)}</strong>
            <small>
              {summary.result >= 0
                ? "Você fechou o período no positivo."
                : "Vale revisar as maiores categorias."}
            </small>
          </article>
          <article className="metric-card">
            <span className="metric-icon">
              <CalendarClock size={20} />
            </span>
            <p>Movimentações</p>
            <strong>{selectedMonthTransactions.length}</strong>
            <small>
              {
                selectedMonthTransactions.filter((item) => item.status === "pending")
                  .length
              }{" "}
              pendente(s)
            </small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel panel--wide">
            <header className="panel-header">
              <div>
                <p className="eyebrow">LEITURA DO MÊS</p>
                <h2>Para onde o dinheiro está indo</h2>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => goTo("reports")}
              >
                Ver relatório <ChevronRight size={16} />
              </button>
            </header>
            {expensesByCategory.length ? (
              <div className="category-chart">
                {expensesByCategory.slice(0, 6).map((item) => (
                  <div className="category-row" key={item.id}>
                    <span>{item.name}</span>
                    <div className="category-track">
                      <i
                        style={{
                          width: Math.max(8, (item.value / maxCategory) * 100) + "%",
                          background: item.color,
                        }}
                      />
                    </div>
                    <strong>{formatBRL(item.value)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="Ainda não há despesas neste mês"
                text="Adicione sua primeira despesa para entender para onde o dinheiro está indo."
                action="Adicionar despesa"
                onAction={() =>
                  setModal({ kind: "transaction", transactionType: "expense" })
                }
              />
            )}
            <details className="data-alternative">
              <summary>Ver dados em tabela</summary>
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByCategory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{formatBRL(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </article>

          <article className="panel">
            <header className="panel-header">
              <div>
                <p className="eyebrow">PLANEJADO</p>
                <h2>Orçamentos</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Criar orçamento"
                onClick={() => setModal({ kind: "budget" })}
              >
                <Plus size={18} />
              </button>
            </header>
            <div className="compact-list">
              {budgets.slice(0, 3).map((budget) => {
                const progress = budgetProgress(budget, state.transactions);
                const category = state.categories.find(
                  (item) => item.id === budget.categoryId,
                );
                return (
                  <div className="progress-item" key={budget.id}>
                    <div>
                      <strong>{category?.name ?? "Categoria"}</strong>
                      <span>
                        {formatBRL(progress.used)} de {formatBRL(budget.limitCents)}
                      </span>
                    </div>
                    <ProgressBar
                      value={progress.percent}
                      tone={progress.status as "normal" | "warning" | "exceeded"}
                      label={
                        (category?.name ?? "Orçamento") + ": " + progress.percent + "%"
                      }
                    />
                  </div>
                );
              })}
              {!budgets.length && (
                <EmptyState
                  icon={Gauge}
                  title="Planeje sem pressão"
                  text="Defina um limite mensal para uma categoria importante."
                  action="Criar orçamento"
                  onAction={() => setModal({ kind: "budget" })}
                  compact
                />
              )}
            </div>
          </article>

          <article className="panel">
            <header className="panel-header">
              <div>
                <p className="eyebrow">PRÓXIMOS PASSOS</p>
                <h2>Metas</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Criar meta"
                onClick={() => setModal({ kind: "goal" })}
              >
                <Plus size={18} />
              </button>
            </header>
            <div className="compact-list">
              {state.goals.slice(0, 3).map((goal) => {
                const progress = goalProgress(goal);
                return (
                  <div className="progress-item" key={goal.id}>
                    <div>
                      <strong>{goal.name}</strong>
                      <span>{progress.percent}% concluída</span>
                    </div>
                    <ProgressBar
                      value={progress.percent}
                      tone="goal"
                      label={goal.name + ": " + progress.percent + "%"}
                    />
                  </div>
                );
              })}
              {!state.goals.length && (
                <EmptyState
                  icon={PiggyBank}
                  title="Dê nome ao próximo sonho"
                  text="Uma meta transforma intenção em progresso visível."
                  action="Criar meta"
                  onAction={() => setModal({ kind: "goal" })}
                  compact
                />
              )}
            </div>
          </article>

          <article className="panel panel--wide">
            <header className="panel-header">
              <div>
                <p className="eyebrow">MOVIMENTO RECENTE</p>
                <h2>Últimas transações</h2>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => goTo("transactions")}
              >
                Ver todas <ChevronRight size={16} />
              </button>
            </header>
            <TransactionList
              items={sortTransactions(state.transactions).slice(0, 6)}
              state={state}
              onEdit={(item) => setModal({ kind: "transaction", item })}
              onDelete={(item) =>
                setDeleteIntent({
                  table: "transactions",
                  id: item.id,
                  label: item.description,
                })
              }
              onDuplicate={duplicateTransaction}
              compact
            />
          </article>

          <article className="panel">
            <header className="panel-header">
              <div>
                <p className="eyebrow">NO RADAR</p>
                <h2>Próximos compromissos</h2>
              </div>
              <BellRing size={19} />
            </header>
            <div className="upcoming-list">
              {upcoming.map((item) => (
                <div key={item.id}>
                  <span className="date-badge">
                    {formatDate(item.date).slice(0, 5)}
                  </span>
                  <p>
                    <strong>{item.description}</strong>
                    <small>
                      {item.status === "pending" ? "Pendente" : "Recorrente"}
                    </small>
                  </p>
                  <b>{formatBRL(item.amountCents)}</b>
                </div>
              ))}
              {!upcoming.length && (
                <p className="muted-copy">
                  Nenhuma despesa pendente ou recorrente por aqui.
                </p>
              )}
            </div>
          </article>
        </section>
      </>
    );
  };

  const renderTransactions = () => (
    <>
      <PageHeader
        eyebrow="MOVIMENTAÇÕES"
        title="Transações"
        description="Registre, pesquise e acompanhe cada entrada e saída."
        action="Nova transação"
        icon={Plus}
        onAction={() => setModal({ kind: "transaction" })}
      />
      <section className="panel">
        <div className="toolbar">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Pesquisar transações</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por descrição ou observação"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar pesquisa"
              >
                <X size={16} />
              </button>
            )}
          </label>
          <label className="filter-field">
            <span className="sr-only">Filtrar por tipo</span>
            <select
              value={transactionFilter}
              onChange={(event) => setTransactionFilter(event.target.value)}
            >
              <option value="all">Todos os tipos</option>
              <option value="expense">Despesas</option>
              <option value="income">Receitas</option>
              <option value="transfer">Transferências</option>
            </select>
          </label>
          <button
            className="button button--secondary"
            type="button"
            onClick={exportCsv}
          >
            <Download size={17} /> Exportar CSV
          </button>
        </div>
        <TransactionList
          items={filteredTransactions}
          state={state}
          onEdit={(item) => setModal({ kind: "transaction", item })}
          onDelete={(item) =>
            setDeleteIntent({
              table: "transactions",
              id: item.id,
              label: item.description,
            })
          }
          onDuplicate={duplicateTransaction}
        />
        {!filteredTransactions.length && (
          <EmptyState
            icon={ReceiptText}
            title={search ? "Nenhum resultado encontrado" : "Sua lista está vazia"}
            text={
              search
                ? "Tente outro termo ou remova os filtros."
                : "Registre uma receita ou despesa para começar sua organização."
            }
            action={search ? "Limpar filtros" : "Adicionar transação"}
            onAction={() =>
              search
                ? (setSearch(""), setTransactionFilter("all"))
                : setModal({ kind: "transaction" })
            }
          />
        )}
      </section>
    </>
  );

  const renderAccounts = () => (
    <>
      <PageHeader
        eyebrow="ONDE O DINHEIRO VIVE"
        title="Contas e cartões"
        description="Tenha saldos, limites e vencimentos reunidos em uma visão."
        action="Adicionar conta"
        icon={Plus}
        onAction={() => setModal({ kind: "account" })}
        secondaryAction="Adicionar cartão"
        onSecondaryAction={() => setModal({ kind: "card" })}
      />
      <section className="section-block">
        <div className="section-title">
          <div>
            <h2>Contas</h2>
            <p>Saldo calculado a partir do valor inicial e das transações pagas.</p>
          </div>
        </div>
        <div className="account-grid">
          {state.accounts.map((account) => (
            <article
              className={"account-card" + (account.archived ? " is-archived" : "")}
              key={account.id}
            >
              <div className="account-card__top">
                <span style={{ background: account.color }}>
                  <Landmark size={21} />
                </span>
                <div className="card-menu">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={"Editar " + account.name}
                    onClick={() => setModal({ kind: "account", item: account })}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={
                      (account.archived ? "Desarquivar " : "Arquivar ") + account.name
                    }
                    onClick={() => toggleArchive("accounts", account)}
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </div>
              <p>{accountLabels[account.type]}</p>
              <h3>{account.name}</h3>
              <strong>{formatBRL(accountBalance(account, state.transactions))}</strong>
              <small>{account.institution ?? "Sem instituição informada"}</small>
            </article>
          ))}
          {!state.accounts.length && (
            <button
              className="add-card"
              type="button"
              onClick={() => setModal({ kind: "account" })}
            >
              <Plus size={24} />
              <strong>Adicionar primeira conta</strong>
              <span>Informe um saldo inicial para começar.</span>
            </button>
          )}
        </div>
      </section>
      <section className="section-block">
        <div className="section-title">
          <div>
            <h2>Cartões de crédito</h2>
            <p>O limite utilizado considera despesas do mês vinculadas ao cartão.</p>
          </div>
        </div>
        <div className="account-grid">
          {state.cards.map((card) => {
            const used = state.transactions
              .filter(
                (item) =>
                  item.type === "expense" &&
                  item.creditCardId === card.id &&
                  item.date.startsWith(month),
              )
              .reduce((total, item) => total + item.amountCents, 0);
            const percent =
              card.limitCents > 0 ? Math.round((used / card.limitCents) * 100) : 0;
            return (
              <article
                className={"credit-card" + (card.archived ? " is-archived" : "")}
                key={card.id}
                style={{ background: card.color }}
              >
                <div className="credit-card__top">
                  <CreditCard size={26} />
                  <div className="card-menu">
                    <button
                      type="button"
                      aria-label={"Editar " + card.name}
                      onClick={() => setModal({ kind: "card", item: card })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={
                        (card.archived ? "Desarquivar " : "Arquivar ") + card.name
                      }
                      onClick={() => toggleArchive("cards", card)}
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
                <h3>{card.name}</h3>
                <p>
                  Fatura atual <strong>{formatBRL(used)}</strong>
                </p>
                <ProgressBar
                  value={percent}
                  tone={percent > 90 ? "warning" : "normal"}
                  label={"Limite utilizado: " + percent + "%"}
                />
                <footer>
                  <span>
                    Disponível
                    <b>{formatBRL(Math.max(card.limitCents - used, 0))}</b>
                  </span>
                  <span>
                    Vencimento
                    <b>dia {card.dueDay}</b>
                  </span>
                </footer>
              </article>
            );
          })}
          <button
            className="add-card"
            type="button"
            onClick={() => setModal({ kind: "card" })}
          >
            <Plus size={24} />
            <strong>Adicionar cartão</strong>
            <span>Acompanhe fatura e limite disponível.</span>
          </button>
        </div>
      </section>
    </>
  );

  const renderBudgets = () => {
    const visible = state.budgets.filter((item) => item.month === month);
    return (
      <>
        <PageHeader
          eyebrow="PLANEJAR PARA ESCOLHER"
          title="Orçamentos"
          description="Defina limites por categoria com mensagens úteis, sem culpa."
          action="Criar orçamento"
          icon={Plus}
          onAction={() => setModal({ kind: "budget" })}
        />
        <div className="month-control">
          <label>
            Mês de referência
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
        </div>
        <section className="budget-grid">
          {visible.map((budget) => {
            const progress = budgetProgress(budget, state.transactions);
            const category = state.categories.find(
              (item) => item.id === budget.categoryId,
            );
            return (
              <article className="budget-card" key={budget.id}>
                <header>
                  <span style={{ background: category?.color ?? "#F8BF4D" }}>
                    <Tag size={20} />
                  </span>
                  <div>
                    <p>Orçamento mensal</p>
                    <h2>{category?.name ?? "Categoria"}</h2>
                  </div>
                  <div className="card-menu">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Editar orçamento"
                      onClick={() => setModal({ kind: "budget", item: budget })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Excluir orçamento"
                      onClick={() =>
                        setDeleteIntent({
                          table: "budgets",
                          id: budget.id,
                          label: category?.name ?? "Orçamento",
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </header>
                <div className="budget-values">
                  <span>
                    Utilizado <b>{formatBRL(progress.used)}</b>
                  </span>
                  <span>
                    Planejado <b>{formatBRL(budget.limitCents)}</b>
                  </span>
                </div>
                <ProgressBar
                  value={progress.percent}
                  tone={progress.status as "normal" | "warning" | "exceeded"}
                  label={
                    (category?.name ?? "Orçamento") + ": " + progress.percent + "%"
                  }
                />
                <p className={"budget-message budget-message--" + progress.status}>
                  {progress.status === "exceeded"
                    ? "O limite foi ultrapassado. Que tal revisar esta categoria com calma?"
                    : progress.status === "warning"
                      ? "Você utilizou " +
                        progress.percent +
                        "% deste orçamento. Ainda há espaço para ajustar."
                      : "Você ainda tem " +
                        formatBRL(progress.remaining) +
                        " disponíveis neste plano."}
                </p>
              </article>
            );
          })}
        </section>
        {!visible.length && (
          <EmptyState
            icon={Gauge}
            title="Nenhum orçamento para este mês"
            text="Escolha uma categoria que você quer acompanhar mais de perto."
            action="Criar orçamento"
            onAction={() => setModal({ kind: "budget" })}
          />
        )}
      </>
    );
  };

  const renderGoals = () => (
    <>
      <PageHeader
        eyebrow="PROGRESSO QUE FAZ SENTIDO"
        title="Metas"
        description="Organize objetivos e acompanhe o quanto falta para chegar lá."
        action="Criar meta"
        icon={Plus}
        onAction={() => setModal({ kind: "goal" })}
      />
      <section className="goal-grid">
        {state.goals.map((goal) => {
          const progress = goalProgress(goal);
          return (
            <article className="goal-card" key={goal.id}>
              <header>
                <span className="goal-hex" style={{ background: goal.color }}>
                  <PiggyBank size={25} />
                </span>
                <div className="card-menu">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={"Editar " + goal.name}
                    onClick={() => setModal({ kind: "goal", item: goal })}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={"Excluir " + goal.name}
                    onClick={() =>
                      setDeleteIntent({
                        table: "goals",
                        id: goal.id,
                        label: goal.name,
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </header>
              <p className="eyebrow">META FINANCEIRA</p>
              <h2>{goal.name}</h2>
              <div className="goal-total">
                <strong>{formatBRL(goal.currentCents)}</strong>
                <span>de {formatBRL(goal.targetCents)}</span>
              </div>
              <ProgressBar
                value={progress.percent}
                tone="goal"
                label={goal.name + ": " + progress.percent + "%"}
              />
              <div className="goal-facts">
                <span>
                  Falta
                  <b>{formatBRL(progress.remaining)}</b>
                </span>
                {goal.targetDate && (
                  <span>
                    Até
                    <b>{formatDate(goal.targetDate)}</b>
                  </span>
                )}
              </div>
              {progress.percent >= 100 ? (
                <p className="positive-callout">Meta concluída. Celebre esse avanço!</p>
              ) : progress.monthlySuggestion ? (
                <p className="goal-suggestion">
                  Uma contribuição de {formatBRL(progress.monthlySuggestion)} por mês
                  alcançaria esta data. É apenas uma estimativa organizacional.
                </p>
              ) : null}
            </article>
          );
        })}
      </section>
      {!state.goals.length && (
        <EmptyState
          icon={PiggyBank}
          title="Qual é o próximo objetivo?"
          text="Reserva, viagem ou dívida: dê um nome ao que você quer construir."
          action="Criar primeira meta"
          onAction={() => setModal({ kind: "goal" })}
        />
      )}
    </>
  );

  const renderReports = () => {
    const filtered = state.transactions.filter(
      (item) =>
        item.date.startsWith(reportMonth) &&
        (!reportCategory || item.categoryId === reportCategory) &&
        (!reportAccount || item.accountId === reportAccount) &&
        (!reportCard || item.creditCardId === reportCard),
    );
    const reportSummary = summarizeMonth(filtered, reportMonth);
    const categories = categoryTotals(filtered, state.categories, reportMonth);
    const max = Math.max(...categories.map((item) => item.value), 1);
    const biggest = sortTransactions(filtered.filter((item) => item.type === "expense"))
      .sort((a, b) => b.amountCents - a.amountCents)
      .slice(0, 5);
    return (
      <>
        <PageHeader
          eyebrow="COMPREENDER PARA AVANÇAR"
          title="Relatórios"
          description="Compare períodos e encontre padrões sem transformar números em julgamento."
          action="Exportar CSV"
          icon={Download}
          onAction={exportCsv}
        />
        <section className="report-filters panel">
          <label>
            Mês
            <input
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
            />
          </label>
          <label>
            Categoria
            <select
              value={reportCategory}
              onChange={(event) => setReportCategory(event.target.value)}
            >
              <option value="">Todas</option>
              {state.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Conta
            <select
              value={reportAccount}
              onChange={(event) => setReportAccount(event.target.value)}
            >
              <option value="">Todas</option>
              {state.accounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cartão
            <select
              value={reportCard}
              onChange={(event) => setReportCard(event.target.value)}
            >
              <option value="">Todos</option>
              {state.cards.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="metric-grid report-metrics">
          <article className="metric-card">
            <p>Receitas</p>
            <strong>{formatBRL(reportSummary.income)}</strong>
          </article>
          <article className="metric-card">
            <p>Despesas</p>
            <strong>{formatBRL(reportSummary.expense)}</strong>
          </article>
          <article className="metric-card metric-card--featured">
            <p>Saldo do período</p>
            <strong>{formatBRL(reportSummary.result)}</strong>
          </article>
          <article className="metric-card">
            <p>Comprometimento</p>
            <strong>{reportSummary.committed}%</strong>
          </article>
        </section>
        <section className="dashboard-grid">
          <article className="panel panel--wide">
            <header className="panel-header">
              <div>
                <p className="eyebrow">POR CATEGORIA</p>
                <h2>Distribuição das despesas</h2>
              </div>
            </header>
            {categories.length ? (
              <div className="vertical-chart" aria-label="Gastos por categoria">
                {categories.slice(0, 7).map((item) => (
                  <div key={item.id}>
                    <span className="vertical-chart__value">
                      {formatBRL(item.value)}
                    </span>
                    <i
                      style={{
                        height: Math.max(14, (item.value / max) * 180) + "px",
                        background: item.color,
                      }}
                    />
                    <b>{item.name}</b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-copy">Sem despesas para os filtros escolhidos.</p>
            )}
            <details className="data-alternative">
              <summary>Ver dados em tabela</summary>
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{formatBRL(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </article>
          <article className="panel">
            <header className="panel-header">
              <div>
                <p className="eyebrow">MAIORES SAÍDAS</p>
                <h2>Despesas em destaque</h2>
              </div>
            </header>
            <ol className="ranking-list">
              {biggest.map((item, index) => (
                <li key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>
                    <strong>{item.description}</strong>
                    <small>{formatDate(item.date)}</small>
                  </p>
                  <b>{formatBRL(item.amountCents)}</b>
                </li>
              ))}
            </ol>
          </article>
          <article className="panel panel--wide">
            <header className="panel-header">
              <div>
                <p className="eyebrow">ORÇADO X REALIZADO</p>
                <h2>Acompanhamento do plano</h2>
              </div>
            </header>
            <div className="compact-list">
              {state.budgets
                .filter((item) => item.month === reportMonth)
                .map((budget) => {
                  const progress = budgetProgress(budget, filtered);
                  const category = state.categories.find(
                    (item) => item.id === budget.categoryId,
                  );
                  return (
                    <div className="progress-item" key={budget.id}>
                      <div>
                        <strong>{category?.name ?? "Categoria"}</strong>
                        <span>
                          {formatBRL(progress.used)} / {formatBRL(budget.limitCents)}
                        </span>
                      </div>
                      <ProgressBar
                        value={progress.percent}
                        tone={progress.status as "normal" | "warning" | "exceeded"}
                        label={
                          (category?.name ?? "Orçamento") +
                          ": " +
                          progress.percent +
                          "%"
                        }
                      />
                    </div>
                  );
                })}
            </div>
          </article>
        </section>
      </>
    );
  };

  const renderSettings = () => (
    <>
      <PageHeader
        eyebrow="SEUS DADOS, SUAS ESCOLHAS"
        title="Configurações"
        description="Cuide das categorias, dos backups e da experiência neste navegador."
      />
      <section className="settings-grid">
        <article className="panel settings-card profile-settings-card">
          <span className="settings-icon">
            <UserRound size={22} />
          </span>
          <div>
            <h2>Perfil e sessão</h2>
            <p>Revise sua identidade, os provedores conectados e as opções da conta.</p>
          </div>
          <dl className="privacy-facts">
            <div>
              <dt>Nome</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Confirmação</dt>
              <dd>{profile.emailConfirmed ? "Confirmado" : "Pendente"}</dd>
            </div>
            <div>
              <dt>Provedores</dt>
              <dd>{profile.providers.join(", ")}</dd>
            </div>
            <div>
              <dt>Conta criada</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString("pt-BR")}</dd>
            </div>
          </dl>
          <div className="settings-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={onSignOut}
            >
              <LogOut size={17} /> Sair
            </button>
            <a className="button button--secondary" href="/privacidade/">
              Política de Privacidade
            </a>
            <a className="button button--secondary" href="/termos/">
              Termos de Uso
            </a>
            <button
              className="button button--danger"
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    "Excluir sua conta remove permanentemente os dados sincronizados. Exporte um backup antes. Deseja continuar?",
                  )
                )
                  await onDeleteAccount();
              }}
            >
              <Trash2 size={17} /> Excluir conta
            </button>
          </div>
        </article>

        <article className="panel settings-card">
          <span className="settings-icon">
            <FileJson size={22} />
          </span>
          <div>
            <h2>Backup e portabilidade</h2>
            <p>
              Exporte todos os dados em JSON ou suas transações em CSV. A importação
              sempre mostra um resumo antes de gravar.
            </p>
          </div>
          <div className="settings-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={exportJson}
            >
              <Download size={17} /> Exportar JSON
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={exportCsv}
            >
              <Download size={17} /> Exportar CSV
            </button>
            <label className="button button--secondary file-button">
              <Upload size={17} /> Importar JSON
              <input
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) selectBackup(file);
                  event.target.value = "";
                }}
              />
            </label>
            <label className="button button--secondary file-button">
              <Upload size={17} /> Importar CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) selectCsv(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {pendingImport && (
            <div className="import-preview">
              <h3>Pré-visualização do backup</h3>
              <p>
                Exportado em{" "}
                {new Date(pendingImport.metadata.exportedAt).toLocaleString("pt-BR")}.
                Contém {pendingImport.data.transactions.length} transações,{" "}
                {pendingImport.data.accounts.length} contas e{" "}
                {pendingImport.data.goals.length} metas.
              </p>
              <p>
                Confirmar substituirá os dados atuais. Nada será alterado antes dessa
                confirmação.
              </p>
              <div className="inline-actions">
                <button className="button" type="button" onClick={confirmImport}>
                  Confirmar importação
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => setPendingImport(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {!!pendingCsv.length && (
            <div className="import-preview">
              <h3>Pré-visualização do CSV</h3>
              <p>
                {pendingCsv.length} linha(s) válida(s) serão adicionadas. Os dados
                existentes não serão removidos.
              </p>
              <ul>
                {pendingCsv.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    {item.description} — {formatBRL(item.amountCents)}
                  </li>
                ))}
              </ul>
              <div className="inline-actions">
                <button className="button" type="button" onClick={confirmCsvImport}>
                  Adicionar transações
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => setPendingCsv([])}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="panel settings-card">
          <span className="settings-icon">
            <Tag size={22} />
          </span>
          <div>
            <h2>Categorias</h2>
            <p>Personalize nomes, cores e disponibilidade para o seu cotidiano.</p>
          </div>
          <div className="category-pills">
            {state.categories.map((category) => (
              <span
                key={category.id}
                className={category.archived ? "is-archived" : ""}
              >
                <i style={{ background: category.color }} />
                {category.name}
                <button
                  type="button"
                  aria-label={"Editar " + category.name}
                  onClick={() => setModal({ kind: "category", item: category })}
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  aria-label={
                    (category.archived ? "Desarquivar " : "Arquivar ") + category.name
                  }
                  onClick={() => toggleArchive("categories", category)}
                >
                  <Archive size={13} />
                </button>
              </span>
            ))}
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setModal({ kind: "category" })}
          >
            <Plus size={17} /> Nova categoria
          </button>
        </article>

        <article className="panel settings-card">
          <span className="settings-icon">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h2>Privacidade e sincronização</h2>
            <p>
              O Supabase é a fonte oficial e este navegador mantém um cache separado por
              conta. Exporte backups periódicos; armazenamento local não equivale a
              criptografia completa.
            </p>
          </div>
          <dl className="privacy-facts">
            <div>
              <dt>Moeda</dt>
              <dd>Real brasileiro (BRL)</dd>
            </div>
            <div>
              <dt>Fuso</dt>
              <dd>{state.settings.timezone}</dd>
            </div>
            <div>
              <dt>Sincronização</dt>
              <dd>{online ? "Conectada" : "Offline · somente leitura"}</dd>
            </div>
          </dl>
        </article>

        <article className="panel settings-card">
          <span className="settings-icon">
            <RefreshCcw size={22} />
          </span>
          <div>
            <h2>Revisar ou recomeçar</h2>
            <p>
              Reabra o tour sem criar registros ou apague os dados financeiros da conta.
            </p>
          </div>
          <div className="settings-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={onReplayTour}
            >
              <RefreshCcw size={17} /> Ver novamente como usar a Colmeia
            </button>
            <button
              className="button button--danger"
              type="button"
              onClick={() =>
                setDeleteIntent({
                  table: "transactions",
                  id: "__all__",
                  label: "todos os dados da aplicação",
                })
              }
            >
              <Trash2 size={17} /> Apagar todos os dados
            </button>
          </div>
        </article>
      </section>
      <p className="disclaimer">
        A Colmeia Educação Financeira oferece ferramentas de organização e educação
        financeira. As informações apresentadas não constituem recomendação de
        investimento, consultoria financeira, contábil ou jurídica.
      </p>
    </>
  );

  const screens: Record<NavKey, () => React.ReactNode> = {
    dashboard: renderDashboard,
    transactions: renderTransactions,
    accounts: renderAccounts,
    budgets: renderBudgets,
    goals: renderGoals,
    reports: renderReports,
    settings: renderSettings,
  };

  return (
    <div
      className="app-shell"
      data-online={online}
      onClickCapture={(event) => {
        if (online) return;
        const button = (event.target as HTMLElement).closest("button");
        if (!button) return;
        const action = `${button.textContent ?? ""} ${button.getAttribute("aria-label") ?? ""}`;
        if (
          /nova|novo|adicionar|editar|excluir|apagar|duplicar|arquivar|desarquivar|confirmar importa/i.test(
            action,
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
          requireOnline();
        }
      }}
    >
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className={"sidebar" + (sidebarOpen ? " sidebar--open" : "")}>
        <div className="sidebar-brand">
          <BrandMark inverse />
          <button
            className="sidebar-close"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activeNav === item.id ? "active" : ""}
                onClick={() => goTo(item.id)}
                aria-current={activeNav === item.id ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.9} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-tip">
          <span className="tip-hex">
            <ShieldCheck size={20} />
          </span>
          <p>
            <strong>Sincronizado com privacidade</strong>O acesso aos dados é separado
            por conta.
          </p>
        </div>
        <footer>
          <p>
            <strong>Colmeia</strong> Planejador v2
          </p>
          <span className="offline-dot">Nuvem + cache local</span>
        </footer>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="app-main">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            aria-label="Abrir menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="mobile-brand">
            <BrandMark compact />
            <strong>COLMEIA</strong>
          </div>
          <label className="month-picker">
            <span className="sr-only">Mês da visão geral</span>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
          <div className="topbar-actions">
            <button
              className="quick-add"
              type="button"
              disabled={!online}
              onClick={() => setModal({ kind: "transaction" })}
            >
              <Plus size={18} /> <span>Nova transação</span>
            </button>
            <span
              className="profile-badge"
              aria-label={`Perfil de ${profile.name}`}
              title={profile.name}
            >
              {profile.name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            Você está offline. O último cache sincronizado continua disponível para
            leitura; edições ficam desativadas para evitar conflitos.
          </div>
        )}
        <main id="main-content" className="content">
          {screens[activeNav]()}
        </main>
        <nav className="bottom-nav" aria-label="Navegação móvel">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activeNav === item.id ? "active" : ""}
                onClick={() => goTo(item.id)}
                aria-label={item.label}
              >
                <Icon size={19} />
                <span>{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>
      {modal && (
        <EntryModal
          key={modal.kind + (modal.item?.id ?? "new")}
          modal={modal}
          accounts={state.accounts}
          cards={state.cards}
          categories={state.categories}
          onClose={() => setModal(null)}
          onSubmit={saveModal}
        />
      )}
      {deleteIntent && (
        <div className="modal-backdrop">
          <section
            className="confirm-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <span className="danger-icon">
              <Trash2 size={23} />
            </span>
            <h2 id="confirm-title">
              {deleteIntent.id === "__all__"
                ? "Apagar todos os dados?"
                : "Excluir este registro?"}
            </h2>
            <p id="confirm-description">
              {deleteIntent.id === "__all__"
                ? "Esta ação remove contas, transações, orçamentos, metas e configurações deste navegador. Exporte um backup antes se quiser preservar as informações."
                : "Você está prestes a excluir “" +
                  deleteIntent.label +
                  "”. Esta ação não pode ser desfeita."}
            </p>
            <div className="modal-actions">
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setDeleteIntent(null)}
              >
                Cancelar
              </button>
              <button
                className="button button--danger"
                type="button"
                onClick={async () => {
                  if (deleteIntent.id === "__all__") {
                    await clearPlannerData();
                    setDeleteIntent(null);
                    await refresh();
                    return;
                  }
                  await confirmDelete();
                }}
              >
                Confirmar exclusão
              </button>
            </div>
          </section>
        </div>
      )}
      <div className="live-region" aria-live="polite" aria-atomic="true">
        {notice && <span>{notice}</span>}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
  icon?: LucideIcon;
  onAction?: () => void;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  icon: Icon,
  onAction,
  secondaryAction,
  onSecondaryAction,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && onAction && (
        <div className="page-header__actions">
          {secondaryAction && onSecondaryAction && (
            <button
              className="button button--secondary"
              type="button"
              onClick={onSecondaryAction}
            >
              <CreditCard size={18} /> {secondaryAction}
            </button>
          )}
          <button className="button" type="button" onClick={onAction}>
            {Icon && <Icon size={18} />} {action}
          </button>
        </div>
      )}
    </header>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text: string;
  action: string;
  onAction: () => void;
  compact?: boolean;
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={"empty-state" + (compact ? " empty-state--compact" : "")}>
      <span className="empty-state__icon">
        <Icon size={compact ? 21 : 28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <button
        className={compact ? "text-button" : "button button--secondary"}
        type="button"
        onClick={onAction}
      >
        <Plus size={16} /> {action}
      </button>
    </div>
  );
}

interface TransactionListProps {
  items: Transaction[];
  state: PlannerState;
  onEdit: (item: Transaction) => void;
  onDelete: (item: Transaction) => void;
  onDuplicate: (item: Transaction) => void;
  compact?: boolean;
}

function TransactionList({
  items,
  state,
  onEdit,
  onDelete,
  onDuplicate,
  compact = false,
}: TransactionListProps) {
  if (!items.length && compact)
    return <p className="muted-copy">Nenhuma transação registrada.</p>;
  return (
    <div className={"transaction-list" + (compact ? " is-compact" : "")}>
      {items.map((item) => {
        const category = state.categories.find((entry) => entry.id === item.categoryId);
        const account = state.accounts.find((entry) => entry.id === item.accountId);
        const Icon =
          item.type === "income"
            ? ArrowDownLeft
            : item.type === "transfer"
              ? ArrowLeftRight
              : ArrowUpRight;
        return (
          <article className="transaction-row" key={item.id}>
            <span
              className={"transaction-icon transaction-icon--" + item.type}
              style={{
                background:
                  item.type === "expense" && category
                    ? category.color + "28"
                    : undefined,
              }}
            >
              <Icon size={18} />
            </span>
            <div className="transaction-main">
              <strong>{item.description}</strong>
              <span>
                {category?.name ??
                  (item.type === "transfer" ? "Transferência" : "Sem categoria")}
                {account ? " · " + account.name : ""}
              </span>
            </div>
            <span className="transaction-date">{formatDate(item.date)}</span>
            <span
              className={
                "status-badge status-badge--" +
                (item.status === "paid" ? "paid" : "pending")
              }
            >
              {item.status === "paid" ? "Pago" : "Pendente"}
            </span>
            <strong className={"transaction-value transaction-value--" + item.type}>
              {item.type === "expense" ? "−" : item.type === "income" ? "+" : ""}
              {formatBRL(item.amountCents)}
            </strong>
            <div className="row-actions">
              <button
                type="button"
                aria-label={"Editar " + item.description}
                onClick={() => onEdit(item)}
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                aria-label={"Duplicar " + item.description}
                onClick={() => onDuplicate(item)}
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                aria-label={"Excluir " + item.description}
                onClick={() => onDelete(item)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
