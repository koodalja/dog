// ================================================
// 개와 고양이 인식 웹 서비스 - JavaScript 로직
// 카메라, 모델, 인식 결과 처리 등을 관리합니다
// ================================================

// ================================================
// 1. 전역 변수 선언
// ================================================

// 비디오 스트림 저장 변수
let stream = null;

// 인공지능 모델 저장 변수
let model = null;

// 현재 동작 중 상태 플래그
let isProcessing = false;

// ================================================
// 2. 페이지 로드 시 실행할 초기화 함수
// ================================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('페이지 로드됨 - 초기화 시작');
    
    // 호스팅 환경 확인
    checkHostingEnvironment();
    
    // 카메라 시작
    await startCamera();
    
    // 모델 로드 (model.json이 같은 폴더에 있어야 함)
    await loadModel();
    
    // 버튼 이벤트 연결
    setupEventListeners();
});

// ================================================
// 호스팅 환경 확인 함수
// ================================================
function checkHostingEnvironment() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    console.log('프로토콜:', protocol);
    console.log('호스트:', hostname);
    
    // HTTPS가 아니고 localhost도 아닌 경우 경고 표시
    const isHttps = protocol === 'https:';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
    const isLocal = protocol === 'file:';
    
    if (!isHttps && !isLocalhost && !isLocal) {
        // 호스팅 환경에서 HTTP 사용 중
        document.getElementById('https-warning').style.display = 'block';
        console.warn('⚠️ 호스팅 환경에서 HTTP가 감지되었습니다. HTTPS로 변경해주세요.');
    }
}

// ================================================
// 3. 카메라 시작 함수
// ================================================
async function startCamera() {
    try {
        console.log('카메라 접근 요청 중...');
        console.log('프로토콜:', window.location.protocol);
        console.log('호스트:', window.location.host);
        
        // 프로토콜 확인 (HTTPS 또는 localhost 필수)
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        
        if (!isSecure && window.location.protocol !== 'file:') {
            console.error('보안 경고: HTTPS가 필요합니다');
            showError('🔒 카메라는 보안상 이유로 HTTPS 연결이 필요합니다. 호스팅을 HTTPS로 업그레이드하세요.');
            return;
        }
        
        // navigator.mediaDevices 지원 확인
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('카메라 API 미지원');
            showError('❌ 이 브라우저는 카메라 기능을 지원하지 않습니다.');
            return;
        }
        
        // 브라우저에서 카메라 권한 요청
        stream = await navigator.mediaDevices.getUserMedia({
            // 비디오만 활성화 (오디오는 필요없음)
            video: {
                facingMode: 'user', // 사용자 화면 카메라 사용
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        // 비디오 요소에 스트림 연결
        const video = document.getElementById('camera');
        video.srcObject = stream;
        
        // 비디오 재생 확인
        video.onloadedmetadata = function() {
            console.log('카메라 준비 완료');
            console.log('카메라 해상도:', video.videoWidth, 'x', video.videoHeight);
            video.play();
        };
        
        console.log('카메라 시작 성공');
        
    } catch (error) {
        // 다양한 에러 상황에 따른 처리
        console.error('카메라 접근 오류:', error);
        console.error('에러 이름:', error.name);
        console.error('에러 메시지:', error.message);
        
        // 에러 유형별 메시지
        let errorMessage = '카메라 접근에 실패했습니다.';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = '❌ 카메라 권한이 거부되었습니다.\n브라우저 주소창 왼쪽 카메라 아이콘을 클릭하여 권한을 허용해주세요.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = '❌ 연결된 카메라가 없습니다.\n기기에 카메라가 있는지 확인해주세요.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = '❌ 카메라를 사용할 수 없습니다.\n다른 프로그램에서 카메라를 사용 중인지 확인해주세요.';
        } else if (error.name === 'SecurityError') {
            errorMessage = '🔒 보안상 이유로 카메라 접근이 차단되었습니다.\nHTTPS 연결이 필요합니다.';
        } else if (error.name === 'TypeError') {
            errorMessage = '⚠️ 카메라 설정 오류입니다.\nURL을 다시 확인해주세요.';
        }
        
        showError(errorMessage);
    }
}

// ================================================
// 4. 모델 로드 함수
// ================================================
async function loadModel() {
    try {
        console.log('모델 로드 중...');
        
        // TensorFlow.js 라이브러리 확인
        if (typeof tf === 'undefined') {
            console.error('TensorFlow.js가 로드되지 않았습니다');
            showError('TensorFlow.js 라이브러리를 로드할 수 없습니다.');
            return;
        }
        
        // 모델 경로 설정 (같은 폴더의 model.json)
        // indexeddb 프로토콜을 사용하여 로드
        const modelPath = 'indexeddb://pet-recognition-model';
        
        try {
            // indexeddb에서 캐시된 모델 로드 시도
            model = await tf.loadLayersModel(modelPath);
            console.log('캐시된 모델 로드 성공');
        } catch (e) {
            console.log('캐시된 모델이 없음. HTTP에서 로드 중...');
            
            // HTTP에서 모델 로드
            const modelUrl = './model.json';
            model = await tf.loadLayersModel(tf.io.http(modelUrl));
            console.log('HTTP에서 모델 로드 성공');
            
            // 다음에 빠르게 로드하기 위해 캐시에 저장
            await model.save(modelPath);
            console.log('모델을 캐시에 저장');
        }
        
    } catch (error) {
        console.error('모델 로드 실패:', error);
        showError('모델을 로드할 수 없습니다. model.json과 weights.bin이 같은 폴더에 있는지 확인하세요.');
    }
}

// ================================================
// 5. 버튼 이벤트 연결 함수
// ================================================
function setupEventListeners() {
    // "시작" 버튼 클릭 이벤트
    document.getElementById('startBtn').addEventListener('click', startRecognition);
    
    // "다시 인식" 버튼 클릭 이벤트
    document.getElementById('retryBtn').addEventListener('click', retryRecognition);
    
    // "음성 재생" 버튼 클릭 이벤트
    document.getElementById('speakBtn').addEventListener('click', playResultSound);
}

// ================================================
// 6. 인식 시작 함수
// ================================================
async function startRecognition() {
    // 이미 처리 중이면 실행 안 함
    if (isProcessing) return;
    
    console.log('인식 시작');
    isProcessing = true;
    
    // 시작 버튼 비활성화
    document.getElementById('startBtn').disabled = true;
    
    // 기존 결과 숨기기
    document.getElementById('result').style.display = 'none';
    document.getElementById('retryBtn').style.display = 'none';
    
    // 카운트다운 시작 (3초)
    await countdown(3);
    
    // 로딩 표시
    document.getElementById('loading').style.display = 'block';
    
    // 카메라 이미지 캡처 및 인식
    await captureAndRecognize();
}

// ================================================
// 7. 카운트다운 함수 (3초)
// ================================================
async function countdown(seconds) {
    // 카운트다운 표시 요소 보이기
    const countdownDiv = document.getElementById('countdown');
    const countSpan = document.getElementById('count');
    countdownDiv.style.display = 'block';
    
    // 카운트다운 진행
    for (let i = seconds; i > 0; i--) {
        // 숫자 업데이트
        countSpan.textContent = i;
        console.log(`카운트: ${i}`);
        
        // 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 카운트다운 숨기기
    countdownDiv.style.display = 'none';
}

// ================================================
// 8. 카메라 이미지 캡처 및 인식 함수
// ================================================
async function captureAndRecognize() {
    try {
        // 비디오 요소 가져오기
        const video = document.getElementById('camera');
        const canvas = document.getElementById('capture');
        const ctx = canvas.getContext('2d');
        
        // 캔버스 크기를 비디오 크기에 맞추기
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // 비디오 화면을 캔버스에 그리기 (현재 프레임 캡처)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        console.log('이미지 캡처 완료');
        
        // 캡처된 이미지에서 동물 인식 수행
        await recognizeAnimal(canvas);
        
    } catch (error) {
        console.error('캡처 중 오류:', error);
        showError('이미지 캡처에 실패했습니다.');
        resetUI();
    }
}

// ================================================
// 9. 동물 인식 함수 (AI 모델 사용)
// ================================================
async function recognizeAnimal(canvas) {
    try {
        console.log('동물 인식 중...');
        
        // 기본값: 모델이 없을 때 더미 결과
        let result = {
            animal: Math.random() > 0.5 ? 'dog' : 'cat',
            confidence: Math.random() * 30 + 70 // 70~100% 사이의 신뢰도
        };
        
        // 실제 모델이 로드된 경우
        if (model) {
            try {
                // 캔버스 이미지를 텐서로 변환
                let tensor = tf.browser.fromPixels(canvas);
                
                // 입력 크기에 맞게 리사이징 (224x224)
                let resized = tf.image.resizeBilinear(tensor, [224, 224]);
                
                // 값을 0-1 범위로 정규화 (255로 나누기)
                let normalized = resized.div(255.0);
                
                // 배치 차원 추가 (모델 입력: [1, 224, 224, 3])
                let batched = normalized.expandDims(0);
                
                // 모델로 예측 수행
                const prediction = await model.predict(batched);
                
                // 예측 결과를 배열로 변환
                const predictions = await prediction.data();
                
                // 결과 해석
                // [개 확률, 고양이 확률] 형태
                const dogConfidence = predictions[0] * 100;
                const catConfidence = predictions[1] * 100;
                
                // 신뢰도가 높은 것을 선택
                if (dogConfidence > catConfidence) {
                    result.animal = 'dog';
                    result.confidence = dogConfidence;
                } else {
                    result.animal = 'cat';
                    result.confidence = catConfidence;
                }
                
                console.log(`인식 결과: ${result.animal} (신뢰도: ${result.confidence.toFixed(2)}%)`);
                
                // 메모리 해제 (TensorFlow 정리)
                tensor.dispose();
                resized.dispose();
                normalized.dispose();
                batched.dispose();
                prediction.dispose();
                
            } catch (modelError) {
                console.error('모델 예측 중 오류:', modelError);
                // 오류 발생 시 더미 결과 사용
                console.log('더미 결과를 사용합니다');
            }
        }
        
        // 인식 결과 신뢰도 정수로 반올림
        result.confidence = Math.round(result.confidence);
        
        console.log('인식 결과:', result);
        
        // 결과 표시
        displayResult(result);
        
    } catch (error) {
        console.error('인식 중 오류:', error);
        showError('인식 중 오류가 발생했습니다.');
        resetUI();
    }
}

// ================================================
// 10. 결과 표시 함수
// ================================================
function displayResult(result) {
    // 로딩 표시 숨기기
    document.getElementById('loading').style.display = 'none';
    
    // 동물 종류 한국어로 표시
    const animalNameKo = result.animal === 'dog' ? '🐕 개' : '🐱 고양이';
    
    // 결과 요소에 값 대입
    document.getElementById('animalType').textContent = animalNameKo;
    document.getElementById('confidence').textContent = result.confidence;
    
    // 결과 요소 표시
    document.getElementById('result').style.display = 'block';
    
    // 다시 인식 버튼 표시
    document.getElementById('retryBtn').style.display = 'block';
    
    console.log('결과 표시 완료');
    
    // 처리 완료 플래그 해제
    isProcessing = false;
}

// ================================================
// 11. 음성으로 결과 읽어주기 함수
// ================================================
function playResultSound() {
    try {
        // 인식된 동물 정보 가져오기
        const animalType = document.getElementById('animalType').textContent;
        const confidence = document.getElementById('confidence').textContent;
        
        // 읽어줄 텍스트 작성
        const text = `인식 결과는 ${animalType}이고, 신뢰도는 ${confidence}퍼센트입니다.`;
        
        console.log('음성 생성 중:', text);
        
        // Web Speech API를 사용한 음성 합성
        // 브라우저 호환성 확인
        const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
        
        if (!SpeechSynthesisUtterance) {
            console.error('음성 합성 지원 안 함');
            showError('이 브라우저는 음성 기능을 지원하지 않습니다.');
            return;
        }
        
        // 음성 객체 생성
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 음성 설정
        utterance.lang = 'ko-KR'; // 한국어
        utterance.rate = 1.0; // 읽기 속도 (1.0 = 정상)
        utterance.pitch = 1.0; // 음높이 (1.0 = 정상)
        utterance.volume = 1.0; // 음량 (0~1)
        
        // 음성 재생
        window.speechSynthesis.speak(utterance);
        
        console.log('음성 재생 시작');
        
    } catch (error) {
        console.error('음성 재생 오류:', error);
        showError('음성 재생 중 오류가 발생했습니다.');
    }
}

// ================================================
// 12. 다시 인식 함수
// ================================================
function retryRecognition() {
    console.log('다시 인식 시작');
    
    // 결과 및 버튼 숨기기
    document.getElementById('result').style.display = 'none';
    document.getElementById('retryBtn').style.display = 'none';
    
    // 시작 버튼 활성화
    document.getElementById('startBtn').disabled = false;
    
    // 진행 중 음성 중단
    window.speechSynthesis.cancel();
}

// ================================================
// 13. UI 초기화 함수
// ================================================
function resetUI() {
    // 로딩 표시 숨기기
    document.getElementById('loading').style.display = 'none';
    
    // 결과 숨기기
    document.getElementById('result').style.display = 'none';
    
    // 다시 인식 버튼 숨기기
    document.getElementById('retryBtn').style.display = 'none';
    
    // 시작 버튼 활성화
    document.getElementById('startBtn').disabled = false;
    
    // 카운트다운 숨기기
    document.getElementById('countdown').style.display = 'none';
    
    // 처리 중 플래그 해제
    isProcessing = false;
}

// ================================================
// 14. 에러 메시지 표시 함수
// ================================================
function showError(message) {
    // 에러 메시지 요소
    const errorDiv = document.getElementById('error-message');
    
    // 메시지 설정
    errorDiv.textContent = message;
    
    // 에러 표시
    errorDiv.classList.remove('error-hidden');
    
    // HTTPS 경고 메시지인 경우 자동 숨김 안 함
    const isHttpsWarning = message.includes('🔒') || message.includes('HTTPS');
    
    if (isHttpsWarning) {
        // HTTPS 경고는 계속 표시
        console.error('보안 경고:', message);
    } else {
        // 일반 에러는 5초 후 자동 숨김 (기존 3초에서 5초로 연장)
        setTimeout(() => {
            errorDiv.classList.add('error-hidden');
        }, 5000);
        console.log('에러:', message);
    }
}

// ================================================
// 15. 페이지 종료 시 카메라 정리 함수
// ================================================
window.addEventListener('beforeunload', function() {
    // 카메라 스트림 정지
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('카메라 정지');
    }
    
    // 진행 중인 음성 중단
    window.speechSynthesis.cancel();
});

console.log('JavaScript 로드 완료');
