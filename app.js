var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose =
        require("passport-local-mongoose"),
    User = require("./models/user");

const medicine = require("./models/medicine");
mongoose.connect("mongodb://localhost:27017/reddyDB", {useNewUrlParser: true});
const spawn = require("child_process").spawn;
var app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
 
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
//=====================
// ROUTES
//=====================
 
// Showing home page
var username;
var user_type;
var brandName;
app.get("/", function (req, res) {
    res.render("home");
});
 
// Showing secret page

 
// Showing register form
app.get("/register", function (req, res) {
    res.render("register");
});
 
// Handling user signup
app.post("/register", function (req, res) {
    username = req.body.username
    var password = req.body.password
    user_type = req.body.user_type
    User.register(new User({ username: username, user_type: user_type }),
            password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
 
        passport.authenticate("local")(
            req, res, function () {
                if (user_type === 'User') {
                    res.render("secret", {
                        username: username,
                        user_type: user_type
                    });
                }else{
                    res.render("admin");
                }

        });
    });
});
 
//Showing login form
app.get("/login", function (req, res) {
    res.render("login");
});

//Handling user login
app.post("/login", passport.authenticate("local"), function (req, res) {
    username = req.body.username
    User.findOne({username: username}, function (err, users) {
        if (users.user_type === 'User') {
            res.render("secret", {
                username: username,
                user_type: users.user_type
            });
        }else{
            res.redirect("/admin");
        } 
    })
    

});
app.get("/vote", function (req, res) {
    medicine
    .find({}, function(err, results) {
      if (err) {
        res.send(err);
      } else {
        res.render("result",{
            results: results});
      }
    })
    .limit(4);
});
app.post("/result", async function (req, res) {
    med = req.body.option;
    let finalVote = 0; 
    console.log(med);
    await medicine.findOne({medicine: med}, function (err, meds) {
        if (err) {
            console.log(err);  
        } else {
            finalVote = meds.vote + 1
            console.log(finalVote);
        }
    })
    console.log(finalVote);
    medicine.findOneAndUpdate({medicine: med}, {vote: finalVote}, function (err, docs) {
        if (err){
            console.log(err)
        }
    });

});
app.get("/admin", function (req, res) {
    res.render("admin")
})
app.post("/admin", function (req, res) {
    let country = req.body.Country
    console.log(country);
    const pythonProcess = spawn('python',["main.py"]);  
    res.render("display");
    pythonProcess.stdout.on('data', (data) => {
            brandName = data.toString();
            console.log(brandName);
           });
    
    setTimeout(function() {
        console.log(brandName);
        let med = new medicine({
            medicine: brandName,
            vote: 0
        });
        med.save(function (err) {
            if (err){
                console.log(err);
            }
        });
         
    }, 16000);
})
//Handling user logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
 
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
 
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});