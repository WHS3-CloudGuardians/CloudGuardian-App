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

  const { email, nickname, password, name, gender, birthDate } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw errorResponse("EMAIL_DUPLICATE");
    const existingNickname = await User.findOne({ where: { nickname } });
    if (existingNickname) throw errorResponse("NICKNAME_DUPLICATE");  

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email, nickname, password: hashedPassword, name, gender, birthDate,
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

// GET /auth/me 마이페이지 정보 조회
exports.getMyInfo = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw errorResponse("USER_NOT_FOUND");

    res.json({
      email: user.email,
      nickname: user.nickname,
      name: user.name,
      gender: user.gender,
      birth: user.birthDate,
    });

  } catch (err) {
    next(err);
  }
};

// GET /auth/check-nickname 닉네임 중복 검사 
exports.checkNickname = async (req, res, next) => {
  try {
    const { nickname } = req.query;
    if (!nickname) return res.status(400).json({ available: false, message: "닉네임을 입력하세요" });

    const existing = await User.findOne({ where: { nickname } });
    // 닉네임이 존재하지만 본인의 닉네임이면 OK
    if (existing && existing.id !== req.user.id) {
      return res.json({ available: false });
    }

    return res.json({ available: true }); // 사용 가능 여부
  } catch (err) {
    next(err);
  }
};

// PUT /auth/me 마이페이지 정보 수정
exports.updateMyInfo = async (req, res, next) => {
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

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw errorResponse("USER_NOT_FOUND");

    const { nickname, password, gender, birth} = req.body;

    user.nickname = nickname || user.nickname;
    user.gender = gender || user.gender;
    user.birthDate = birth || user.birthDate;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();

    return successResponse(res, null, "마이페이지 수정 성공");

  } catch (err) {
    next(err);
  }
};

// DELETE /auth 회원탈퇴
exports.deleteMyAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw errorResponse("USER_NOT_FOUND");

    const { password } = req.body;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw errorResponse("WRONG_PASSWORD");

    await user.destroy(); // 💥 진짜 삭제

    return successResponse(res, null, "마이페이지 회원 탈퇴 성공");
  } catch (err) {
    next(err);
  }
}