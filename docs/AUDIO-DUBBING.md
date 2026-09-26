# Audio / Dubbing Factory

## Scope

AI GAME FACTORY treats audio as a first-class production domain:

- music
- soundtrack
- ambient
- SFX
- footsteps
- UI sounds
- cinematic sound
- voice generation
- dubbing
- lip-sync
- dialogue timing
- multilingual voice
- ElevenLabs
- provider routing

## Canonical pipeline

```text
Brief → Reference → Generation → Variation → Selection → Editing
→ Mix → Dialogue Timing → Localization → Lip-Sync → Mastering
→ Metadata → Validation → Engine Export
```

## Dialogue timing

Dialogue lines carry character ID, text, timing, language, voice ID, emotion and pronunciation hints. This creates a typed bridge between Narrative/Cinematic systems and audio production.

## Multilingual voice

The pipeline supports multiple target language tracks and BCP-47 language/locale identifiers where supported by a provider. Voice identity and dialogue continuity remain part of asset lineage.

## Provider routing

Audio routing is capability-based. Music, SFX, voice, dubbing and lip-sync can use different providers. Policies can constrain allowed/denied/preferred providers, latency, cost, languages, commercial-use requirements and lip-sync requirements.

## ElevenLabs

The repository contains an ElevenLabs adapter contract. Current official documentation supports Text-to-Speech and Dubbing APIs; multilingual TTS and dubbing are exposed through the provider contract. ElevenLabs documents dubbing across 90+ languages and timing/emotion preservation. Lip-sync is deliberately not declared as an ElevenLabs Dubbing capability; it must be routed to a compatible provider.

## Validation

Release gates can check timing, language, loudness, clipping, sample rate, channels, voice continuity, lip-sync alignment and provenance/license.

## Security

Provider API keys are secret-manager references only. They are never stored in Android client state, AudioSpec, AudioJob or generated artifacts.

The Factory only marks an external provider operation complete after a worker/adapter returns evidence.
