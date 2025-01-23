const express = require("express")
require("dotenv").config();
const { User, AI, Campaign, Notification, Setting, Followup } = require("../Schema/UserSchema")
const jwt = require("jsonwebtoken")
const Verify_user = require("../Middleware/Verify_User")
const Add_email = require("../Controllers/EmailAdd")
const Settind_Add = require("../Controllers/SettingAdd(additionalemail)")
const Settind_Add_AIPrefer = require("../Controllers/SettingAdd(ai)")
const Settind_Add_AdditionalEmail = require("../Controllers/SettingAdd(additionalemail)")
const Settind_Add_Follow_up = require("../Controllers/SettindAdd(followups)")
const Settind_Add_Alerts = require("../Controllers/SettindAdd(Alerts)")
const { OAuth2Client, SCOPES } = require("../Configuration/GoogleAPI")
const { google } = require("googleapis")
const Dash_board_Data = require("../Controllers/Dashboard")
const User_Router = express.Router()

const getRedirectURI = () =>
  process.env.Environment === "prod"
    ? "https://cold-server-bj3d.vercel.app/user/oauth2callback"
    : "http://localhost:1042/user/oauth2callback";

User_Router.get("/auth", async (req, res) => {
  console.log(process.env)
  console.log(getRedirectURI())
  try {
    const authorizeURL = OAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      redirect_uri: getRedirectURI(),
    });
    res.redirect(authorizeURL);
  } catch (error) {
    console.error("Error in /auth:", error);
    res.status(500).json({ msg: "Authorization failed." });
  }
});

User_Router.get("/reauth", async (req, res) => {
  try {
    const authorizeURL = OAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      redirect_uri: getRedirectURI(),
      prompt: "consent",
    });
    res.redirect(authorizeURL);
  } catch (error) {
    console.error("Error in /reauth:", error);
    res.status(500).json({ msg: "Re-authorization failed." });
  }
});

const createUserSettings = async (email) => {
  const newAI = new AI();
  const newCampaign = new Followup();
  const newNotification = new Notification();

  await newAI.save();
  await newCampaign.save();
  await newNotification.save();

  const newSetting = new Setting({
    primaryEmail: email,
    aiPreference: newAI._id,
    notification: newNotification._id,
    followup: newCampaign._id,
  });

  await newSetting.save();

  return newSetting;
};

// Helper function to create and return a JWT token
const generateUserToken = (tokens, email) => {
  const jwtPayload = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    email: email,
  };


  return jwt.sign(jwtPayload, process.env.SECRET_KEY, { expiresIn: '7d' });
};

User_Router.get("/oauth2callback", async (req, res) => {
  console.log(req.query);
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ msg: "Missing authorization code." });
  }

  try {
    const { tokens } = await OAuth2Client.getToken(code);
    OAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: OAuth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    const userEmail = data.email;

    let Found_User = await User.findOne({ email: userEmail });
    console.log(userEmail);

    if (Found_User) {
      // Update existing user's settings if necessary
      if (!Found_User.refresh_token && tokens.refresh_token) {
        Found_User.refresh_token = tokens.refresh_token;
        await Found_User.save();
      }
      if (!Found_User.setting) {
        const newSetting = await createUserSettings(userEmail);
        Found_User.setting = newSetting._id;
        await Found_User.save();
      }

      // Generate JWT token
      const userToken = generateUserToken(tokens, userEmail);

      res.cookie("user_token", userToken, {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: "none", // Required for cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });


      console.log("Set-Cookie:", res.getHeaders()["set-cookie"]);
      return process.env.Environment === "prod" ? res.redirect(`https://cold-weld.vercel.app?user=${JSON.stringify(Found_User)}`) : res.redirect(`http://localhost:5173?user=${JSON.stringify(Found_User)}`)

    } else {
      // Create a new user if not found
      const newSetting = await createUserSettings(userEmail);

      const Saved_user = await User.create({
        name: data.name,
        email: userEmail,
        refresh_token: tokens.refresh_token,
        setting: newSetting._id,
      });

      // Generate JWT token
      const userToken = generateUserToken(tokens, userEmail);

      res.cookie("user_token", userToken, {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: "none", // Required for cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log("Set-Cookie:", res.getHeaders()["set-cookie"]);
      return process.env.Environment === "prod" ? res.redirect(`https://cold-weld.vercel.app?user=${JSON.stringify(Saved_user)}`) : res.redirect(`http://localhost:5173?user=${JSON.stringify(Saved_user)}`)

    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.status(500).json({ msg: "Authentication failed." });
  }
});

User_Router.post("/email", Verify_user, Add_email)
User_Router.post("/setting/mail", Verify_user, Settind_Add_AdditionalEmail)
User_Router.post("/setting/ai", Verify_user, Settind_Add_AIPrefer)
User_Router.post("/setting/followup", Verify_user, Settind_Add_Follow_up)
User_Router.post("/setting/alerts", Verify_user, Settind_Add_Alerts)
User_Router.get("/dashboard", Verify_user, Dash_board_Data)
module.exports = User_Router