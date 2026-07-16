"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
    detail: "A captura usa dados fictícios e mostra onde consultar o resumo do mês.",
    icon: BarChart3,
    image: "/tutorial/visao-geral.png",
    imageAlt: "Tela real da visão geral com resumo financeiro e navegação lateral",
    screenLabel: "Tela: Visão geral",
  },
  {
    title: "Registre suas transações",
    description:
      "Adicione receitas e despesas, depois edite ou exclua quando precisar. Você continua no controle.",
    detail:
      "Abra “Transações” na barra lateral para pesquisar, filtrar e adicionar lançamentos.",
    icon: ReceiptText,
    image: "/tutorial/transacoes.png",
    imageAlt: "Tela real de transações com pesquisa, filtros e lançamentos",
    screenLabel: "Tela: Transações",
  },
  {
    title: "Organize contas e cartões",
    description:
      "Cadastre onde o dinheiro fica e acompanhe saldos, faturas, limites usados e disponíveis.",
    detail:
      "Use “Contas e cartões” na barra lateral. Nada é criado automaticamente ao concluir.",
    icon: Landmark,
    image: "/tutorial/contas-cartoes.png",
    imageAlt: "Tela real de contas e cartões com saldos, fatura e limite",
    screenLabel: "Tela: Contas e cartões",
  },
  {
    title: "Planeje com orçamentos e metas",
    description:
      "Defina referências mensais e acompanhe objetivos no seu ritmo, com mensagens educativas e sem julgamento.",
    detail:
      "Orçamentos e Metas ficam em áreas separadas e não constituem recomendação financeira.",
    icon: Target,
    image: "/tutorial/orcamentos-metas.png",
    imageAlt: "Tela real de orçamentos com progresso mensal por categoria",
    screenLabel: "Tela: Orçamentos e metas",
  },
  {
    title: "Seus dados, suas escolhas",
    description:
      "A nuvem sincroniza seus registros entre dispositivos. Você também pode exportar JSON e CSV quando quiser.",
    detail:
      "Em Configurações você encontra perfil, backup e privacidade. Em dispositivos compartilhados, sempre saia da conta.",
    icon: Database,
    image: "/tutorial/configuracoes-backup.png",
    imageAlt: "Tela real de configurações com perfil, backup e privacidade",
    screenLabel: "Tela: Configurações e backup",
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
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
          aria-label={`Tutorial visual: ${current.screenLabel}`}
        >
          <span className="feature-hex" aria-hidden="true">
            <StepIcon size={34} strokeWidth={1.8} />
          </span>
          <figure className="tour-screen">
            <Image
              src={basePath + current.image}
              alt={current.imageAlt}
              width={1280}
              height={800}
              priority={step === 0}
              unoptimized
            />
            <figcaption>{current.screenLabel}</figcaption>
          </figure>
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
        As capturas usam dados fictícios e não alteram sua conta.
      </p>
    </main>
  );
}
