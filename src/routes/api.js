const express = require("express");
const router = express.Router();

const api = require("../controllers/apiController");
const { requireApiKey } = require("../middleware/apiAuth");

router.use(requireApiKey);

router.get("/getBalance", api.getBalance);
router.get("/getServicesList", api.getServicesList);
router.get("/getCountriesList", api.getCountriesList);
router.get("/getPrices", api.getPrices);
router.get("/getNumber", api.getNumber);
router.get("/getStatus", api.getStatus);
router.get("/setStatus", api.setStatus);

module.exports = router;