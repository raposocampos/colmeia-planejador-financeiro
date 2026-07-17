"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { currentMonth, formatBRL } from "../lib/calculations";
import type {
  Account,
  Budget,
  Category,
  CreditCard,
  Goal,
  Transaction,
} from "../lib/types";

export type ModalKind =
  "transaction" | "account" | "card" | "budget" | "goal" | "category";

export interface ModalState {
  kind: ModalKind;
  item?: Transaction | Account | CreditCard | Budget | Goal | Category;
  transactionType?: Transaction["type"];
}

export interface FormValues {
  name: string;
  description: string;
  type: string;
  amount: string;
  date: string;
  categoryId: string;
  accountId: string;
  destinationAccountId: string;
  creditCardId: string;
  status: string;
  recurrence: string;
  notes: string;
  institution: string;
  initialBalance: string;
  limit: string;
  closingDay: string;
  dueDay: string;
  month: string;
  target: string;
  current: string;
  targetDate: string;
  color: string;
  kind: string;
}

interface EntryModalProps {
  modal: ModalState;
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

const titles: Record<ModalKind, string> = {
  transaction: "Registrar movimentação",
  account: "Adicionar conta",
  card: "Adicionar cartão",
  budget: "Criar orçamento",
  goal: "Criar meta",
  category: "Criar categoria",
};

const recordValue = (item: object | undefined, key: string): string => {
  if (!item || !(key in item)) return "";
  const value = (item as Record<string, unknown>)[key];
  return value === undefined || value === null ? "" : String(value);
};

export function EntryModal({
  modal,
  accounts,
  cards,
  categories,
  onClose,
  onSubmit,
}: EntryModalProps) {
  const item = modal.item;
  const activeCategories = categories.filter((category) => !category.archived);
  const budgetCategories = activeCategories.filter(
    (category) => category.kind !== "income",
  );
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      name: recordValue(item, "name"),
      description: recordValue(item, "description"),
      type:
        recordValue(item, "type") ||
        modal.transactionType ||
        (modal.kind === "account" ? "digital" : "expense"),
      amount:
        item && "amountCents" in item
          ? formatBRL(Number(item.amountCents)).replace("R$", "").trim()
          : "",
      date: recordValue(item, "date") || new Date().toISOString().slice(0, 10),
      categoryId:
        recordValue(item, "categoryId") ||
        (modal.kind === "transaction"
          ? (activeCategories[0]?.id ?? "")
          : modal.kind === "budget"
            ? (budgetCategories[0]?.id ?? "")
            : ""),
      accountId: recordValue(item, "accountId"),
      destinationAccountId: recordValue(item, "destinationAccountId"),
      creditCardId: recordValue(item, "creditCardId"),
      status: recordValue(item, "status") || "paid",
      recurrence: recordValue(item, "recurrence") || "none",
      notes: recordValue(item, "notes"),
      institution: recordValue(item, "institution"),
      initialBalance:
        item && "initialBalanceCents" in item
          ? formatBRL(Number(item.initialBalanceCents)).replace("R$", "").trim()
          : "",
      limit:
        item && "limitCents" in item
          ? formatBRL(Number(item.limitCents)).replace("R$", "").trim()
          : "",
      closingDay: recordValue(item, "closingDay") || "22",
      dueDay: recordValue(item, "dueDay") || "2",
      month: recordValue(item, "month") || currentMonth(),
      target:
        item && "targetCents" in item
          ? formatBRL(Number(item.targetCents)).replace("R$", "").trim()
          : "",
      current:
        item && "currentCents" in item
          ? formatBRL(Number(item.currentCents)).replace("R$", "").trim()
          : "",
      targetDate: recordValue(item, "targetDate"),
      color: recordValue(item, "color") || "#F8BF4D",
      kind: recordValue(item, "kind") || "expense",
    },
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);

  const submit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch {
      setSubmitError(
        "Não foi possível salvar. Verifique sua conexão e tente novamente.",
      );
    }
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{item ? "EDITAR" : "NOVO REGISTRO"}</p>
            <h2 id="modal-title">
              {item
                ? titles[modal.kind].replace(/Adicionar|Criar|Registrar/, "Editar")
                : titles[modal.kind]}
            </h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>
        <form className="entry-form" onSubmit={submit}>
          {modal.kind === "transaction" && (
            <>
              <div className="form-grid form-grid--three">
                <label>
                  Tipo
                  <select {...register("type")} data-testid="transaction-type">
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </label>
                <label className="span-two">
                  Descrição
                  <input
                    {...register("description", { required: true })}
                    placeholder="Ex.: Supermercado"
                    autoFocus
                    data-testid="transaction-description"
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Valor
                  <input
                    {...register("amount", { required: true })}
                    inputMode="decimal"
                    placeholder="0,00"
                    data-testid="transaction-amount"
                  />
                </label>
                <label>
                  Data
                  <input
                    type="date"
                    {...register("date", { required: true })}
                    data-testid="transaction-date"
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Categoria
                  <select
                    {...register("categoryId", { required: true })}
                    disabled={!activeCategories.length}
                  >
                    {!activeCategories.length && (
                      <option value="">Cadastre uma categoria em Configurações</option>
                    )}
                    {activeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Conta
                  <select {...register("accountId")}>
                    <option value="">Selecione</option>
                    {accounts
                      .filter((account) => !account.archived)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Cartão (opcional)
                  <select {...register("creditCardId")}>
                    <option value="">Nenhum</option>
                    {cards
                      .filter((card) => !card.archived)
                      .map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Conta de destino (transferência)
                  <select {...register("destinationAccountId")}>
                    <option value="">Selecione</option>
                    {accounts
                      .filter((account) => !account.archived)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Estado
                  <select {...register("status")}>
                    <option value="paid">Pago</option>
                    <option value="pending">Pendente</option>
                  </select>
                </label>
                <label>
                  Recorrência
                  <select {...register("recurrence")}>
                    <option value="none">Não repetir</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </label>
              </div>
              <label>
                Observação
                <textarea {...register("notes")} rows={3} />
              </label>
            </>
          )}

          {modal.kind === "account" && (
            <>
              <label>
                Nome da conta
                <input {...register("name", { required: true })} autoFocus />
              </label>
              <div className="form-grid">
                <label>
                  Tipo
                  <select {...register("type")}>
                    <option value="checking">Conta-corrente</option>
                    <option value="digital">Conta digital</option>
                    <option value="savings">Poupança</option>
                    <option value="wallet">Carteira</option>
                    <option value="cash">Dinheiro</option>
                    <option value="investment">Investimentos</option>
                    <option value="other">Outros</option>
                  </select>
                </label>
                <label>
                  Instituição (opcional)
                  <input {...register("institution")} />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Saldo inicial
                  <input {...register("initialBalance")} inputMode="decimal" />
                </label>
                <label>
                  Cor
                  <input type="color" {...register("color")} />
                </label>
              </div>
            </>
          )}

          {modal.kind === "card" && (
            <>
              <label>
                Nome do cartão
                <input {...register("name", { required: true })} autoFocus />
              </label>
              <div className="form-grid">
                <label>
                  Limite
                  <input {...register("limit")} inputMode="decimal" />
                </label>
                <label>
                  Conta para pagamento
                  <select {...register("accountId")}>
                    <option value="">Nenhuma</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-grid form-grid--three">
                <label>
                  Fechamento
                  <input type="number" min="1" max="31" {...register("closingDay")} />
                </label>
                <label>
                  Vencimento
                  <input type="number" min="1" max="31" {...register("dueDay")} />
                </label>
                <label>
                  Cor
                  <input type="color" {...register("color")} />
                </label>
              </div>
            </>
          )}

          {modal.kind === "budget" && (
            <>
              <label>
                Categoria
                <select
                  {...register("categoryId", { required: true })}
                  disabled={!budgetCategories.length}
                >
                  {!budgetCategories.length && (
                    <option value="">Cadastre uma categoria de despesa</option>
                  )}
                  {budgetCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  Mês
                  <input type="month" {...register("month")} />
                </label>
                <label>
                  Limite planejado
                  <input {...register("limit")} inputMode="decimal" />
                </label>
              </div>
            </>
          )}

          {modal.kind === "goal" && (
            <>
              <label>
                Nome da meta
                <input
                  {...register("name", { required: true })}
                  placeholder="Ex.: Reserva de emergência"
                  autoFocus
                />
              </label>
              <div className="form-grid">
                <label>
                  Valor-alvo
                  <input {...register("target")} inputMode="decimal" />
                </label>
                <label>
                  Valor atual
                  <input {...register("current")} inputMode="decimal" />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Data desejada (opcional)
                  <input type="date" {...register("targetDate")} />
                </label>
                <label>
                  Conta associada
                  <select {...register("accountId")}>
                    <option value="">Nenhuma</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}

          {modal.kind === "category" && (
            <>
              <label>
                Nome
                <input {...register("name", { required: true })} autoFocus />
              </label>
              <div className="form-grid">
                <label>
                  Aplicação
                  <select {...register("kind")}>
                    <option value="expense">Despesas</option>
                    <option value="income">Receitas</option>
                    <option value="both">Ambos</option>
                  </select>
                </label>
                <label>
                  Cor
                  <input type="color" {...register("color")} />
                </label>
              </div>
            </>
          )}

          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}

          <footer className="modal-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button"
              disabled={formState.isSubmitting}
              data-testid="modal-save"
            >
              {formState.isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
