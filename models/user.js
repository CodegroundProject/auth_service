const mongoose = require("mongoose")
const uuid = require('uuid');


const UserSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true, default: "user_" + uuid.v4() },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

}, {
    collection: "users"
})


const model = mongoose.model("UserModel", UserSchema)

module.exports = model 