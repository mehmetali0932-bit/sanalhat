const bcrypt = require("bcryptjs");
const repo = require("../repo");

function showRegister(req, res) {
  res.render("register", { error: null });
}

async function doRegister(req, res) {
  const { email, password, passwordConfirm } = req.body;
  if (!email || !password) {
    return res.status(400).render("register", { error: "E-posta ve sifre gerekli." });
  }
  if (password.length < 6) {
    return res.status(400).render("register", { error: "Sifre en az 6 karakter olmali." });
  }
  if (password !== passwordConfirm) {
    return res.status(400).render("register", { error: "Sifreler eslesmiyor." });
  }
  if (repo.findUserByEmail(email)) {
    return res.status(400).render("register", { error: "Bu e-posta ile zaten bir hesap var." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = repo.createUser({ email, passwordHash });
  req.session.userId = user.id;
  res.redirect("/panel");
}

function showLogin(req, res) {
  res.render("login", { error: null, next: req.query.next || "/panel" });
}

async function doLogin(req, res) {
  const { email, password } = req.body;
  const nextUrl = req.body.next || "/panel";
  const user = repo.findUserByEmail(email || "");
  if (!user) {
    return res.status(400).render("login", { error: "E-posta veya sifre hatali.", next: nextUrl });
  }
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) {
    return res.status(400).render("login", { error: "E-posta veya sifre hatali.", next: nextUrl });
  }
  req.session.userId = user.id;
  res.redirect(nextUrl);
}

function doLogout(req, res) {
  req.session.destroy(() => res.redirect("/"));
}

module.exports = { showRegister, doRegister, showLogin, doLogin, doLogout };