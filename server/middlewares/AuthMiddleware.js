// AuthMiddleware.js
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/Response");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(errorResponse("NO_TOKEN"));
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 요청 객체에 사용자 정보 저장
    next();
  } catch (err) {
    next(errorResponse("INVALID_TOKEN"));
  }
};

module.exports = verifyToken;
