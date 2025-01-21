const mongoose = require("mongoose");

// AI Schema
const AISchema = new mongoose.Schema({
    emailTone: { type: String, default: "Professional" },
    personalization: { type: Number, default: 33 },
});
const AI = mongoose.model("AI", AISchema);

// Follow-up Schema
const FollowUpSetting = new mongoose.Schema({
    template: { type: String, default: "Template1" },
    followUps: { type: Boolean, default: false },
    followupDays: { type: Number, default: 7 },
});
const Followup = mongoose.model("Followup", FollowUpSetting);

// Notification Schema
const NotificationSchema = new mongoose.Schema({
    emailAlerts: { type: Boolean, default: true },
    performanceNotification: { type: Boolean, default: true },
});
const Notification = mongoose.model("Notification", NotificationSchema);

// Email Schema
const emailSchema = new mongoose.Schema({
    body: { type: String, required: true },
    subject: { type: String, required: true },
    sender: { type: String, required: true },
    recipientList: { type: String, required: true },
    createdAt:{type:Date , default:Date.now()},
    recipientName:{type:String}
});
const Email = mongoose.model("email", emailSchema);

// Settings Schema
const SettingSchema = new mongoose.Schema({
    primaryEmail: { type: String, required: true },
    additionalEmails: { type: [String], default: [] },
    aiPreference: { type: mongoose.Schema.Types.ObjectId, ref: "AI" },
    notification: { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    followup: { type: mongoose.Schema.Types.ObjectId, ref: "Followup" },
    
});
const Setting = mongoose.model("Setting", SettingSchema);

// Click Rate Schema
const ClickRateSchema = new mongoose.Schema({
    clickRate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
const ClickRate = mongoose.model("clickrate", ClickRateSchema);

// Response Rate Schema
const ResponseRateSchema = new mongoose.Schema({
    responseRate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
const ResponseRate = mongoose.model("responserate", ResponseRateSchema);

// Open Rate Schema
const OpenRateSchema = new mongoose.Schema({
    openRate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
const OpenRate = mongoose.model("openrate", OpenRateSchema);

// Campaign Schema
const CampaignSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["Draft", "Scheduled", "In Progress", "Completed"],
        default: "Draft",
    },
    email: [{ type: mongoose.Types.ObjectId, ref: "email" }],
    followUpsEnabled: { type: Boolean, default: false },
    followUpDays: { type: Number, default: 7 },
    performanceMetrics: {
        openRate: [{ type: mongoose.Types.ObjectId, ref: "openrate" }],
        clickRate: [{ type: mongoose.Types.ObjectId, ref: "clickrate" }],
        responseRate: [{ type: mongoose.Types.ObjectId, ref: "responserate" }],
    },
    scheduleDate: { type: Date },
    aiAssistanceUsed: { type: Boolean, default: false },
    linkedResume: { type: String },
});
const CampaignDetails = mongoose.model("CampaignDetail", CampaignSchema);

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    setting: { type: mongoose.Schema.Types.ObjectId, ref: "Setting" },
    refresh_token :{type:String},
    campaign: [{ type: mongoose.Types.ObjectId, ref: "CampaignDetail" }],
});
const User = mongoose.model("User", UserSchema);

// Exporting Models
module.exports = { AI, Followup, Notification, Setting, User, CampaignDetails, Email , OpenRate , ResponseRate , ClickRate };
