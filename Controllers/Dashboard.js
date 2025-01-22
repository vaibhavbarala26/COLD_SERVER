const { CampaignDetails, User, ClickRate } = require("../Schema/UserSchema");
const Days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Dash_board_Data = async (req, res) => {
    try {
        const { email } = req.user;
    
        // Find the user and populate campaigns
        const Found_user = await User.findOne({ email }).populate("campaign");
        if (!Found_user) {
            return res.status(404).json("User not found");
        }

        // Fetch emails and deduplicate them based on `sentAt`
        const mailPromises = Found_user.campaign.map(async (camp) => {
            const campaign = await CampaignDetails.findById(camp._id).populate("email");
            return campaign.email.map(email => ({
                name:email.recipientName,
                emailAddress:email.recipientList,
                sentAt: email.createdAt, // Include sentAt for filtering
            }));
        });

        const emails = (await Promise.all(mailPromises)).flat();
        
        // Filter emails sent in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEmails = emails.filter(email => new Date(email.sentAt) >= sevenDaysAgo);

        // Create a map for weekly email data
        let emailDaysMap = new Map();
        Days_of_week.forEach(day => {
            emailDaysMap.set(day, 0); // Initialize all days with 0 emails
        });

        // Group email counts by day of the week
        recentEmails.forEach(email => {
            const date = new Date(email.sentAt);
            const dayOfWeek = Days_of_week[date.getUTCDay()];
            emailDaysMap.set(dayOfWeek, emailDaysMap.get(dayOfWeek) + 1);
        });

        const weeklyEmailData = Array.from(emailDaysMap.entries()).map(([day, count]) => ({
            day: day,
            emailsSent: count,
        }));

        // Fetch click rates and deduplicate based on `createdAt` and `clickRate`
        const clickRatesPromises = Found_user.campaign.map(async (camp) => {
            const campaign = await CampaignDetails.findById(camp._id).populate("performanceMetrics.clickRate");
            return campaign.performanceMetrics.clickRate.map(rate => ({
                clickRate: rate.clickRate,
                createdAt: rate.createdAt,
            }));
        });

        const clickRates = (await Promise.all(clickRatesPromises)).flat();
        const uniqueClickRates = clickRates.filter((rate, index, self) =>
            index === self.findIndex(r =>
                new Date(r.createdAt).getTime() === new Date(rate.createdAt).getTime() &&
                r.clickRate === rate.clickRate
            )
        );

        const recentClickRates = uniqueClickRates.filter(rate => new Date(rate.createdAt) >= sevenDaysAgo);

        // Map click rates to days
        let clickDaysMap = new Map();
        Days_of_week.forEach(day => {
            clickDaysMap.set(day, 0);
        });

        recentClickRates.forEach(rate => {
            const date = new Date(rate.createdAt);
            const dayOfWeek = Days_of_week[date.getUTCDay()];
            clickDaysMap.set(dayOfWeek, clickDaysMap.get(dayOfWeek) + rate.clickRate);
        });

        const weeklyClickData = Array.from(clickDaysMap.entries()).map(([day, rate]) => ({
            day: day,
            clickRate: rate,
        }));

        const totalClickRate = recentClickRates.reduce((sum, rate) => sum + rate.clickRate, 0);
        const totalMailSent = emails.length;

        res.status(200).json({
            totalMailSent,
            totalClickRate,
            weeklyEmails: weeklyEmailData,
            weeklyClicks: weeklyClickData,
            address_data:emails
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json("An error occurred while fetching dashboard data.");
    }
};

module.exports = Dash_board_Data;
