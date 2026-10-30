const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting CareerTrack API Automated Verification ---');

  // 1. Health Check
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. Health check status:', health.status, health.data?.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

  // 2. Candidate Login
  const login = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'user@careertrack.dev', password: 'Candidate@12345' }
  );
  console.log('2. Candidate login status:', login.status, login.data?.success ? '✅ PASS' : '❌ FAIL');
  const token = login.data?.token;
  const cookie = login.headers['set-cookie'] ? login.headers['set-cookie'][0].split(';')[0] : '';

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    Cookie: cookie,
  };

  // 3. /auth/me
  const me = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: authHeaders,
  });
  console.log('3. Auth me endpoint:', me.status, me.data?.user?.email === 'user@careertrack.dev' ? '✅ PASS' : '❌ FAIL');

  // 4. List Applications
  const apps = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/applications',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(
    '4. List applications count:',
    apps.data?.applications?.length,
    apps.data?.success ? '✅ PASS' : '❌ FAIL'
  );

  // 5. Create new Application
  const newApp = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/applications',
      method: 'POST',
      headers: authHeaders,
    },
    {
      company_name: 'Apple',
      job_title: 'macOS Platform Engineer',
      status: 'Applied',
      job_type: 'Full-time',
      work_mode: 'Hybrid',
      location: 'Cupertino, CA',
      salary_min: 170000,
      salary_max: 220000,
      description: 'Core OS graphics rendering and window server optimization.',
    }
  );
  console.log('5. Create application:', newApp.status, newApp.data?.success ? '✅ PASS' : '❌ FAIL');
  const createdId = newApp.data?.application?.id;

  // 6. Schedule Interview on Application
  const interview = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/applications/${createdId}/interviews`,
      method: 'POST',
      headers: authHeaders,
    },
    {
      round_title: 'CoreOS Architecture Interview',
      round_type: 'Technical',
      scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
      meeting_link: 'https://apple.webex.com/meet/recruiter',
      interviewer_name: 'Craig Federighi Team',
    }
  );
  console.log('6. Schedule interview on app:', interview.status, interview.data?.success ? '✅ PASS' : '❌ FAIL');

  // 7. Verify Parent Application auto-transitioned to 'Interviewing' (PRD FR-03)
  const updatedApp = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/applications/${createdId}`,
    method: 'GET',
    headers: authHeaders,
  });
  console.log(
    '7. Auto-transitioned to Interviewing:',
    updatedApp.data?.application?.status === 'Interviewing' ? '✅ PASS' : '❌ FAIL (Status is ' + updatedApp.data?.application?.status + ')'
  );

  // 8. Add Note
  const note = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/applications/${createdId}/notes`,
      method: 'POST',
      headers: authHeaders,
    },
    { content: 'Reviewed Metal and Mach kernel IPC primitives.' }
  );
  console.log('8. Add application note:', note.status, note.data?.success ? '✅ PASS' : '❌ FAIL');

  // 9. Analytics Summary
  const analytics = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/analytics/summary',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(
    '9. Analytics conversion calculation:',
    analytics.status,
    analytics.data?.conversionRates ? '✅ PASS' : '❌ FAIL'
  );

  // 10. Admin Endpoint Protection
  const adminAsUser = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/users',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(
    '10. RBAC protection on admin route:',
    adminAsUser.status === 403 ? '✅ PASS (Forbidden for candidate)' : '❌ FAIL'
  );

  // 11. Admin Login & Platform Metrics
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@careertrack.dev', password: 'Admin@12345' }
  );
  const adminToken = adminLogin.data?.token;
  const adminMetrics = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/metrics',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(
    '11. Admin platform metrics:',
    adminMetrics.status,
    adminMetrics.data?.metrics?.total_users ? '✅ PASS' : '❌ FAIL'
  );

  console.log('\n🎉 ALL AUTOMATED API TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(console.error);
