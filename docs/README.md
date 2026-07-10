# Documentação — NarraMeuGol

> *"a IA que narra seu gol de várzea"*

Esta pasta é a documentação viva do projeto, organizada em **SDD (Spec-Driven Development)**: escrevemos a especificação antes do código e mantemos os dois em sincronia.

A fonte da verdade do produto continua sendo o [`../BRIEF.md`](../BRIEF.md). Estes documentos **refinam** o brief em algo executável; quando houver conflito, o `BRIEF.md` vence e este material deve ser corrigido.

## Como navegar

| Documento | Para quê serve |
|-----------|----------------|
| [`product-overview.md`](./product-overview.md) | O quê e o porquê: objetivo, escopo, não-escopo, fluxo de UX. |
| [`roadmap.md`](./roadmap.md) | **O refinamento**: tudo que falta desenvolver, quebrado em épicos, tarefas e critérios de "pronto". |
| [`architecture/overview.md`](./architecture/overview.md) | Componentes, fronteiras e stack. |
| [`architecture/data-flow.md`](./architecture/data-flow.md) | Ciclo de vida da requisição `/api/narrate`, com diagrama. |
| [`architecture/decisions.md`](./architecture/decisions.md) | ADRs — por que decidimos cada coisa. |
| [`specs/`](./specs/README.md) | Uma spec por capacidade (upload, roteiro, TTS, API, player). |
| [`definitions/glossary.md`](./definitions/glossary.md) | Vocabulário de domínio (várzea, bordão, locutor...). |
| [`definitions/api-contract.md`](./definitions/api-contract.md) | Contrato completo de `POST /api/narrate`. |
| [`definitions/environment.md`](./definitions/environment.md) | Variáveis de ambiente e configuração. |

## Fluxo de trabalho SDD

1. Uma capacidade nova ou alteração começa por uma **spec** em `specs/` (use o template no `specs/README.md`).
2. A spec define **critérios de aceitação** testáveis antes de qualquer código.
3. Decisões arquiteturais com trade-off viram um **ADR** em `architecture/decisions.md`.
4. O trabalho pendente vive no [`roadmap.md`](./roadmap.md); ao concluir uma tarefa, atualize o status lá.

## Status do projeto

Repositório recém-criado (desafio DEV Weekend — Passion Edition). Ainda **não scaffoldado**: só existem `BRIEF.md` e esta documentação. O próximo passo concreto está no topo do [`roadmap.md`](./roadmap.md).
