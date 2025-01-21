const { ClickRate, CampaignDetails } = require("../Schema/UserSchema");

const getClickRatesToday = async () => {
  try {
    // Get today's start and end
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);  // Set to midnight (start of today)

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);  // Set to the last millisecond of today

    // Query for ClickRate documents created today
    const clickRatesToday = await ClickRate.find({
      createdAt: {
        $gte: startOfToday,  // greater than or equal to midnight of today
        $lte: endOfToday     // less than or equal to the last millisecond of today
      }
    });

    return clickRatesToday;
  } catch (error) {
    console.error("Error fetching click rates for today:", error);
    throw new Error("An error occurred while fetching today's click rates.");
  }
};

const Track_click = async (req, res) => {
  const { email, campaignId, url } = req.query;

  try {
    // Validate required inputs
    if (!campaignId || !url || !email) {
      return res.status(400).send("Missing required parameters.");
    }

    // Find campaign details
    const Found_campaign = await CampaignDetails.findById(campaignId).exec();
    if (!Found_campaign) {
      return res.status(404).send("Campaign not found.");
    }

    const Today_clicks = await getClickRatesToday();
    let newClickRate;

    if (Today_clicks.length === 0) {
      // No click rates for today, create a new one
      newClickRate = new ClickRate({ clickRate: 1, createdAt: new Date() });
      await newClickRate.save();
    } else {
      // Update the existing clickRate for today
      newClickRate = Today_clicks[0];
      newClickRate.clickRate += 1;  // Increment the click rate
      await newClickRate.save();
    }

    // Initialize performanceMetrics if it doesn't exist
    if (!Found_campaign.performanceMetrics) {
      Found_campaign.performanceMetrics = { clickRate: [] };
    }

    // Append to the clickRate array in performanceMetrics
    Found_campaign.performanceMetrics.clickRate.push(newClickRate._id);
    await Found_campaign.save();

    console.log(
      `Click logged for campaign: ${campaignId}, email: ${email}, clickRate ID: ${newClickRate._id}`
    );

    // Ensure the provided URL is safe before redirecting
    const safeLink = decodeURIComponent(url);
    if (!/^https?:\/\//i.test(safeLink)) {
      return res.status(400).send("Invalid URL.");
    }

    res.redirect(safeLink);
  } catch (error) {
    console.error("Error logging click:", error.message);
    res.status(500).send("Failed to track click.");
  }
};

module.exports = Track_click;
