"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Landmark,
  Sparkles,
  Target,
} from "lucide-react";
import { BrandMark } from "./BrandMark";

const steps = [
  {
    title: "Contas e cartões em um só lugar",
    description: "Cadastre onde seu dinheiro entra, fica guardado ou é utilizado.",
    icon: Landmark,
  },
  {
    title: "Registre receitas e despesas",
    description:
      "Acompanhe seus gastos e entradas com valores em reais e datas do seu jeito.",
    icon: Sparkles,
  },
  {
    title: "Entenda o destino de cada centavo",
    description:
      "Categorias e relatórios transformam movimentações em decisões mais claras.",
    icon: BarChart3,
  },
  {
    title: "Transforme organização em hábito",
    description: "Acompanhe orçamentos, metas e sua evolução sem julgamentos.",
    icon: Target,
  },
];

interface OnboardingProps {
  onFinish: (values: {
    accountName: string;
    balance: string;
    demo: boolean;
  }) => Promise<void>;
  onSkip: () => Promise<void>;
}

export function Onboarding({ onFinish, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [accountName, setAccountName] = useState("Conta principal");
  const [balance, setBalance] = useState("");
  const [demo, setDemo] = useState(true);
  const [saving, setSaving] = useState(false);
  const StepIcon = steps[step].icon;

  const finish = async () => {
    setSaving(true);
    try {
      await onFinish({ accountName, balance, demo });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="onboarding-shell">
      <header className="onboarding-header">
        <BrandMark />
        <button className="text-button" type="button" onClick={onSkip}>
          Pular por agora
        </button>
      </header>
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <div className="onboarding-art" aria-hidden="true">
          <span className="feature-hex">
            <StepIcon size={34} strokeWidth={1.8} />
          </span>
          <span className="floating-cell floating-cell--one" />
          <span className="floating-cell floating-cell--two" />
          <span className="floating-cell floating-cell--three" />
        </div>
        <div className="onboarding-copy">
          <p className="eyebrow">PASSO {step + 1} DE 4</p>
          <h1 id="onboarding-title">{steps[step].title}</h1>
          <p>{steps[step].description}</p>
          {step === 3 && (
            <div className="onboarding-fields">
              <label>
                Nome da primeira conta
                <input
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="Ex.: Conta principal"
                />
              </label>
              <label>
                Saldo inicial
                <input
                  value={balance}
                  onChange={(event) => setBalance(event.target.value)}
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                />
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={demo}
                  onChange={(event) => setDemo(event.target.checked)}
                />
                <span>
                  Usar dados demonstrativos fictícios para conhecer os recursos
                </span>
              </label>
            </div>
          )}
          <div className="step-dots" aria-label={"Etapa " + (step + 1) + " de 4"}>
            {steps.map((item, index) => (
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
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            {step < 3 ? (
              <button
                type="button"
                className="button"
                onClick={() => setStep((current) => current + 1)}
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
                {saving ? "Preparando..." : "Começar a organizar"}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>
      <p className="onboarding-note">
        Seus dados ficam neste navegador. Você poderá exportar um backup quando quiser.
      </p>
    </main>
  );
}
