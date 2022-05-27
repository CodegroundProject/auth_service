const jwt = require("jsonwebtoken")

const roles = {
    Admin: 'admin',
    Manager: 'manager',
    User: 'user',
}

const authorize = (roles = []) => {
    // roles param can be a single role string (e.g. Role.User or 'User')
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        const authHeaders = req.headers["authorization"]
        const token = authHeaders && authHeaders.split(" ")[1]
        if (token == null) return res.sendStatus(401) // Unauthorized
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            console.log(user)
            if (err) return res.sendStatus(403)
            req.user = user
        })
        console.log(req.user.role);
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(401).json({
                message: 'Unauthorized role'
            })
        }
        next();
    };
}

module.exports = {
    authorize,
    roles
}