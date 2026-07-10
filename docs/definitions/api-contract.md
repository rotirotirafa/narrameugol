# Contrato da API

Fonte única do contrato de `POST /api/narrate`. Governado por [SPEC-004](../specs/SPEC-004-api-narrate.md).

## `POST /api/narrate`

Orquestra vídeo → roteiro (Gemini) → áudio (ElevenLabs) e retorna ambos.

### Request

- **Content-Type:** `multipart/form-data`
- **Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `video` | File | sim | Clipe de vídeo (`video/*`), curto (~≤ 1 min). |
| `style` | string | não | `classic` \| `hype`. Ausente/ inválido → `classic`. |

### Response `200`

```json
{
  "script": "GOOOL! ...",
  "audioBase64": "<mp3 em base64>",
  "mime": "audio/mpeg"
}
```

```ts
interface NarrateResponse {
  script: string;
  audioBase64: string;
  mime: "audio/mpeg";
}
```

### Erros

| Status | Quando | Corpo |
|--------|--------|-------|
| `400` | Sem vídeo ou mime inválido | `{ "error": "<mensagem PT-BR>" }` |
| `413` | Vídeo acima do limite de tamanho | `{ "error": "<mensagem PT-BR>" }` |
| `502` | Falha do ElevenLabs (sem áudio a entregar) | `{ "error": "<mensagem PT-BR>" }` |
| `500` | Erro inesperado / configuração ausente | `{ "error": "<mensagem PT-BR>" }` |

### Regras

- **Falha só do Gemini não é erro:** o servidor usa o fallback e ainda retorna `200`.
- Nenhuma resposta expõe chaves ou detalhes internos do provedor.
- O vídeo **não** é retornado pela API — o cliente já possui o arquivo local para o `<video>`.

### Exemplo (`curl`)

```bash
curl -X POST http://localhost:3000/api/narrate \
  -F "video=@clipe.mp4" \
  -F "style=hype"
```
