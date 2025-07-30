// AuthMiddleware.js
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/Response");

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(errorResponse("NO_TOKEN"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ 인증된 사용자:", user.id);
    req.user = user;
    next(); // ✅ 반드시 호출해줘야 함
  } catch (err) {
    return next(errorResponse("INVALID_TOKEN"));
  }
};

module.exports = verifyToken;