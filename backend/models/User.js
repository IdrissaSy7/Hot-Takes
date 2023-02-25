const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Schéma de données pour un user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
