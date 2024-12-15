const jwt = require("jsonwebtoken");
const {PrismaClient} = require("@prisma/client");
const passport = require("passport");
const prisma = new PrismaClient();

const restrict = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if(!token){
            return res.status(401).json({
                status:401,
                message: "Token not provided"
            });
        }

        jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
            if(err){
                return res.status(401).json({
                    status: 401,
                    message:err.message
                });
            }

            const user = await prisma.user.findUnique({
                where:{
                    id: data.id
                }
            });

            if(!user){
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                })
            }

            delete user.password;
            req.user = user;
            next();
        });
    } catch (error) {
        next(error)
    }
}

const googleAuth = passport.authenticate("google", {
    scope: ["email", "profile"],
    prompt: "select_account"
});

const authGoogleCallback = passport.authenticate("google", {
    failureRedirect: "api/auth/google",
    session: false
});

module.exports = {
    googleAuth,
    authGoogleCallback,
    restrict
}