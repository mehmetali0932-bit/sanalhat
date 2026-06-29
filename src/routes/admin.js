const express = require("express");
const router = express.Router();

const admin = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/auth");

router.use(requireAdmin);

router.get("/", admin.dashboard);
router.get("/kullanicilar", admin.usersList);
router.post("/kullanicilar/:id/bakiye", admin.adjustUserBalance);
router.get("/servisler", admin.servicesList);
router.post("/servisler/:id/fiyat", admin.updateServicePrice);
router.get("/siparisler", admin.ordersList);

module.exports = router;