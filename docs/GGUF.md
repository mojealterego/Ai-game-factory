# GGUF Model System

## Two primary slots
- PRIMARY LARGE — deep reasoning, coding, planning and high-quality generation.
- SECONDARY SMALL — fast routing, summarization, classification, fallback and mobile-friendly workloads.

## Recorded metadata
model name, repository, source URL, version, file name, file size, quantization, context length, RAM/VRAM estimate, threads, GPU offload, checksum, license and Android/runtime compatibility.

## Hugging Face flow
Search → inspect model card → select GGUF file → verify license → inspect size/quantization → checksum/version → queue import → cloud/device target → compatibility check → install/activate.

A model is never marked installed merely because a URL was entered.
