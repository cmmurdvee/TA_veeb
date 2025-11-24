const mysql = require("mysql2/promise");
const argon2 = require("argon2");
const dbInfo = require("../../../VP_2025_config");


const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
}

//@desc home page for signup
//@route GET /signup
//@access public

const signupPage = (req, res)=>{
	res.render("signup", {notice: "Ootan andmeid"});
};



//@desc page for creaing user account, signup
//@route POST /signup
//@access public


const signupPagePost = async (req, res)=>{
	let conn;
	let notice = "";
	console.log(req.body);
	//andmete valideerimine
	if(
		!req.body.firstNameInput ||
		!req.body.lastNameInput ||
		!req.body.birthDateInput ||
		!req.body.genderInput ||
		!req.body.emailInput ||
		req.body.passwordInput.length < 8 ||
		req.body.passwordInput !== req.body.confirmPasswordInput
	) {
		let notice = "Andmeid on puudu või miski on vigane!"
		console.log(notice);
		return res.render("signup", {notice: notice});
	}

	try {
		conn = await mysql.createConnection(dbConf);
		//kontrollin, ega sellist juba pole
		let sqlReq = "SELECT id from users_ta WHERE email = ?";
		const [users] = await conn.execute(sqlReq, [req.body.emailInput]);
		if(users.length > 0){
			notice = "Selline kasutaja on juba olemas!";
			console.log(notice);
			return res.render("signup", {notice: notice});
		}
		//krüpteerime parooli
		const pwdHash = await argon2.hash(req.body.passwordInput)
		//console.log(pwdHash);
		//console.log(pwdHash.length);
		sqlReq = "INSERT INTO users_ta (first_name, last_name, birth_date, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)";

	  const [result] = await conn.execute(sqlReq, [
		req.body.firstNameInput,
		req.body.lastNameInput,
		req.body.birthDateInput,
		req.body.genderInput,
		req.body.emailInput,
		pwdHash
	  ]);
	  console.log("Salvestati kasutaja: " + result.insertId);
	  res.render("signup", {notice:"Valmis!"});
	}
	catch(err) {
	  console.log(err);
	  res.render("signup", {notice:"Tehniline viga"});
	}
	finally {
	  if(conn){
	  await conn.end();
	    console.log("Andmebaasiühendus on suletud!");
	  }
	}
};

module.exports = {
	signupPage,
	signupPagePost
};