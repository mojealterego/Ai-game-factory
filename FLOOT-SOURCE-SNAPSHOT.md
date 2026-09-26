# AI GAME FACTORY — Floot Source Snapshot

Current exported source for the Android-first AI GAME FACTORY mobile command center.

## Enhanced surfaces
- Multi-provider AI routing catalog
- No-code Agent Builder
- Primary large GGUF + secondary small GGUF slots
- Hugging Face GGUF discovery, verification and import/download queue
- Dashboard, Projects, AI Agents, Game DNA, Story Generator, Builder Hub
- Asset, Audio, 3D, GitHub, Cloud, Build Center, QA, Logs and Settings

## Provider catalog
OpenAI, Google Gemini, Anthropic Claude, xAI Grok, Mistral, Cohere, Groq, DeepSeek, Qwen, OpenRouter, Together AI, Fireworks AI, Perplexity, Hugging Face, Replicate, Fal.ai, Stability AI, ElevenLabs, Runway, Kling, Luma, Azure OpenAI, AWS Bedrock, Google Vertex AI and custom OpenAI-compatible endpoints.

## GGUF
PRIMARY is intended for large/deep workloads. SECONDARY is intended for fast routing, summarization and fallback. Both expose model size, quantization, context, RAM/VRAM, threads, GPU offload and checksum concepts. Actual Android execution depends on the runtime and device.

## Security
Provider secrets must remain server-side. The UI deliberately does not expose or embed API keys.

## Native builds
This repository is a source snapshot. APK/AAB availability must be based on an actual verified native build artifact, not a source commit.
