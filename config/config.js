require("dotenv").config();

module.exports = {

    development: {

        username: process.env.DB_USER,

        password: process.env.DB_PASSWORD,

        database: process.env.DB_NAME,

        host: process.env.DB_HOST,

        dialect: "mysql",

        logging: false,

    },

    production: {

        username: process.env.DB_USER,

        password: process.env.DB_PASSWORD,

        database: process.env.DB_NAME,

        host: process.env.DB_HOST,

        dialect: "mysql",

        logging: false,

    },

    jwt_secret: process.env.JWT_SECRET,

    access_jwt_secret: process.env.ACCESS_TOKEN_SECRET,

    refresh_jwt_secret: process.env.REFRESH_TOKEN_SECRET,

    access_token_expires:
        process.env.ACCESS_TOKEN_EXPIRES || "15m",

    refresh_token_expires_days:
    Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7,

};