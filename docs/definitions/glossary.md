# Glossário

Vocabulário de domínio e técnico do NarraMeuGol.

| Termo | Definição |
|-------|-----------|
| **NarraMeuGol** | Nome do produto/repo. A "IA" está no slogan: *"a IA que narra seu gol de várzea"*. |
| **Várzea** | Futebol amador de campo aberto/comunitário no Brasil. Contexto dos clipes. |
| **Locutor** | Narrador de rádio esportivo. O estilo-alvo da narração gerada. |
| **Bordão** | Frase de efeito característica de narradores (ex.: alongar "GOOOL"). Deve aparecer no roteiro. |
| **Roteiro (script)** | Texto curto (~100 palavras) em PT-BR gerado pela IA a partir do vídeo, que vira áudio. |
| **Hype** | Tom empolgado/exagerado. Objetivo do produto — não é relatório factual. |
| **Estilo (`style`)** | Parâmetro do usuário: `classic` (rádio medido) ou `hype` (over-the-top). Afeta o tom do prompt. |
| **Fallback** | Roteiro genérico (`lib/scriptFallback.ts`) usado quando o Gemini falha, para a demo não quebrar. |
| **Clipe** | Vídeo curto (~≤ 1 min) enviado pelo usuário. |
| **Burn-in** | Stretch: queimar o áudio da narração dentro do vídeo (ffmpeg) para um único arquivo. |
| **Gemini** | Modelo de IA do Google (`@google/genai`) que assiste ao vídeo e escreve o roteiro. |
| **ElevenLabs** | Serviço de TTS que converte o roteiro em mp3. |
| **File API (Gemini)** | Mecanismo de upload de arquivos do Gemini, usado para enviar clipes (vs. inline para arquivos muito pequenos). |
| **Route handler** | Endpoint server-side do Next.js (`app/api/narrate/route.ts`) que orquestra as IAs. |
| **`audioBase64`** | Áudio mp3 codificado em base64 dentro da resposta JSON. |
| **Voice ID** | Identificador da voz de locutor PT-BR no ElevenLabs (`ELEVENLABS_VOICE_ID`). |
