"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Database,
  Landmark,
  ReceiptText,
  Target,
} from "lucide-react";
import { BrandMark } from "./BrandMark";

export const onboardingSteps = [
  {
    title: "Comece pela visão geral",
    description:
      "Receitas, despesas e o resultado do mês aparecem juntos para você enxergar o momento atual com clareza.",
    detail: "Os valores abaixo são apenas uma apresentação e não serão salvos.",
    icon: BarChart3,
    preview: [
      "Receitas  R$ 4.800,00",
      "Despesas  R$ 3.120,00",
      "Resultado  R$ 1.680,00",
    ],
  },
  {
    title: "Registre suas transações",
    description:
      "Adicione receitas e despesas, depois edite ou exclua quando precisar. Você continua no controle.",
    detail:
      "Descrições e valores de exemplo existem somente enquanto este tour está aberto.",
    icon: ReceiptText,
    preview: ["Salário de exemplo  + R$ 4.800,00", "Mercado de exemplo  − R$ 286,40"],
  },
  {
    title: "Organize contas e cartões",
    description:
      "Cadastre onde o dinheiro fica e acompanhe saldos, faturas, limites usados e disponíveis.",
    detail: "Nenhuma conta é criada automaticamente ao concluir.",
    icon: Landmark,
    preview: ["Conta de exemplo", "Cartão de exemplo  32% do limite"],
  },
  {
    title: "Planeje com orçamentos e metas",
    description:
      "Defina referências mensais e acompanhe objetivos no seu ritmo, com mensagens educativas e sem julgamento.",
    detail: "A Colmeia não transforma esses exemplos em recomendação financeira.",
    icon: Target,
    preview: ["Alimentação  68% utilizado", "Reserva de exemplo  24% concluída"],
  },
  {
    title: "Seus dados, suas escolhas",
    description:
      "A nuvem sincroniza seus registros entre dispositivos. Você também pode exportar JSON e CSV quando quiser.",
    detail:
      "Em dispositivos compartilhados, saia da conta e evite manter a sessão conectada.",
    icon: Database,
    preview: ["Sincronização protegida por conta", "Backup JSON e exportação CSV"],
  },
] as const;

interface OnboardingProps {
  onFinish: () => Promise<void> | void;
  onSkip?: () => Promise<void> | void;
  replay?: boolean;
}

export function Onboarding({ onFinish, onSkip, replay = false }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const current = onboardingSteps[step];
  const StepIcon = current.icon;

  useEffect(() => titleRef.current?.focus(), [step]);

  const finish = async () => {
    setSaving(true);
    try {
      await onFinish();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="onboarding-shell" data-testid="onboarding-v2">
      <header className="onboarding-header">
        <BrandMark />
        {onSkip && (
          <button className="text-button" type="button" onClick={onSkip}>
            {replay ? "Fechar tour" : "Concluir por agora"}
          </button>
        )}
      </header>
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <div
          className="onboarding-art onboarding-art--preview"
          aria-label="Dados fictícios de demonstração"
        >
          <span className="feature-hex" aria-hidden="true">
            <StepIcon size={34} strokeWidth={1.8} />
          </span>
          <div className="tour-preview">
            {current.preview.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
        <div className="onboarding-copy">
          <p className="eyebrow">
            ETAPA {step + 1} DE {onboardingSteps.length}
          </p>
          <h1 id="onboarding-title" ref={titleRef} tabIndex={-1}>
            {current.title}
          </h1>
          <p>{current.description}</p>
          <p className="tour-detail">{current.detail}</p>
          <div
            className="step-dots"
            aria-label={`Etapa ${step + 1} de ${onboardingSteps.length}`}
          >
            {onboardingSteps.map((item, index) => (
              <span
                key={item.title}
                className={index === step ? "active" : ""}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="onboarding-actions">
            <button
              type="button"
              className="button button--secondary"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            {step < onboardingSteps.length - 1 ? (
              <button
                type="button"
                className="button"
                onClick={() => setStep((value) => value + 1)}
              >
                Continuar <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="button"
                disabled={saving}
                onClick={finish}
              >
                {saving ? "Finalizando..." : "Ir para meu painel"}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>
      <p className="onboarding-note">
        Os exemplos deste tour não são gravados no navegador nem na nuvem.
      </p>
    </main>
  );
}
