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
- **Modelos de IA** — Gemini `gemini-2.5-flash` (forte: `gemini-2.5-pro`); ElevenLabs `eleven_multilingual_v2` por padrão (confiável em todos os planos e ótimo em PT-BR). Eleven v3 é mais expressivo, mas o acesso via API é restrito — use `ELEVENLABS_MODEL_EXPRESSIVE` só se sua conta tiver acesso ao v3. IDs em `lib/config.ts`.
- **Voz do ElevenLabs (`ELEVENLABS_VOICE_ID`)** — precisa ser uma voz que o seu plano acessa. Vozes premium / da Voice Library podem exigir o tier **Creator ou acima** (erro `free_users_not_allowed`: "You need to be on the creator tier or above to use this voice"). No plano free, use uma voz *premade* / de "My Voices" e copie o **Voice ID** no painel do ElevenLabs.
