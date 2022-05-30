const mongoose = require("mongoose")
const uuid = require('uuid');


const AdminSchema = new mongoose.Schema({
    manager_id: { type: String, required: true, unique: true, default: "admin_" + uuid.v4() },
    admin_name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

}, {
    collection: "admins"
})


const model = mongoose.model("AdminModel", AdminSchema)

module.exports = model 