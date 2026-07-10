# Specs (SDD)

Uma spec por capacidade. Cada uma descreve **o comportamento esperado** e **critérios de aceitação testáveis** antes do código. Ao implementar, a spec é o contrato; ao mudar comportamento, atualize a spec primeiro.

## Índice

| ID | Capacidade | Status |
|----|-----------|--------|
| [SPEC-001](./SPEC-001-video-upload.md) | Upload e validação do clipe | Rascunho |
| [SPEC-002](./SPEC-002-script-generation.md) | Geração do roteiro (Gemini) + fallback | Rascunho |
| [SPEC-003](./SPEC-003-text-to-speech.md) | Text-to-speech (ElevenLabs) | Rascunho |
| [SPEC-004](./SPEC-004-api-narrate.md) | Orquestração `POST /api/narrate` | Rascunho |
| [SPEC-005](./SPEC-005-narration-playback.md) | Player sincronizado + download | Rascunho |

Status possíveis: **Rascunho** → **Aprovada** → **Implementada**.

## Template

```markdown
# SPEC-XXX — <Título>

- **Status:** Rascunho | Aprovada | Implementada
- **Épico:** <link para roadmap>
- **Arquivos-alvo:** <caminhos>

## Objetivo
Uma frase: o que esta capacidade entrega.

## Contexto & referências
Links para brief, ADRs, outras specs.

## Requisitos funcionais
RF-1, RF-2... — declarações testáveis do que o sistema DEVE fazer.

## Requisitos não-funcionais
Performance, resiliência, i18n, segurança.

## Interface / contrato
Entradas, saídas, tipos, formatos.

## Regras de negócio & edge cases
Comportamentos-limite, o que fazer quando algo dá errado.

## Critérios de aceitação
Given / When / Then verificáveis.

## Fora de escopo
O que esta spec explicitamente NÃO cobre.

## Dependências
Outras specs/serviços de que depende.
```
