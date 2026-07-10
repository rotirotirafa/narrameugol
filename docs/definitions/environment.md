# Ambiente & Configuração

## Variáveis de ambiente

Todas server-side. **Nunca** prefixar com `NEXT_PUBLIC_` nem usar em código de cliente ([ADR-0003](../architecture/decisions.md#adr-0003--chaves-de-api-somente-no-servidor)).

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Chave da API do Google Gemini (`@google/genai`). | sim |
| `ELEVENLABS_API_KEY` | Chave da API do ElevenLabs. | sim |
| `ELEVENLABS_VOICE_ID` | ID da voz de locutor PT-BR no ElevenLabs. | sim |

## Arquivos

- **`.env.local`** — valores reais, **gitignored**. Usado no desenvolvimento local.
- **`.env.example`** — apenas os **nomes** das variáveis (sem valores), **commitado** como referência.

```dotenv
# .env.example
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

## Produção (Vercel)

Adicionar as três variáveis no dashboard da Vercel (Project → Settings → Environment Variables) antes do deploy.

## Configuração relacionada (não-segredo)

Constantes que valem centralizar em `lib/` (ou config), coerentes entre cliente e servidor:

- **Limite de tamanho do vídeo** — usado na validação client e server ([SPEC-001](../specs/SPEC-001-video-upload.md)); alinhar aos limites de payload da função serverless ([ADR-0005](../architecture/decisions.md#adr-0005--áudio-como-base64-no-json)).
- **Modelos de IA** — `gemini-2.5-flash` (fallback `gemini-2.5-pro`); ElevenLabs Eleven v3 (fallback Flash v2.5). **Confirmar os IDs atuais** na doc dos provedores antes de implementar (roadmap 1.6).
