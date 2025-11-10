const mysql = require("mysql2/promise");
const dbInfo = require("../../../VP_2025_config");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc home page for photogallery
//@route GET /photogallery
//@access public

const galleryHome = async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "SELECT filename, alttext FROM galleryphotos_id WHERE privacy >= ? AND deleteit IS NULL";
		const privacy = 2;
		const [rows, fields] = await conn.execute(sqlReq, [privacy]);
		console.log(rows);
		let listData = [];
		for (let i = 0; i < rows.length; i ++){
			let altText = "Galeriipilt";
			if(rows[i].alttext != ""){
				altText = rows[i].alttext;
			}
			listData.push({src: rows[i].filename, alt: altText});
		}
		res.render("gallery", {galleryData: listData, imagehref: "/gallery/thumbs/"});
	}
	catch(err){
		console.log(err);
		res.render("gallery", {galleryData: []});
	}
	finally {
	  if(conn){
	    await conn.end();
	    console.log("Andmebaasiühendus on suletud!");
	  }
	}
};

module.exports = {
	galleryHome
};