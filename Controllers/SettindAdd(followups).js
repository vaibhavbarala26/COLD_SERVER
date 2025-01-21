const { User, Setting, Followup } = require("../Schema/UserSchema");

const Settind_Add_Follow_up = async (req, res) => {
    const { template, followUps, followupDays } = req.body;

    if (!template && !followUps && !followupDays) {
        return res.status(400).json({ msg: "No updates provided" });
    }

    try {
        const Current_User = req.user;
        const Found_user = await User.findOne({email:req.user.email});
        
        if (!Found_user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const Found_settings = await Setting.findById(Found_user.setting);
        console.log(Found_user , Found_settings);
        
        if (!Found_settings) {
            return res.status(404).json({ msg: "Setting not found" });
        }
        const followup_found =await Followup.findById(Found_settings.followup)
        console.log(followup_found);
        
        // Update only the fields that are provided in the request body
        if (template) followup_found.template = template;
        if (followUps !== undefined) followup_found.followUps = followUps; // handle both true/false
        if (followupDays) followup_found.followupDays = followupDays;

        // Save the updated setting back to the database
        await followup_found.save();
        console.log("saved" , followup_found);
        
        return res.status(200).json({ msg: "Settings updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
};

module.exports = Settind_Add_Follow_up;
