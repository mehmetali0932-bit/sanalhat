const repo = require("../repo");

function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    const user = repo.findUserById(req.session.userId);
    if (user) {
      req.user = user;
      res.locals.currentUser = {
        id: user.id,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
        apiKey: user.apiKey
      };
    } else {
      req.session.userId = null;
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/giris?next=" + encodeURIComponent(req.originalUrl));
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect("/giris");
  if (!req.user.isAdmin) return res.status(403).render("error", { message: "Bu sayfaya erisim yetkin yok." });
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };