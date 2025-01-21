const express = require("express")
const connection = require("./Configuration/connect")
const User_Router = require("./Router/UserRouter")
const cookiParser = require("cookie-parser")
const Verify_user = require("./Middleware/Verify_User")
const Email_Router = require("./Router/EmailRouter")
const cors = require("cors");
const app = express()
app.use(cookiParser("HELLOBHAI"))
app.use(cors({
    origin:["http://localhost:5173", "https://3894-2401-4900-7401-b311-38d7-4d3e-a8a7-6f53.ngrok-free.app/" , "https://cold-8uu31jkw0-vaibhavbarala26s-projects.vercel.app"],
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
