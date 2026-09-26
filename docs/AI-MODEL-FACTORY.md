# AI Model Factory

## Purpose

AI Model Factory is the model-control layer of Factory Core. It separates model metadata, provider capabilities, routing policy and local-model lifecycle so the Android control surface can manage cloud and local execution without pretending that an external operation completed.

## Provider families

### Cloud foundation / LLM
- OpenAI
- Google Gemini
- Anthropic Claude
- xAI Grok
- Mistral
- Cohere
- Groq
- DeepSeek
- Qwen
- OpenRouter
- Together AI
- Fireworks AI
- Perplexity
- Azure OpenAI
- AWS Bedrock
- Google Vertex AI
- Custom OpenAI-compatible endpoint

### Generative media
- Hugging Face
- Replicate
- Fal
- Stability AI
- Generic image provider
- Generic video provider
- Generic music provider
- Generic voice provider

Hugging Face is modeled as both a model source and inference layer. Its public Hub documentation covers model repositories, model cards, licenses, downloads and inference through multiple providers. citeturn0search1turn0search2turn0search3

## Local / hybrid model classes

- chat model
- code model
- image model
- video model
- embedding model
- speech model

Local models use GGUF metadata where the model is represented as GGUF. The contract does not assume that every image/video model is GGUF-compatible; format and runtime are explicit fields.

## Required model metadata

Every model record can carry:

| Field | Purpose |
|---|---|
| model / id | Stable factory identity |
| kind | chat, code, image, video, embedding or speech |
| quantization | e.g. Q4_K_M for GGUF |
| size | File/resource footprint |
| context | Maximum context where applicable |
| RAM | Estimated system-memory requirement |
| VRAM | Estimated accelerator-memory requirement |
| checksum | Integrity verification |
| license | Usage/compliance metadata |
| source | Provider, repository or local origin |
| version/revision | Reproducible model identity |
| compatibility | Android/cloud/CPU/GPU/runtime constraints |

## GGUF lifecycle

`discovered → queued → downloading → downloaded → installing → installed → active/inactive → deleted`

Supported user actions:

`download`, `install`, `activate`, `deactivate`, `delete`.

An action is a state transition in Factory Core. Actual network download, storage installation or runtime activation belongs to the connected worker/runtime. A URL or queued job is not installation evidence.

## Routing

`selectModelRoute()` filters enabled providers by capability and runtime, excludes denied providers, honors preferred providers, and can fall back to a registered local model. The result identifies the provider, optional model and selection reason.

## Security

Provider credentials are represented by `secretRef` rather than API keys. Secrets must remain in the connected secret manager/backend and must never be embedded in model metadata, Android UI state or Git history.

## Android / cloud split

- Android: discovery, approval, lifecycle commands, status, compatibility and evidence display.
- Cloud: heavy inference, media generation, model execution and builds where device resources are insufficient.
- Hybrid: provider/runtime can be selected per model and task.

## Factory invariants

1. No model is marked installed without installation evidence.
2. No provider credential is stored in source-controlled model metadata.
3. Model license and source remain attached to provenance.
4. Checksums are recorded for downloaded artifacts.
5. Runtime compatibility is evaluated before activation.
6. Provider routing is capability-aware rather than a hard-coded single-provider dependency.
7. External services are never reported as completed without evidence.