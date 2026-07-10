# SPEC-005 — Player sincronizado + download

- **Status:** Rascunho
- **Épico:** [Épico 3](../roadmap.md#épico-3--frontend-tela-única)
- **Arquivos-alvo:** `components/NarrationPlayer.tsx`, `app/page.tsx`

## Objetivo

Tocar o vídeo (mudo) com o áudio da narração por cima, exibir o roteiro e permitir baixar o mp3.

## Contexto & referências

- [ADR-0006](../architecture/decisions.md#adr-0006--sincronia-de-player-boa-o-suficiente).
- [`data-flow.md`](../architecture/data-flow.md).

## Requisitos funcionais

- **RF-1:** Renderiza `<video muted>` (do arquivo local que o usuário subiu, via object URL) e um `<audio>` (do `audioBase64` retornado).
- **RF-2:** Ao dar play, chama `play()` no vídeo e no áudio **juntos** (sem exigir sincronia frame a frame).
- **RF-3:** Exibe o `script` retornado em texto.
- **RF-4:** Botão de **download** do mp3 (nome de arquivo amigável, ex.: `narrameugol.mp3`).
- **RF-5:** Reconstrói o áudio a partir do base64 (`data:audio/mpeg;base64,...` ou Blob URL).

## Requisitos não-funcionais

- Mobile-first e responsivo.
- Textos e rótulos em PT-BR.
- Não travar a UI enquanto o áudio decodifica.

## Interface / contrato

- Entrada (props): `videoFile` (File local), `script` (string), `audioBase64` (string), `mime` (`audio/mpeg`).
- Consome a resposta de [SPEC-004](./SPEC-004-api-narrate.md).

## Regras de negócio & edge cases

- **Autoplay bloqueado:** navegadores podem barrar `play()` sem gesto; disparar o play a partir de uma interação do usuário (ex.: botão "Ouvir narração"). Ver [ADR-0006](../architecture/decisions.md#adr-0006--sincronia-de-player-boa-o-suficiente).
- Vídeo mais curto que o áudio (ou vice-versa): aceitável; o áudio é a peça principal (voiceover).
- Revogar object URLs ao desmontar para evitar vazamento de memória.
- Recarregar a página perde o resultado (sem persistência — [ADR-0007](../architecture/decisions.md#adr-0007--sem-estado-sem-persistência-mvp)).

## Critérios de aceitação

- **CA-1:** *Dado* uma resposta `200`, *quando* o usuário dá play, *então* vídeo (mudo) e áudio começam juntos.
- **CA-2:** *Então* o roteiro aparece em texto na tela.
- **CA-3:** *Quando* o usuário clica em baixar, *então* um mp3 audível é salvo.
- **CA-4:** *Dado* autoplay bloqueado, *então* o play acontece via ação do usuário sem erro visível.

## Fora de escopo

- Controles avançados (scrub sincronizado, waveform, velocidade).
- Compartilhamento social.

## Dependências

- [SPEC-004](./SPEC-004-api-narrate.md) (fonte do roteiro e do áudio).
