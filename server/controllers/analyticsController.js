const db = require('../config/db');

// GET /api/v1/analytics/summary
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. KPI Counts
    const kpiRes = await db.query(
      `SELECT 
        COUNT(*)::int AS total_applications,
        COUNT(CASE WHEN status NOT IN ('Rejected', 'Withdrawn', 'Archived', 'Accepted') THEN 1 END)::int AS active_applications,
        COUNT(CASE WHEN status = 'Interviewing' THEN 1 END)::int AS interviewing_count,
        COUNT(CASE WHEN status = 'Offer' THEN 1 END)::int AS offer_count,
        COUNT(CASE WHEN status = 'Accepted' THEN 1 END)::int AS accepted_count,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END)::int AS rejected_count,
        COUNT(CASE WHEN status = 'Wishlist' THEN 1 END)::int AS wishlist_count
       FROM applications WHERE user_id = $1`,
      [userId]
    );

    const kpi = kpiRes.rows[0];

    // 2. Stage Breakdown for Funnel
    const stageRes = await db.query(
      `SELECT status, COUNT(*)::int AS count
       FROM applications
       WHERE user_id = $1
       GROUP BY status`,
      [userId]
    );

    const stagesMap = {
      Wishlist: 0,
      Applied: 0,
      Screening: 0,
      Shortlisted: 0,
      Interviewing: 0,
      Offer: 0,
      Accepted: 0,
      Rejected: 0,
      Withdrawn: 0,
      Archived: 0,
    };

    stageRes.rows.forEach((r) => {
      if (stagesMap[r.status] !== undefined) {
        stagesMap[r.status] = r.count;
      }
    });

    // Funnel progressive metrics
    // Total Applied = all except Wishlist
    const totalApplied = kpi.total_applications - stagesMap.Wishlist;
    const reachedScreening = totalApplied - stagesMap.Applied;
    const reachedInterview = stagesMap.Interviewing + stagesMap.Offer + stagesMap.Accepted;
    const reachedOffer = stagesMap.Offer + stagesMap.Accepted;

    const conversionRates = {
      appliedToScreening: totalApplied > 0 ? Math.round((reachedScreening / totalApplied) * 100) : 0,
      screeningToInterview: reachedScreening > 0 ? Math.round((reachedInterview / reachedScreening) * 100) : 0,
      interviewToOffer: reachedInterview > 0 ? Math.round((reachedOffer / reachedInterview) * 100) : 0,
      overallSuccess: totalApplied > 0 ? Math.round((reachedOffer / totalApplied) * 100) : 0,
    };

    // 3. Weekly Application Velocity (past 8 weeks)
    const velocityRes = await db.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('week', applied_date), 'YYYY-MM-DD') AS week_start,
        COUNT(*)::int AS count
       FROM applications
       WHERE user_id = $1 
         AND applied_date IS NOT NULL
         AND applied_date >= CURRENT_DATE - INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', applied_date)
       ORDER BY DATE_TRUNC('week', applied_date) ASC`,
      [userId]
    );

    // 4. Job Type & Work Mode Distribution
    const jobTypeRes = await db.query(
      `SELECT job_type, COUNT(*)::int AS count
       FROM applications
       WHERE user_id = $1
       GROUP BY job_type
       ORDER BY count DESC`,
      [userId]
    );

    const workModeRes = await db.query(
      `SELECT work_mode, COUNT(*)::int AS count
       FROM applications
       WHERE user_id = $1
       GROUP BY work_mode
       ORDER BY count DESC`,
      [userId]
    );

    // 5. Expiring Deadlines & Assessments (< 5 days)
    const deadlinesRes = await db.query(
      `SELECT 
        a.id,
        a.job_title,
        a.status,
        a.deadline_date,
        c.name AS company_name,
        c.logo_url AS company_logo,
        (a.deadline_date - CURRENT_DATE)::int AS days_remaining
       FROM applications a
       JOIN companies c ON a.company_id = c.id
       WHERE a.user_id = $1
         AND a.deadline_date IS NOT NULL
         AND a.deadline_date >= CURRENT_DATE
         AND a.deadline_date <= CURRENT_DATE + INTERVAL '5 days'
       ORDER BY a.deadline_date ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      kpi,
      stageBreakdown: stagesMap,
      conversionRates,
      weeklyVelocity: velocityRes.rows,
      jobTypeDistribution: jobTypeRes.rows,
      workModeDistribution: workModeRes.rows,
      expiringDeadlines: deadlinesRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalyticsSummary,
};
