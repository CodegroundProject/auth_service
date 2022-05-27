var express = require('express');
var router = express.Router();
const Joi = require("joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Manager = require("../models/managers")

const { authorize, roles } = require("../middlewares/authorize")

/* GET managers listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post("/register", async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        manager_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })

    const validationResult = validator.validate(data)
    if (!validationResult.error) {
        const { manager_name, email, password } = req.body
        const salt = await bcrypt.genSalt(parseInt(process.env.ROUNDS));
        const hashPassowrd = await bcrypt.hash(password, salt)
        try {
            await Manager.create({
                manager_name: manager_name,
                email: email,
                password: hashPassowrd
            })
            res.json({
                status: "success",
                message: "Manager created"
            })
        } catch (e) {
            console.error(e)
            res.status(500).json({
                status: "error",
                message: "Couldn't create the manager"
            })
        }
    } else {
        res.status(500).json({
            status: "error",
            message: "validation error"
        })
    }
})


router.post("/login", async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        manager_name: Joi.string().required(),
        password: Joi.string().required()
    })

    const validationResult = validator.validate(data)
    if (!validationResult.error) {
        const { manager_name, password } = req.body
        const manager = await Manager.findOne({ manager_name: manager_name }).exec()
        if (!manager) {
            return res.status(401).json({
                status: "error",
                message: `No manager of manager_name ${manager_name} was found`
            })

        }

        // manager found
        // 1. Compare password
        console.log(manager)
        const passwordDoesMatch = await bcrypt.compare(password, manager.password)
        if (!passwordDoesMatch) {
            return res.status(401).json({
                status: "error",
                message: "Password is incorrect"
            })
        }

        // 2. Generate toke with role
        const token = jwt.sign({
            id: manager._id,
            username: manager_name,
            role: roles.Manager
        }, process.env.JWT_SECRET, {
            expiresIn: 36000
        })

        // 3. Send token
        return res.json({
            status: "success",
            token
        })
    } else {
        res.status(500).json({
            status: "error",
            message: "validation error"
        })
    }
})


module.exports = router;
