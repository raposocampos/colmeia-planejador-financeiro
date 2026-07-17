import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../components/BrandMark";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <main className="legal-shell">
      <header>
        <BrandMark />
        <Link href="/">Voltar para a Colmeia</Link>
      </header>
      <article className="legal-card">
        <p className="eyebrow">VERSÃO TÉCNICA PRELIMINAR · 16/07/2026</p>
        <h1>Termos de Uso</h1>
        <p className="legal-alert">
          Documento técnico preliminar. Necessita de revisão jurídica antes da
          disponibilização pública.
        </p>
        <h2>1. Finalidade</h2>
        <p>
          A Colmeia Educação Financeira oferece ferramentas de organização e educação
          financeira. As informações apresentadas não constituem recomendação de
          investimento, consultoria financeira, contábil ou jurídica.
        </p>
        <h2>2. Sua conta</h2>
        <p>
          Você é responsável por manter a senha protegida, confirmar o e-mail informado,
          encerrar a sessão em dispositivos compartilhados e revisar os dados
          cadastrados.
        </p>
        <h2>3. Dados e backups</h2>
        <p>
          Os dados financeiros são sincronizados por meio do fornecedor de
          infraestrutura indicado na Política de Privacidade. A exportação JSON é uma
          cópia portátil e deve ser guardada em local seguro.
        </p>
        <h2>4. Disponibilidade</h2>
        <p>
          A V2 pode depender de conexão, disponibilidade do fornecedor e limites do
          plano contratado. A leitura offline usa o último cache sincronizado e as
          edições offline não estão disponíveis.
        </p>
        <h2>5. Uso responsável</h2>
        <p>
          Não utilize o produto para atividades ilícitas, para acessar dados de
          terceiros ou como única fonte para decisões financeiras relevantes.
        </p>
        <h2>6. Exclusão</h2>
        <p>
          A opção “Excluir conta” solicita a remoção da identidade e dos registros
          vinculados. Backups exportados por você não podem ser apagados pela Colmeia.
        </p>
        <h2>7. Alterações</h2>
        <p>
          Uma versão revisada destes termos deverá informar vigência e mudanças
          relevantes antes do uso público.
        </p>
      </article>
    </main>
  );
}
