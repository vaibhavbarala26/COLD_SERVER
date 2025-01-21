const { google } = require("googleapis");
const { OAuth2Client } = require("../Configuration/GoogleAPI.js");
const { Email, User, Setting, Followup, CampaignDetails } = require("../Schema/UserSchema.js");
const agenda = require("../Configuration/Agenda.js");


agenda.define("send mail", async (job) => {
  const { emails, id, access_token, refresh_token , linkedResume } = job.attrs.data;
  
  // Initialize Gmail client with OAuth2 credentials
  const gmail = google.gmail({ version: "v1", auth: OAuth2Client });
  OAuth2Client.setCredentials({ access_token, refresh_token });

  let successCount = 0;
  
  for (let email of emails) {
    try {
      const emailLines = [
        `To: ${email.recipientList}`,
        `Subject: ${email.subject}`,
        `Content-Type: text/html; charset="UTF-8"`,
        '',
        `<p>${email.salutation}</p>` +
        `<p>${email.openingline} ${email.introduction}</p>`+
        `</p> ${email.details}</p>` +
        `<p>${email.action}</p>` +
        `<p>${email.closingline}</p>`+
        `<p>${email.regards}`+
        `<p>${email.name}`+
        `<p>${email.mobilenumber}</p>`


      ];
       
      if (email.links && email.links.length > 0) {
        email.links.forEach((link) => {
          emailLines.push(`<p><a href="http://localhost:1042/email/track?email=${email.recipientList}&campaignId=${id}&url=${encodeURIComponent(link.url)}">${link.label}</a></p>`);

        });
      }
      const emailContent = emailLines.join("\r\n");
      const encodedEmail = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedEmail },
      });

      console.log(`Email sent successfully to ${email.recipientList}: ${result.data.id}`);
      successCount++;
    } catch (error) {
      console.error(`Failed to send email to ${email.recipientList}: ${error.message}`);
    }
  }

  // Update campaign status if all emails have been sent
  if (successCount === emails.length) {
    const foundCampaign = await CampaignDetails.findById(id);
    if (foundCampaign) {
      foundCampaign.status = "Completed";
      await foundCampaign.save();
      console.log(`Campaign status updated to "Completed"`);
    }
  }
});


const Email_Schedule_Send = async (req, res) => {
  try {
    let { access_token, refresh_token, email } = req.user;
    const {emails , followup_value , aiAssistance , scheduleDate , linkedResume} = req.body
    // Save emails to database
    if(!refresh_token){
      const Found_user = await User.findOne({email:email})
      refresh_token = Found_user.refresh_token
    }
    const email_to_save = emails.map((email)=>({
      subject:email.subject,
      body:`${email.salutation} ${email.openingline} ${email.introduction} ${email.details} ${email.action} ${email.closingline}`,
      sender:req.user.email,
      recipientList:email.recipientList
    }))
    const saved_mail = await Email.insertMany(email_to_save)
    const Saved_mail_id = saved_mail.map((mail) => mail._id);
    console.log(scheduleDate);
    
    // Update follow-up settings
    const Found_User = await User.findOne({ email: email });
    const Found_setting = await Setting.findById(Found_User.setting);
    const followup = await Followup.findById(Found_setting.followup);
    followup.followUps = followup_value;
    await followup.save();

    // Create and save campaign details
    //const scheduleDate = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3 minutes from now
    const Scheduled_campaign = new CampaignDetails({
      name: `${Found_User.name}'s Campaign - ${scheduleDate}`,
      createdAt: Date.now(),
      status: "Scheduled",
      email: Saved_mail_id,
      followUpsEnabled: followup_value,
      followUpDays: followup.followupDays,
      scheduleDate: scheduleDate,
      aiAssistanceUsed: aiAssistance,
      linkedResume: linkedResume,
    });
    await Scheduled_campaign.save();

    const campaignId = Scheduled_campaign._id;

    // Schedule agenda job
    await agenda.start();
    await agenda.schedule(scheduleDate, "send mail", { emails, id: campaignId, access_token, refresh_token , linkedResume });

    res.status(200).json({ message: "Emails scheduled successfully." });
  } catch (error) {
    console.error("Error scheduling emails:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = Email_Schedule_Send;
