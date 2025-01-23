const jwt = require("jsonwebtoken")
const Verify_user = (req, res, next) => {
    const user_token = req.signedCookies.user_token;
    console.log("request"  , req)
    try {
        if (!user_token) {
            return res.status(400).json({ mag: "Token Not found" })
        }
        jwt.verify(user_token, process.env.SECRET_KEY, (err, payload) => {
            if (err) {
                console.error("Token verification error", err);
                return res.status(401).json({ msg: "Token is not valid" });
            }
            
            req.user = payload;

            next();

        })
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token has expired, please login again" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ msg: "Invalid token, authorization denied" });
        }
        console.error("Token verification error:", err);
        return res.status(500).json({ msg: "Internal server error" });
    }

}
module.exports = Verify_user