var express = require('express');
var router = express.Router();
const Joi = require("joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

const { authorize, roles } = require("../middlewares/authorize")

/**
 * @swagger
 *  /users:
 *    get:
 *      description: Get all users
 *      responses:
 *        200:
 *          description: Success
 */
router.get('/', async (req, res, next) => {
  res.json({
    users: await User.find({})
  })
});

/**
 * @swagger
 * /users/regiser:
 *  post:
 *    desription: registers a new user to codeground
 *    reponses:
 *      200:
 *        description: User created
 *      401:
 *        description: validation error
 *      500:
 *        description: Couldn't create the user
 */
router.post("/register", async (req, res) => {
  const data = req.body
  const validator = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  const validationResult = validator.validate(data)
  if (!validationResult.error) {
    const { username, email, password } = req.body
    const salt = await bcrypt.genSalt(parseInt(process.env.ROUNDS));
    const hashPassowrd = await bcrypt.hash(password, salt)
    try {
      await User.create({
        username: username,
        email: email,
        password: hashPassowrd
      })
      res.json({
        status: "success",
        message: "User created"
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({
        status: "error",
        message: "Couldn't create the user"
      })
    }
  } else {
    res.status(400).json({
      status: "error",
      message: "validation error"
    })
  }
})


/**
 * @swagger
 * /users/login:
 *  post:
 *    desription: Login to codeground
 *    reponses:
 *      200:
 *        description: success
 *      404:
 *        description: No user of username was found
 *      401:
 *        description: Password is incorrect
 */

router.post("/login", async (req, res) => {
  const data = req.body
  const validator = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })

  const validationResult = validator.validate(data)
  if (!validationResult.error) {
    const { username, password } = req.body
    const user = await User.findOne({ username: username }).exec()
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `No user of username ${username} was found`
      })

    }

    // user found
    // 1. Compare password
    console.log(user)
    const passwordDoesMatch = await bcrypt.compare(password, user.password)
    if (!passwordDoesMatch) {
      return res.status(401).json({
        status: "error",
        message: "Password is incorrect"
      })
    }

    // 2. Generate toke with role
    const token = jwt.sign({
      id: user._id,
      username: username,
      role: roles.User
    }, process.env.JWT_SECRET, {
      expiresIn: 36000
    })

    // 3. Send token
    return res.json({
      status: "success",
      token
    })
  } else {
    res.status(401).json({
      status: "error",
      message: "validation error"
    })
  }
})


router.get("/test", authorize([roles.User, roles.Admin]), (req, res) => {
  res.json("allowed!!")
})


module.exports = router;
