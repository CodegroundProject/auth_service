const mongoose = require("mongoose")
const uuid = require('uuid');


const ManagerSchema = new mongoose.Schema({
    manager_id: { type: String, required: true, unique: true, default: "manager_" + uuid.v4() },
    manager_name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

}, {
    collection: "managers"
})


const model = mongoose.model("ManagerModel", ManagerSchema)

module.exports = model 