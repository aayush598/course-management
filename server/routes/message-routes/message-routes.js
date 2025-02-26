const express = require("express");
const { getMessage, getContactList } = require("../../controllers/message-controller/message-controller");
const authenticate = require("../../middleware/auth-middleware");

const Router = express.Router(); 

Router.get("/get/message/:senderId", authenticate , getMessage);

Router.get("/get/contact-list" , authenticate ,getContactList  )

module.exports = Router;