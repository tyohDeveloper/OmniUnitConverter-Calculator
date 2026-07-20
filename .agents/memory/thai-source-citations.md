---
name: Thai official source citations
description: Which Thai government hosts are reachable for citing weights/measures law, and why baht (weight) cannot cite Thai law.
---

# Thai official source citations

- Reachable official host: `https://onestopservice.ditp.go.th/download/file/2dit.pdf` serves the full Weights and Measures Act B.E. 2542 (Thai). Requires a browser User-Agent for curl (plain curl gets 403); browsers load it fine. Content verified: schedule under Section 9 defines rai = 1,600 m², ngan = 400 m², square wa = 4 m².
- Blocked/unreachable from the build environment (as of July 2026): krisdika.go.th, law.krisdika.go.th, cbwmthai.org, ratchakitcha.soc.go.th (403 even with UA), dl.parliament.go.th, e-library.moc.go.th, infocenter.oic.go.th.
- **Why baht stays on Wikipedia (Tical):** no Thai law defines the 15.244 g gold-trade baht. The B.E. 2542 Act's traditional weight schedule lists only hap luang (60 kg), chang luang (600 g), and carat luang. The 1923 Act (B.E. 2466) defined baht = 15 g exactly, which contradicts the app's 0.015244 kg factor (the gold-bullion value). The 15.244 g figure appears in a Royal Gazette commerce notification (ratchakitcha, blocked). Citing either act for 15.244 g would be inaccurate.
- **How to apply:** if ratchakitcha.soc.go.th becomes reachable, `DATA/PDF/2552/E/051/61.PDF` is the gazette notification defining gold bar 1 baht; verify content before citing for baht_th.
