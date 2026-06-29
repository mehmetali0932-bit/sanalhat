const repo = require("../repo");

function requireApiKey(req, res, next) {
  const apiKey = req.query.api_key || req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ status: "ERROR", message: "API anahtari (api_key) eksik." });
  }
  const user = repo.findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ status: "ERROR", message: "Gecersiz API anahtari." });
  }
  req.apiUser = user;
  next();
}

module.exports = { requireApiKey };