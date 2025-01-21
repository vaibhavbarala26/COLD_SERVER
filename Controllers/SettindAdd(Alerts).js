const { User, Setting, Notification } = require("../Schema/UserSchema");

const Settind_Add_Alerts = async (req, res) => {
    const { emailAlerts, performanceNotification } = req.body;

    // Check if any updates are provided
    if (emailAlerts === undefined && performanceNotification === undefined) {
        return res.status(400).json({ msg: "No updates provided" });
    }

    try {
        const Current_User = req.user;
        const Found_User = await User.findOne({email:req.user.email})

        if (!Found_User) {
            return res.status(404).json({ msg: "User not found" });
        }

        const Found_setting = await Setting.findById(Found_User.setting);

        if (!Found_setting) {
            return res.status(404).json({ msg: "Setting not found" });
        }

        const FoundAlerts = await Notification.findById(Found_setting.notification);

        if (!FoundAlerts) {
            return res.status(404).json({ msg: "Notification settings not found" });
        }

        // Update the notification settings if provided in the request
        if (emailAlerts !== undefined) {
            FoundAlerts.emailAlerts = emailAlerts;
        }
        if (performanceNotification !== undefined) {
            FoundAlerts.performanceNotification = performanceNotification;
        }

        // Save the updated notification settings
        await FoundAlerts.save();

        return res.status(200).json({ msg: "Notification settings updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
};

module.exports = Settind_Add_Alerts;
