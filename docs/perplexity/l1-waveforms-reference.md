# Common L1 / Wire-Level Waveforms — Reference

> Context: prior discussion covered (1) waveforms used in modern digital communications (OFDM, APSK, PAM, coherent DP-QAM, GFSK, CSS, DSSS, etc.) and (2) the OSI 7-layer model, confirming L1 = physical layer. This document answers: **beyond sine/square/triangle, what waveforms actually appear on real L1 wires and fibers?**

## Short answer

Sine, square, and triangle are the *primitives*. The waveform on a real wire or fiber is almost always:

> **a chosen pulse shape × a chosen symbol alphabet, clocked at the symbol rate.**

- **Pulse shape** decides the spectrum (RRC, Gaussian, rectangular, chirp, …).
- **Symbol alphabet** decides how many bits per symbol (NRZ = 2 levels, PAM-4 = 4 levels, 256-QAM = 256 points in the I/Q plane, 256-APSK = 256 points on rings, …).
- **Line coding** wrapped around it (8b/10b, 64b/66b, Manchester, MLT-3, HDB3, …) guarantees transitions and DC balance so the receiver can recover the clock.

A true square wave has infinite bandwidth (all odd harmonics of a sine), so no real high-speed link transmits one — it gets filtered into something rounder the moment it hits a channel.

---

## 1. The idealized "textbook" waveforms

These are building blocks, but rarely the transmitted signal itself.

| Shape | Where it actually appears on a wire |
|---|---|
| **Sine** | RF carriers, clock references, single-tone test signals, the subcarriers inside OFDM (each subcarrier is a sine) |
| **Square** | Digital logic *inside* a chip or on very short traces (I²C, SPI, parallel buses); clocks; the conceptual "before pulse shaping" version of NRZ |
| **Triangle / sawtooth** | Ramps in PLLs, sweep generators, chirp modulation building blocks, DAC test patterns — almost never as a data-carrying line signal |

---

## 2. Baseband line codes — the shapes actually clocked onto wires and fibers

These are what "the waveform on the wire" almost always means in Ethernet, USB, PCIe, SATA, HDMI, DisplayPort, fiber optics, DSL, etc.

| Line code | Shape | Where used |
|---|---|---|
| **NRZ** (Non-Return-to-Zero) | Two levels, one bit per symbol. Looks like a filtered square wave. | 10/100/1000BASE-T (partially), SATA, PCIe Gen1–5, USB up through 3.2, 10G/25G Ethernet SerDes, most fiber up to 25 Gb/s per lane |
| **NRZI** (NRZ-Inverted) | Level flips on a 1, stays on a 0 (or vice versa) — encodes transitions, not levels. | USB 1.x/2.0, Fast Ethernet (100BASE-FX), FDDI |
| **RZ** (Return-to-Zero) | Pulse returns to zero mid-bit — guaranteed edge per bit. | Some optical links, older telecom |
| **Manchester** | Every bit is a mid-bit transition (up = 1, down = 0). Self-clocking. | 10BASE-T Ethernet, consumer IR remotes, RFID, some automotive/industrial buses |
| **Differential Manchester** | Transition at bit start encodes the bit; mid-bit transition is always present. | Token Ring, some avionics buses (MIL-STD-1553) |
| **AMI** (Alternate Mark Inversion) | Three levels: 0 = 0 V, 1 = alternating +V/–V. Keeps DC balance. | T1/E1 telecom lines |
| **HDB3 / B8ZS** | AMI with bit-stuffing tricks to avoid long runs of zeros. | E1 (HDB3), T1 (B8ZS) |
| **MLT-3** | Three levels cycled 0 → +V → 0 → –V → 0 on each 1. Slows the fundamental frequency for the same bit rate. | 100BASE-TX Ethernet over Cat5 |
| **PAM-2 / PAM-4 / PAM-8 / PAM-16** | Multi-level pulse amplitude modulation. PAM-4 = 4 levels, 2 bits/symbol. | 1000BASE-T uses PAM-5; 2.5/5/10GBASE-T uses PAM-16; 100/200/400/800GbE lanes and DDR5 memory use PAM-4 |
| **8b/10b, 64b/66b, 128b/130b** | Not shapes — coding layers that guarantee transitions and DC balance before the line driver emits NRZ. | PCIe, SATA, Fibre Channel, USB 3, most SerDes |

---

## 3. Pulse-shaped and specially-shaped waveforms (RF and high-speed wireline)

Once symbol rates get high, the transmitter deliberately shapes each pulse so the spectrum is compact and neighboring symbols don't smear into each other (ISI control).

| Shape | What it is | Where used |
|---|---|---|
| **Raised cosine / root-raised-cosine (RRC) pulse** | The "sinc with the tails tamed." The standard pulse shape for QAM/PSK on RF and coherent optical links. | Basically every single-carrier RF modem, DVB-S2/S2X, cable, microwave, coherent 100G+ optics |
| **Gaussian pulse** | Bell-shaped; smooth spectrum, no ringing, but some ISI. | GMSK (GSM), GFSK (Bluetooth), many short-range radios |
| **Sinc pulse** | The theoretical zero-ISI ideal. Not physically realizable, only approximated. | Reference case for Nyquist signaling |
| **Chirp** | A sine whose frequency ramps linearly across the symbol. | LoRa (CSS), radar, some sonar, FMCW |
| **OFDM symbol** | Sum of hundreds/thousands of sines, each QAM-modulated, over one symbol period. Looks noise-like on a scope. | Wi-Fi, LTE/5G, DVB-T2, DOCSIS 3.1, VDSL/G.fast (as DMT) |
| **PWM (Pulse-Width Modulation)** | Square-ish with variable duty cycle; encodes value in width. | Servo control, DMX-adjacent lighting, class-D audio, some sensor buses — rarely carries "network" data but common on wires |
| **PPM (Pulse-Position Modulation)** | Encodes value in *when* the pulse arrives inside a slot. | IR remotes, some optical wireless, ultra-wideband |
| **Duobinary / PAM-3 (MLT-3-adjacent)** | Deliberately introduce controlled ISI to halve bandwidth. | Some 100G optical, older telecom |

---

## 4. What real modern links actually look like on a scope

| Link | Waveform on the wire |
|---|---|
| **Cat 6 Ethernet at 10G (10GBASE-T)** | PAM-16, heavily equalized — fuzzy multi-level steps |
| **PCIe Gen 6** | PAM-4, ~32 GBaud |
| **400G fiber, short reach** | PAM-4 optical, ~53 GBaud/lane |
| **400G fiber, long haul** | Coherent DP-16QAM/64QAM with RRC pulse shaping — looks like colored noise until demodulated |
| **Wi-Fi 7** | OFDM: sum of ~4000 sines, each carrying up to 4096-QAM |
| **Bluetooth LE** | GFSK: a sine whose frequency wobbles between two values, smoothed by a Gaussian filter |
| **LoRa** | A chirp sweeping across the band each symbol |
| **USB 2.0** | NRZI on a differential pair |
| **SATA / PCIe Gen1–5** | NRZ on a differential pair, 8b/10b or 128b/130b coded |
| **100BASE-TX (Cat5)** | MLT-3 |
| **10BASE-T (original Ethernet-over-copper)** | Manchester |
| **T1 / E1 telecom** | AMI with B8ZS / HDB3 |

---

## 5. Mental model to carry forward

1. **Textbook shapes** (sine, square, triangle) are primitives — they show up as clocks, carriers, and building blocks, not as data-carrying line signals on modern links.
2. **On wireline digital links**, the waveform is a **line code** (NRZ, NRZI, Manchester, MLT-3, PAM-N, …) — the interesting engineering is in the *symbol alphabet* (how many voltage/optical levels) and the *coding* (8b/10b, 64b/66b, HDB3) that keeps the receiver's clock recovery and DC balance happy.
3. **On RF and coherent optical links**, the waveform is a **pulse-shaped symbol** (RRC, Gaussian, chirp, OFDM composite) carrying a **constellation** (BPSK, QPSK, QAM, APSK). Pulse shape sets the spectrum; constellation sets the bits/symbol.
4. **OFDM is the outlier** — instead of one shaped pulse per symbol, it transmits a whole comb of QAM-modulated sines simultaneously. On a scope it looks like noise.

---

## Cross-reference to related concepts

- **OSI Layer 1 (physical)**: everything in this document lives here.
- **Layer 2 (data link)** decides *which* bits get sent (framing, MAC, scheduling); L1 decides *how* those bits become a signal.
- **Modulation vs. waveform**: in modern usage, "waveform" usually means the composite PHY signal (multiplexing + pulse shape); "modulation" means the constellation mapped onto it. Most real systems are a pairing of the two — e.g. "CP-OFDM with 256-QAM," "single-carrier RRC-shaped 64-APSK," "PAM-4 NRZ."
