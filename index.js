const express = require("express");
const fs = require("fs");
//päringu lahtiharutaja POST jaoks
const bodyparser = require("body-parser");
//SQL andmebaasi moodul
//const mysql = require("mysql2");
//Kuna kasutame asünkroonust, siis impordime mysql2/promise mooduli
const mysql = require("mysql2/promise");
const dateEt = require("./src/dateTimeET");
const dbInfo = require("../../VP_2025_config");
const textRef = "public/txt/vanasonad.txt";
//käivitan express.js funktsiooni ja annan talle nimeks "app"
const app = express();
//määran veebilehtede mallide renderdamise mootori
app.set("view engine", "ejs");
//määran ühe päris kataloogi avalikult kättesaadavaks
app.use(express.static("public"));
//parsime päringu URL-i, lipp false, kui ainult tekst ja true, kui muid andmeid ka

app.use(bodyparser.urlencoded({extended: true}));

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

app.get("/", async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "SELECT filename, alttext FROM galleryphotos_id WHERE id=(SELECT MAX(id) FROM galleryphotos_id WHERE privacy=? AND deleteit IS NULL)";
		const privacy = 3;
		const [rows, fields] = await conn.execute(sqlReq, [privacy]);
		console.log(rows);
		let imgAlt = "Avalik foto";
		if(rows[0].alttext != ""){
			imgAlt = rows[0].alttext;
		}
		res.render("index", {imgFile: "gallery/normal/" + rows[0].filename, imgAlt: imgAlt});
	}
	catch(err){
		console.log(err);
		//res.render("index");
		res.render("index", {imgFile: "images/otsin_pilte.jpg", imgAlt: "Tunnen end, kui pilti otsiv lammas ..."});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaasiühendus suletud!");
		}
	}
});

app.get("/timenow", (req, res)=>{
	const weekDayNow = dateEt.weekDay();
	const dateNow = dateEt.fullDate();
	res.render("timenow", {weekDayNow: weekDayNow, dateNow: dateNow});
});

app.get("/vanasonad", (req, res)=>{
	let folkWisdom = [];
	fs.readFile(textRef, "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Valik Eesti vanasõnu", listData: ["Ei leidnud ühtegi vanasõna!"]});
		}
		else {
			folkWisdom = data.split(";");
			res.render("genericlist", {heading: "Valik Eesti vanasõnu", listData: folkWisdom});
		}
	});
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	//avan tekstifaili kirjutamiseks sellisel moel, et kui teda pole, luuakse (parameeter "a")
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw(err);
		}
		else {
			//faili senisele sisule lisamine
			fs.appendFile("public/txt/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ", " + dateEt.fullDate() + " kell " + dateEt.fullTime() + ";", (err)=>{
				if(err){
					throw(err);
				}
				else {
					console.log("Salvestatud!");
					res.render("visitregistered", {visitor: req.body.firstNameInput + " " + req.body.lastNameInput});
				}
			});
		}
	});
});

app.get("/visitlog", (req, res)=>{
	let listData = [];
	fs.readFile("public/txt/visitlog.txt", "utf8", (err, data)=>{
		if(err){
			//kui tuleb viga, siis ikka väljastame veebilehe, liuhtsalt vanasõnu pole ühtegi
			res.render("genericlist", {heading: "Registreeritud külastused", listData: ["Ei leidnud ühtegi külastust!"]});
		}
		else {
			listData = data.split(";");
			let correctListData = [];
			for(let i = 0; i < listData.length - 1; i ++){
				correctListData.push(listData[i]);
			}
			res.render("genericlist", {heading: "registreeritud külastused", listData: correctListData});
		}
	});
});

//Eesti filmi marsruudid
const eestifilmRouter = require("./routes/eestifilmRoutes");
app.use("/Eestifilm", eestifilmRouter);

//Galerii fotode üleslaadimine
const photoupRouter = require("./routes/photoupRoutes");
app.use("/galleryphotupload", photoupRouter);

//Galerii marsruudid
const galleryRouter = require("./routes/galleryRoutes");
app.use("/photogallery", galleryRouter);

//Konto loomise marsruudid
const signupRouter = require("./routes/signupRoutes");
app.use("/signup", signupRouter);

app.listen(5121);