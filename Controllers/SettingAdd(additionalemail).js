const { User, Setting, AI } = require("../Schema/UserSchema")

const Settind_Add_AdditionalEmail = async (req , res)=>{
    const {additionalmail} = req.body
    if(!additionalmail){
        return res.status(400).json({msg:"Please Enter the mail"})
    }
    try{
    const Current_User = req.user
    const Found_user = await User.findOne({email:req.user.email})
    const Found_Setting = await Setting.findById(Found_user.setting)
    if(!Found_Setting){
        return res.status(400).json({msg:"User not Found"})
    }
    Found_Setting.additionalEmails.push(additionalmail)
    await Found_Setting.save()
    return res.status(200).json({msg:"Additional Email is added"})
    }
    catch(E){
        console.error("Error" , E)
    }
}

module.exports = Settind_Add_AdditionalEmail