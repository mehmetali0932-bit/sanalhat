const repo = require("../repo");
const smsProvider = require("../services/smsProvider");

function getBalance(req, res) {
  res.json({ status: "OK", balance: req.apiUser.balance });
}

function getServicesList(req, res) {
  res.json({ status: "OK", services: repo.listServices() });
}

function getCountriesList(req, res) {
  res.json({ status: "OK", countries: repo.listCountries() });
}

function getPrices(req, res) {
  const { service, country } = req.query;
  if (service && country) {
    const price = repo.priceFor(service, country);
    if (price == null) return res.status(400).json({ status: "ERROR", message: "Gecersiz service/country." });
    return res.json({ status: "OK", service, country, price });
  }
  const services = repo.listServices();
  const countries = repo.listCountries();
  const table = {};
  for (const s of services) {
    table[s.id] = {};
    for (const c of countries) {
      table[s.id][c.id] = repo.priceFor(s.id, c.id);
    }
  }
  res.json({ status: "OK", prices: table });
}

function getNumber(req, res) {
  const { service, country } = req.query;
  const price = repo.priceFor(service, country);
  if (price == null) {
    return res.status(400).json({ status: "ERROR", message: "Gecersiz service/country parametresi." });
  }
  if (req.apiUser.balance < price) {
    return res.status(402).json({ status: "ERROR", message: "Yetersiz bakiye." });
  }
  const order = repo.createOrder({ userId: req.apiUser.id, serviceId: service, countryId: country });
  repo.adjustBalance(req.apiUser.id, -price);
  smsProvider.requestIncomingSms(order.id);
  res.json({ status: "OK", id: order.id, phoneNumber: order.phoneNumber, price: order.price });
}

function getStatus(req, res) {
  const order = repo.getOrder(req.query.id);
  if (!order || order.userId !== req.apiUser.id) {
    return res.status(404).json({ status: "ERROR", message: "Siparis bulunamadi." });
  }
  res.json({
    status: "OK",
    id: order.id,
    orderStatus: order.status,
    phoneNumber: order.phoneNumber,
    smsCode: order.smsCode
  });
}

function setStatus(req, res) {
  const order = repo.getOrder(req.query.id);
  if (!order || order.userId !== req.apiUser.id) {
    return res.status(404).json({ status: "ERROR", message: "Siparis bulunamadi." });
  }
  const action = String(req.query.status || "").toLowerCase();
  if (action === "cancel" && order.status === "PENDING") {
    smsProvider.cancelSimulation(order.id);
    repo.updateOrder(order.id, { status: "CANCELED" });
    repo.adjustBalance(req.apiUser.id, order.price);
  } else if (action === "finish" && order.status === "RECEIVED") {
    repo.updateOrder(order.id, { status: "FINISHED" });
  } else {
    return res.status(400).json({ status: "ERROR", message: "Gecersiz status gecisi." });
  }
  res.json({ status: "OK" });
}

module.exports = {
  getBalance,
  getServicesList,
  getCountriesList,
  getPrices,
  getNumber,
  getStatus,
  setStatus
};