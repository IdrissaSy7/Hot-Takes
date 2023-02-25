const Sauce = require("../models/sauce");
const fs = require("fs");

// Créer un objet
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Afficher tout les objets
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Afficher les objets individuellement
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

// Modifier un objet
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce) {
      if (req.file) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.log(err);
        });
      }
      Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
        .catch((error) => res.status(400).json({ error }));
    } else {
      res.status(404).json({ error: "Sauce non trouvée" });
    }
  });
};

// Liker une sauce
exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const sauceId = req.params.id;
  const like = req.body.like;

  Sauce.findOne({ _id: sauceId })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: "Sauce non trouvée" });
      }
      switch (like) {
        case 1: // Like sur la sauce
          sauce.likes++;
          sauce.usersLiked.push(userId);
          break;
        case 0: // Le like/Dislike est retiré
          if (sauce.usersLiked.includes(userId)) {
            sauce.likes--;
            sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
          } else if (sauce.usersDisliked.includes(userId)) {
            sauce.dislikes--;
            sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
          }
          break;
        case -1: // Dislike sur la sauce
          sauce.dislikes++;
          sauce.usersDisliked.push(userId);
          break;
        default:
          return res.status(400).json({ message: "Mauvaise requête" });
      }
      sauce
        .save()
        .then(() => {
          const message =
            like === 1
              ? "Like ajouté à la sauce"
              : like === -1
              ? "Dislike ajouté à la sauce"
              : "Like/dislike retiré de la sauce";

          res.status(200).json({ message: message });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Supprimer un objet
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
