# Human-response semantic domain metadata

## Observation

The current category taxonomy uses `family` for conversion flavor
(SI_QUANTITY, DIMENSIONLESS_RATIO, DATA_QUANTITY, FUEL_ECONOMY,
NUMERIC_FUNCTION, SYMBOLIC) but has no way to express semantic
grouping across categories that share the same family. Several
categories fall into a "human response" cluster that the framework
cannot currently name:

**Perceptual response** (senses, often logarithmic):

- `luminous_flux`, `illuminance`, `luminance` — vision system's
  response to radiation across wavelengths (photopic weighting via
  V(λ)); luminous_flux is the SI quantity of vision-weighted power.
- Logarithmic units for perception: dB (SPL), phon (loudness), EV/
  stops (photographic exposure adapted to visual dynamic range).

**Physiological effect / damage** (dose response):

- `radiation_dose` (Gy) — absorbed energy per mass
- `equivalent_dose` (Sv) — biological equivalent, weighted for
  radiation type damage
- `radiation_exposure` — ionization of air per mass

All of these are SI_QUANTITY dimensionally, but semantically they
are physical measures of *how humans respond* to the underlying
stimulus, not the stimulus itself. `sound_pressure` (physics) vs
`phon` (perception) is a good example of the distinction.

## Proposal (not yet decided)

Add optional `semanticDomain` metadata orthogonal to `family`. Value
could be a string tag like `'human_perception'`,
`'biological_response'`, `'ionizing_radiation_dose'`.

Alternative: restructure `family` into a compound
`{ primary: 'SI_QUANTITY', domain: 'HUMAN_PERCEPTION' }`. More
expressive, but larger schema change.

Recommendation: option A (additive, orthogonal, easier to migrate).

## What this would enable

- Direct-pane "See related quantities" grouping by domain instead of
  by dimensions alone.
- Documentation and localization can flag "this is a perceptual
  quantity, not a physical one."
- Future perceptual-quantity subcategories (weighted dB variants:
  dBA/dBC; color-space luminance vs radiance) get a natural home.

## Categories to classify (rough draft)

**human_perception** (specifically wired to human sensory response):
luminous_flux, illuminance, luminance (all use the V(λ) photopic
curve derived from human visual response), phon (within logarithmic,
auditory loudness with A-weighting or equal-loudness curves), EV/stop
(within logarithmic, photographic exposure adapted to visual dynamic
range).

**biological_response** (dose/exposure to biological tissue, not
specifically human):
radiation_dose, equivalent_dose, radiation_exposure. Note: these
apply to biological tissue generally, not just humans — Sv weighting
factors use human tissue as reference, but the underlying concept
(absorbed energy / biological damage) applies to any living tissue.
So `biological_response` is the more accurate framing than a broader
`human_response` umbrella that lumps these with perception.

**Framework implication**: it may be worth having TWO domains rather
than collapsing into one. Perception (V(λ) / A-weighting) is
fundamentally about *how the human sensory system responds to a
physical stimulus* — the domain is inseparable from human anatomy.
Dose (Gy/Sv/Coulomb-per-kg) is fundamentally about *how living
tissue receives ionizing radiation* — humans are the reference but
not the whole story. Different phenomena, different reference frames,
different traceable standards.

**not domain-flagged** (stays plain SI_QUANTITY, no domain):
sound_pressure (physical pressure oscillation, distinct from phon
which IS the perceptual layer), refractive_power (optical property
of lens systems), lightbulb (engineering shorthand for equivalent-
power ratings, not a perceptual quantity per se).

Edge cases:

- `catalytic_activity` — biological rate (mol/s of substrate turnover)
  but not response-oriented in the perceptual/dose sense. Probably
  stays plain SI_QUANTITY. Could argue for a `biochemistry_rate`
  domain in the future if more categories join it.
- Perceived temperature ("feels-like", wind-chill, heat-index) —
  perceptual but derived, not its own category yet.
- `photon` energy — physical stimulus (individual photon carrier
  energy), not a response quantity. Stays plain SI_QUANTITY.

## Scope

Deferred. Framework work is complete without this; it's a UX and
semantic-modeling refinement, not a correctness fix.
