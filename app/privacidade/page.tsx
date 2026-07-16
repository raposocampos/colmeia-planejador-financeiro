import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../components/BrandMark";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <header>
        <BrandMark />
        <Link href="/">Voltar para a Colmeia</Link>
      </header>
      <article className="legal-card">
        <p className="eyebrow">VERSÃO TÉCNICA PRELIMINAR · 16/07/2026</p>
        <h1>Política de Privacidade</h1>
        <p className="legal-alert">
          Documento técnico preliminar. Necessita de revisão jurídica antes da
          disponibilização pública.
        </p>
        <h2>Dados tratados</h2>
        <p>
          Nome, e-mail, identificadores técnicos da conta, status do onboarding e os
          dados financeiros inseridos por você: contas, cartões, categorias, transações,
          orçamentos, metas e preferências.
        </p>
        <h2>Finalidades</h2>
        <p>
          Autenticar sua conta, sincronizar o planejador entre dispositivos, permitir
          exportação e exclusão, proteger a separação entre usuários e manter a operação
          técnica.
        </p>
        <h2>Armazenamento e fornecedor</h2>
        <p>
          A V2 foi preparada para Supabase Auth e PostgreSQL. O navegador mantém um
          cache IndexedDB separado por usuário. Região, suboperadores e prazos
          contratuais precisam ser confirmados antes da produção.
        </p>
        <h2>Retenção</h2>
        <p>
          Os dados permanecem enquanto a conta estiver ativa. A exclusão da conta aciona
          a remoção em cascata no banco. Retenções de segurança e backups do fornecedor
          ainda precisam de validação contratual.
        </p>
        <h2>Compartilhamento</h2>
        <p>
          Não há venda de dados. O processamento técnico depende do Supabase e dos
          fornecedores de infraestrutura utilizados por ele. O login Google, quando
          escolhido, também envolve o Google.
        </p>
        <h2>Seus controles</h2>
        <p>
          Você pode exportar JSON e CSV, sair, evitar sessão persistente, revisar o
          perfil e solicitar a exclusão pela própria aplicação.
        </p>
        <h2>Logs</h2>
        <p>
          Os registros técnicos não devem conter valores, descrições de transações,
          nomes de contas, e-mails completos, tokens ou backups. Incidentes devem seguir
          o runbook documentado.
        </p>
        <h2>Limites e contato</h2>
        <p>
          Este texto não declara conformidade jurídica automática. Canal do titular,
          encarregado, base legal, transferência internacional e prazos finais dependem
          de revisão jurídica e operacional.
        </p>
      </article>
    </main>
  );
}
