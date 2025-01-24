const express = require("express")
const connection = require("./Configuration/connect")
const User_Router = require("./Router/UserRouter")
const cookiParser = require("cookie-parser")
const Verify_user = require("./Middleware/Verify_User")
const Email_Router = require("./Router/EmailRouter")
const cors = require("cors");
const app = express()
app.use(cookiParser(process.env.SECRET_KEY))
app.use(cors({
    origin:["http://localhost:5173",  "https://cold-nine.vercel.app"],
    credentials:true,
}))
const PORT = 1042
app.use(express.json())
app.use("/user" , User_Router)
app.use("/email", Email_Router)
connection()
.then(()=>{
    
    app.listen(PORT , ()=>{
        console.log("Listening to PORT " , PORT);
        
        })
})
