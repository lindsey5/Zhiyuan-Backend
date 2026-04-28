import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import {
    downloadAllDistributorSales,
    downloadDistributorSales,
    getAllDistributorSales,
    getDistributorItemsSoldPerMonth,
    getDistributorItemsSoldThisMonth,
    getDistributorItemsSoldThisWeek,
    getDistributorItemsSoldThisYear,
    getDistributorItemsSoldToday,
    getDistributorMonthlySales,
    getDistributorMostSellingProducts,
    getDistributorSales,
    getDistributorSalesThisMonth,
    getDistributorSalesThisWeek,
    getDistributorSalesThisYear,
    getDistributorSalesToday,
} from "../controllers/distributorSaleController";

const router = Router();

/**
 * ============================================================
 * SALES LISTING
 * ============================================================
 * View all distributor sales records (paginated, searchable, sortable)
 */
router.get(
  "/",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_VIEW_ALL),
  getAllDistributorSales
);

/**
 * ============================================================
 * OVERALL SALES STATISTICS (ALL DISTRIBUTORS)
 * ============================================================
 * Used for dashboard stats/analytics (today, week, month, year)
 */
router.get(
  "/today",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorSalesToday
);

router.get(
  "/this-week",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorSalesThisWeek
);

router.get(
  "/this-month",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorSalesThisMonth
);

router.get(
  "/this-year",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorSalesThisYear
);

/**
 * ============================================================
 * OVERALL ITEMS SOLD STATISTICS (ALL DISTRIBUTORS)
 * ============================================================
 * Returns total quantity of items sold (today, week, month, year)
 */
router.get(
  "/items/today",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorItemsSoldToday
);

router.get(
  "/items/this-week",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorItemsSoldThisWeek
);

router.get(
  "/items/this-month",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorItemsSoldThisMonth
);

router.get(
  "/items/this-year",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorItemsSoldThisYear
);

/**
 * ============================================================
 * OVERALL MONTHLY REPORTS (ALL DISTRIBUTORS)
 * ============================================================
 * Returns monthly sales/items sold breakdown (Jan-Dec)
 */
router.get(
  "/monthly",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  hasAnyPermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW, PERMISSIONS.DASHBOARD_VIEW),
  getDistributorMonthlySales
);

router.get(
  "/items-sold",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  hasAnyPermission(PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW, PERMISSIONS.DASHBOARD_VIEW),
  getDistributorItemsSoldPerMonth
);

/**
 * ============================================================
 * SALES STATISTICS BY DISTRIBUTOR ID
 * ============================================================
 * Dashboard stats for a specific distributor (today, week, month, year)
 */
router.get(
  "/today/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorSalesToday
);

router.get(
  "/this-week/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorSalesThisWeek
);

router.get(
  "/this-month/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorSalesThisMonth
);

router.get(
  "/this-year/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorSalesThisYear
);

/**
 * ============================================================
 * ITEMS SOLD STATISTICS BY DISTRIBUTOR ID
 * ============================================================
 * Returns total quantity of items sold (today, week, month, year)
 */
router.get(
  "/items/today/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorItemsSoldToday
);

router.get(
  "/items/this-week/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorItemsSoldThisWeek
);

router.get(
  "/items/this-month/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorItemsSoldThisMonth
);

router.get(
  "/items/this-year/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorItemsSoldThisYear
);

/**
 * ============================================================
 * MONTHLY SALES REPORT BY DISTRIBUTOR ID
 * ============================================================
 * Returns monthly sales breakdown (Jan-Dec) for a distributor
 */
router.get(
  "/monthly/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
  getDistributorMonthlySales
);

/**
 * ============================================================
 * MONTHLY ITEMS SOLD REPORT BY DISTRIBUTOR ID
 * ============================================================
 * Returns items sold breakdown per month (Jan-Dec) for a distributor
 */
router.get(
    "/items-sold/:id",
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
    getDistributorItemsSoldPerMonth
);

router.get(
    '/download/:id',
    createRateLimiter(5 * 60 * 1000, 5),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_VIEW),
    downloadDistributorSales
)

router.get(
    '/download',
    createRateLimiter(5 * 60 * 1000, 5),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_VIEW_ALL),
    downloadAllDistributorSales
)

router.get(
  '/most-selling',
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  hasAnyPermission(PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.DISTRIBUTOR_REPORTS_VIEW),
  getDistributorMostSellingProducts
)

/**
 * ============================================================
 * SALES RECORDS BY DISTRIBUTOR ID
 * ============================================================
 * View sales records of a specific distributor (paginated, searchable, sortable)
 */
router.get(
  "/:id",
  createRateLimiter(5 * 60 * 1000, 100),
  authenticate,
  authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_VIEW),
  getDistributorSales
);

const distributorSaleRoutes = router;
export default distributorSaleRoutes;