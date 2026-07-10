# SPEC-001 — Upload e validação do clipe

- **Status:** Rascunho
- **Épico:** [Épico 3](../roadmap.md#épico-3--frontend-tela-única) (cliente) + [Épico 2](../roadmap.md#épico-2--rota-de-orquestração-apinarrate) (validação servidor)
- **Arquivos-alvo:** `components/VideoUpload.tsx`, `app/api/narrate/route.ts`

## Objetivo

Permitir que o usuário selecione/arraste um clipe curto de vídeo e garantir que apenas uploads válidos cheguem ao pipeline de IA.

## Contexto & referências

- [`BRIEF.md`](../../BRIEF.md) — "Keep clips short (~≤ 1 min)".
- Contrato: [`api-contract.md`](../definitions/api-contract.md).

## Requisitos funcionais

- **RF-1:** O componente aceita um arquivo de vídeo via clique (input `type=file`, `accept="video/*"`) e via drag-and-drop.
- **RF-2:** Antes de enviar, o cliente valida **tipo** (mime `video/*`) e **tamanho** (limite configurável, alinhado ao limite do servidor).
- **RF-3:** O cliente exibe o nome/preview do arquivo escolhido e permite trocá-lo.
- **RF-4:** O servidor **revalida** presença, mime e tamanho (não confia na validação do cliente).
- **RF-5:** Servidor sem vídeo ou com mime inválido → `400`; vídeo acima do limite → `413`.

## Requisitos não-funcionais

- Mensagens de erro em PT-BR, claras (ex.: "Envie um vídeo de até X MB").
- Mobile-first: o seletor deve funcionar bem em toque.

## Interface / contrato

- Envio: `multipart/form-data` com campo `video` (File) e `style` (string). Ver [SPEC-004](./SPEC-004-api-narrate.md).
- Limite de tamanho: constante única compartilhada (documentar valor em [`environment.md`](../definitions/environment.md) ou constante em `lib/`), coerente com os limites da função serverless.

## Regras de negócio & edge cases

- Arquivo não-vídeo (ex.: imagem) → bloqueado no cliente e rejeitado com `400` no servidor.
- Nenhum arquivo selecionado → botão de gerar desabilitado; servidor retorna `400` se chamado mesmo assim.
- Clipe muito longo/pesado → orientar o usuário a cortar; servidor retorna `413`.
- `style` ausente/ inválido → assumir `classic` como padrão (não bloquear o fluxo).

## Critérios de aceitação

- **CA-1:** *Dado* um mp4 de ~30s válido, *quando* o usuário seleciona, *então* o app habilita a geração e envia `video` + `style`.
- **CA-2:** *Dado* um arquivo de imagem, *quando* o usuário tenta usá-lo, *então* o cliente recusa com mensagem PT-BR e o servidor, se acionado, responde `400`.
- **CA-3:** *Dado* um vídeo acima do limite, *quando* enviado, *então* o servidor responde `413`.
- **CA-4:** *Dado* nenhum vídeo, *quando* o endpoint é chamado, *então* responde `400`.

## Fora de escopo

- Transcodificação/compressão no cliente.
- Múltiplos arquivos, edição ou corte.

## Dependências

- [SPEC-004](./SPEC-004-api-narrate.md) (formato do request e códigos de erro).
