const express = require("express");
const loginCheck = require("../src/checklogin")

const router = express.Router();
//kõigile marsruutidele lisan vahevara sisselogimise kontrollimiseks
router.use(loginCheck.isLogin);

//kontrollerid
const {
    galleryHome,
    galleryPage} = require("../controllers/galleryControllers");

router.route("/").get(galleryHome);

router.route("/:page").get(galleryPage); //parameeter peab olema viimasena

module.exports = router;





