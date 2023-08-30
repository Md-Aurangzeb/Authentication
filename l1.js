require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();



app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(("publlic")));



mongoose.connect("mongodb://localhost:27017/userDB").catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = new mongoose.model("User", userSchema);




app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});




app.post("/register", async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    await newUser.save().catch(err => console.log(err)).then(res.render("secrets"))
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const foundUser = await User.findOne({ email: username }).exec();
    if(foundUser){
        if(foundUser.password===password){
            res.render("secrets");
        }
    }
});







app.listen(process.env.PORT, () => {
    console.log(`server is hosted on http://localhost:${process.env.PORT}`);
})