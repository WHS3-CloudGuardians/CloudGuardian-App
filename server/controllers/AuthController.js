// AuthController.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { successResponse, errorResponse } = require("../utils/Response");
const User = db.User;

exports.signup = async (req, res, next) => {
  // 요청 유효성 검사 결과 체크
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "입력값이 올바르지 않습니다.",
      errors: errors.array()
    });
  }

  const { email, username, password, name, gender, birthDate } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw errorResponse("EMAIL_DUPLICATE");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email, username, password: hashedPassword, name, gender, birthDate,
    });

    return successResponse(res, { user }, "회원가입 성공");
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  // 요청 유효성 검사 결과 체크
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "입력값이 올바르지 않습니다.",
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) throw errorResponse("USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw errorResponse("WRONG_PASSWORD");

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return successResponse(res, {
      accessToken: token,
      user: { id: user.id, email: user.email }
    }, "로그인 성공");

  } catch (err) {
    next(err);
  }
};