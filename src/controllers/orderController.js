const repo = require("../repo");
const smsProvider = require("../services/smsProvider");

function dashboard(req, res) {
  const orders = repo.listOrdersForUser(req.user.id).slice(0, 20);
  res.render("dashboard", {
    services: repo.listServices(),
    countries: repo.listCountries(),
    orders,
    error: req.query.error || null
  });
}

function buyNumber(req, res) {
  const { serviceId, countryId } = req.body;
  const price = repo.priceFor(serviceId, countryId);
  if (price == null) {
    return res.redirect("/panel?error=" + encodeURIComponent("Gecersiz servis veya ulke secimi."));
  }
  if (req.user.balance < price) {
    return res.redirect("/panel?error=" + encodeURIComponent("Bakiyen yetersiz. Demo bakiye yuklemeyi dene."));
  }
  const order = repo.createOrder({ userId: req.user.id, serviceId, countryId });
  repo.adjustBalance(req.user.id, -price);
  smsProvider.requestIncomingSms(order.id);
  res.redirect("/panel#siparis-" + order.id);
}

function orderStatus(req, res) {
  const order = repo.getOrder(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ status: "ERROR", message: "Siparis bulunamadi." });
  }
  res.json({ status: "OK", order });
}

function cancelOrder(req, res) {
  const order = repo.getOrder(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ status: "ERROR", message: "Siparis bulunamadi." });
  }
  if (order.status === "PENDING") {
    smsProvider.cancelSimulation(order.id);
    repo.updateOrder(order.id, { status: "CANCELED" });
    repo.adjustBalance(req.user.id, order.price);
  }
  res.redirect("/panel");
}

function finishOrder(req, res) {
  const order = repo.getOrder(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ status: "ERROR", message: "Siparis bulunamadi." });
  }
  if (order.status === "RECEIVED") {
    repo.updateOrder(order.id, { status: "FINISHED" });
  }
  res.redirect("/panel");
}

function demoTopUp(req, res) {
  const amount = Math.min(Math.max(parseFloat(req.body.amount) || 0, 0), 1000);
  if (amount > 0) repo.adjustBalance(req.user.id, amount);
  res.redirect("/panel");
}

function regenerateApiKey(req, res) {
  repo.regenerateApiKey(req.user.id);
  res.redirect("/panel");
}

module.exports = {
  dashboard,
  buyNumber,
  orderStatus,
  cancelOrder,
  finishOrder,
  demoTopUp,
  regenerateApiKey
};