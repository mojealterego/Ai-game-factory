# GGUF Model System

## Two primary slots
- PRIMARY LARGE — deep reasoning, coding, planning and high-quality generation.
- SECONDARY SMALL — fast routing, summarization, classification, fallback and mobile-friendly workloads.

## Recorded metadata
model name, repository, source URL, version, file name, file size, quantization, context length, RAM/VRAM estimate, threads, GPU offload, checksum, license and Android/runtime compatibility.

## Hugging Face flow
Search → inspect model card → select GGUF file → verify license → inspect size/quantization → checksum/version → queue import → cloud/device target → compatibility check → install/activate.

A model is never marked installed merely because a URL was entered.

## AI Model Factory

The GGUF registry is now part of the broader AI Model Factory. The factory separates:

- **Cloud model providers:** OpenAI, Gemini, Claude, Grok, Mistral, Cohere, Groq, DeepSeek, Qwen, OpenRouter, Together, Fireworks, Perplexity, Azure OpenAI, AWS Bedrock, Vertex AI and custom OpenAI-compatible endpoints.
- **Generative media providers:** Hugging Face, Replicate, Fal, Stability AI plus generic image, video, music and voice provider slots.
- **Local / hybrid models:** GGUF chat, code, image, video, embedding and speech models.

Each registered model carries identity, model kind, provider, runtime, quantization/format, size, context, RAM/VRAM, checksum, license, source, version/revision and Android/cloud compatibility. Lifecycle state is evidence-driven: download → install → activate → deactivate → delete.

### Routing

Model routing is capability-aware and can honor preferred/denied providers, runtime constraints and project requirements. A preferred compatible provider is selected first; local models can act as fallback when no eligible cloud route exists.

### Hugging Face

Hugging Face is treated as both a model source and an inference layer. Its current public documentation supports model discovery, model cards/licensing, file downloads, and unified inference through multiple providers. The factory therefore records the source/model revision and does not treat a model URL alone as proof of installation. citeturn0search1turn0search2turn0search3