const express = require("express")
const collection = require("../server/server.js")
const cors = require("cors")
app.use(express.json)
app.use(express.urlencoded({ extended: true}))
app.use(cors())



app.get("/", cors(), (req,res))