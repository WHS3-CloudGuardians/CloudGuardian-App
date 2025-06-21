// AuthRoutes.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/AuthController");
const verifyToken = require("../middlewares/AuthMiddleware.js");

// 회원가입
router.post("/signup",
  [
    body("email").isEmail().withMessage("유효한 이메일 형식이 아닙니다."),
    body("username").notEmpty().withMessage("아이디는 필수입니다."),
    body("password").isLength({ min: 8 }).withMessage("비밀번호는 최소 8자 이상"),
    body("name").notEmpty(),
    body("gender").isIn(["male", "female", "other"]),
    body("birthDate").isDate().withMessage("생년월일 형식이 잘못되었습니다 (YYYY-MM-DD)"),
  ], authController.signup);
/*
body("password")
    .isLength({ min: 8 }).withMessage("비밀번호는 최소 8자 이상")
    .matches(/[A-Z]/).withMessage("영문 대문자 포함 필요")
    .matches(/[a-z]/).withMessage("영문 소문자 포함 필요")
    .matches(/\d/).withMessage("숫자 포함 필요")
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("특수문자 포함 필요"),
*/

// 로그인
router.post("/login",
  [
    body("email").isEmail().withMessage("유효한 이메일 형식이 아닙니다."),
    body("password").isLength({ min: 8 }).withMessage("비밀번호는 최소 8자 이상"),
  ], authController.login);


// 사용자 인증
/*
headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
*/
router.post("/me", verifyToken, (req, res) => {
    res.json({ message: `사용자 ${req.user.id} 인증` });
});

module.exports = router;