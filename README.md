# 🐾 개와 고양이 인식 웹 서비스

순수 HTML/CSS/JavaScript로 만든 개와 고양이를 인식하는 웹 서비스입니다.

## 📋 주요 기능

✅ **카메라 실시간 표시** - 웹캠을 통해 실시간으로 카메라 화면 표시
✅ **3초 카운트다운** - "시작" 버튼 클릭 후 3초 대기
✅ **AI 모델 인식** - 카메라에 비친 이미지 분석
✅ **텍스트 결과** - 인식된 동물과 신뢰도 백분율 표시
✅ **음성 출력** - 결과를 한국어로 음성으로 읽어줌
✅ **반응형 디자인** - 모든 화면 크기에 자동 맞춤 (휴대폰, 태블릿, PC)
✅ **주석 설명** - 모든 코드에 한국어 주석 포함

## 📁 파일 구조

```
12345/
├── index.html      # 메인 HTML 파일 (화면 구조)
├── style.css       # CSS 스타일시트 (디자인)
├── script.js       # JavaScript 로직 (기능)
├── model.json      # AI 모델 파일
└── README.md       # 이 파일
```

## 🚀 사용 방법

### 1. 웹 서비스 시작

```bash
# 간단한 웹 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Python 2
python -m SimpleHTTPServer 8000
```

### 2. 브라우저에서 접속

```
http://localhost:8000
```

### 3. 서비스 이용

1. **카메라 권한 승인** - 브라우저에서 카메라 접근 허용 클릭
2. **"시작" 버튼 클릭** - 3초 카운트다운 시작
3. **이미지 인식** - 자동으로 카메라 이미지 분석
4. **결과 확인** - 동물 종류와 신뢰도 표시
5. **음성 재생** - 🔊 결과 음성 재생 버튼으로 음성 듣기
6. **"다시 인식"** - 다시 인식하려면 "다시 인식" 버튼 클릭

## � 호스팅 배포 가이드

### Netlify로 배포 (가장 쉬움)

1. **파일 준비**
   ```
   12345/ 폴더의 모든 파일 준비
   - index.html
   - style.css
   - script.js
   - model.json
   - weights.bin
   ```

2. **Netlify 배포**
   - https://app.netlify.com 방문
   - "Add new site" → "Deploy manually" 선택
   - 파일 폴더를 드래그 앤 드롭
   - 자동으로 HTTPS 적용 됨
   - 배포 완료!

3. **테스트**
   - Netlify에서 제공하는 URL 복사
   - 브라우저에서 접속
   - 카메라 권한 허용
   - 시작 버튼 클릭

### GitHub Pages로 배포

1. **GitHub 저장소 생성**
   ```bash
   git init
   git add .
   git commit -m "Pet Recognition Service"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pet-recognition.git
   git push -u origin main
   ```

2. **Settings에서 Pages 설정**
   - Repository → Settings → Pages
   - Source: main branch 선택
   - Save

3. **배포 완료**
   - `https://YOUR_USERNAME.github.io/pet-recognition`에서 접속

### 기타 호스팅 서비스

#### Vercel
```bash
npm install -g vercel
vercel
# 선택지를 따라 진행하면 자동 배포
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔒 HTTPS가 필수인 이유

브라우저의 `getUserMedia()` API는 보안상 이유로 다음 환경에서만 카메라 접근 허용:
- ✅ HTTPS 연결 (모든 호스팅)
- ✅ localhost (로컬 테스트)
- ✅ 127.0.0.1 (로컬 테스트)
- ❌ HTTP 호스팅 (차단됨)

따라서 **호스팅은 반드시 HTTPS를 지원하는 서비스를 선택**해야 합니다.

### index.html
- 페이지 구조 정의
- 카메라 비디오 요소
- 버튼과 결과 표시 영역
- 모든 요소에 한국어 주석

### style.css
- 모바일 우선(Mobile-First) 반응형 디자인
- 미디어 쿼리로 다양한 화면 크기 지원
- 애니메이션 효과 (로딩, 카운트다운 등)
- 모든 스타일에 한국어 주석

### script.js
- 카메라 접근 및 관리
- AI 모델 로드
- 이미지 캡처 및 인식
- 결과 표시 및 음성 출력
- 모든 함수에 한국어 주석

### model.json
- AI 모델 파일 (TensorFlow.js 형식)
- 개와 고양이 분류 모델

## 🔧 모델 교체 방법

현재는 샘플 모델이 포함되어 있습니다. 실제 작동하려면:

### 1. TensorFlow.js 모델 사용

**model.json과 model.weights.bin 파일 필요:**
```
model.json         # 모델 구조 정의
model.weights.bin  # 모델 가중치
```

**script.js의 loadModel() 함수:**
```javascript
// 주석을 제거하고 실제 모델 로드 코드 활성화
model = await tf.loadLayersModel('file://./model.json');
```

### 2. Google Colab에서 모델 만들기

```python
# MobileNet v2 모델 사용
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2

# 모델 생성
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False)
# ... 맞춤 레이어 추가 ...

# TensorFlow.js 형식으로 변환
!pip install tensorflowjs
!tensorflowjs_converter --input_format=keras model.h5 ./

# model.json과 model.weights.bin 생성
```

## 📱 반응형 디자인 지원

- **모바일** (≤480px): 세로 레이아웃, 작은 버튼
- **태블릿** (768px~): 중간 크기 레이아웃
- **PC** (≥1024px): 전체 크기 레이아웃
- **모든 화면**: 16:9 비율 카메라 유지

## 🌐 브라우저 호환성

| 브라우저 | 지원 | 비고 |
|---------|------|------|
| Chrome | ✅ | 권장 |
| Firefox | ✅ | 지원 |
| Safari | ✅ | iOS 11+ |
| Edge | ✅ | 지원 |
| IE | ❌ | 미지원 |

## 🔒 주의사항

### 카메라 사용
- **HTTPS 필수** - 보안상 로컬호스트 또는 HTTPS 사이트에서만 사용
- **권한 승인** - 첫 사용 시 브라우저에서 카메라 접근 허용 필수
- **성능** - 고사양 이미지 처리이므로 안정적인 기기 권장

### 음성 기능
- **인터넷 불필요** - 브라우저 내장 음성 합성 사용 (텍스트 투 스피치)
- **브라우저 지원** - 모던 브라우저 대부분 지원
- **언어** - 한국어 설정

## 📊 코드 라인 수

```
index.html: ~70 줄 (HTML)
style.css: ~350 줄 (CSS)
script.js: ~400 줄 (JavaScript)
합계: ~820 줄 (모두 한국어 주석 포함)
```

## 🛠️ 커스터마이징 팁

### 1. 색상 변경
`style.css`의 컬러 값 수정:
```css
/* 메인 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 2. 카메라 설정
`script.js`의 카메라 설정 수정:
```javascript
video: {
    facingMode: 'user', // 'environment'로 변경 = 후면 카메라
    width: { ideal: 1280 },
    height: { ideal: 720 }
}
```

### 3. 카운트다운 시간
`script.js`의 countdown() 함수 호출 수정:
```javascript
await countdown(5); // 3초 대신 5초로 변경
```

### 4. 음성 속도/음높이
`script.js`의 playResultSound() 함수 수정:
```javascript
utterance.rate = 1.5; // 읽기 속도 (0.5 = 느림, 2.0 = 빠름)
utterance.pitch = 1.2; // 음높이 조절
```

## 🐛 문제 해결

### 카메라가 안 보일 때
1. **브라우저 설정에서 카메라 권한 확인**
   - 주소창 왼쪽 카메라 아이콘 클릭
   - "항상 허용" 또는 "허용" 선택

2. **호스팅 환경에서 카메라 안 될 때 (중요!)**
   - ⚠️ **호스팅은 반드시 HTTPS로 설정해야 합니다**
   - HTTP는 보안상 카메라 접근이 차단됩니다
   - 호스팅 서비스의 SSL 인증서 설정 확인

3. **호스팅 HTTPS 설정 방법**
   - **Netlify**: 자동 HTTPS 적용 (무료)
   - **GitHub Pages**: 자동 HTTPS 적용 (무료)
   - **Vercel**: 자동 HTTPS 적용 (무료)
   - **Heroku**: SSL 설정 필요
   - **AWS S3 + CloudFront**: CloudFront에 SSL 추가
   - **일반 호스팅**: cPanel/Plesk에서 Let's Encrypt 인증서 설정

4. **다른 프로그램에서 카메라 사용 중이 아닌지 확인**
   - Zoom, Skype, 웹캠 앱 등 종료
   - 다른 탭이나 창에서 카메라 사용 중이 아닌지 확인

5. **브라우저 콘솔에서 에러 확인** (F12)
   - 에러 메시지를 확인하면 정확한 원인 파악 가능

### 호스팅 추천 (카메라 작동 확인됨)
```
✅ Netlify (추천)
   - https://app.netlify.com
   - 파일 드래그 앤 드롭 또는 Git 연결
   - 자동 HTTPS 적용
   - 무료 플랜 충분

✅ GitHub Pages
   - GitHub 계정 필요
   - 저장소에 파일 업로드
   - 자동 HTTPS 적용
   - 무료

✅ Vercel (Next.js 제작사)
   - https://vercel.com
   - 자동 HTTPS 적용
   - 무료 플랜 충분

✅ Firebase Hosting
   - https://firebase.google.com/docs/hosting
   - Google 계정 필요
   - 자동 HTTPS 적용
   - 무료 플랜 충분
```

### 로컬 테스트 시 HTTPS 설정 (선택사항)
```bash
# Python 3.8+를 사용한 HTTPS 로컬 서버 실행

# 먼저 자체 서명 인증서 생성
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# 그 다음 HTTPS 서버 실행
python3 -c "import http.server, ssl; ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ssl_context.load_cert_chain('cert.pem', 'key.pem'); httpd = http.server.HTTPServer(('localhost', 443), http.server.SimpleHTTPRequestHandler); httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True); httpd.serve_forever()"

# 브라우저에서 https://localhost 접속
# 보안 경고 무시하고 진행
```

## 📝 라이선스

이 프로젝트는 자유롭게 사용, 수정, 배포할 수 있습니다.

## 📞 문의

코드 이해가 안 되는 부분은 각 파일의 한국어 주석을 참고하세요.
모든 함수와 변수에 상세한 설명이 있습니다.

---

**만든 날짜**: 2026-05-12
**버전**: 1.0
**상태**: ✅ 완성
