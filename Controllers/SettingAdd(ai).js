const { User, Setting, AI } = require("../Schema/UserSchema")

const Settind_Add_AIPrefer = async (req, res) => {
    const { change } = req.body;
    
    if (!change) {
        return res.status(400).json({ msg: "Entries Missing" });
    }

    try {
        const Current_user = req.user;
        const Found_user = await User.findById(Current_user.id)
       const Found_Setting = await Setting.findById(Found_user.setting)

        if (!Found_Setting) {
            return res.status(404).json({ msg: "User settings not found" });
        }

        const AI_Pref = await AI.findById(Found_Setting.aiPreference);

        if (!AI_Pref) {
            return res.status(404).json({ msg: "AI Preferences not found" });
        }

        // Check if `change` is an object or a primitive type to handle all possible updates
        if (typeof change === 'number') {
            // Assuming 'personalization' is a number
            AI_Pref.personalization = change;
        } else if (typeof change === 'string') {
            // Assuming 'emailTone' is a string
            AI_Pref.emailTone = change;
        } else {
            return res.status(400).json({ msg: "Invalid input type" });
        }

        await AI_Pref.save();
        return res.status(200).json({ msg: "Changes made successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
};
module.exports = Settind_Add_AIPrefer