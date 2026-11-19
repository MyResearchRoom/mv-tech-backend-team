const {
  access_jwt_secret,
  refresh_jwt_secret,
  access_token_expires,
  refresh_token_expires_days,
} = require("../config/config");

const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) =>
  jwt.sign(payload, access_jwt_secret, {
    expiresIn: access_token_expires,
  });

exports.generateRefreshToken = (payload) =>
  jwt.sign(payload, refresh_jwt_secret, {
    expiresIn: `${refresh_token_expires_days}d`,
  });