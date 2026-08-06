# Quantization SNR & Information Capacity — Reference Spec

Foundational math for quantifying the information capacity of any
sampled, quantized signal — abstract, not tied to a specific medium.
Applies to audio, RF, imaging, sensor telemetry, control systems, or
any other channel that samples a continuous quantity into discrete
levels.

Downstream work will combine this with sample rate, channel bandwidth,
and channel count to produce a full information-throughput model
(Shannon capacity, effective bit rate, etc.).

Formulas throughout are given in exact symbolic form.

---

## 1. Core formula (ideal uniform quantizer, full-scale sinusoid)

```
SNR_dB(N) = 20·log₁₀(2^N) + 20·log₁₀(√(3/2))
          = 20·N·log₁₀(2) + 10·log₁₀(3/2)
```

Where `N` is the number of bits of an ideal uniform quantizer, with a
full-scale sinusoidal input, and quantization noise assumed white and
uniformly distributed over ±½ LSB.

The sinusoid is the canonical reference input because it maximizes RMS
for a bounded peak among smooth periodic signals of a single frequency,
making it the standard benchmark for converter datasheets across every
domain — not because the channel is audio.

Inverse — effective number of bits from measured SINAD:

```
ENOB(SINAD_dB) = (SINAD_dB − 10·log₁₀(3/2)) / (20·log₁₀(2))
```

Note: ENOB is derived from **SINAD** (signal to noise + distortion),
not pure SNR. Datasheets vary; treat SNR, SINAD, and DR as distinct.

---

## 2. Derivation (for the code comments / tests)

Signal RMS for a full-scale sinusoid of amplitude `A`:

```
V_sig_rms = A / √2
```

Quantization step for an N-bit converter with full-scale range `2A`:

```
Δ = 2A / 2^N
```

Quantization noise RMS (uniform distribution over one LSB):

```
V_noise_rms = Δ / √12
```

Ratio:

```
SNR = V_sig_rms / V_noise_rms
    = (A / √2) / (2A / (2^N · √12))
    = 2^N · √12 / (2·√2)
    = 2^N · √(12/8)
    = 2^N · √(3/2)
```

In dB:

```
SNR_dB = 20·log₁₀(2^N · √(3/2))
       = 20·log₁₀(2^N) + 20·log₁₀(√(3/2))
       = 20·N·log₁₀(2) + 10·log₁₀(3/2)
```

The two terms are independent:

- **20·N·log₁₀(2)** — from `20·log₁₀(2^N)`. Each bit doubles the ratio.
- **10·log₁₀(3/2)** — the *net* of the signal's peak-to-RMS ratio and
  the noise's peak-to-RMS ratio. Changes with signal statistics (§3).

The derivation makes no assumption about what the sampled quantity
represents — voltage, current, photon count, pressure, position,
concentration, or an abstract information-bearing variable. The result
is a pure ratio.

---

## 3. Signal-statistics-dependent constant

The `20·N·log₁₀(2)` term is fixed. Only the additive constant changes
with the input signal's crest factor (peak-to-RMS ratio). All values
assume the signal is scaled to just reach full scale without clipping.

General form:

```
SNR_dB(N, CF) = 20·N·log₁₀(2) + 10·log₁₀(3 / CF²)
```

where `CF` is the peak-to-RMS crest factor of the input signal.

| Signal (full-scale)      | Crest factor `CF` | Additive term (exact) |
|--------------------------|-------------------|-----------------------|
| Two-level (square)       | 1                 | `10·log₁₀(3)`         |
| Sinusoid                 | √2                | `10·log₁₀(3/2)`       |
| Uniform / triangle ramp  | √3                | `10·log₁₀(1) = 0`     |
| Gaussian, `k`σ headroom  | `k`               | `10·log₁₀(3/k²)`      |
| Arbitrary, measured      | `V_peak/V_rms`    | `10·log₁₀(3/CF²)`     |

For Gaussian signals, `CF` is a chosen clipping headroom (e.g. `k = 4`
for ~4σ), not an intrinsic property; document the assumption at the
call site.

For arbitrary real signals, compute `CF` empirically from the sample
record and pass it in. This makes the model work for any channel type
without hard-coding a signal class.

---

## 4. Oversampling and noise shaping (for later phases)

Not needed for the first quantifier, but the model should leave room
for these terms.

### Plain oversampling (no noise shaping)

```
SNR_dB(N, CF, OSR) = 20·N·log₁₀(2) + 10·log₁₀(3/CF²) + 10·log₁₀(OSR)
```

- `OSR = f_s / (2·BW)` — oversampling ratio, where `BW` is the
  bandwidth of interest in the sampled signal (not necessarily an
  audio band; could be an RF channel, a sensor's meaningful frequency
  range, a control-loop crossover region, etc.)
- Each doubling of OSR adds `10·log₁₀(2)` dB (i.e. `½ · 20·log₁₀(2)`,
  equivalent to half a bit)

### Δ-Σ modulator, order `L`, oversampling ratio OSR

Approximate; textbook forms vary. One common expression:

```
SNR_dB ≈ 20·N·log₁₀(2)
       + 10·log₁₀(3/CF²)
       + 10·log₁₀((2L + 1) / π^(2L))
       + 10·(2L + 1)·log₁₀(OSR)
```

Mark as approximate in docstrings. For a 1-bit modulator, `N = 1` and
the shaping term dominates.

---

## 5. Reference constants

Names and exact definitions:

```
DB_PER_BIT              = 20 · log₁₀(2)
SINE_FULLSCALE_ADD_DB   = 10 · log₁₀(3/2)
TRIANGLE_ADD_DB         = 10 · log₁₀(1)     = 0
SQUARE_ADD_DB           = 10 · log₁₀(3)
```

Crest factor constants:

```
CF_SQUARE    = 1
CF_SINE      = √2
CF_TRIANGLE  = √3
```

Convention note: the additive term is defined here as
`10·log₁₀(3/CF²)`. This is the "signal power over quantization noise
power" formulation and is internally consistent across all crest
factors. Some references quote a "sinusoid" constant of
`20·log₁₀(√(3/2))`, which is algebraically identical to
`10·log₁₀(3/2)`.

---

## 6. Suggested API surface

Language-agnostic; adapt to the project's stack (TS/Python/etc.).
Naming is generic — no `audio_`, `voltage_`, or medium-specific
prefixes. The module operates on dimensionless bits, ratios, and dB.

```
snr_db_from_bits(bits, crest_factor = CF_SINE) -> number
    Returns theoretical SNR for an ideal N-bit uniform quantizer.
    Formula: 20·bits·log₁₀(2) + 10·log₁₀(3 / crest_factor²)

bits_from_snr_db(snr_db, crest_factor = CF_SINE) -> number
    Returns ENOB (may be fractional).
    Formula: (snr_db − 10·log₁₀(3/CF²)) / (20·log₁₀(2))

snr_db_oversampled(bits, osr, crest_factor = CF_SINE) -> number
    Adds 10·log₁₀(osr) process gain.

snr_db_delta_sigma(bits, osr, order, crest_factor = CF_SINE) -> number
    Approximate Δ-Σ result. Mark as approximate in docstring.

snr_linear_from_db(snr_db) -> number
    Returns 10^(snr_db / 10). Power ratio, not amplitude ratio.

snr_db_from_linear(snr_linear) -> number
    Returns 10·log₁₀(snr_linear).

shannon_capacity(bandwidth_hz, snr_linear) -> number
    Returns bandwidth_hz · log₂(1 + snr_linear), in bits per second.
    Accepts `bandwidth_hz` in any consistent frequency unit; the
    result has the same time-inverse unit.
```

Design notes:

- Default `crest_factor = √2` so the no-argument call returns the
  familiar sinusoid result. This is a convention, not a domain
  assumption.
- Accept `crest_factor` as a number, not an enum, so arbitrary signal
  statistics work. Provide named constants (`CF_SINE`, `CF_TRIANGLE`,
  `CF_SQUARE`) as conveniences.
- Do not conflate SNR and SINAD in the API. If you add a SINAD-based
  ENOB helper, name it explicitly (`enob_from_sinad_db`).
- `bandwidth_hz` is named for the SI unit but the function is unit-
  agnostic; the caller is responsible for consistency. If the project
  standardizes on a `Frequency` or `Rate` type elsewhere, wire it
  through.

---

## 7. Test cases

Expected values are given as exact symbolic expressions.

| Call                                    | Expected value (exact)                          |
|-----------------------------------------|-------------------------------------------------|
| `snr_db_from_bits(0)`                   | `10·log₁₀(3/2)`                                 |
| `snr_db_from_bits(1)`                   | `20·log₁₀(2) + 10·log₁₀(3/2)`                   |
| `snr_db_from_bits(N)`                   | `20·N·log₁₀(2) + 10·log₁₀(3/2)`                 |
| `snr_db_from_bits(N, CF_TRIANGLE)`      | `20·N·log₁₀(2)`                                 |
| `snr_db_from_bits(N, CF_SQUARE)`        | `20·N·log₁₀(2) + 10·log₁₀(3)`                   |
| `bits_from_snr_db(snr_db_from_bits(N))` | `N`                                             |
| `snr_db_oversampled(N, OSR)`            | `snr_db_from_bits(N) + 10·log₁₀(OSR)`           |
| `snr_db_oversampled(N, 1)`              | `snr_db_from_bits(N)`                           |
| `snr_linear_from_db(0)`                 | `1`                                             |
| `snr_linear_from_db(10)`                | `10`                                            |
| `shannon_capacity(BW, 1)`               | `BW`   (since log₂(2) = 1)                      |
| `shannon_capacity(BW, 0)`               | `0`                                             |

Property tests:

- Round-trip: `bits_from_snr_db(snr_db_from_bits(n)) == n` for
  `n ∈ [1, 32]`.
- dB round-trip: `snr_db_from_linear(snr_linear_from_db(x)) == x` for
  `x ∈ [−60, 200]`.
- Per-bit delta: `snr_db_from_bits(n+1) − snr_db_from_bits(n) ==
  20·log₁₀(2)` for all `n`.
- OSR doubling: `snr_db_oversampled(n, 2·k) − snr_db_oversampled(n, k)
  == 10·log₁₀(2)` for all `n`, `k`.
- Slope independence of crest factor: for any two crest factors `CF₁`,
  `CF₂`, `snr_db_from_bits(n, CF₁) − snr_db_from_bits(n, CF₂)` is
  independent of `n`.
- Shannon monotonicity: `shannon_capacity(BW, s₁) <
  shannon_capacity(BW, s₂)` whenever `s₁ < s₂` and `BW > 0`.

---

## 8. Information-capacity roadmap

This module is the first quantifier. Downstream pieces that build on
it, in order of dependency:

1. **Power-ratio conversions** — `snr_linear ↔ snr_db`. Included in
   the API above because Shannon needs a linear ratio.
2. **Shannon channel capacity** — `C = BW · log₂(1 + SNR_linear)`,
   in bits per unit time. Included in the API above.
3. **Sampled information rate** — for a discrete channel sampled at
   `f_s` with effective resolution `ENOB`, the raw information rate is
   `f_s · ENOB` bits per unit time, ignoring framing and correlation
   between samples. Extend with:
   - source correlation / redundancy (real signals carry less than
     `f_s · ENOB` bits of new information per sample);
   - framing, sync, and error-correction overhead;
   - channel-count multiplexing.
4. **Dimensional / observer-dependent adjustments** — for channels
   where the meaningful quantity is not the raw sampled variable but
   a weighted response (e.g. photometric weighting of a light sensor,
   perceptual weighting of an acoustic sensor, action-spectrum
   weighting of a chemical sensor), a separate weighting module
   consumes this one's output. Keep those out of §1–§3.
5. **Non-uniform quantization** — companded (μ-law, A-law), floating-
   point, and logarithmic quantizers change the noise distribution
   relative to signal amplitude. The uniform-quantizer result becomes
   a lower bound on effective SNR near full scale and an upper bound
   near the noise floor. Model as a separate module.

Keep §1–§3 pure: no channel model, no perceptual weighting, no
medium-specific assumptions. Every extension is a layer that consumes
the pure result.

---

## 9. References for citations in code / commits

- Shannon, C. E. (1948). "A Mathematical Theory of Communication."
  *Bell System Technical Journal.* Origin of channel capacity.
- Bennett, W. R. (1948). "Spectra of Quantized Signals." *Bell System
  Technical Journal.* Original derivation of the uniform-quantization
  noise model.
- Widrow, B. & Kollár, I. (2008). *Quantization Noise.* Cambridge UP.
  Modern reference on when the uniform-noise assumption holds.
- Kester, W. (2009). "Taking the Mystery out of the Infamous Formula,
  SNR = 6.02N + 1.76dB." Analog Devices MT-001.
  https://www.analog.com/media/en/training-seminars/tutorials/MT-001.pdf
- Schreier, R. & Temes, G. (2005). *Understanding Delta-Sigma Data
  Converters.* Wiley. For §4 approximations.
- Cover, T. M. & Thomas, J. A. (2006). *Elements of Information
  Theory*, 2nd ed. Wiley. For §8 extensions to source correlation
  and channel coding.
