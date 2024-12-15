const app = require("express").Router();
const {register, login, googleOauth2, changePw} = require("../controllers/auth.controller")
const {restrict, googleAuth, authGoogleCallback} = require("../middlewares/googleAuth")

app.get("/auth/google", googleAuth);
app.get("/auth/google/callback", authGoogleCallback, googleOauth2);
app.post("/register", register);
app.post("/login", login);
app.post("/changepw", restrict, changePw);

module.exports = app;