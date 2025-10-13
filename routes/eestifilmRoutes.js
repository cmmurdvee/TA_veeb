const express = require("express");
const router = express.Router();

const {
    eestifilm,
    inimesed,
    inimesedAdd,
    inimesedAddPost
} = require ("../controllers/eestifilmControllers")

router.route("/").get(eestifilm);

router.route("/inimesed").get(inimesed);

router.route("/filmiinimesed_add").get(inimesedAdd);

router.route("/filmiinimesed_add").post(inimesedAddPost);

module.exports = router;

