const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const targetDbName = process.env.DB_NAME || 'careertrack';

async function initDatabase() {
  console.log(`[DB INIT] Connecting to PostgreSQL on ${dbConfig.host}:${dbConfig.port}...`);
  
  // 1. Connect to default postgres DB to ensure target database exists
  const rootClient = new Client({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (res.rowCount === 0) {
      console.log(`[DB INIT] Database "${targetDbName}" does not exist. Creating it...`);
      await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`[DB INIT] Database "${targetDbName}" created successfully.`);
    } else {
      console.log(`[DB INIT] Database "${targetDbName}" already exists.`);
    }
  } catch (err) {
    console.error(`[DB INIT] Error checking/creating database:`, err.message);
    throw err;
  } finally {
    await rootClient.end();
  }

  // 2. Connect to the target careertrack database and apply schema
  const appClient = new Client({
    ...dbConfig,
    database: targetDbName,
  });

  try {
    await appClient.connect();
    console.log(`[DB INIT] Connected to database "${targetDbName}". Applying schema...`);

    const schemaPath = path.join(__dirname, '..', 'migrations', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await appClient.query(schemaSql);
    console.log(`[DB INIT] Schema & indexes applied successfully!`);

    // 3. Seed initial data
    console.log(`[DB INIT] Seeding initial data...`);
    const saltRounds = 12;
    const adminPassHash = await bcrypt.hash('Admin@12345', saltRounds);
    const userPassHash = await bcrypt.hash('Candidate@12345', saltRounds);

    // Insert Admin
    const adminRes = await appClient.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, target_role, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email`,
      ['admin@careertrack.dev', adminPassHash, 'System Administrator', 'admin', true, 'Engineering Lead', 'San Francisco, CA']
    );

    // Insert Candidate User
    const userRes = await appClient.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, target_role, location, bio, portfolio_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email`,
      [
        'user@careertrack.dev',
        userPassHash,
        'Alex Rivers',
        'user',
        true,
        'Full Stack Software Engineer',
        'Seattle, WA',
        'Passionate software engineer building resilient, user-centric web applications and scalable APIs.',
        'https://github.com/alexrivers-dev'
      ]
    );

    const candidateId = userRes.rows[0].id;
    console.log(`[DB INIT] Seeded Users: admin@careertrack.dev and user@careertrack.dev`);

    // Insert Companies
    const companies = [
      { name: 'Google', website: 'https://careers.google.com', logo: 'https://logo.clearbit.com/google.com' },
      { name: 'Stripe', website: 'https://stripe.com/jobs', logo: 'https://logo.clearbit.com/stripe.com' },
      { name: 'Microsoft', website: 'https://careers.microsoft.com', logo: 'https://logo.clearbit.com/microsoft.com' },
      { name: 'OpenAI', website: 'https://openai.com/careers', logo: 'https://logo.clearbit.com/openai.com' },
      { name: 'Airbnb', website: 'https://careers.airbnb.com', logo: 'https://logo.clearbit.com/airbnb.com' },
      { name: 'Datadog', website: 'https://www.datadoghq.com/careers', logo: 'https://logo.clearbit.com/datadoghq.com' },
      { name: 'Netflix', website: 'https://jobs.netflix.com', logo: 'https://logo.clearbit.com/netflix.com' },
      { name: 'Figma', website: 'https://www.figma.com/careers', logo: 'https://logo.clearbit.com/figma.com' },
    ];

    const companyMap = {};
    for (const c of companies) {
      const compRes = await appClient.query(
        `INSERT INTO companies (name, website, logo_url) VALUES ($1, $2, $3) RETURNING id, name`,
        [c.name, c.website, c.logo]
      );
      companyMap[c.name] = compRes.rows[0].id;
    }
    console.log(`[DB INIT] Seeded ${companies.length} companies.`);

    // Insert Applications for candidate
    const today = new Date();
    const addDays = (d, n) => {
      const date = new Date(d);
      date.setDate(date.getDate() + n);
      return date.toISOString().split('T')[0];
    };
    const addDaysTime = (d, n, hours = 14) => {
      const date = new Date(d);
      date.setDate(date.getDate() + n);
      date.setHours(hours, 0, 0, 0);
      return date.toISOString();
    };

    const applicationsData = [
      {
        company: 'Stripe',
        job_title: 'Full Stack Engineer - Billing',
        status: 'Interviewing',
        job_type: 'Full-time',
        work_mode: 'Remote',
        location: 'Seattle / Remote',
        salary_min: 165000,
        salary_max: 210000,
        applied_date: addDays(today, -14),
        deadline_date: addDays(today, 3),
        description: 'Building high-throughput payment primitives, developer APIs, and resilient checkout flows.',
        app_url: 'https://stripe.com/jobs/req-1029',
      },
      {
        company: 'Google',
        job_title: 'Software Engineer III - Cloud Platforms',
        status: 'Interviewing',
        job_type: 'Full-time',
        work_mode: 'Hybrid',
        location: 'Mountain View, CA',
        salary_min: 175000,
        salary_max: 235000,
        applied_date: addDays(today, -20),
        deadline_date: addDays(today, 6),
        description: 'Distributed infrastructure and kubernetes service orchestrations for Google Cloud.',
        app_url: 'https://careers.google.com/jobs/results/901',
      },
      {
        company: 'OpenAI',
        job_title: 'Frontend Platform Engineer',
        status: 'Offer',
        job_type: 'Full-time',
        work_mode: 'Hybrid',
        location: 'San Francisco, CA',
        salary_min: 200000,
        salary_max: 260000,
        applied_date: addDays(today, -30),
        deadline_date: addDays(today, 5),
        description: 'Interactive generative UI streaming interfaces and AI canvas workspaces.',
        app_url: 'https://openai.com/careers/fe-platform',
      },
      {
        company: 'Airbnb',
        job_title: 'Senior Frontend Engineer - Guest Experience',
        status: 'Screening',
        job_type: 'Full-time',
        work_mode: 'Remote',
        location: 'Remote (US)',
        salary_min: 160000,
        salary_max: 205000,
        applied_date: addDays(today, -5),
        deadline_date: addDays(today, 12),
        description: 'Next-generation search & discovery experiences for millions of global travelers.',
        app_url: 'https://careers.airbnb.com/positions/3301',
      },
      {
        company: 'Microsoft',
        job_title: 'Software Engineer II - Azure Core',
        status: 'Shortlisted',
        job_type: 'Full-time',
        work_mode: 'Hybrid',
        location: 'Redmond, WA',
        salary_min: 150000,
        salary_max: 190000,
        applied_date: addDays(today, -10),
        deadline_date: addDays(today, 2),
        description: 'Scalable cloud storage telemetry and microservices architecture.',
        app_url: 'https://careers.microsoft.com/azure-eng',
      },
      {
        company: 'Datadog',
        job_title: 'Software Engineer - Distributed Tracing',
        status: 'Applied',
        job_type: 'Full-time',
        work_mode: 'Remote',
        location: 'Remote',
        salary_min: 155000,
        salary_max: 195000,
        applied_date: addDays(today, -2),
        deadline_date: addDays(today, 15),
        description: 'Observability agent collectors and high-throughput real-time metric pipelines.',
        app_url: 'https://datadoghq.com/careers/trace-eng',
      },
      {
        company: 'Netflix',
        job_title: 'UI Engineer - Content Ingestion',
        status: 'Rejected',
        job_type: 'Full-time',
        work_mode: 'Hybrid',
        location: 'Los Gatos, CA',
        salary_min: 190000,
        salary_max: 240000,
        applied_date: addDays(today, -45),
        deadline_date: null,
        description: 'Studio tools and digital asset management workflows for production suites.',
        app_url: 'https://jobs.netflix.com/ui-studio',
      },
      {
        company: 'Figma',
        job_title: 'Product Engineer - Multiplayer Collaboration',
        status: 'Wishlist',
        job_type: 'Full-time',
        work_mode: 'Hybrid',
        location: 'San Francisco, CA',
        salary_min: 180000,
        salary_max: 225000,
        applied_date: null,
        deadline_date: addDays(today, 20),
        description: 'Real-time WebGL rendering canvas and collaborative multi-user editing engine.',
        app_url: 'https://figma.com/careers/eng',
      }
    ];

    const appRecords = [];
    for (const app of applicationsData) {
      const companyId = companyMap[app.company];
      const res = await appClient.query(
        `INSERT INTO applications (
          user_id, company_id, job_title, status, job_type, work_mode,
          location, salary_min, salary_max, application_url, description,
          applied_date, deadline_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, job_title, company_id`,
        [
          candidateId, companyId, app.job_title, app.status, app.job_type, app.work_mode,
          app.location, app.salary_min, app.salary_max, app.app_url, app.description,
          app.applied_date, app.deadline_date
        ]
      );
      appRecords.push({ ...res.rows[0], companyName: app.company });
    }
    console.log(`[DB INIT] Seeded ${appRecords.length} applications.`);

    // Seed Interviews
    const stripeApp = appRecords.find(a => a.companyName === 'Stripe');
    const googleApp = appRecords.find(a => a.companyName === 'Google');
    const openaiApp = appRecords.find(a => a.companyName === 'OpenAI');

    if (stripeApp) {
      // Past Screening
      await appClient.query(
        `INSERT INTO interviews (application_id, round_title, round_type, scheduled_at, meeting_link, interviewer_name, outcome, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          stripeApp.id,
          'Recruiter Screening Call',
          'Screening',
          addDaysTime(today, -7, 10),
          'https://meet.google.com/abc-defg-hij',
          'Sarah Jenkins',
          'Passed',
          'Great conversation regarding background in React and microservices. Advanced to technical round.'
        ]
      );

      // Upcoming Technical in 2 days (Matches dashboard upcoming 7-day requirement)
      await appClient.query(
        `INSERT INTO interviews (application_id, round_title, round_type, scheduled_at, meeting_link, interviewer_name, outcome, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          stripeApp.id,
          'System Architecture & API Design',
          'Technical',
          addDaysTime(today, 2, 14),
          'https://zoom.us/j/9876543210',
          'Marcus Chen (Staff Architect)',
          'Pending',
          'Focus on idempotency, rate limiting, and distributed state consistency.'
        ]
      );
    }

    if (googleApp) {
      // Upcoming Google Tech Round in 4 days
      await appClient.query(
        `INSERT INTO interviews (application_id, round_title, round_type, scheduled_at, meeting_link, interviewer_name, outcome, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          googleApp.id,
          'Coding Loop - Algorithms & Concurrency',
          'Technical',
          addDaysTime(today, 4, 11),
          'https://meet.google.com/goo-gle-loop',
          'David Kim & Elena Torres',
          'Pending',
          'Trees/Graphs, concurrency primitives, and complexity analysis.'
        ]
      );
    }

    if (openaiApp) {
      // Completed interview loops leading to offer
      await appClient.query(
        `INSERT INTO interviews (application_id, round_title, round_type, scheduled_at, meeting_link, interviewer_name, outcome, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          openaiApp.id,
          'Frontend Systems & Real-time Canvas',
          'Technical',
          addDaysTime(today, -10, 13),
          'https://zoom.us/j/1234567890',
          'Liam Taylor',
          'Passed',
          'Discussed WebGL canvas rendering, diffing algorithms, and web workers.'
        ]
      );

      await appClient.query(
        `INSERT INTO interviews (application_id, round_title, round_type, scheduled_at, meeting_link, interviewer_name, outcome, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          openaiApp.id,
          'Leadership & Culture Alignment',
          'Behavioral',
          addDaysTime(today, -6, 15),
          'https://zoom.us/j/1234567891',
          'Rachel Zhao (VP of Engineering)',
          'Passed',
          'Strong team alignment and passion for AI developer ergonomics.'
        ]
      );
    }
    console.log(`[DB INIT] Seeded interviews successfully.`);

    // Seed Notes
    if (stripeApp) {
      await appClient.query(
        `INSERT INTO notes (application_id, user_id, content) VALUES ($1, $2, $3)`,
        [stripeApp.id, candidateId, 'Reviewed Stripe API conventions, idempotency keys, and webhook signing before the round.']
      );
    }
    if (openaiApp) {
      await appClient.query(
        `INSERT INTO notes (application_id, user_id, content) VALUES ($1, $2, $3)`,
        [openaiApp.id, candidateId, 'Offer received: $215k base + equity package. Expiration window in 5 days.']
      );
    }

    console.log(`\n========================================`);
    console.log(`✅ CareerTrack Database Initialized & Seeded!`);
    console.log(`Demo Accounts:`);
    console.log(`👤 Candidate : user@careertrack.dev  / Candidate@12345`);
    console.log(`🛡️ Admin     : admin@careertrack.dev / Admin@12345`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error(`[DB INIT] Error executing schema/seeds:`, err);
    throw err;
  } finally {
    await appClient.end();
  }
}

initDatabase().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
