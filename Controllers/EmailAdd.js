const { User, CampaignDetails,  Email, OpenRate, ResponseRate, ClickRate } = require("../Schema/UserSchema");

const Add_email = async (req, res) => {
  try {
    const {
      emails,
      name,
      status,
      followUpsEnabled,
      followUpDays,
      openRate,
      responseRate,
      clickRate,
      scheduleDate,
      aiAssistanceUsed,
      linkedResume,
    } = req.body;

    // Check for required fields
    if (!emails || !name || !status || !scheduleDate) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Validate emails array
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ msg: "Invalid email array" });
    }

    // Save the emails to the database
    const savedEmails = await Email.insertMany(emails);
    const emailIds = savedEmails.map((email) => email._id);
    const savedOpenrate = await OpenRate.insertMany(openRate)
    const savedopenids = savedOpenrate.map((open)=>open._id)
    const savedresponserate = await ResponseRate.insertMany(responseRate)
    const savedresposnseid = savedresponserate.map((res)=>res._id)
    const savedClickrate = await ClickRate.insertMany(clickRate)
    const clickrateid = savedClickrate.map((click)=>click._id)
    // Create the campaign
    const campaign = new CampaignDetails({
      name,
      status,
      email: emailIds,
      followUpDays,
      followUpsEnabled,
      
      scheduleDate,
      aiAssistanceUsed,
      linkedResume,
    });

    // Save the campaign to the database
    await campaign.save();

    // Find the user by email
    const user = req.user;
    const foundUser = await User.findOne({ email: user.email });

    if (!foundUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Add the campaign to the user's campaign list
    foundUser.campaign.push(campaign);
    await foundUser.save();

    // Return the updated user
    return res.status(200).json({ user: foundUser , campaign});
  } catch (error) {
    console.error("Error in Add_email:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = Add_email;
