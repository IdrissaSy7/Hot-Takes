const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const cors = require("cors");
const app = express();

app.use(express.json()); //Body parser
app.use(cors());

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// Connexion  a la database mongooDB
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PASSWORD}@cluster0.fqkxzba.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Autorise les requètes du locahost 4200 au 3000
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Initialisation de helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Permet de charger des ressources externes à la page
  })
);

// Limiter les requetes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limite à 50 demandes par fenêtre
  standardHeaders: true, // Permet de signifier a l'utilisateur quand il peut réessayer
  legacyHeaders: false, // Envoie les réponses les plus récentes
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
app.use("/api", limiter);

module.exports = app;
