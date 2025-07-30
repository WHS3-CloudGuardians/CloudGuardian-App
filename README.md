<div align="center">

# CloudGuardians Board
### AWS 환경 테스트 어플리케이션

[![README](https://img.shields.io/badge/-README-important?logo=markdown)]()  
[![화이트햇 스쿨](https://img.shields.io/badge/화이트햇_스쿨_3기-blueviolet?style=flat)]() 
[![구름수비대](https://img.shields.io/badge/구름수비대-팀-blue?style=flat&logo=cloud)]() 

</div>


## 어플리케이션 개요

### 목적
AWS 인프라가 실제로 작동하는지 테스트하기 위한 애플리케이션

실사용 환경과 유사한 인프라 구성을 검증하기 위해 제작

### 🛠️ 사용 프레임워크
- React (프론트엔드)
- Node.js (백엔드)

### ✨ 주요 기능
- 회원가입
- 로그인
- 게시글 작성/조회/수정/삭제



## 📂 디렉토리 구성
```
├── client/              # 프론트엔드
├── server/              # 백엔드
└── scripts/             # 배포 스크립트
```



## 작동 방법
### 테라폼으로 EC2인스턴스 생성시, 자동 배포
user_data을 이용
``` terraform
user_data = base64encode(
    templatefile("${path.module}/deploy.sh", {
      rds_endpoint   = aws_db_instance.rds_db.endpoint
      rds_secret_arn = data.aws_secretsmanager_secret.rds_secret.arn
      DB_NAME        = aws_db_instance.rds_db.db_name
    })
```

| 배포 방식     | 사용 스크립트 | 설명 |
|---------------|----------------|------|
| 단일 인스턴스  | `scripts/deploy.sh` | 프론트+백 한 서버에 배포 |
| 이중 인스턴스  | `scripts/deploy-web.sh` / `scripts/deploy-app.sh` | 프론트/백 분리 배포 |

> ⚠️ **주의**  
> AWS SSM에서 시크릿(DB_PASSWORD, JWT_SECRET)을 가져오는 코드가 있습니다.  
> → EC2에 적절한 IAM 역할 필요합니다.  
> → SSM Parameter에 시크릿이 미리 준비되어 있어야 합니다.

> 💡 `scripts/deploy-web.sh` 실행 시, 백엔드의 ALB DNS 또는 EC2 퍼블릭/프라이빗 DNS를 외부 주입해야 합니다.
> (위 코드에서 rds_endpoint 외부 주입한 것과 동일하게)

---


### 로컬에서 테스트(개발용) 작동
- `/server`에 `.env` 생성 필요
```
PORT=8080

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_NAME=dbname
DB_PORT=3306

# JWT Setting
JWT_SECRET=jwtkey
JWT_EXPIRES_IN=30m
```
#### 프론트
```
cd client
npm install
npm run dev
```
#### 서버
```
cd server
npm install
npm run start
```

## ☁️ 개발 인원

- [이다솔](https://github.com/dasol729)  
- [손예은](https://github.com/ye-nni)   


