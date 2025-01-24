const { User, Setting } = require("../Schema/UserSchema");

const Get_Email_additional = async (req, res) => {
    try {
        const { email } = req.user;
        if (!email) {
            return res.status(400).json({ error: "Email is required in the request." });
        }

        // Find the user by email
        const Found_user = await User.findOne({ email });
        if (!Found_user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Validate user settings
        if (!Found_user.setting) {
            return res.status(400).json({ error: "User settings not defined." });
        }

        // Find the setting by its ID
        const Found_setting = await Setting.findById(Found_user.setting);
        if (!Found_setting) {
            return res.status(404).json({ error: "Settings not found for this user." });
        }

        // Return the additional emails
        const Found_Additional_emails = Found_setting.additionalEmails || [];
        return res.status(200).json(Found_Additional_emails);

    } catch (error) {
        // Handle unexpected errors
        console.error("Error retrieving additional emails:", error);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
};
module.exports = Get_Email_additional