// utils/response.js

// 성공 반환 템플릿
exports.successResponse = (res, data = {}, message = "요청이 성공적으로 처리되었습니다.") => {
  return res.status(200).json({
    status: 200,
    code: "SUCCESS",
    message,
    data
  });
};

// 에러 객체 생성 함수
exports.errorResponse = (code, message = null) => {
  const err = new Error(message || ERROR_CODES[code]?.message || code);
  err.code = code;
  return err;
};

// 전역 에러 핸들러
exports.errorHandler = (err, req, res, next) => {
  const error = ERROR_CODES[err.code] || ERROR_CODES.SERVER_ERROR;

  res.status(error.status).json({
    status: error.status,
    code: err.code || "SERVER_ERROR",
    message: err.message || error.message
  });
};

// 에러 코드 목록
const ERROR_CODES = {
  NO_TOKEN: { status: 401, code: "NO_TOKEN", message: "토큰이 없습니다. 로그인 해주세요." },
  INVALID_TOKEN: { status: 401, code: "INVALID_TOKEN", message: "유효하지 않은 토큰입니다." },
  USER_NOT_FOUND: { status: 404, code: "USER_NOT_FOUND", message: "존재하지 않는 사용자입니다." },
  WRONG_PASSWORD: { status: 401, code: "WRONG_PASSWORD", message: "비밀번호가 일치하지 않습니다." },
  VALIDATION_ERROR: { status: 400, code: "VALIDATION_ERROR", message: "입력값이 올바르지 않습니다." },
  EMAIL_DUPLICATE: { status: 400, code: "EMAIL_DUPLICATE",message: "이미 등록된 이메일입니다." },
  SERVER_ERROR: { status: 500, code: "SERVER_ERROR", message: "서버 내부 오류가 발생했습니다." }
};