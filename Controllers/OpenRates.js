const { OpenRate, CampaignDetails } = require("../Schema/UserSchema");
const fs = require("fs");

const Track_open = async (req, res) => {
  const { email, campaignId } = req.query;
  console.log("hello");
  
  try {
    // Validate inputs
    if (!campaignId || !email) {
      return res.status(400).send("Missing required parameters.");
    }

    // Find the campaign
    const Found_campaign = await CampaignDetails.findById(campaignId).exec();
    if (!Found_campaign) {
      return res.status(404).send("Campaign not found.");
    }
    const Oprn_Rate = new OpenRate({openRate:1 , createdAt:Date.now()});
    await Oprn_Rate.save()
    if (!Found_campaign.performanceMetrics) {
        Found_campaign.performanceMetrics = { clickRate: [] };
      }
      Found_campaign.performanceMetrics.openRate.push(Oprn_Rate._id)
      await Found_campaign.save()


    console.log(`Open logged for campaign ${campaignId} and email ${email}`);

    // Return a 1x1 transparent GIF
    const transparentPixel = Buffer.from(
      "47494638396101000100800000ffffff00000021f90401000001002c00000000010001000002024401003b",
      "hex"
    );
    fs.writeFileSync("transparent.gif", transparentPixel);

    res.set("Content-Type", "image/gif");
    res.send(transparentPixel);
  } catch (error) {
    console.error("Error logging open:", error.message);
    res.status(500).send("Failed to track open.");
  }
};

module.exports = Track_open;
