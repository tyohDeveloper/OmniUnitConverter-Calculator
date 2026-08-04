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

**human_perception**:
luminous_flux, illuminance, luminance, phon (within logarithmic),
EV/stop (within logarithmic)

**biological_response**:
radiation_dose, equivalent_dose, radiation_exposure

**not human-response** (stays plain SI_QUANTITY, no domain):
sound_pressure (physical), refractive_power (optical property),
lightbulb (engineering convention)

Edge cases:

- `catalytic_activity` — biological, but not response-oriented
- Perceived temperature ("feels-like") — perceptual but derived, not
  its own category
- `photon` energy — physical stimulus, not response

## Scope

Deferred. Framework work is complete without this; it's a UX and
semantic-modeling refinement, not a correctness fix.
