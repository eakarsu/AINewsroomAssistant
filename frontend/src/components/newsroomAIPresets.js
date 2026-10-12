export const AI_TOOL_PRESETS = {
  headline: [
    {
      label: 'Climate data story',
      values: {
        title: 'City Heat Records Reveal a Growing Neighborhood Divide',
        content: 'A newsroom analysis of 15 years of public temperature data found that neighborhoods with less tree cover averaged 7°F warmer during summer heat waves. Reporters interviewed residents, public-health researchers, and the city forestry director. The city says 12,000 trees will be planted over three years, with priority given to the hottest census tracts.',
        category: 'Local',
        target_audience: 'Metro residents, neighborhood leaders, and local policy makers',
      },
    },
    {
      label: 'Transit investigation',
      values: {
        title: 'Why the New Commuter Rail Schedule Is Leaving Night Workers Behind',
        content: 'The transit authority added peak-hour trains but reduced late-night service on three lines. Shift workers at two hospitals reported longer waits and higher rideshare costs. Agency records show late-night ridership has remained stable while operating costs increased. The authority will review the schedule after a 90-day pilot.',
        category: 'Business',
        target_audience: 'Daily commuters, shift workers, and regional transportation officials',
      },
    },
    {
      label: 'Science explainer',
      values: {
        title: 'What a New Battery Breakthrough Could Mean for the Electric Grid',
        content: 'University researchers published peer-reviewed results for a sodium-ion battery that retained 92% capacity after 1,000 cycles in laboratory tests. Independent experts said the chemistry may reduce material costs, but large-scale manufacturing and field performance remain unproven. A pilot installation is planned for next year.',
        category: 'Science',
        target_audience: 'General readers interested in energy, technology, and climate policy',
      },
    },
  ],
  angles: [
    {
      label: 'Housing accountability',
      values: {
        topic: 'The city missed its affordable-housing construction target for a third year',
        context: 'Budget records show allocated funds, but permitting delays and contractor shortages slowed projects in four districts.',
        audience: 'Renters, homeowners, housing advocates, and city officials',
        outlet_type: 'Local news',
      },
    },
    {
      label: 'Public health impact',
      values: {
        topic: 'Rural clinics are adopting remote patient monitoring',
        context: 'Three county clinics began a one-year pilot for diabetes and heart-care patients; no outcome data are available yet.',
        audience: 'Rural families, clinicians, and state health policy makers',
        outlet_type: 'Digital news',
      },
    },
    {
      label: 'Education data',
      values: {
        topic: 'Community colleges report a rise in mid-career enrollment',
        context: 'Enrollment records show growth in nursing, cybersecurity, and skilled-trades certificates while overall enrollment remains flat.',
        audience: 'Adult learners, employers, educators, and workforce officials',
        outlet_type: 'Investigative',
      },
    },
  ],
  readability: [
    {
      label: 'Breaking news brief',
      values: {
        title: 'Water Main Break Closes Three Downtown Blocks',
        content: 'A water main broke beneath Market Street shortly before 7 a.m. Tuesday, flooding three blocks and closing nearby roads. City crews shut off the damaged line and said repairs could continue through the evening. Two bus routes were diverted. Officials asked drivers to avoid the area and said nearby homes still had safe drinking water.',
        target_grade_level: 'Grade 8',
      },
    },
    {
      label: 'Policy explainer',
      values: {
        title: 'How the New Property-Tax Credit Works',
        content: 'Homeowners with household income below $85,000 may apply for the new state property-tax credit. The credit covers up to $750 of an eligible primary residence tax bill. Applications open November 1 and require proof of income and residency. Renters and owners of second homes do not qualify under the current law.',
        target_grade_level: 'Grade 10',
      },
    },
    {
      label: 'Technical analysis',
      values: {
        title: 'Regional Grid Operators Test Long-Duration Storage',
        content: 'The regional grid operator approved a controlled pilot of long-duration energy storage at two substations. Engineers will measure discharge duration, response time, and performance during peak demand. The pilot does not authorize commercial deployment. Regulators will review safety data, operating costs, and reliability results before considering expansion.',
        target_grade_level: 'College',
      },
    },
  ],
  credibility: [
    {
      label: 'Public data source',
      values: {
        source_name: 'Metro Open Data Office',
        source_type: 'Government official',
        url: 'https://data.example.gov/transportation',
        track_record: 'Publishes versioned monthly datasets with methodology notes and correction logs; verify the latest revision date.',
        context: 'A story comparing bus reliability across neighborhoods over the past two years.',
      },
    },
    {
      label: 'Academic expert',
      values: {
        source_name: 'Dr. Lena Ortiz, Center for Urban Climate Research',
        source_type: 'Academic expert',
        url: 'https://research.example.edu/urban-climate',
        track_record: 'Author of peer-reviewed heat-mapping studies; disclose that one current project receives city grant funding.',
        context: 'Explaining methods and limitations in a neighborhood heat-disparity investigation.',
      },
    },
    {
      label: 'Anonymous tip',
      values: {
        source_name: 'Confidential municipal procurement source',
        source_type: 'Anonymous source',
        url: 'https://procurement.example.gov/public-records',
        track_record: 'First contact with the newsroom; supplied two document references that require independent authentication.',
        context: 'A preliminary tip alleging irregular scoring in a public software contract.',
      },
    },
  ],
};

export const AI_INSIGHT_PRESETS = {
  competitive: [
    {
      label: 'Transit exclusive',
      values: {
        topic: 'Late-night commuter rail reductions and their effect on hospital workers',
        your_angle: 'Use schedule data and worker travel diaries to measure the cost shifted onto night workers.',
        competitor_coverage: '[{"outlet":"Metro Daily","headline":"Transit Agency Trims Overnight Service","focus":"agency budget"},{"outlet":"Channel 8","headline":"Riders React to New Schedule","focus":"commuter interviews"}]',
        deadline: '2026-10-14T18:00:00-04:00',
      },
    },
    {
      label: 'Housing follow-up',
      values: {
        topic: 'Delayed affordable-housing projects despite fully allocated funding',
        your_angle: 'Trace each delayed project through permits, contracts, and council oversight records.',
        competitor_coverage: '[{"outlet":"City Ledger","headline":"Housing Target Missed Again","focus":"annual totals"},{"outlet":"Public Radio","headline":"Families Wait for New Units","focus":"tenant impact"}]',
        deadline: '2026-10-18T09:00:00-04:00',
      },
    },
    {
      label: 'Climate data desk',
      values: {
        topic: 'Neighborhood heat exposure and the city tree-planting plan',
        your_angle: 'Compare block-level heat readings, canopy coverage, and the first-year planting map.',
        competitor_coverage: '[{"outlet":"State News","headline":"Region Breaks Heat Record","focus":"regional temperature"},{"outlet":"Climate Wire","headline":"Cities Expand Tree Canopies","focus":"national trend"}]',
        deadline: '2026-10-20T12:00:00-04:00',
      },
    },
  ],
  'source-match': [
    {
      label: 'Hospital staffing',
      values: {
        story_topic: 'How overnight hospital staffing shortages affect emergency-room wait times',
        expertise_needed: 'Emergency medicine operations, nursing workforce data, and patient advocacy',
        geography: 'Metro region and surrounding counties',
        language: 'English',
      },
    },
    {
      label: 'School ventilation',
      values: {
        story_topic: 'School ventilation upgrades funded by federal relief grants',
        expertise_needed: 'Indoor air quality, public procurement, school facilities, and pediatric health',
        geography: 'Statewide with two urban and two rural districts',
        language: 'English and Spanish',
      },
    },
    {
      label: 'Grid reliability',
      values: {
        story_topic: 'Long-duration battery storage pilot at regional substations',
        expertise_needed: 'Power-grid engineering, battery safety, utility regulation, and ratepayer impact',
        geography: 'Regional transmission area',
        language: 'English',
      },
    },
  ],
  correction: [
    {
      label: 'Name correction',
      values: {
        article_text: 'The council voted 6-3 Tuesday to approve the transit plan. The article identified committee chair Lena Morris as Linda Morris.',
        complaint: 'The committee chair says her first name was published incorrectly.',
        evidence: '[{"type":"official council directory","finding":"The chair is listed as Lena Morris"},{"type":"meeting video","finding":"The chair states her name as Lena Morris"}]',
      },
    },
    {
      label: 'Data clarification',
      values: {
        article_text: 'The district spent $4.2 million on ventilation upgrades last year, according to its capital dashboard.',
        complaint: 'The district says the figure covers a two-year program, not spending completed in one year.',
        evidence: '[{"type":"capital dashboard revision","finding":"$4.2 million is the approved 2025-2026 program budget"},{"type":"invoice summary","finding":"$2.1 million was paid in 2025"}]',
      },
    },
    {
      label: 'Quote review',
      values: {
        article_text: 'A resident said the project would close the park for the entire summer.',
        complaint: 'The resident says the recorded quote was that one section of the park could close for part of the summer.',
        evidence: '[{"type":"interview recording","finding":"Speaker says one section could close for part of the summer"},{"type":"project schedule","finding":"Phased closures are proposed; dates are not final"}]',
      },
    },
  ],
  embargo: [
    {
      label: 'Research release',
      values: {
        story_title: 'University Publishes Regional Heat-Exposure Study',
        embargo_until: '2026-11-03T14:00:00Z',
        jurisdictions: '["US/Eastern","Europe/London"]',
        distribution_partners: '["Regional public radio","State news cooperative","University press office"]',
        sensitivity: 'standard',
      },
    },
    {
      label: 'Earnings briefing',
      values: {
        story_title: 'Transit Technology Vendor Reports Quarterly Results',
        embargo_until: '2026-11-12T21:05:00Z',
        jurisdictions: '["US/Eastern","US/Pacific"]',
        distribution_partners: '["Business wire desk","Broadcast affiliate","Digital homepage team"]',
        sensitivity: 'highly-sensitive',
      },
    },
    {
      label: 'Policy report',
      values: {
        story_title: 'State Auditor Releases Housing Program Review',
        embargo_until: '2026-11-17T13:00:00Z',
        jurisdictions: '["US/Eastern","US/Central"]',
        distribution_partners: '["Investigations desk","Capitol bureau","Syndication partner"]',
        sensitivity: 'elevated',
      },
    },
  ],
  a11y: [
    {
      label: 'News photo',
      values: {
        media_kind: 'photo',
        media_description: 'Three city workers in reflective vests examine a broken water main at the intersection of Market and Third streets. Water covers the roadway, and orange barriers block traffic. No injured people are visible.',
        headline: 'Water Main Break Closes Three Downtown Blocks',
        caption_lang: 'en',
        audience: 'Local general-news readers',
      },
    },
    {
      label: 'Data chart',
      values: {
        media_kind: 'chart',
        media_description: 'A grouped bar chart compares on-time bus performance in four districts for 2025 and 2026. North improved from 71% to 78%; East fell from 83% to 74%; South stayed at 80%; West rose from 69% to 76%.',
        headline: 'Bus Reliability Improves Overall, but East District Falls Behind',
        caption_lang: 'en',
        audience: 'Transit riders and local policy readers',
      },
    },
    {
      label: 'Video still',
      values: {
        media_kind: 'video-still',
        media_description: 'A wide shot shows residents seated in a city council chamber while a housing map is projected behind the council dais. The map uses blue and orange areas to mark proposed zoning changes.',
        headline: 'Council Advances Mixed-Use Zoning Proposal',
        caption_lang: 'es',
        audience: 'Spanish-speaking local-news audience',
      },
    },
  ],
};
