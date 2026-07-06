/**
 * Solar blog content data.
 * All policy, regulatory, and financial data sourced from:
 * "Strategic Intelligence Report: Rooftop Solar Policy, Regulatory Dynamics,
 * and Business Strategy in Odisha (2026)"
 */

export interface TableSection {
  headers: string[];
  rows: string[][];
  accentLast?: boolean;
}

export interface BlogSection {
  heading?: string;
  subheading?: string;
  text?: string;
  table?: TableSection;
  bullets?: string[];
  callout?: { title: string; body: string };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readTime: number;
  sections: BlogSection[];
}

export const solarBlogPosts: BlogPost[] = [
  {
    slug: 'complete-guide-rooftop-solar-odisha-2026',
    title: 'Complete Guide to Rooftop Solar in Odisha (2026)',
    excerpt: 'Everything you need to know about rooftop solar installation in Odisha — dual subsidies, OERC tariffs, ALMM compliance, ELBO licensing, net metering, and the step-by-step application process.',
    tags: ['Odisha Solar', 'PM Surya Ghar', 'Subsidies', 'Regulations'],
    date: 'July 2026',
    readTime: 12,
    sections: [
      {
        text: 'The rooftop solar market in Odisha has entered a phase of unprecedented acceleration in 2026. A combination of the central government\'s PM Surya Ghar: Muft Bijli Yojana and Odisha\'s own Akshaya Shakti Bikash Yojana (OASBY) has created a dual-subsidy architecture that compresses consumer payback periods to record lows.',
      },
      {
        heading: 'The Dual-Subsidy Architecture',
        text: 'Odisha\'s rooftop solar ecosystem is defined by the stacking of two independent financial frameworks. When combined, they transform solar from a long-term capital investment into an immediate utility expense reduction.',
      },
      {
        subheading: 'Central Subsidy: PM Surya Ghar',
        text: 'The national scheme deposits funds directly into consumers\' Aadhaar-linked bank accounts via Direct Benefit Transfer (DBT). Subsidies are calculated based on system capacity and are strictly capped at MNRE benchmark costs.',
        table: {
          headers: ['System Capacity', 'Central Subsidy (PM Surya Ghar)', 'State Subsidy (OASBY)', 'Total Combined'],
          rows: [
            ['1 kW', '₹30,000', '₹25,000', '₹55,000'],
            ['2 kW', '₹60,000', '₹50,000', '₹1,10,000'],
            ['3 kW', '₹78,000', '₹60,000', '₹1,38,000'],
            ['5 kW+', '₹78,000 (capped)', '₹60,000 (capped)', '₹1,38,000'],
          ],
          accentLast: true,
        },
      },
      {
        subheading: 'Odisha OASBY: State Top-Up',
        text: 'For FY 2026–27, the Odisha government allocated ₹495 crore specifically for additional state support through OREDA. The state subsidy perfectly complements the central scheme.',
        callout: {
          title: '⚠️ State Fund Advisory',
          body: 'OASBY funds operate on a budgetary depletion model. Always present the central ₹78,000 as confirmed (subject to technical compliance) and the state ₹60,000 as "subject to current OREDA fund availability." Verify active OREDA disbursements before making binding proposals.',
        },
      },
      {
        heading: 'OERC Telescopic Tariff Structure',
        text: 'For FY 2026–27, the OERC maintained a freeze on domestic tariffs, keeping rates stable but highly progressive across consumption tiers.',
        table: {
          headers: ['Monthly Consumption', 'Energy Charge (₹/kWh)'],
          rows: [
            ['0 – 50 units', '₹2.90'],
            ['51 – 200 units', '₹4.70'],
            ['201 – 400 units', '₹5.70'],
            ['Above 400 units', '₹6.10'],
          ],
        },
        callout: {
          title: '💡 Strategic insight',
          body: 'Because tariffs leap from ₹2.90 to ₹4.70 to ₹5.70, solar eliminates the most expensive units first. Sizing to bring net grid draw into the 0–50 unit slab (₹2.90) yields disproportionately high returns.',
        },
      },
      {
        heading: 'ALMM List-II: The June 2026 Cell Mandate',
        text: 'From June 1, 2026, all PM Surya Ghar systems must use modules manufactured with domestically produced solar cells certified under MNRE\'s ALMM List-II. Previously, manufacturers could import cells from China and assemble modules in India.',
        bullets: [
          'Verify specific module model numbers on the MNRE ALMM List-I (not just manufacturer brands)',
          'Confirm List-II cell certification for each module batch before procurement',
          'Modules must also hold valid BIS certification (IS 14086)',
          'Using non-compliant equipment causes immediate subsidy rejection — loss of up to ₹1.38 Lakh for the consumer',
          '"Give It Up" option: consumers voluntarily forgoing subsidies may use non-DCR panels (valid until March 31, 2027)',
        ],
      },
      {
        heading: 'ELBO Compliance: Odisha\'s Strict Contractor Rules',
        text: 'Unlike states with relaxed contractor oversight, Odisha strictly enforces the Electrical Licensing Board Odisha (ELBO) regulations. Every grid-connected solar installation requires ELBO-licensed contractors.',
        bullets: [
          'Valid HT or MV Contractor License issued by ELBO',
          'Electrical Supervisor with Supervisor Certificate of Competency (SCC)',
          'Certified Electrical Workmen with valid permits',
          'Calibrated testing equipment: 5 kV motorized insulation testers, earth testers, theodolites',
          'Formal legally binding declarations proving full-time employment of licensed personnel',
          'Failure to maintain ELBO compliance risks PBG forfeiture and permanent blacklisting from Tata Power networks',
        ],
      },
      {
        heading: 'Net Metering Settlement in Odisha',
        text: 'Odisha allows net metering for systems from 1 kWp to 500 kWp. Excess solar power exported to TPWODL, TPSODL, TPCODL, or TPNODL is credited monthly. Annual settlement occurs at March 31, when any surplus export credits are paid at the APPC rate (₹3.25–₹3.75/unit).',
        bullets: [
          'Monthly billing: exported units deducted from imported units',
          'Surplus units carry forward to next month',
          'Year-end settlement at APPC rate (₹3.25–₹3.75/unit)',
          'Group Net Metering: one system credits multiple locations under same consumer',
          'Virtual Net Metering: apartment residents share generation credits proportionally',
        ],
      },
      {
        heading: 'BESS Mandate for 5 kW+ Systems',
        text: 'The OERC\'s 2026 DRES Regulations mandate Battery Energy Storage Systems for residential systems of 5 kW and above.',
        table: {
          headers: ['System Size', 'Min. BESS Capacity', 'Energy Storage'],
          rows: [
            ['>5 kW to 10 kW', '1 kW', '2 kWh'],
            ['>10 kW to 30 kW', '2 kW', '4 kWh'],
            ['>30 kW to 100 kW', '6 kW', '12 kWh'],
            ['>100 kW to 500 kW', '20 kW', '40 kWh'],
          ],
        },
        text: 'BESS units must charge during daytime solar hours and discharge during evening peak. The added cost of hybrid inverter + lithium-ion BESS increases gross project cost by ₹40,000–₹70,000 for standard residential systems.',
      },
      {
        heading: 'Standard Application Process (End-to-End)',
        bullets: [
          '1. Portal Registration: Consumer links mobile + DISCOM consumer number on pmsuryaghar.gov.in. Aadhaar name must exactly match electricity bill.',
          '2. Feasibility Approval: Odisha waived technical feasibility studies for ≤10 kW systems (July 2024). Typically 7–15 working days.',
          '3. Vendor Selection: Choose an MNRE-empanelled vendor with valid ELBO license.',
          '4. Installation: ALMM List-II compliant equipment, IS 3043 earthing, 4 sqmm minimum DC cable.',
          '5. DISCOM Inspection: Physical verification of ALMM serial numbers, cable sizing, earthing documentation.',
          '6. Net Meter Installation: System remains de-energized until bi-directional meter is installed.',
          '7. DBT Disbursement: Consumer provides cancelled cheque; subsidy deposited to Aadhaar-linked bank account.',
          'Total end-to-end timeline: 45–90 days.',
        ],
      },
    ],
  },
];

// ── Post 2 ─────────────────────────────────────────────────────────────────────

solarBlogPosts.push({
  slug: 'pm-surya-ghar-oasby-subsidy-guide',
  title: 'PM Surya Ghar & Odisha OASBY: Subsidies, Eligibility & Application Guide',
  excerpt: 'Detailed breakdown of the dual-subsidy architecture — central DBT and state OASBY — with exact slabs, eligibility criteria, and a step-by-step application walkthrough for Odisha residents.',
  tags: ['PM Surya Ghar', 'OASBY', 'Subsidies', 'DBT'],
  date: 'July 2026',
  readTime: 10,
  sections: [
    {
      text: 'In 2026, Odisha offers the most favourable rooftop solar financial environment in India. Two independent subsidy streams stack together to bring the net consumer investment on a 3 kW system as low as ₹42,000–₹57,000 — on an asset with a 25-year operational lifespan.',
    },
    {
      heading: 'Who Is Eligible?',
      bullets: [
        'Individual residential households on LT-Domestic electricity connection',
        'Group Housing Societies (GHS) and Resident Welfare Associations (RWA) for common facility loads (₹18,000/kW, up to 500 kW total, capped at 3 kW per individual house)',
        'Collateral-free loans at ~7% interest for systems up to 3 kW via nationalized banks',
        'Commercial, industrial, and institutional consumers are NOT eligible for PM Surya Ghar or OASBY',
      ],
    },
    {
      heading: 'Central Subsidy: PM Surya Ghar Slabs',
      text: 'The national scheme provides direct-to-consumer financial assistance via DBT, bypassing state intermediaries. Calculation is based on MNRE benchmark costs — quotes exceeding the benchmark do not yield proportionately higher subsidies.',
      table: {
        headers: ['System Size', 'Central Subsidy'],
        rows: [
          ['Up to 1 kW', '₹30,000'],
          ['2 kW', '₹60,000'],
          ['3 kW and above', '₹78,000 (maximum cap)'],
        ],
      },
    },
    {
      heading: 'Odisha OASBY State Top-Up Slabs',
      text: 'The Odisha government allocated ₹495 crore for FY 2026–27 specifically for OASBY top-up subsidies administered through OREDA.',
      table: {
        headers: ['System Size', 'Odisha State Subsidy (OASBY)'],
        rows: [
          ['1 kW', '₹25,000'],
          ['2 kW', '₹50,000'],
          ['3 kW and above', '₹60,000 (maximum cap)'],
        ],
      },
    },
    {
      heading: 'The "Give It Up" Exemption',
      text: 'Consumers who voluntarily opt out of central subsidy via the "Give It Up" option on the national portal can use non-DCR panels (imported cells). This is valid until March 31, 2027.',
      callout: {
        title: 'When does Give It Up make sense?',
        body: 'Mathematically, forgoing ₹1.38 Lakh in subsidies to save on non-DCR panel costs rarely makes financial sense for most consumers. It\'s useful for high-net-worth individuals wanting ultra-high-efficiency N-Type TOPCon or HJT modules, or for consumers facing severe DCR module supply delays who need to expedite installation.',
      },
    },
    {
      heading: 'Critical KYC Requirements',
      text: 'The most common reason for subsidy rejection is a KYC mismatch. Before applying:',
      bullets: [
        'The name on your Aadhaar card must exactly match the name on your electricity bill',
        'Even minor discrepancies (e.g., "Ramesh Kumar" vs. "R. Kumar") trigger rejection at the DBT stage',
        'Your mobile number must be linked to your Aadhaar',
        'Your sanctioned grid load must be at least as large as the solar system you intend to install',
        'If your desired solar system exceeds your sanctioned load, a separate load enhancement application must be filed with DISCOM first',
      ],
    },
    {
      heading: 'Performance Bank Guarantee (Vendor Requirement)',
      text: 'To process subsidies, vendors must be empanelled on the national portal with a Performance Bank Guarantee. State-level vendors require ₹2,50,000 PBG. Approval takes 7–15 working days after submission.',
    },
  ],
});

// ── Post 3 ─────────────────────────────────────────────────────────────────────

solarBlogPosts.push({
  slug: 'rooftop-solar-roi-costs-savings-payback',
  title: 'Rooftop Solar ROI Explained: Costs, Savings, Payback & Long-Term Benefits',
  excerpt: 'Engineering-grade financial model: OERC telescopic tariffs, net investment after dual subsidies, payback calculation with worked examples, 25-year savings projection, and CO₂ impact.',
  tags: ['Finance', 'ROI', 'Payback Period', 'Solar Calculator'],
  date: 'July 2026',
  readTime: 9,
  sections: [
    {
      text: 'The financial case for rooftop solar in Odisha in 2026 is compelling. With gross installation costs of ₹60,000–₹65,000 per kW and a combined subsidy of up to ₹1,38,000, a standard 3 kW residential system achieves payback in under 3 years — on an asset with a 25-year lifespan.',
    },
    {
      heading: 'The Calculation Logic (Step by Step)',
      text: 'Our solar ROI calculator uses the following sequential logic, derived from OERC and MNRE data:',
      bullets: [
        '1. Units consumed: Monthly bill ÷ ₹5.00 (blended Odisha rate)',
        '2. Recommended system size: Units consumed ÷ 120 (Odisha generates 120 units/kW/month)',
        '3. Space check: System size × 100 ≤ available roof area (sq. ft.)',
        '4. Gross cost: System size × ₹65,000 (ALMM List-II modules + structure)',
        '5. Central subsidy: PM Surya Ghar slab (₹30K/₹60K/₹78K)',
        '6. State subsidy: OASBY slab (₹25K/₹50K/₹60K)',
        '7. Net investment: Gross cost − (central + state subsidy)',
        '8. Payback period: Net investment ÷ (monthly bill × 12)',
      ],
    },
    {
      heading: 'Worked Example: 3 kW System in Odisha',
      text: 'Consider a residential consumer with a monthly electricity bill of ₹1,800 and 500 sq. ft. of available roof area.',
      table: {
        headers: ['Parameter', 'Value'],
        rows: [
          ['Monthly bill', '₹1,800'],
          ['Units consumed', '360 units/month (₹1,800 ÷ ₹5)'],
          ['Recommended system', '3 kW (360 ÷ 120)'],
          ['Space check', '300 sq. ft. required (valid ≤ 500)'],
          ['Gross cost', '₹1,95,000 (3 × ₹65,000)'],
          ['Central subsidy', '₹78,000 (PM Surya Ghar)'],
          ['State subsidy', '₹60,000 (OASBY)'],
          ['Net investment', '₹57,000'],
          ['Annual savings', '₹21,600 (₹1,800 × 12)'],
          ['Payback period', '2.64 years'],
          ['25-year total savings', '~₹8.5 Lakh (4% tariff escalation)'],
        ],
        accentLast: false,
      },
      callout: {
        title: '🏆 Key insight',
        body: 'A 2.64-year payback on a 25-year asset means the consumer earns back their investment 9.5 times over the system\'s lifespan. This is the apex of the solar sales pitch — and it\'s based on real, verifiable numbers.',
      },
    },
    {
      heading: 'OERC Telescopic Tariff Advantage',
      text: 'Odisha\'s progressive tariff structure creates a multiplicative effect: solar doesn\'t merely offset your average electricity cost — it eliminates the most expensive units first.',
      bullets: [
        'Units 0–50: ₹2.90/kWh (lowest tier)',
        'Units 51–200: ₹4.70/kWh',
        'Units 201–400: ₹5.70/kWh',
        'Units above 400: ₹6.10/kWh',
        'A heavy consumer (400+ units/month) offsetting 200 units saves at ₹5.70–₹6.10, not ₹2.90',
        'Sizing to bring net grid draw into the 0–50 unit slab maximizes financial returns',
      ],
    },
    {
      heading: 'Commercial & Industrial ROI Model',
      text: 'Commercial and industrial consumers are ineligible for residential subsidies. Their ROI model is based on different parameters.',
      bullets: [
        'HT industrial tariff: ~₹5.85/kVAh (load factor < 60%) — forms the comparison baseline',
        '40% Year-1 accelerated depreciation tax shield on system cost',
        'Non-DCR (imported bifacial) panels permissible — lower cost, higher wattage',
        'LCOE comparison against DISCOM grid tariff determines ROI viability',
        'Heavy industries with 80%+ monthly load factors qualify for additional OERC rebates',
        'Incremental solar-hour rate: ₹4.30/kVAh — creating peak-hour cost arbitrage',
      ],
    },
    {
      heading: 'Net Metering & APPC Revenue',
      text: 'Beyond direct bill savings, net metering creates an additional revenue stream. Surplus export credits accumulated over the year are paid at the APPC rate.',
      bullets: [
        'Odisha APPC rate: ₹3.25–₹3.75 per unit (historically)',
        'Annual surplus payment at March 31 year-end settlement',
        'Correctly sized systems minimize export and maximize self-consumption (higher savings at ₹5.70+ vs. ₹3.50 export rate)',
        'Group Net Metering allows surplus from one property to offset bills at another under the same consumer',
      ],
    },
    {
      heading: 'Environmental & Long-Term Value',
      bullets: [
        'A typical 3 kW system generates ~4,320 kWh/year and offsets ~3.5 tonnes CO₂/year',
        'Equivalent to planting ~155 trees annually',
        'Panel efficiency degrades only ~0.5% per year — system remains highly productive at year 25',
        'Solar increases property resale value — premium real estate now expects solar installations',
        'Energy independence from grid outages and future tariff hikes',
      ],
    },
  ],
});
