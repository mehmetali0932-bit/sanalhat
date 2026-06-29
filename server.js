const path = require("path");
const express = require("express");
const session = require("express-session");

const { attachUser } = require("./src/middleware/auth");
const webRoutes = require("./src/routes/web");
const apiRoutes = require("./src/routes/api");
const adminRoutes = require("./src/routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sanalhat-demo-secret-degistir",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
  })
);

app.use(attachUser);

app.use("/api/v1", apiRoutes);
app.use("/admin", adminRoutes);
app.use("/", webRoutes);

app.use((req, res) => {
  res.status(404).render("error", { message: "Sayfa bulunamadi." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { message: "Beklenmeyen bir hata olustu." });
});

app.listen(PORT, () => {
  console.log(`SanalHat sunucusu: http://localhost:${PORT}`);
});