const Agenda = require("agenda")
const agenda = new Agenda({
    db:{
        address:process.env.DB_URL,
        collection:process.env.NAME
    },
})

module.exports = agenda