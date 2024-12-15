// const { getHTML, sendEmail } = require("../libs/mailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
    try {
        const {nama, email, password} = req.body
        if(!nama || !email || !password){
            return res.status(400).json({
                status: false,
                message: "Bad Request"
            });
        }

        const exist = await prisma.user.findFirst({where: {email: email}});
        if(exist){
            return res.status(403).json({
                status: false,
                message: "Email has been used"
            });
        }

        const encryptedPw = await bcrypt.hash(password, 10);
        const newUser = await prisma.newUser.create({
            data:{
                email,
                password: encryptedPw,
                Profile:{
                    create:{
                        name
                    }
                }
            }
        });

        const token = jwt.sign(newUser, process.env.JWT_KEY);
        delete newUser.password;

        res.cookie("token", token, {httpOnly: true})
        // return res.redirect
    } catch (error) {
        next(error)
    }
};

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({
                status: false,
                message: "Bad request"
            });
        }

        const userLog = await prisma.user.findFirst({where: { email: email }});
        if(!userLog){
            return res.status(401).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const checkPw = await bcrypt.compare(password, userLog.password);
        if(!checkPw){
            return res.status(401).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const isGoogleUser = await prisma.user.findUnique({ where: {email: email}});
        if(isGoogleUser.isgoogleuser){
            return res.status(403).json({
                status: false,
                message: "Account has already signed using Google"
            });
        }

        delete userLog.password;
        
        const token = jwt.sign(userLog, process.env.JWT_KEY);
        res.cookie("token", token, { httpOnly: true });
    } catch (error) {
        next(error);
    }
};

const googleOauth2 = async (req, res, next) => {
    try {
        const user  = await prisma.user.findUnique({
            where:{
                id: req.user.id
            }
        });

        const token = jwt.sign({d: req.user.id}, process.env.JWT_KEY);
        return res.redirect(`${process.env.REDIRECT_URL}`)
    } catch (error) {
        next(error)
    }
}

const changePw = async (req, res, next) => {
    try {
        const {oldPw, newPw, confirmPw} = req.body
        const user = await prisma.user.findUnique({
            where: {id: req.user.id}
        });

        if(!user){
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        if(!newPw || !oldPw || confirmPw){
            return res.status(400).json({
                status: false,
                message: "Bad request"
            });
        }

        if(newPw !== confirmPw){
            return res.status(401).json({
                status: false,
                message: "Password does not match !"
            });
        }

        const validationPw = await bcrypt.compare(oldPw, user.password);
        if(!validationPw){
            return res.status(401).json({
                status: false,
                message: "Password Invalid !"
            });
        }

        const encryptedPw = await bcrypt.hash(newPw, 10);

        await prisma.user.update({
            data:{
                password: encryptedPw
            },
            where:{
                id: user.id
            }
        });

        return res.status(200).json({
            status: true,
            message: "Success"
        })
    } catch (error) {
        next(error)
    }
}



module.exports = {
    register, login, googleOauth2, changePw
};
