---
title: Add s⁻¹ as default frequency unit
---
# Add s⁻¹ as Default Frequency Unit

## What & Why
The frequency category currently lists Hz as the base/default unit, but s⁻¹ is the correct SI dimensional expression and should be the default. Hz should remain available as a selectable option. Since 1 Hz = 1 s⁻¹ they share the same conversion factor.

## Done looks like
- `s⁻¹` appears as a selectable unit in the frequency unit picker
- `s⁻¹` is the default unit shown when the frequency category is first selected
- `Hz` remains in the list as a selectable option
- Conversions between `s⁻¹` and all other frequency units are correct

## Out of scope
- Changes to any other unit category
- Changing the internal base unit used for conversion arithmetic (Hz can remain the internal base)

## Tasks
1. Add `s⁻¹` as an entry in the frequency units list with factor 1, and set it as the default display unit for the frequency category.

## Relevant files
- `client/src/data/conversion/frequency.json`