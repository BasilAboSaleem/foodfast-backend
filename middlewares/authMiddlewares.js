var jwt = require("jsonwebtoken");
const UserModel = require("../models/User")

const requireAuth = (req,res,next) => {
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, process.env.JWTSECRET_KEY, (err) => {
            if(err){
                res.redirect("/signin")
            }else{
                next()
            }
            
        })

}else{
    res.redirect("/signin")
}

}
const checkIfUser =  (req, res, next) => {
 
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWTSECRET_KEY, async (err, decoded) => {
      if (err) {
        res.locals.user = null;
        req.user = null; 
        next();
      } else {
        const currentUser = await UserModel.findById(decoded.id);
        res.locals.user = currentUser;
        req.user = currentUser  
        next();
      }
    });
  } else {
    res.locals.user = null;
    req.user = null; 
    next();
  }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.render("pages/error/403", {
            title: "Access Denied",
            message: "You do not have permission to access this page."
        });
    }
}


module.exports = {
    requireAuth,
    checkIfUser,
    isAdmin

}