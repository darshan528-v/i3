# Digital Marketing Project 03: Google & Meta Ads Mock Campaign Plan

A responsive, browser-only planning dashboard for the sample EdTech brand **LearnPro Academy**. It uses HTML, CSS, JavaScript, Bootstrap 5, and Chart.js. All campaigns and metrics are hypothetical planning examples; no advertising accounts are connected and no ads are live.

## Features

- Campaign overview with objectives, audience personas, channel plans, sample ad copy, and KPI guidance.
- Editable 30-day budget and allocation percentages. The budget chart and displayed allocation amounts update interactively; amounts are proportionally normalized when the percentages do not total 100%, and their sum remains equal to the selected total.
- Editable performance scenario with transparent CTR, CPC, CPL, lead conversion, and enrolment conversion formulas.
- A/B experiment plan, landing-page recommendations, and a planned-versus-actual report that explicitly marks actual data as unavailable.
- Campaign table with search, platform/status filters, sortable columns, add, edit, delete, reset-to-sample, browser `localStorage` persistence, CSV export, and print-friendly report.
- Responsive layout and accessible labels for controls, tables, and charts.

## Open in VS Code

1. Open VS Code.
2. Select **File → Open Folder…** and choose this project folder.
3. Install the **Live Server** extension by Ritwick Dey if it is not already installed.
4. In the Explorer, right-click `index.html` and select **Open with Live Server** (or select **Go Live** in the VS Code status bar).
5. The dashboard opens in your default browser. Changes to the HTML, CSS, or JavaScript are served locally; refresh if needed.

The project has no build step, backend, package installation, or API keys. Bootstrap and Chart.js are loaded from public CDNs, so an internet connection is needed for those libraries and the optional Google font. The page itself runs locally; saved campaign edits remain in that browser's local storage.

## Budget and forecast

The default sample allocation is ₹30,000 for 30 days:

| Allocation | Share | Planned amount |
| --- | ---: | ---: |
| Google Search Ads | 50% | ₹15,000 |
| Meta Awareness Ads | 20% | ₹6,000 |
| Meta Lead Generation Ads | 20% | ₹6,000 |
| Retargeting Ads | 10% | ₹3,000 |
| **Total** | **100%** | **₹30,000** |

The initial forecast scenario uses 300,000 impressions, 6,000 clicks, 300 leads, and 45 enrolments. These values are assumptions for demonstrating the calculator only—not measured results, promised performance, or a media quotation. Real performance depends on bidding, competition, audience, creative quality, consent eligibility, and landing-page performance.

## Data and privacy

Campaign management rows are saved under `learnpro-campaign-planner-v1` in the browser's local storage. Use **Reset sample data** to restore the original sample campaign rows. This action does not clear other browser storage. Do not enter personal or confidential information. The app does not submit forms or transmit campaign data to an advertising platform.

Retargeting examples are concepts only and must not be activated without appropriate consent, audience eligibility, platform-policy review, and applicable privacy compliance.

## Project files

- `index.html` — page structure and campaign content.
- `style.css` — responsive interface and print styles.
- `script.js` — charts, budget calculator, forecast, campaign CRUD, local storage, filtering, sorting, and CSV export.
- `README.md` — setup and usage instructions.
