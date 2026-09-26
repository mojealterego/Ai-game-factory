# 3D Asset Factory

## Unified pipeline

Text/Image/Multi-view/Reference
-> Generate
-> Inspect
-> Segment
-> Complete
-> Retopologize
-> Texture
-> UV/Material
-> Rig
-> Retarget
-> LOD
-> Collision
-> Optimize
-> Validate
-> Export

## Asset classes

- characters
- creatures
- NPCs
- props
- weapons
- vehicles
- buildings
- environments
- modular kits
- foliage
- VFX meshes

## Profiles

- Android Low
- Android High
- Web
- PC
- High-end cinematic
- Custom

Each profile specifies polygon, texture, shader, draw-call, memory and animation budgets.

## Tripo adapter

The Tripo adapter maps Factory jobs to asynchronous Tripo tasks and tracks task IDs, progress, output URLs, errors, credits and provenance. It must support text-to-model, image-to-model, multiview-to-model, texture, mesh operations and rigging/animation where the connected account exposes them.

## Validation

No 3D asset becomes release-ready until geometry, materials, UVs, scale, pivot, collision, LOD and license/provenance checks pass.
