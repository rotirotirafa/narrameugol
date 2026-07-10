# Visão de Produto — NarraMeuGol

## Pitch

O usuário sobe um clipe curto de um jogo de futebol amador (várzea). Uma IA **assiste ao vídeo** e escreve um roteiro de narração no estilo locutor de rádio brasileiro, empolgado e cheio de bordões. Outra IA **transforma o roteiro em áudio**. O app **toca a narração por cima do vídeo (mudo)** e deixa o usuário **baixar o mp3**.

É **hype, não relatório de jogo**: nomes de jogadores e minutos exatos não importam — o objetivo é emoção.

## Objetivos

- Entregar uma experiência "mágica" em uma única tela: subir clipe → ouvir narração épica em segundos.
- Tudo em **português do Brasil** (UI e narração).
- Nunca quebrar numa demo ao vivo (fallback obrigatório de roteiro).
- Deployável na **Vercel** dentro da janela do desafio.

## Público / cenário de uso

Jogador de várzea, organizador de pelada ou torcedor que gravou um lance no celular e quer transformá-lo em algo divertido de compartilhar. Uso oportunista, mobile-first, sem cadastro.

## Fluxo de UX (tela única)

1. **Upload** — usuário escolhe/arrasta um clipe curto (~≤ 1 min).
2. **Estilo** — escolhe o tom do locutor: `classic` (rádio clássico, medido) ou `hype` (over-the-top).
3. **Gerar** — clica; app mostra estado de carregamento enquanto a IA trabalha.
4. **Resultado** — vídeo (mudo) toca sincronizado com o áudio da narração; roteiro aparece em texto.
5. **Baixar** — usuário baixa o mp3 da narração.

## Escopo do MVP

Upload → roteiro (Gemini) → áudio (ElevenLabs) → tocar vídeo+áudio sincronizados → baixar mp3. **Uma tela. Sem autenticação, sem banco de dados, sem histórico.**

## Não-escopo (explicitamente fora do MVP)

- Login / contas / persistência de clipes ou narrações.
- Edição de vídeo, cortes, múltiplos clipes.
- Compartilhamento social nativo, feed, likes.
- Legendas, tradução, outros idiomas além de PT-BR.
- Precisão factual (nomes, placar, cronômetro) — é hype por design.

## Stretch (só se sobrar tempo)

- **Burn-in**: queimar a narração dentro do vídeo (ffmpeg no servidor) para gerar um único arquivo baixável. Detalhado no [`roadmap.md`](./roadmap.md#épico-6--stretch-burn-in-do-áudio-no-vídeo).

## Métrica de sucesso da demo

Um clipe real de várzea entra e, em poucos segundos, sai uma narração empolgada e coerente tocando sobre o vídeo — sem erro visível, mesmo se a IA de vídeo falhar (cai no fallback).
