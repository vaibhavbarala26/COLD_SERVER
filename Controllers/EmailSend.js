
const { google } = require("googleapis");
const { OAuth2Client } = require("../Configuration/GoogleAPI");
const { Email, CampaignDetails, User, Setting, Followup } = require("../Schema/UserSchema");

// Helper to chunk emails for batch processing
const chunkEmails = (emails, size) => {
  const chunks = [];
  while (emails.length) {
    chunks.push(emails.splice(0, size));
  }
  return chunks;
};

// Helper to send an email with retry mechanism
const sendEmailWithRetry = async (gmail, email, linkedResume,id, retries = 3) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const emailLines = [
        `To: ${email.recipientList}`,
        `Subject: ${email.subject}`,
        `Content-Type: text/html; charset="UTF-8"`,
        '',
        `
        <p>${email.salutation}</p>
        <p>${email.openingline} ${email.introduction}</p>
        <p>${email.details}</p>
        <p>${email.action}</p>
        <p>${email.closingline}</p>
        <p>
          ${email.regards}<br>
          ${email.name}<br>
          ${email.mobilenumber}
        </p>
       
        `
      ];
      
      if (email.links && email.links.length > 0) {
        email.links.forEach((link) => {
          emailLines.push(`<p><a href="http://localhost:1042/email/track?email=${email.recipientList}&campaignId=${id}&url=${encodeURIComponent(link.url)}">${link.label}</a></p>`);

        });
      }
 
      const emailContent = emailLines.join('\r\n');
      const encodedEmail = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Base64url encoding

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail },
      });

      console.log(`Email sent successfully to ${email.recipientList}: ${result.data.id}`);
      return { success: true, recipient: email.recipientList };
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed to send email to ${email.recipientList}:`, error.message);
      if (attempt === retries) {
        return { success: false, recipient: email.recipientList, error: error.message };
      }
    }
  }
};

const Email_Send = async (req, res) => {
  let { access_token, refresh_token , email} = req.user; // Assuming `emails` is part of the request
  console.log(access_token , refresh_token);
  if(!refresh_token){
    const Found_user = await User.findOne({email:email})
    refresh_token = Found_user.refresh_token
  }
  const {emails , followup_value , linkedResume ,aiAssistance} = req.body
  const gmail = google.gmail({ version: 'v1', auth: OAuth2Client });
  OAuth2Client.setCredentials({ access_token, refresh_token });
console.log(emails);

  try {
    const email_to_save = emails.map((email)=>({
      subject:email.subject,
      body:`${email.salutation} ${email.openingline} ${email.introduction} ${email.details} ${email.action} ${email.closingline}`,
      sender:req.user.email,
      recipientList:email.recipientList,
      recipientName:email.recipientName
    }))
    const saved_mail = await Email.insertMany(email_to_save)
    const Saved_mailids = saved_mail.map((mail)=>mail._id)
 
    const Found_user = await User.findOne({email:req.user.email})
   
    const Found_setting = await Setting.findById(Found_user.setting)
    const followup = await Followup.findById(Found_setting.followup)
    followup.followUps = followup_value;
    await followup.save()
    const Saved_campaign = new CampaignDetails({
                      name:`${Found_user.name}'s Campaign - ${ Date.now()}`,
                      createdAt:Date.now(),
                      status:"Completed",
                      email: Saved_mailids,
                      followUpsEnabled:followup_value,
                      followUpDays:followup.followupDays,
                      scheduleDate:Date.now(),
                      aiAssistanceUsed:aiAssistance,
                      linkedResume:linkedResume
                  })
                  await Saved_campaign.save()
    Found_user.campaign.push(Saved_campaign)
    await Found_user.save()
    const emailChunks = chunkEmails([...emails], 50); // Chunking emails in batches of 50

    for (const chunk of emailChunks) {
      const emailResults = await Promise.all(
        chunk.map((email) => sendEmailWithRetry(gmail, email , linkedResume , Saved_campaign._id))
      );

      const failedEmails = emailResults.filter(result => !result.success);

      if (failedEmails.length > 0) {
        return res.status(500).json({
          message: "Some emails failed to send.",
          failedEmails,
        });
      }
      
    }
   
    res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Failed to send emails.", error: error.message });
  }
};

module.exports = Email_Send;
