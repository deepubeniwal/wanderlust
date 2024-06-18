const User = require("../models/user.js")

module.exports.renderSignup = (req, res)=>{
    res.render("user/signup.ejs");
}

module.exports.signup = async(req,res)=>{
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username}) ;
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Registered Successfully , Welcome to Wanderlust");
    res.redirect("./listings");
    });
    
    }
    catch(e){
        req.flash("error", e.message);
        console.log(e)
        res.redirect("/signup");
    }
};

module.exports.renderLogin = (req, res)=>{
    res.render("user/login.ejs");
};


module.exports.login = async(req, res)=> {
    req.flash("success", "welcome back to Wanderlust")
    let redirectUrl = res.locals.redirectUrl || "/listings";

  res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged Out!");
        res.redirect("/listings");
    });
};