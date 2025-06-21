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
    body("username").notEmpty().withMessage("닉네임은 필수입니다."),
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
  //res.json({ message: `사용자 ${req.user.id} 인증` });
  res.json({
    status: 200,
    code: "SUCCESS",
    message: "인증된 사용자 정보",
    data: {
      user: {
        id:    req.user.id,
        email: req.user.email
      }
    }
  });
});

// 마이페이지
router.get("/me", verifyToken, authController.getMyInfo);

// 닉네임 중복 검사
router.get("/check-nickname", verifyToken, authController.checkNickname);

// 마이페이지 수정 (비밀번호, 성별, 생년월일)
router.put("/me", verifyToken,[
    body("username").optional().isLength({ min: 1 }).withMessage("닉네임은 최소 1자 이상이어야 합니다."),
    body("gender").optional().isIn(["male", "female", "other"]).withMessage("성별은 male, female, other 중 하나여야 합니다."),
    body("birth").optional().isDate().withMessage("생년월일 형식이 잘못되었습니다 (YYYY-MM-DD)"),
    body("password")
      .optional()
      .isLength({ min: 8 }).withMessage("비밀번호는 최소 8자 이상이어야 합니다.")
      .matches(/[A-Za-z]/).withMessage("비밀번호에 영문자를 포함해야 합니다.")
      .matches(/\d/).withMessage("비밀번호에 숫자를 포함해야 합니다.")
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("비밀번호에 특수문자를 포함해야 합니다.")
  ], authController.updateMyInfo);

// 회원탈퇴
router.delete("/", verifyToken, authController.deleteMyAccount);

module.exports = router;
