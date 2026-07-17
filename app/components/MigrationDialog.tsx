"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, Download, ShieldCheck, X } from "lucide-react";
import type { LegacyCounts } from "../lib/migration";

interface MigrationDialogProps {
  counts: LegacyCounts;
  remoteHasData: boolean;
  onBackup: () => void;
  onImport: () => Promise<void>;
  onUseCloud: () => void;
  onCancel: () => void;
}

export function MigrationDialog({
  counts,
  remoteHasData,
  onBackup,
  onImport,
  onUseCloud,
  onCancel,
}: MigrationDialogProps) {
  const [busy, setBusy] = useState(false);
  const [backupMade, setBackupMade] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);

  const backup = () => {
    onBackup();
    setBackupMade(true);
  };
  const migrate = async () => {
    setBusy(true);
    setError("");
    try {
      await onImport();
    } catch {
      setError(
        "A importação foi interrompida sem alterar os dados locais. Tente novamente ou cancele para revisar.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="migration-shell">
      <section
        className="migration-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-title"
      >
        <button
          className="migration-close"
          type="button"
          onClick={onCancel}
          aria-label="Cancelar e sair"
        >
          <X size={19} />
        </button>
        <span className="settings-icon">
          <ShieldCheck size={24} />
        </span>
        <p className="eyebrow">MIGRAÇÃO SEGURA</p>
        <h1 id="migration-title" ref={titleRef} tabIndex={-1}>
          Encontramos dados deste planejador neste navegador.
        </h1>
        <p>
          Seus dados locais continuam intactos. Recomendamos gerar um backup antes de
          escolher como continuar.
        </p>
        <dl className="migration-counts">
          <div>
            <dt>Contas</dt>
            <dd>{counts.accounts}</dd>
          </div>
          <div>
            <dt>Cartões</dt>
            <dd>{counts.cards}</dd>
          </div>
          <div>
            <dt>Transações</dt>
            <dd>{counts.transactions}</dd>
          </div>
          <div>
            <dt>Orçamentos</dt>
            <dd>{counts.budgets}</dd>
          </div>
          <div>
            <dt>Metas</dt>
            <dd>{counts.goals}</dd>
          </div>
          <div>
            <dt>Categorias próprias</dt>
            <dd>{counts.customCategories}</dd>
          </div>
        </dl>
        {remoteHasData ? (
          <div className="migration-warning" role="status">
            <Cloud size={19} />
            <span>
              <strong>Sua conta já possui dados na nuvem.</strong> Nesta versão, não
              fazemos combinações automáticas. Use os dados da nuvem, exporte os dados
              locais ou cancele para revisar.
            </span>
          </div>
        ) : (
          <div className="migration-warning">
            <ShieldCheck size={19} />
            <span>
              A importação preserva IDs, centavos, datas e relacionamentos, e só termina
              depois da verificação das contagens.
            </span>
          </div>
        )}
        {!backupMade && !remoteHasData && (
          <p className="backup-reminder">
            Faça o backup JSON antes de importar. Assim você mantém uma cópia
            independente.
          </p>
        )}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="migration-actions">
          <button className="button button--secondary" type="button" onClick={backup}>
            <Download size={17} /> Fazer backup JSON
          </button>
          {!remoteHasData && (
            <button className="button" type="button" disabled={busy} onClick={migrate}>
              {busy ? "Verificando..." : "Importar para minha conta"}
            </button>
          )}
          <button
            className="button button--secondary"
            type="button"
            onClick={onUseCloud}
          >
            {remoteHasData ? "Usar os dados da nuvem" : "Continuar sem importar"}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
