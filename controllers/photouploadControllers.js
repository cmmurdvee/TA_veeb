const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const sharp = require("sharp");
const pool = require("../src/dbPool")
const watermarkFile = "./public/images/vp_logo_small.png";

//@desc home page for uploading gallery photos
//@route GET /galleryphotoupload
//@access public

const photouploadPage = (req, res)=>{
	res.render("galleryphotoupload");
};



//@desc page for uploading photos to gallery
//@route POST /galleryphotoupload
//@access public


const photouploadPagePost = async (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	try {
	  const fileName = "vp_" + Date.now() + ".jpg";
	  console.log(fileName);
	  await fs.rename(req.file.path, req.file.destination + fileName);
	  //kontrollin, kas vesimärgi fail on olemas
		const watermarkSettings = [{
            input: watermarkFile,
            gravity: "southeast"
        }];
		if (!await fs.access(watermarkFile).then(() => true).catch(() => false)) {
             console.log("Vesimärgi faili ei leitud!");
             // Tühjendame seaded, et vesimärki ei proovitaks lisada
             watermarkSettings.length = 0; 
        }
		console.log("Muudan suurust: 800X600");
		//loon normaalmõõdus foto (800X600)
		//await sharp(req.file.destination + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
		 let normalImageProcessor = await sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90});
        console.log("Lisan vesimärgi" + watermarkSettings.length);    
        if (watermarkSettings.length > 0) {
            normalImageProcessor = await normalImageProcessor.composite(watermarkSettings);
        }
		await normalImageProcessor.toFile("./public/gallery/normal/" + fileName);
	  //loon thumbnail pildi 100X100
	  await sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumbs/" + fileName);
	  let sqlReq = "INSERT INTO galleryphotos_id (filename, origname, alttext, privacy, userid) VALUES(?,?,?,?,?)";
	  //kuna kasutajakontosid veel ei ole, siis määrame userid = 1, UPD: nüüd on kasutajakontod olemas
	  const userId = req.session.userId;
	  const [result] = await pool.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
	  console.log("Salvestati kirje: " + result.insertId);
	  res.render("galleryphotoupload");
	}
	catch(err) {
	  console.log(err);
	  res.render("galleryphotoupload");
	}
	finally {
/* 	  if(conn){
	  await conn.end();
	    console.log("Andmebaasiühendus on suletud!");
	  } */
	}
};

module.exports = {
	photouploadPage,
	photouploadPagePost
};