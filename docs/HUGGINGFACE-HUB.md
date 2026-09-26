# 11. Hugging Face Hub

AI GAME FACTORY treats Hugging Face as a real model-ingestion subsystem rather than a navigation button.

## Pipeline

`Search → Model Card → Files → Compatibility → License → Quantization → Download → Verify → Import → Register → Activate`

The repository implements this order in `packages/factory-core/src/huggingface-hub.ts`.

Hugging Face model repositories expose model cards, metadata such as license/task/library/tags, and model files. The Hub also provides programmatic APIs and clients for repository access and model operations. citeturn0search0turn0search2turn0search6

## Stage contracts

| Stage | Factory responsibility | Completion evidence |
|---|---|---|
| Search | Discover exact repo | repository ID / search result |
| Model Card | Read model metadata | revision + card metadata |
| Files | Enumerate files and select artifact | exact file path + format |
| Compatibility | Check Android/cloud requirements | compatibility result |
| License | Establish license | license identifier/link |
| Quantization | Detect format/quantization | GGUF/quantization metadata |
| Download | Retrieve selected artifact | local/cloud path + transfer result |
| Verify | Verify integrity | checksum verification |
| Import | Create Factory model identity | imported model ID |
| Register | Register in Model Factory | registered model record |
| Activate | Activate runtime | active lifecycle state |

Hugging Face model cards are Markdown `README.md` files with YAML metadata; license metadata can be declared there. citeturn0search0turn0search1

## GGUF handling

For local model registration, the current pipeline requires the selected artifact to be GGUF. This keeps the local runtime contract explicit instead of silently pretending that arbitrary Hub files can be loaded by a GGUF runtime.

The selected file retains:
- source URL
- exact repository/file path
- revision
- quantization
- size
- checksum
- license
- compatibility
- installed path

## Security and reproducibility

- A URL is not proof of download.
- A downloaded file is not proof of integrity until verification succeeds.
- A verified file is not registered until import succeeds.
- A registered model is not active until activation succeeds.
- License information remains attached to provenance.
- Provider credentials are not stored in the Hub metadata.
- External operations are represented by adapter contracts and evidence rather than fabricated completion.

## Android/cloud

The same pipeline supports `android` and `cloud` targets. Android remains the control/approval surface; heavy downloads and model execution can be delegated to cloud workers.

## Official references

- Hugging Face Hub API documentation
- Hugging Face Model Cards
- Hugging Face Models documentation
- Hugging Face license documentation
