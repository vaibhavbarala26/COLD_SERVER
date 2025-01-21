const express = require("express")
const Verify_user = require("../Middleware/Verify_User")
const Email_Send = require("../Controllers/EmailSend")
const Email_Schedule_Send = require("../Controllers/EmailScheduleSend")
const Track_click = require("../Controllers/TrackClicks")
const Track_open = require("../Controllers/OpenRates")

const Email_Router = express.Router()
Email_Router.post("/" , Verify_user , Email_Send)
Email_Router.post("/schedule" , Verify_user , Email_Schedule_Send)
Email_Router.get("/track" , Track_click)
Email_Router.get("/open" ,Track_open)
module.exports = Email_Router