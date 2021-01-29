const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./../utils/keys');
const UserTest = require('./../models/userModel_test');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(401).json({ 
            error: 'you must be logged in!'
        });
    }

    try {
        const token = authorization.replace("Bearer ", "");
        // const token = authorization;
        jwt.verify(token, JWT_SECRET, async (err, payload) => {
            
            if(err) {
                return res.status(401).json({ 
                    error: 'invalid token!'
                });
            }

            const { _id } = payload;
            const userLogin = await UserTest.findById(_id);
            req.user = userLogin;
            next();
        })
        
    } catch (error) {
        console.log(error)
    }
    // next();
}