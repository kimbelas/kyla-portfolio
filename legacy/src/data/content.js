// ─────────────────────────────────────────────────────────────
//  Kyla Belas · site content
//  Every word, link and image on the site comes from this file.
//  Edit here, then run `npm run build`. No component changes needed.
//  Source: "Portfolio 2026.pdf" and "Updated VA Resume 2026" (Google Drive).
// ─────────────────────────────────────────────────────────────

const img = (p) => `${import.meta.env.BASE_URL}images/${p}`

export const site = {
  name: 'Kyla Belas',
  firstName: 'Kyla',
  title: 'Executive Virtual Assistant · Junior Architect · Project Manager',
  location: 'Pampanga, Philippines',
  email: 'kylabelasss@gmail.com',
  photo: img('profile/kyla.webp'),
  links: {
    linkedin: 'https://www.linkedin.com/in/kcbelas',
    upwork: 'https://www.upwork.com/freelancers/~0192a51c7e5e0976e8?mp_source=share',
    onlinejobs: 'https://www.onlinejobs.ph/jobseekers/info/1985636',
    drive: 'https://drive.google.com/drive/folders/1HBR_zivQPaMLyt6rmjuvce2AvqeIVuwl?usp=sharing',
    recordings: 'https://drive.google.com/drive/folders/1P1dFI5vCiM5kfRlWG6_Zy8m7kxywGWHp',
    videos: 'https://drive.google.com/drive/folders/1utqA7885ORD8ps7G_3IyTmVa2sGuiTw_',
    socialImages: 'https://drive.google.com/drive/folders/1sZ7SAZOcY7lgi6DTcj5MVAYCYwSncIDW',
    reviews: 'https://drive.google.com/drive/folders/1HTb2cGZqg7IjpWZVCG7DjqE4SfpLuZPV',
  },
  // Contact form: create a free form at https://formspree.io and paste its ID here
  // (the part after /f/ in the endpoint, e.g. "xqkrabcd"). While empty, the form
  // opens the visitor's email app with the message filled in instead.
  formspreeId: '',
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'calls', label: 'Calls' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'experience', label: 'Experience' },
  { id: 'testimonials', label: 'Kind words' },
  { id: 'tools', label: 'Tools' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  eyebrow: 'Architecture-trained · Operations-minded',
  headline: ['I keep projects, people', 'and pipelines moving.'],
  rotating: [
    'Construction Operations',
    'Project Management',
    'Executive Assistance',
    'Sales & Lead Generation',
    'Marketing & Social Media',
    'Business Operations',
  ],
  intro:
    'BS Architecture graduate with 6+ years across construction, real estate, sales and marketing. As the CEO’s right hand at 2A Construction LLC, I run daily operations and carry remodeling projects from first inquiry to completion.',
  badges: [
    { label: 'BS Architecture', sub: 'Holy Angel University' },
    { label: 'GoHighLevel', sub: 'Expert level' },
  ],
}

// Niches (roles and services Kyla offers), shown in the scrolling band under the hero.
export const niches = [
  'Executive Virtual Assistant',
  'Project Coordinator',
  'Project Manager',
  'Cold Calling',
  'Appointment Setter',
  'Lead Generation',
  'Acquisitions',
  'Real Estate VA',
  'Creative Ad Specialist',
  'Social Media Manager',
  'Email Marketing',
  'Content Creation & Graphic Design',
  'CRM Management',
  'Estimating',
  'Admin & Customer Support',
  'Architectural Design & 3D Visualization',
]

export const about = {
  heading: 'From blueprints to business operations',
  paragraphs: [
    'I am a detail-oriented virtual assistant passionate about my work and committed to continuous learning. With a determined mindset, I thrive as both a reliable team member and an effective leader. I take initiative, listen actively, and excel in high-pressure situations, which makes me adept at conflict resolution.',
    'My degree in Architecture gave me a skill set that translates directly into operations. Attention to detail, cultivated through design and project planning, lets me manage tasks with precision and creativity. I understand technical project requirements, review plans, and bring practical solutions to operational challenges.',
    'Today I manage multiple remodeling and construction projects, streamline workflows, and make decisions that support business growth and efficiency. Challenges are what keep me going.',
  ],
  education: {
    degree: 'Bachelor of Science in Architecture',
    school: 'Holy Angel University',
    years: '2020 – 2025',
  },
  facts: [
    { value: '6+', label: 'years across sales, real estate, construction and marketing' },
    { value: '5–12', label: 'qualified leads generated daily at Orange Grove Properties' },
    { value: '3–5', label: 'sales closed per day as a sales representative at iQor' },
    { value: '20%', label: 'minimum profit on every direct sale, 2014–2018' },
  ],
  journey: [
    { year: '2014', text: 'Started in direct sales, negotiating deals and selling properties locally.' },
    { year: '2018', text: 'Sales & customer service at iQor, closing 3–5 sales a day.' },
    { year: '2020', text: 'Began architecture studies and real estate virtual assistance in California.' },
    { year: '2023', text: 'Executive VA and creative ad specialist for Mortske Media.' },
    { year: '2024', text: 'Became the CEO’s right hand at Sharks Capital and 2A Construction LLC.' },
    { year: '2025', text: 'Graduated BS Architecture and returned to 2A Construction as executive VA and project manager.' },
  ],
}

export const expertise = [
  {
    key: 'construction',
    title: 'Construction Operations',
    summary: 'Remodeling and construction projects run from first inquiry through completion.',
    points: [
      'Estimates, scopes of work, contracts and invoices',
      'Subcontractor, vendor and supplier coordination',
      'Schedules, permits, inspections and material procurement',
      'Keeping projects on track and within budget',
    ],
  },
  {
    key: 'architecture',
    title: 'Architecture & Design',
    summary: 'A design eye that reads plans and turns ideas into drawings and renders.',
    points: [
      'Floor plans, layouts and annotated proposals',
      'Custom cabinetry and vanity design',
      '3D interior visualization in SketchUp, Lumion, V-Ray and D5',
      'Reviewing technical plans with project managers',
    ],
  },
  {
    key: 'executive',
    title: 'Executive Assistance',
    summary: 'The CEO’s right hand for priorities, calendars and communication.',
    points: [
      'Executive and project calendars, meetings and site visits',
      'Screening communications and managing correspondence',
      'HR support: job postings, onboarding, team coordination',
      'Training and supporting junior assistants',
    ],
  },
  {
    key: 'operations',
    title: 'Business Operations',
    summary: 'Systems that keep a growing company organised and measurable.',
    points: [
      'CRM systems, tracking sheets, SOPs and KPI dashboards',
      'Billing and payments in GoHighLevel and QuickBooks',
      'Automation tools that streamline workflow',
      'Financial tracking and administrative operations',
    ],
  },
  {
    key: 'sales',
    title: 'Sales & Lead Generation',
    summary: 'Calls, follow-ups and negotiations that turn leads into closed deals.',
    points: [
      'Cold calling, appointment setting and lead qualification',
      'SMS campaigns and consistent prospect follow-up',
      'Estimates, sales calls and deal closings',
      'Real estate agent outreach and creative financing',
    ],
  },
  {
    key: 'marketing',
    title: 'Marketing & Social Media',
    summary: 'Content that reflects the brand and reaches the right audience.',
    points: [
      'Social media content, ads and infographics',
      'Email marketing campaigns and newsletters',
      'Ad scripts, briefs and creative review',
      'Competitive research and audience targeting',
    ],
  },
]

// Portfolio categories. `category` on each item must match a key here.
export const portfolioCategories = [
  { key: 'all', label: 'All work' },
  { key: 'marketing', label: 'Marketing & social' },
  { key: 'construction', label: '2A Construction projects' },
  { key: 'growth', label: 'Business records' },
  { key: 'architecture', label: 'Architectural design' },
]

export const portfolio = [
  // Marketing & creative portfolio
  { title: 'Kitchen Remodeling Promotion', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/kitchen-remodel-promo.webp'), feature: true },
  { title: 'Beauty Service Before & After', category: 'marketing', tag: 'Blossom Waxing', src: img('marketing/beauty-before-after.webp') },
  { title: 'Home Addition Promotion', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/home-addition.webp') },
  { title: 'Waxing Aftercare Guide', category: 'marketing', tag: 'Blossom Waxing', src: img('marketing/waxing-aftercare.webp') },
  { title: 'Construction Marketing Post', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/construction-post.webp') },
  { title: 'Recruitment Social Post', category: 'marketing', tag: 'Blossom Waxing', src: img('marketing/recruitment-post.webp') },
  { title: 'Automotive Sales Promotion', category: 'marketing', tag: 'Social media ad', src: img('marketing/auto-sales.webp') },
  { title: 'Equipment Rental Promotion', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/equipment-rental.webp') },
  { title: 'Back to School Special Promo', category: 'marketing', tag: 'Blossom Waxing', src: img('marketing/back-to-school.webp') },
  { title: 'Welcome Back Offer', category: 'marketing', tag: 'Blossom Waxing', src: img('marketing/welcome-back-offer.webp') },
  { title: 'Home Improvement Infographic', category: 'marketing', tag: 'Infographic', src: img('marketing/home-improvement-infographic.webp') },
  { title: 'Holiday Safety Infographic', category: 'marketing', tag: 'Infographic', src: img('marketing/holiday-safety.webp') },
  { title: 'YouTube Thumbnail', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/youtube-thumbnail.webp') },
  { title: 'Remodeling Price Guide', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/price-guide.webp') },
  { title: 'Get Your Ideal Home', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/ideal-home-steps.webp') },
  { title: 'Kitchen Remodeling Questions', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/kitchen-remodel-questions.webp') },
  { title: 'Small Bathroom Tips', category: 'marketing', tag: 'Brucksch & Sons', src: img('marketing/bathroom-tips.webp') },
  { title: 'Cash for Cars', category: 'marketing', tag: 'Social media ad', src: img('marketing/cash-for-cars.webp') },
  { title: 'Daily Penny Stock', category: 'marketing', tag: 'Social media ad', src: img('marketing/penny-stock.webp') },
  { title: 'Learn How to Start Trading', category: 'marketing', tag: 'Social media ad', src: img('marketing/trading-lessons.webp') },

  // 2A Construction project samples
  { title: 'Remodeling Perspective', category: 'construction', tag: '2A Construction', src: img('construction/remodel-perspective.webp'), feature: true },
  { title: 'Seattle Remodeling Plan', category: 'construction', tag: '2A Construction', src: img('construction/seattle-plan.webp') },
  { title: 'Proposed Layout and Annotations', category: 'construction', tag: '2A Construction', src: img('construction/annotated-layout.webp') },
  { title: 'Remodeling Floor Plan', category: 'construction', tag: '2A Construction', src: img('construction/remodel-floor-plan.webp') },
  { title: 'Custom Vanity Design', category: 'construction', tag: '2A Construction', src: img('construction/vanity.webp') },
  { title: 'Custom Kitchen Cabinet Design', category: 'construction', tag: '2A Construction', src: img('construction/kitchen-cabinet.webp') },
  { title: 'Hall Bathroom Project', category: 'construction', tag: '2A Construction', src: img('construction/hall-bathroom.webp') },

  // Business records
  { title: 'First-Month Business Record', category: 'growth', tag: 'CRM dashboard · July 2025', src: img('construction/first-month-record.webp') },
  { title: 'First-Year Business Record', category: 'growth', tag: 'CRM dashboard · July 2026', src: img('construction/first-year-record.webp') },

  // Architectural design portfolio
  { title: 'Primary Bedroom Visualization', category: 'architecture', tag: '3D render', src: img('architecture/primary-bedroom.webp'), feature: true },
  { title: 'Kitchen Visualization 01', category: 'architecture', tag: '3D render', src: img('architecture/kitchen-01.webp') },
  { title: 'Living Room Visualization', category: 'architecture', tag: '3D render', src: img('architecture/living.webp') },
  { title: 'Bathroom Visualization 01', category: 'architecture', tag: '3D render', src: img('architecture/bathroom-01.webp') },
  { title: 'Dining Area Visualization', category: 'architecture', tag: '3D render', src: img('architecture/dining.webp') },
  { title: 'Kitchen Visualization 02', category: 'architecture', tag: '3D render', src: img('architecture/kitchen-02.webp') },
  { title: 'Bedroom Visualization', category: 'architecture', tag: '3D render', src: img('architecture/bedroom.webp') },
  { title: 'Revised Kitchen Design', category: 'architecture', tag: '3D render', src: img('architecture/kitchen-revised.webp') },
  { title: 'Bathroom Visualization 02', category: 'architecture', tag: '3D render', src: img('architecture/bathroom-02.webp') },
]

// Call recordings (files in public/audio). `group` sets the filter chip.
const audio = (f) => `${import.meta.env.BASE_URL}audio/${f}`
export const recordings = {
  heading: 'Hear me on the call',
  intro: 'Real calls with homeowners, sellers, agents and gatekeepers. Press play on any recording.',
  featured: { title: 'Self introduction', group: 'Introduction', note: 'Recorded early 2025', src: audio('self-introduction.mp3'), duration: 102 },
  tracks: [
    { title: '2A Construction · Customer call', group: 'Construction', src: audio('2a-customer-call.mp3'), duration: 530 },
    { title: '2A Construction · Customer call 2', group: 'Construction', src: audio('2a-customer-call-2.mp3'), duration: 589 },
    { title: '2A Construction · Client call', group: 'Construction', src: audio('2a-client-call.mp3'), duration: 631 },
    { title: 'Appointment setting · Angela', group: 'Appointment setting', src: audio('appointment-setting-angela.mp3'), duration: 143 },
    { title: 'Sample call · Ann', group: 'Appointment setting', src: audio('ann-call.mp3'), duration: 187 },
    { title: 'Cold calling', group: 'Cold calling', src: audio('cold-calling.mp3'), duration: 270 },
    { title: 'Cold calling 12', group: 'Cold calling', src: audio('cold-calling-12.mp3'), duration: 278 },
    { title: 'Phase 1 · Gatekeeper breakthrough', group: 'Cold calling', src: audio('gatekeeper-breakthrough.mp3'), duration: 63 },
    { title: 'Phase 2 · Owner connection script', group: 'Cold calling', src: audio('owner-connection-script.mp3'), duration: 68 },
    { title: 'Agent outreach call', group: 'Real estate', src: audio('agent-outreach-call.mp3'), duration: 280 },
    { title: 'Seller script', group: 'Real estate', src: audio('seller-script.mp3'), duration: 172 },
  ],
  more: { label: 'More recordings on Drive', href: site.links.recordings },
}

export const moreWork = [
  { label: 'Video work', sub: 'Reels, promo videos and recap edits', href: site.links.videos },
  { label: 'Social media library', sub: 'Image samples and campaign graphics', href: site.links.socialImages },
  { label: 'Full Drive portfolio', sub: 'Everything, in its original folders', href: site.links.drive },
]

// Growth record from 2A Construction's CRM (screenshots in the portfolio).
// Same date window (July 7–31), one year apart.
export const growth = {
  heading: 'One year of operations at 2A Construction',
  note: 'CRM dashboard, July 7–31 in 2025 (first month) and 2026 (one year later). All pipelines.',
  metrics: [
    { label: 'Won revenue', before: 28.91, after: 253.81, prefix: '$', suffix: 'K', decimals: 2 },
    { label: 'Conversion rate', before: 4.81, after: 10.29, prefix: '', suffix: '%', decimals: 2 },
    { label: 'Pipeline value', before: 532.91, after: 636.01, prefix: '$', suffix: 'K', decimals: 2 },
  ],
}

export const experience = [
  {
    role: 'Executive Virtual Assistant · Project Manager',
    company: 'Sharks Capital | 2A Construction LLC',
    place: 'Washington, USA',
    period: 'Aug 2024 – Mar 2025 · Jul 2025 – Sep 2026',
    industry: 'Insurance / Construction',
    highlights: [
      'Served as the CEO’s right hand, managing daily operations, priorities and execution.',
      'Prepared and reviewed contracts, estimates, final calculations, invoices, reports and email campaigns.',
      'Managed billing and payments with GoHighLevel and QuickBooks and tracked financial performance.',
      'Maintained CRM systems, project tracking sheets and SOPs to monitor clients, progress and KPIs.',
      'Coordinated project managers, subcontractors, vendors and suppliers on materials and updates.',
      'Supported sales with estimates, calls and deal closings; oversaw job postings and onboarding.',
      'Trained junior assistants and kept sensitive data confidential and secure.',
    ],
  },
  {
    role: 'General VA · Real Estate VA / Social Media Manager',
    company: 'Falloopi LLC',
    place: 'Houston, TX, USA',
    period: 'Jan 2024 – Aug 2024',
    industry: 'Real estate',
    highlights: [
      'Managed the agent’s calendar, calls, appointments and follow-ups.',
      'Cold-called homeowners, qualified sellers and passed warm leads to the broker.',
      'Handled buyer and seller inquiries by phone, email and social media.',
      'Generated leads through Houston-area Facebook groups and tracked pipeline results.',
    ],
  },
  {
    role: 'Executive Virtual Assistant · Creative Ad Specialist',
    company: 'Mortske Media',
    place: 'Wisconsin, USA',
    period: 'Jun 2023 – Jan 2024',
    industry: 'Video advertising',
    highlights: [
      'Organised incoming leads and kept KPI dashboards and trackers current in Notion.',
      'Coordinated recruitment, onboarding and scheduling for editors and freelancers.',
      'Booked filming dates, locations and logistics for videographers.',
      'Drafted ad scripts and briefs and gave final review on creative before release.',
      'Prepared invoices, tracked payments and handled account administration.',
    ],
  },
  {
    role: 'Real Estate Virtual Assistant · Wholesaler',
    company: 'Orange Grove Properties',
    place: 'California, USA',
    period: 'Apr 2020 – Mar 2023',
    industry: 'Real estate',
    highlights: [
      'Generated 5–12 qualified leads daily through targeted outreach.',
      'Ran SMS marketing campaigns and lead nurturing.',
      'Built partnerships through real estate agent outreach and coordinated VA outreach.',
      'Presented creative financing options and supported closings.',
    ],
  },
  {
    role: 'Sales & Customer Service Representative',
    company: 'iQor',
    place: 'Clark, Pampanga',
    period: '2018 & 2019 summer terms',
    industry: 'BPO',
    highlights: [
      'Closed 3–5 sales per day.',
      'Consistently met targets for speed, accuracy and productivity.',
      'Analysed real-time performance issues and recommended solutions.',
    ],
  },
  {
    role: 'Sales Marketing',
    company: 'Direct clients & business partners',
    place: 'Pampanga, Philippines',
    period: '2014 – 2018',
    industry: 'Sales',
    highlights: [
      'Negotiated deals with a minimum of 20% profit.',
      'Sold properties on the local marketplace.',
    ],
  },
]

export const projectClients = [
  { name: 'Brucksch & Sons Remodeling', place: 'Pasadena, USA', role: 'Social Media Manager', work: 'Competitive research, audience targeting, email campaigns, newsletters, video ads and scheduled content.' },
  { name: 'Grinergy LTD', place: 'Farnborough, England', role: 'Admin Management', work: 'Data entry, SOPs to streamline workflows, project scheduling and the CEO’s calendar.' },
  { name: 'Green Porte LLC', place: 'New York, USA', role: 'Lead Generation', work: 'Cold calling across campaigns, lead prospecting and daily lead nurturing.' },
  { name: 'Jmax SBS', place: 'Massachusetts, USA', role: 'B2B Appointment Setter', work: 'Reached decision-makers, qualified leads and provided quotations.' },
  { name: 'Jake Weber · Upwork', place: 'Minnesota, USA', role: 'Appointment Setter', work: 'Offered free inspections to storm-affected homeowners and scheduled appointments.' },
  { name: 'WeBuy315', place: 'New York, USA', role: 'Social Media Manager', work: 'Content creation, account setup, service marketing and logo making.' },
  { name: 'Blossom Waxing', place: 'New York, USA', role: 'Social Media Manager', work: 'Content creation and service marketing through social media.' },
]

// Quotes are copied word for word from the original screenshots.
export const testimonials = [
  {
    quote:
      'Excellent Service! We had a great experience with 2A Construction! The team did an excellent job, completed the project on time, and maintained great communication throughout the entire process. A special thank you to Kayla, who was our main point of contact from beginning to end. She was always responsive, helpful, and kept us updated every step of the way. We’re very happy with the results and would definitely recommend 2A Construction!',
    name: 'Sanjeshni Devi',
    context: '2A Construction client · 5-star review',
    stars: 5,
    screenshot: img('reviews/google-sanjeshni.webp'),
  },
  {
    quote:
      'I had the exterior of my home painted to include the trim, gutters and door stained. The job was done efficiently and professionally. I made a couple changes mid-way and they adapted nicely. Art and Kyla are a pleasure to work with.',
    name: 'Tracy Scuteri',
    context: '2A Construction client · 5-star review',
    stars: 5,
    screenshot: img('reviews/google-tracy.webp'),
  },
  {
    quote: 'Thank you for everything. You have been amazing to work with.',
    name: 'Mayra J.',
    context: '2A Construction customer',
    screenshot: img('reviews/customer-1.webp'),
  },
  {
    quote: 'You have been doing a great job so far so don’t worry about it. Have a great fantastic blessed weekend.',
    name: 'Josie A.',
    context: '2A Construction customer',
    screenshot: img('reviews/customer-3.webp'),
  },
  {
    quote: 'YOU CRUSHED THESE SCRIPTS!! only had to make very minor changes. Love it!',
    name: 'Agency lead',
    context: 'Ad script feedback · Slack',
    screenshot: img('reviews/client-6.webp'),
  },
  {
    quote: 'You are 1000% amazing. Best VA 🔥🔥🔥 Really appreciate, you are best 😊',
    name: 'Client',
    context: 'Direct message',
    screenshot: img('reviews/client-2.webp'),
  },
  {
    quote: 'Me either greatly appreciate 🔥🔥🔥🔥 You are top assistant 😊',
    name: 'Client',
    context: 'Direct message',
    screenshot: img('reviews/client-4.webp'),
  },
  {
    quote: 'Kyla you have amazing very beautiful voice 🔥🔥🔥',
    name: 'Client',
    context: 'Direct message',
    screenshot: img('reviews/client-3.webp'),
  },
]

export const reviewArchive = [
  { title: 'Sanjeshni Devi · 2A Construction', src: img('reviews/google-sanjeshni.webp') },
  { title: 'Tracy Scuteri · 2A Construction', src: img('reviews/google-tracy.webp') },
  { title: 'Upwork · Appointment Setter, 4.6 stars', src: img('reviews/upwork-appointment-setter.webp') },
  { title: 'Client Feedback 2', src: img('reviews/client-2.webp') },
  { title: 'Client Feedback 3', src: img('reviews/client-3.webp') },
  { title: 'Client Feedback 4', src: img('reviews/client-4.webp') },
  { title: 'Client Feedback 6', src: img('reviews/client-6.webp') },
  { title: 'Customer Feedback 1', src: img('reviews/customer-1.webp') },
  { title: 'Customer Feedback 2', src: img('reviews/customer-2.webp') },
  { title: 'Customer Feedback 3', src: img('reviews/customer-3.webp') },
  { title: 'Customer Feedback 4', src: img('reviews/customer-4.webp') },
  { title: 'Customer Feedback 5', src: img('reviews/customer-5.webp') },
  { title: 'Customer Feedback 6', src: img('reviews/customer-6.webp') },
]

export const upwork = {
  job: 'Appointment Setter',
  rating: 4.6,
  period: 'Jun 29 – Jul 9, 2023',
}

export const tools = [
  {
    group: 'CRM & sales',
    items: [
      { name: 'GoHighLevel', note: 'Expert' },
      { name: 'HubSpot' },
      { name: 'Salesforce' },
      { name: 'REIreply' },
      { name: 'Launch Control' },
      { name: 'BatchLeads' },
      { name: 'PropStream' },
      { name: 'REITakeOff' },
      { name: 'RingCentral' },
      { name: 'Compass' },
    ],
  },
  {
    group: 'Operations & projects',
    items: [{ name: 'Notion' }, { name: 'ClickUp' }, { name: 'Asana' }, { name: 'Monday.com' }, { name: 'QuickBooks' }],
  },
  {
    group: 'Design & architecture',
    items: [
      { name: 'AutoCAD' },
      { name: 'Revit' },
      { name: 'SketchUp' },
      { name: 'Lumion' },
      { name: 'V-Ray' },
      { name: 'D5 Render' },
    ],
  },
  {
    group: 'Marketing & creative',
    items: [{ name: 'Canva' }, { name: 'Photoshop' }, { name: 'MailChimp' }],
  },
]

export const skills = [
  'Architectural Planning',
  'Project Coordination',
  'CRM Management',
  'Lead Generation',
  'Calendar Management',
  'Campaign Management',
  'Sales Marketing',
  'Effective Phone Communication',
  'Social Media Management',
  'Content Creation & Graphic Design',
  'Email Marketing',
  'Audience Segmentation & Targeting',
  'Research & Analysis',
  'Admin & Customer Support',
  'Office Management',
  'Problem Solving',
]

export const contact = {
  heading: 'Let’s build something that runs smoothly',
  text: 'For roles, collaborations or portfolio requests, send a note. I reply from kylabelasss@gmail.com.',
}
