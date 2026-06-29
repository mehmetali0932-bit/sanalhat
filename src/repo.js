const db = require("./db");

function users() {
  return db.snapshot().users;
}

function findUserByEmail(email) {
  return users().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

function findUserById(userId) {
  return users().find((u) => u.id === userId);
}

function findUserByApiKey(apiKey) {
  return users().find((u) => u.apiKey === apiKey);
}

function createUser({ email, passwordHash }) {
  const data = db.snapshot();
  const user = {
    id: db.id(),
    email,
    passwordHash,
    balance: 100,
    apiKey: db.id().replace(/-/g, ""),
    isAdmin: data.users.length === 0,
    createdAt: new Date().toISOString()
  };
  data.users.push(user);
  db.save();
  return user;
}

function adjustBalance(userId, amount) {
  const data = db.snapshot();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return null;
  user.balance = Math.round((user.balance + amount) * 100) / 100;
  db.save();
  return user;
}

function regenerateApiKey(userId) {
  const data = db.snapshot();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return null;
  user.apiKey = db.id().replace(/-/g, "");
  db.save();
  return user;
}

function listServices() {
  return db.snapshot().services;
}

function getService(serviceId) {
  return listServices().find((s) => s.id === serviceId);
}

function listCountries() {
  return db.snapshot().countries;
}

function getCountry(countryId) {
  return listCountries().find((c) => c.id === countryId);
}

function priceFor(serviceId, countryId) {
  const service = getService(serviceId);
  const country = getCountry(countryId);
  if (!service || !country) return null;
  return Math.round(service.basePrice * country.multiplier * 100) / 100;
}

function randomPhoneNumber(country) {
  let local = "";
  for (let i = 0; i < 9; i++) local += Math.floor(Math.random() * 10);
  return `+${country.dialCode}${local}`;
}

function createOrder({ userId, serviceId, countryId }) {
  const data = db.snapshot();
  const service = getService(serviceId);
  const country = getCountry(countryId);
  if (!service || !country) throw new Error("Gecersiz servis veya ulke");
  const price = priceFor(serviceId, countryId);

  const order = {
    id: `${String(data.meta.nextOrderSeq).padStart(6, "0")}`,
    userId,
    serviceId,
    serviceName: service.name,
    countryId,
    countryName: country.name,
    phoneNumber: randomPhoneNumber(country),
    price,
    status: "PENDING",
    smsCode: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.meta.nextOrderSeq += 1;
  data.orders.unshift(order);
  db.save();
  return order;
}

function getOrder(orderId) {
  return db.snapshot().orders.find((o) => o.id === orderId);
}

function updateOrder(orderId, patch) {
  const data = db.snapshot();
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: new Date().toISOString() });
  db.save();
  return order;
}

function listOrdersForUser(userId) {
  return db.snapshot().orders.filter((o) => o.userId === userId);
}

function listAllOrders() {
  return db.snapshot().orders;
}

function stats() {
  const data = db.snapshot();
  const totalUsers = data.users.length;
  const totalOrders = data.orders.length;
  const totalRevenue = Math.round(data.orders.filter((o) => o.status === "RECEIVED" || o.status === "FINISHED").reduce((sum, o) => sum + o.price, 0) * 100) / 100;
  const activeOrders = data.orders.filter((o) => o.status === "PENDING").length;
  return { totalUsers, totalOrders, totalRevenue, activeOrders };
}

module.exports = { findUserByEmail, findUserById, findUserByApiKey, createUser, adjustBalance, regenerateApiKey, listServices, getService, listCountries, getCountry, priceFor, createOrder, getOrder, updateOrder, listOrdersForUser, listAllOrders, stats, users };