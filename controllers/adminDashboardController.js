const pool = require("../dbConfig");

const adminController = {
  async getDashboardMetrics(req, res) {
    try {
      const metrics = {};
      // Add 1 to convert from JS month (0-11) to SQL month (1-12)
      const selectedMonth =
        (parseInt(req.query.month) || new Date().getMonth()) + 1;
      const year = new Date().getFullYear();

      const totalRevenueQuery = `
  SELECT 
    COALESCE(SUM(CASE WHEN Verified = 'Verified' THEN PaymentAmount ELSE 0 END), 0) as TotalRevenue
  FROM Payment
`;

      // Get top spending customers
      const topSpendersQuery = `
                SELECT 
                    p.ParentID,
                    CONCAT(p.FirstName, ' ', p.LastName) as FullName,
                    SUM(pay.PaymentAmount) as TotalSpent
                FROM Parent p
                JOIN Slot s ON p.ParentID = s.ParentID
                JOIN Payment pay ON s.SlotID = pay.SlotID
                WHERE pay.Verified = 'Verified'
                GROUP BY p.ParentID
                ORDER BY TotalSpent DESC
                LIMIT 5
            `;

      // Get most active participants
      const activeParticipantsQuery = `
                SELECT 
                    p.ParentID,
                    CONCAT(p.FirstName, ' ', p.LastName) as FullName,
                    COUNT(DISTINCT s.ProgrammeID) as ProgrammeCount
                FROM Parent p
                JOIN Slot s ON p.ParentID = s.ParentID
                GROUP BY p.ParentID
                ORDER BY ProgrammeCount DESC
                LIMIT 5
            `;

      // Get programme popularity
      const popularProgrammesQuery = `
                SELECT 
                    p.ProgrammeID,
                    p.ProgrammeName,
                    COUNT(s.SlotID) as EnrollmentCount
                FROM Programme p
                LEFT JOIN Slot s ON p.ProgrammeID = s.ProgrammeID
                GROUP BY p.ProgrammeID
                ORDER BY EnrollmentCount DESC
                LIMIT 5
            `;

      // Get revenue by month
      const monthlyRevenueQuery = `
        SELECT 
          DATE(PaymentDate) as Date,
          SUM(CASE WHEN Verified = 'Verified' THEN PaymentAmount ELSE 0 END) as Revenue
        FROM Payment 
        WHERE MONTH(PaymentDate) = ? AND YEAR(PaymentDate) = ?
        GROUP BY DATE(PaymentDate)
        ORDER BY Date ASC
      `;

      // Get average ratings
      const ratingsQuery = `
                SELECT 
                    p.ProgrammeID,
                    p.ProgrammeName,
                    ROUND(AVG(r.Rating), 2) as AverageRating,
                    COUNT(r.ReviewID) as ReviewCount
                FROM Programme p
                LEFT JOIN Reviews r ON p.ProgrammeID = r.ProgrammeID
                GROUP BY p.ProgrammeID
                ORDER BY AverageRating DESC
                LIMIT 5
            `;

      const membershipCountQuery = `
            SELECT 
                Membership,
                COUNT(*) as MemberCount
            FROM Parent
            GROUP BY Membership
        `;

      // Execute all queries concurrently
      const [
        topSpenders,
        activeParticipants,
        popularProgrammes,
        monthlyRevenue,
        ratings,
        totalRevenue,
        membershipCounts,
      ] = await Promise.all([
        pool.query(topSpendersQuery),
        pool.query(activeParticipantsQuery),
        pool.query(popularProgrammesQuery),
        pool.query(monthlyRevenueQuery, [selectedMonth, year]),
        pool.query(ratingsQuery),
        pool.query(totalRevenueQuery),
        pool.query(membershipCountQuery),
      ]);

      metrics.topSpenders = topSpenders[0];
      metrics.activeParticipants = activeParticipants[0];
      metrics.popularProgrammes = popularProgrammes[0];
      metrics.monthlyRevenue = monthlyRevenue[0];
      metrics.ratings = ratings[0];
      metrics.totalRevenue = totalRevenue[0];
      metrics.membershipCounts = membershipCounts[0];

      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = adminController;
