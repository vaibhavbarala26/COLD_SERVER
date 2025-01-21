const mongoose = require("mongoose")
const connection = async () => {
    try{
        await mongoose.connect(process.env.DB_URL)
            .then(() => (
                console.log("connected to DB")
            ))
        }
        catch(error){
            console.log("Error");
            
        }
   
}
module.exports = connection;
