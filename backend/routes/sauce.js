const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const stuffCtrl = require("../controllers/sauce");

router.post("/", auth, multer, stuffCtrl.createSauce); // Créer un objet
router.get("/", auth, stuffCtrl.getAllSauces); // Afficher tout les objets
router.get("/:id", auth, stuffCtrl.getOneSauce); // Afficher les objets individuellement
router.put("/:id", auth, multer, stuffCtrl.modifySauce); // Modifier un objet
router.post("/:id/like", auth, stuffCtrl.likeSauce); // Liker un objet
router.delete("/:id", auth, stuffCtrl.deleteSauce); // Supprimer un objet

module.exports = router;
