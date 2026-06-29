const repo = require("../repo");

const PENDING_TIMERS = new Map();

function randomCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10);
  return code;
}

function requestIncomingSms(orderId, { minMs = 4000, maxMs = 12000 } = {}) {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  const timer = setTimeout(() => {
    const order = repo.getOrder(orderId);
    if (order && order.status === "PENDING") {
      repo.updateOrder(orderId, { status: "RECEIVED", smsCode: randomCode() });
    }
    PENDING_TIMERS.delete(orderId);
  }, delay);
  PENDING_TIMERS.set(orderId, timer);
}

function cancelSimulation(orderId) {
  const timer = PENDING_TIMERS.get(orderId);
  if (timer) {
    clearTimeout(timer);
    PENDING_TIMERS.delete(orderId);
  }
}

module.exports = { requestIncomingSms, cancelSimulation };