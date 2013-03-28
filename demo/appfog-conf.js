var creds = JSON.parse(process.env.VCAP_SERVICES)['mysql-5.1'][0].credentials;

module.exports = {
    port: process.env.VCAP_APP_PORT,
    'create-db': true,
    db : {
	type: 'mysql',
	host: creds.host,
	user: creds.user,
	password: creds.password,
	database: creds.name
    }
};
