const { Client } = require('pg');
const parseDbUrl = require("parse-database-url");

const dbConfig = parseDbUrl(process.env.DATABASE_URL);

const client = new Client({
	user: dbConfig.user,
    	host: dbConfig.host,
    	database: dbConfig.database,
    	password: dbConfig.password,
    	port: dbConfig.port,
    	ssl: { rejectUnauthorized: false }
})

client.on("connect", ()=>{
	console.log("Database Connected!")
})

client.on("end", ()=>{
	console.log("Database Disconnected!")
})

// Creating Database
client.query(
	'CREATE TABLE IF NOT EXISTS Post (sno INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title VARCHAR, slug VARCHAR, content VARCHAR, date Date);', (err, res)=>{
	if(!err){
		console.log(res);
	}else{
		console.log(err)
	}
})

module.exports = client
