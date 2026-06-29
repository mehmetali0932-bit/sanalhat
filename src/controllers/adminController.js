const repo = require("../repo");
const db = require("../db");

function dashboard(req, res) {
  res.render("admin/dashboard", { stats: repo.stats() });
}

function usersList(req, res) {
  res.render("admin/users", { users: repo.users() });
}

function adjustUserBalance(req, res) {
  const amount = parseFloat(req.body.amount);
  if (!Number.isNaN(amount)) {
    repo.adjustBalance(req.params.id, amount);
  }
  res.redirect("/admin/kullanicilar");
}

function servicesList(req, res) {
  res.render("admin/services", {
    services: repo.listServices(),
    countries: repo.listCountries()
  });
}

function updateServicePrice(req, res) {
  const data = db.snapshot();
  const service = data.services.find((s) => s.id === req.params.id);
  const newPrice = parseFloat(req.body.basePrice);
  if (service && !Number.isNaN(newPrice) && newPrice >= 0) {
    service.basePrice = newPrice;
    db.save();
  }
  res.redirect("/admin/servisler");
}

function ordersList(req, res) {
  res.render("admin/orders", { orders: repo.listAllOrders().slice(0, 200) });
}

module.exports = {
  dashboard,
  usersList,
  adjustUserBalance,
  servicesList,
  updateServicePrice,
  ordersList
};