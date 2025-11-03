const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const sharp = require("sharp");
const dbInfo = require("../../../VP_2025_config");

const dbConfig = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
}

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
	let conn;
	console.log(req.body);
	console.log(req.file);
	try {
		const fileName = "vp_" + Date.now() + ".jpg";
		console.log(fileName);
		await fs.rename(req.file.path, req.file.destination + fileName);
		//loon normaalsuuruse 800x600
		await sharp(req.file.destination + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
		//loome thumbnail pildi 100x100
		await sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumbs/" + fileName);
		conn = await mysql.createConnection(dbConfig);
		let sqlReq = "INSERT INTO galleryphotos_id (filename, origname, alttext, privacy, userid) VALUES(?, ?, ?, ?, ?)";
		//kuna kasutajakontosid veel ei ole, siis määrame userid = 1
		const userid = 1;
		const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid]);
		console.log("Salvestati kirje: " + result.insertId);
		res.render("galleryphotoupload");
	}
	catch(err) {
		console.log(err);
		res.render("galleryphotoupload");
	}
	finally {
		if(conn){
		await conn.end();
			console.log("Andmebaasiühendus on suletud!");
			}
		}
	};
	
module.exports = {
	photouploadPage,
	photouploadPagePost
};