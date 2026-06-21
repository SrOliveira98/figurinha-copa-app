# Minha Figurinha da Copa 2026

Site completo em Next.js 14 para gerar figurinhas personalizadas no estilo Copa 2026, com preview com marca d'agua, checkout no Stripe e download da versao final.

## Stack

- Next.js 14 com App Router
- Tailwind CSS
- Sharp para geracao da figurinha em PNG
- Stripe Checkout para pagamento
- Armazenamento local temporario em `storage/`

## Como rodar

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

2. Preencha as chaves do Stripe no `.env.local`.

3. Instale as dependencias:

```bash
npm install
```

4. Rode em desenvolvimento:

```bash
npm run dev
```

5. Acesse:

```txt
http://localhost:3000
```

## Variaveis de ambiente

- `OPENAI_API_KEY`
- `OPENAI_IMAGE_MODEL`
- `OPENAI_IMAGE_QUALITY`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Fluxo principal

- `/` landing page
- `/criar` formulario multi-step
- `/preview?id=...` preview com marca d'agua
- `/api/checkout` cria a sessao do Stripe Checkout
- `/api/webhook` confirma o pagamento
- `/sucesso?session_id=...` libera download da figurinha limpa

## Observacoes

- Se `OPENAI_API_KEY` estiver configurada, a rota de geracao tenta criar a figurinha com OpenAI usando a imagem enviada e uma imagem de referencia local.
- `OPENAI_IMAGE_QUALITY=medium` costuma ficar mais rapido que `high`, com boa qualidade visual.
- Se `OPENAI_API_KEY` nao estiver configurada, a aplicacao usa a geracao programatica local com `sharp`.
- Os arquivos sao guardados temporariamente em `storage/` e limpos automaticamente apos 24h.
- A versao sem marca d'agua so e servida depois da confirmacao de pagamento.

## Stripe em producao

- Use chaves `live` apenas em `deploy` real, nunca fixas no codigo.
- Configure `STRIPE_SECRET_KEY` no servidor e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` no ambiente do front.
- Cadastre o webhook apontando para `/api/webhook`.
- Escute pelo menos o evento `checkout.session.completed`.
- Em ambiente local, use Stripe CLI ou uma URL publica de tunel para encaminhar eventos ao webhook.
