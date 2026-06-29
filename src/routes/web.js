const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");
const { requireAuth } = require("../middleware/auth");
const repo = require("../repo");

router.get("/", (req, res) => {
  res.render("index", {
    services: repo.listServices().slice(0, 6),
    countries: repo.listCountries()
  });
});

router.get("/api-dokumantasyon", (req, res) => {
  res.render("api-docs");
});

router.get("/kayit", authController.showRegister);
router.post("/kayit", authController.doRegister);
router.get("/giris", authController.showLogin);
router.post("/giris", authController.doLogin);
router.post("/cikis", authController.doLogout);

router.get("/panel", requireAuth, orderController.dashboard);
router.post("/panel/satin-al", requireAuth, orderController.buyNumber);
router.get("/panel/siparis/:id/durum", requireAuth, orderController.orderStatus);
router.post("/panel/siparis/:id/iptal", requireAuth, orderController.cancelOrder);
router.post("/panel/siparis/:id/tamamla", requireAuth, orderController.finishOrder);
router.post("/panel/demo-bakiye-yukle", requireAuth, orderController.demoTopUp);
router.post("/panel/api-anahtari-yenile", requireAuth, orderController.regenerateApiKey);

module.exports = router;