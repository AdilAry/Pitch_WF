
## 1. Business Turku: "New in Southwest Finland" radar

**Brief.** Every month hundreds of new companies register in Varsinais-Suomi, and Business Turku's advisors hear about most of them too late, if at all. Advisors currently find newcomers by word of mouth and events, so free services (funding advice, internationalisation, recruiting help) reach the same familiar firms. Business Turku wants a tool that spots new and changing companies in the region each week, ranks them by how likely they are to benefit from a specific service, and drafts a short, personal first contact for the advisor to send.

**Mentor answers**

- **Users:** about 30 business advisors, each owning a sector (ICT, life science, maritime, food). They work from Outlook and a CRM, and they won't open another dashboard daily, so a weekly digest wins.
- **Data:** use the public trade register only. Watch for new registrations, changes in main line of business (NACE), new auxiliary names and address moves into the region. Contact details aren't in the open data; the advisor adds those.
- **Wow:** the digest says *why* each company is on the list ("registered 12 Oct, NACE 62.01, moved its registered address to Turku on 3 Oct") and links each claim back to the register entry. No black-box scores.
- **Business angle:** advisors' time is the scarce resource. If 15 minutes a week replaces hours of searching and doubles first meetings with firms under one year old, the region gets more companies through the risky first years. That is Business Turku's performance metric towards the city.

**Judging criteria**

1. Ranking quality: are the top 10 a week genuinely relevant to a named service?
2. Explainability: every reason is traceable to a register field.
3. Fit with how advisors already work (email digest, CRM export).
4. Responsible use of data: no scraping beyond the open API, and personal names handled carefully.

**Data**

| Source | What you get | Access |
| --- | --- | --- |
| [PRH open data, YTJ companies API v3](https://avoindata.prh.fi/en/info/swagger-ui) | Companies in the Trade Register: name, business ID, form, NACE, address, registration date; filter by location, mainBusinessLine, registrationDateStart. Updated daily. | Free JSON API, no key, CC BY 4.0. Excludes sole traders, emails and phone numbers. |
| [PRH registered notifications API](https://avoindata.prh.fi/en/info/swagger-ui) (same page) | Register changes since 7 Nov 2014: date and subject of each entry. | Same terms. |
| [Statistics Finland, business demography table 157m](https://statfin.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__bdem/157m.px/) | Estimated enterprise openings and closures by region, 2019Q1–2026Q1, for regional context and baselines. | PxWeb API, no key. The 8 June 2026 database change shortened API identifiers, so take query codes from the current table. |

## 2. Turku Energia: 48-hour demand and flexibility planner

**Brief.** Electric heating and EV charging make household electricity demand swing harder with the weather, and the peaks are what cost an energy company money. Turku Energia's trading and network teams forecast tomorrow's demand in spreadsheets and gut feel, and they have no simple way to tell customers when shifting load would actually help. The company wants a forecaster for the next 48 hours by user group that also flags the hours where moving flexible load (EV charging, water heaters) would cut the peak, with a plain-language reason.

**Mentor answers**

- **Users:** two groups. Traders and grid planners want hourly numbers with uncertainty bands. Customers in the Turku Energia app want one sentence: "charge after 23:00 tonight".
- **Data:** you won't get our meter data. Use Fingrid's national hourly consumption by user group as a stand-in and treat Turku weather as the driver; the method transfers to our own data later.
- **Wow:** a forecast that beats the naive "same hour last week" baseline on a held-out cold snap, and explains itself ("−8 °C overnight, electric-heated houses +14 %"). Bonus if it runs offline on a modest laptop.
- **Business angle:** every MWh shaved off a peak hour is bought cheaper and stresses the grid less. A customer nudge that people actually follow is worth more than a perfect forecast nobody acts on.

**Judging criteria**

1. Forecast accuracy against a stated baseline (MAPE or MAE on a held-out period you name).
2. Usefulness of the flexibility advice: clear hours, clear reason, realistic load shift.
3. Honesty about uncertainty and the gap between national stand-in data and a city utility.
4. Engineering: reproducible pipeline, runs without cloud services.

**Data**

| Source | What you get | Access |
| --- | --- | --- |
| [Fingrid dataset 360: consumption by user group](https://data.fingrid.fi/en/datasets/360) | Hourly aggregate metering in Finnish distribution networks for 14 user groups, including electric-heated small houses (BE02) and EV charging points (BE12). From 1 Aug 2023. | Free REST API after registration (free key). CC BY. |
| [Fingrid dataset 124: electricity consumption in Finland](https://data.fingrid.fi/en/datasets/124) | National hourly consumption, a long history for training. | Same key. CC BY 4.0. |
| [Fingrid dataset 166: consumption forecast](https://data.fingrid.fi/en/datasets/166) | Fingrid's own 72-hour forecast, a ready-made benchmark to beat or match. | Same key. |
| [FMI open data (WFS)](https://en.ilmatieteenlaitos.fi/open-data-manual-fmi-wfs-services) | Hourly weather observations and forecasts for Turku (stored queries such as fmi::observations::weather::hourly::simple). Times in UTC. | No key. Python client: [fmiopendata](https://github.com/pnuu/fmiopendata). |

## 3. Traficom (NCSC-FI): "Patch this first" for small organisations

**Brief.** Traficom's National Cyber Security Centre publishes vulnerability alerts, but a 12-person accounting firm or a municipal school has no one who can turn a list of CVE numbers into a decision. These organisations patch whatever is loudest, or nothing. Traficom wants an assistant that takes a plain software inventory (typed in, pasted from a spreadsheet, or an SBOM), matches it to known vulnerabilities, and returns a short ranked to-do list in Finnish or English: what to fix this week, why, and how.

**Mentor answers**

- **Users:** the "accidental IT person" at a small company, school or association: an office manager or a teacher. No security vocabulary, about 30 minutes a month for this.
- **Data:** public vulnerability data only. Combine three signals: severity (CVSS from NVD), probability of exploitation (EPSS) and confirmed exploitation (CISA KEV). The inventory is the user's own and must not leave their machine unredacted.
- **Wow:** paste "Windows 10, Office 2019, a Fortinet VPN, WordPress 6.2" and get three actions in plain Finnish, each with the reason ("attackers are already using this flaw") and a link to the vendor fix. Bonus: it says what it couldn't match.
- **Business angle:** for Traficom it's public value: fewer ransomware cases in SMEs and the public sector, and NCSC-FI advice that reaches people who never read advisories. It must be free, trustworthy and hard to misread.

**Judging criteria**

1. Correct prioritisation: the KEV-listed, high-EPSS items really come first, and the ranking is explained.
2. Plain-language quality for a non-expert, in Finnish and English.
3. Privacy and security of the tool itself: inventory handling, no secrets in the client, safe use of LLMs.
4. Matching accuracy from messy product names to CPE/CVE, with unmatched items shown honestly.

**Data**

| Source | What you get | Access |
| --- | --- | --- |
| [CISA Known Exploited Vulnerabilities catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | CVEs with confirmed exploitation, vendor, product, date added, ransomware flag. [JSON feed](https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json), mirrored at [cisagov/kev-data](https://github.com/cisagov/kev-data). | Free, no key. |
| [FIRST EPSS API](https://api.first.org/epss) | Daily probability that a CVE is exploited in the next 30 days, with percentile and 30-day history. | Free, no key (API marked beta). |
| [NVD CVE API 2.0](https://nvd.nist.gov/developers/api-workflows) | CVE descriptions, CVSS scores and CPE product matches; search by keyword or CPE. | Free. Without a key it allows 5 requests per 30 s; a free key raises that to 50. |

## 4. DNA: broadband gap finder

**Brief.** Outside the big cities many Finnish households still live with slow fixed broadband, and 5G fixed-wireless access (a home router on the mobile network) could replace it quickly. DNA's sales and network planning teams decide where to market it, and where to add capacity, from coarse municipal statistics. DNA wants a map tool that finds 1 km areas where many people live but measured internet speeds are poor, ranks them, and explains each pick.

**Mentor answers**

- **Users:** regional sales managers choosing next quarter's campaign areas, and network planners checking whether a cell can carry more fixed-wireless homes.
- **Data:** use public crowd-sourced speed tests and the official population grid. Speed-test tiles don't say which operator was tested, so treat them as "what people in this area experience", not as DNA's own coverage.
- **Wow:** a map of Varsinais-Suomi where you click a red square and read "412 residents, median fixed download 18 Mbit/s from 37 tests, mobile download 140 Mbit/s nearby: strong fixed-wireless candidate". Plus a top-20 list exported for the campaign team.
- **Business angle:** every fixed-wireless subscription adds revenue on a network that already exists. Choosing the right 50 villages matters more than the perfect model. Being upfront about thin data (few tests) builds trust.

**Judging criteria**

1. Soundness of the ranking: population, test counts and speeds combined sensibly, with low-sample areas flagged.
2. Clarity of the map and the per-area explanation.
3. Actionability: an exportable shortlist sales can use next week.
4. Data handling: correct licence attribution and no attempt to infer individuals.

**Data**

| Source | What you get | Access |
| --- | --- | --- |
| [Speedtest by Ookla open data](https://registry.opendata.aws/speedtest-global-performance) | Quarterly fixed and mobile performance tiles (\~610 m at the equator): average download, upload, latency, test and device counts. Parquet or Shapefile. | Free from S3 with `aws s3 ls --no-sign-request s3://ookla-open-data/`. **CC BY-NC-SA 4.0: non-commercial.** Fine for a rehearsal; at the real event, check it against the challenge's IP terms. |
| [Statistics Finland population grid 1 km × 1 km](https://stat.fi/org/avoindata/paikkatietoaineistot/vaestoruutuaineisto_1km_en.html) | Population by age group per inhabited 1 km cell, as of 31 Dec of the reference year. | Free WFS (geo.stat.fi/geoserver/vaestoruutu/wfs), CC BY 4.0. |
| [Statistics Finland 1 km grid municipality key](https://stat.fi/org/avoindata/paikkatietoaineistot/tilastoruudukko_1km_en.html) | Maps each grid cell to its municipality (CSV/XLSX), for filtering to Varsinais-Suomi. | Free download. |

## 5. FORCIT Group: fragmentation from a phone photo

**Brief.** How well a blast broke the rock decides everything downstream: oversize boulders need secondary breaking and slow the loader, and too many fines waste explosive and energy. Drill-and-blast engineers at quarries and mines rarely measure fragmentation, because commercial photo-analysis systems are expensive and need calibrated setups. FORCIT wants a tool that takes an ordinary photo of a muckpile with a scale object in it, segments the fragments, and returns a size distribution (X50, X80, oversize share) that an engineer can log against the blast. This is a stand-in for one link of the real "Drill and Blast Cycle Intelligence" theme, built on public data so nothing touches the NDA.

**Mentor answers**

- **Users:** the blast engineer or shotfirer on site, on a phone or rugged tablet, often with poor connectivity, and the site manager reviewing results across blasts.
- **Data:** public muckpile images only. They're unlabelled, so label a small validation set yourself (10–20 images) and say so; a zero-shot segmenter plus a scale reference is a fair starting point.
- **Wow:** take a photo, draw a line over the scale object, and get a size curve and "7 % oversize > 800 mm" in seconds on the device, with the segmentation overlay so the engineer can see where it was wrong and fix it.
- **Business angle:** FORCIT sells explosives and blasting know-how. A cheap, repeatable fragmentation measurement lets customers tune burden, spacing and charge per blast, and turns FORCIT from a supplier into the partner whose data shows the savings.

**Judging criteria**

1. Measurement validity: agreement with your hand-labelled set, with error stated, including fines that a photo can't resolve.
2. Field usability: works offline on modest hardware, simple capture flow, correction of bad masks.
3. Engineering value: outputs blast engineers already use (X50, X80, Rosin-Rammler fit, oversize share).
4. Honest limits: lighting, perspective, scale errors and 2D-versus-3D bias explained.

**Data**

| Source | What you get | Access |
| --- | --- | --- |
| [Mendeley Data: "fragmented rocks by blasting"](https://data.mendeley.com/datasets/z78ghz96bn/1) | 226 photos of blasted rock from Gole-Gohar iron ore mine, Iran, across rock types (hematite, magnetite, quartz schist, gneiss and others). No labels mentioned. | Free download, CC BY 4.0. |
| [Segment Anything (SAM)](https://github.com/facebookresearch/segment-anything) | Pretrained zero-shot segmentation model for the first-pass fragment masks. | Open weights, Apache 2.0. |

## Sources

All pages opened or searched on 1 Nov 2026: [PRH open data API](https://avoindata.prh.fi/en/info/swagger-ui) · [StatFin 157m](https://statfin.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__bdem/157m.px/) · [Fingrid 360](https://data.fingrid.fi/en/datasets/360) · [Fingrid open data terms](https://data.fingrid.fi/en/about) · [FMI open data FAQ](https://en.ilmatieteenlaitos.fi/open-data-questions) · [FIRST EPSS API](https://api.first.org/epss) · [NVD API workflows](https://nvd.nist.gov/developers/api-workflows) · [Ookla on the AWS open data registry](https://registry.opendata.aws/speedtest-global-performance) · [Statistics Finland population grid](https://stat.fi/org/avoindata/paikkatietoaineistot/vaestoruutuaineisto_1km_en.html) · [Mendeley fragmentation dataset](https://data.mendeley.com/datasets/z78ghz96bn/1)
