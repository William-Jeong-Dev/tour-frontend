# Web3Forms 설정 가이드 (매우 간단!)

Web3Forms는 가장 간단한 이메일 전송 서비스입니다. **단 1개의 Access Key만 발급받으면 끝**입니다!

## ⭐ 설정 시간: 약 2분

## 1. Web3Forms 계정 생성 및 Access Key 발급

1. https://web3forms.com 접속
2. 우측 상단 "Get Started" 또는 "Create Access Key" 클릭
3. **이메일 주소 입력**: `chungwon87@naver.com`
4. "I'm not a robot" 체크박스 선택
5. "Create Access Key" 클릭
6. 화면에 표시되는 **Access Key** 복사 (예: `a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`)
7. **중요**: 이 Access Key를 안전한 곳에 보관하세요!

## 2. .env.local 파일 설정

프로젝트 루트의 `.env.local` 파일을 열고 다음과 같이 입력하세요:

```env
# Web3Forms 설정
VITE_WEB3FORMS_ACCESS_KEY="a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
```

**주의**:
- 큰따옴표(`"`) 안에 Access Key를 입력하세요
- 앞뒤 공백이 없도록 주의하세요

## 3. 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버를 재시작하세요:

```bash
# 기존 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

## 4. 테스트

1. 웹사이트에서 "1:1 맞춤견적" 페이지로 이동
2. 폼을 작성하고 제출
3. **브라우저 콘솔(F12)에서 에러 확인**
4. `chungwon87@naver.com` 메일함에서 이메일 도착 확인
5. 상품 상세 페이지에서 "예약하기" 테스트

## ✅ 완료!

**이게 전부입니다!** Access Key만 발급받으면 바로 사용 가능합니다.

## 📊 무료 플랜 제한

- **월 250개 제출**까지 무료
- 더 많은 이메일이 필요하면 유료 플랜 고려

## 💡 작동 방식

### 이메일 수신:
- **수신자**: chungwon87@naver.com (자동으로 전송됨)
- **발신자**: Web3Forms (noreply@web3forms.com)
- **답장 주소**: 고객이 입력한 이메일 주소

### 이메일 제목:
- **1:1 맞춤견적**: `[1:1 맞춤견적] {고객이름}님의 견적 요청`
- **예약하기**: `[예약 요청] {상품명} - {고객이름}님의 예약`

## 🔧 문제 해결

### "Web3Forms 설정이 완료되지 않았습니다" 에러:
1. `.env.local` 파일에 `VITE_WEB3FORMS_ACCESS_KEY`가 입력되었는지 확인
2. 개발 서버를 재시작했는지 확인
3. Access Key가 올바른지 확인 (앞뒤 공백 제거)

### 이메일이 전송되지 않는 경우:
1. 브라우저 콘솔(F12)에서 에러 메시지 확인
2. Access Key가 올바른지 재확인
3. https://web3forms.com 에서 "Email Logs" 확인
4. 네이버 메일의 스팸함 확인

### "Invalid Access Key" 에러:
- Access Key를 다시 발급받으세요
- https://web3forms.com 에서 새로운 Access Key 생성

### CORS 에러:
- Web3Forms는 CORS를 완전히 지원하므로 이 문제가 발생하지 않아야 합니다
- 만약 발생한다면 브라우저 캐시를 지우고 다시 시도하세요

## 🎯 장점

✅ **설정이 매우 간단** - Access Key 하나만 필요
✅ **CORS 문제 없음** - 추가 설정 불필요
✅ **이메일 활성화 불필요** - 바로 사용 가능
✅ **Gmail 연동 불필요** - chungwon87@naver.com으로 직접 전송
✅ **템플릿 설정 불필요** - 코드에서 모두 처리
✅ **무료 플랜 넉넉함** - 월 250개

## 📞 지원

문제가 발생하면:
1. https://web3forms.com/docs 문서 확인
2. https://web3forms.com/contact 지원 요청

---

**이게 가장 간단한 방법입니다!** 단 1개의 Access Key만 발급받으면 바로 사용할 수 있습니다. 🚀
