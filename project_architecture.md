# AeroCalc 프로젝트 아키텍처 및 파일 명세서

AeroCalc는 사용자 친화적인 디자인과 강력한 계산 기능을 결합한 **클라이언트 중심 웹 애플리케이션**입니다. 본 문서는 프로젝트의 전체 구조와 각 파일의 역할을 상세히 설명합니다.

---

## 1. 프로젝트 개요 (Project Overview)
- **개발 컨셉**: Glassmorphism 디자인 기반의 다기능 스마트 계산기
- **주요 기술 스택**: 
  - **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
  - **Libraries**: math.js, jStat, Chart.js, Font Awesome
  - **Backend (Optional)**: FastAPI (Python), Pandas, Scipy
  - **API**: ExchangeRate-API (실시간 환율)

---

## 2. 전체 아키텍처 (Architecture)

본 프로젝트는 **SPA(Single Page Application)** 스타일로 설계되었습니다. 모든 기능이 하나의 HTML 페이지에서 동적으로 전환되며, 복잡한 통계 및 자연어 처리 로직도 클라이언트 브라우저에서 직접 수행하여 높은 반응성을 제공합니다.

### 데이터 흐름
1. **사용자 입력**: 키패드, 키보드, 또는 음성(Speech Recognition API)을 통해 전달
2. **로직 처리**: `script.js` 내의 각 모듈별 클래스/함수가 라이브러리(`math.js`, `jStat`)를 활용해 계산
3. **상태 관리**: 테마 및 계산 기록은 `localStorage`에 영구 저장
4. **시각화**: 통계 데이터는 `Chart.js`를 통해 즉시 캔버스에 렌더링

---

## 3. 파일별 역할 (File Specification)

### 📂 Frontend Core
#### [index.html](file:///c:/WORK-파이썬/AeroCalc/index.html)
- **역할**: 애플리케이션의 뼈대(Skeleton)
- **주요 내용**: 
  - 9가지 계산 모드(Basic, Sci, NLP 등)의 레이아웃 구조 정의
  - 외부 라이브러리(CDN) 및 폰트 로드
  - 사이드바 메뉴 및 히스토리 패널 구조화

#### [style.css](file:///c:/WORK-파이썬/AeroCalc/style.css)
- **역할**: 디자인 시스템 및 테마 정의
- **주요 내용**:
  - Glassmorphism 효과(backdrop-filter) 구현
  - 3가지 테마(Dark, Light, Cute) 변수 관리
  - 반응형 레이아웃 및 배경 애니메이션 효과

#### [script.js](file:///c:/WORK-파이썬/AeroCalc/script.js)
- **역할**: 애플리케이션의 두뇌 (Core Logic)
- **주요 내용**:
  - `Calculator` 클래스: 기본 연산 및 히스토리 관리
  - `parseAndCalculateNLP`: 한국어 자연어 수식 파싱 및 계산
  - `initCurrencyCalc`: 실시간 환율 API 연동
  - 통계 계산 로직 및 `Chart.js` 차트 생성

### 📂 Backend / Server-side
#### [app.py](file:///c:/WORK-파이썬/AeroCalc/app.py)
- **역할**: 고성능 통계 분석 API (Standalone/Alternative)
- **주요 내용**:
  - FastAPI 기반의 REST API 서버
  - Pandas 및 Scipy를 이용한 정밀 통계 처리
  - Matplotlib/Seaborn을 활용한 서버측 그래프 생성 (Base64 변환)

#### [requirements.txt](file:///c:/WORK-파이썬/AeroCalc/requirements.txt)
- **역할**: Python 환경 의존성 관리
- **주요 내용**: fastapi, pandas, scipy, matplotlib 등 필요 라이브러리 목록

---

## 4. 기능 모듈 요약

| 모듈명 | 핵심 기술 | 주요 기능 |
| :--- | :--- | :--- |
| **Basic/Sci** | math.js | 사칙연산, 삼각함수, 로그, 이스터에그(Fly) |
| **NLP** | Web Speech API | 한국어 음성/텍스트 기반 수식 계산 |
| **Stats** | jStat, Chart.js | 평균, 분산, 상관계수, 히스토그램, 산점도 |
| **Unit/Currency** | Fetch API | 단위 변환 및 실시간 환율 계산 |
| **Photo/Planet** | Physics Logic | 노출값(EV), 화각, 행성별 무게, 탈출 속도 |

---

## 5. 유지보수 및 확장 가이드
- **새로운 테마 추가**: `style.css`의 `:root` 변수 그룹을 추가하여 쉽게 테마 확장 가능
- **계산 모드 추가**: `index.html`에 View 컨테이너를 추가하고 `script.js`에서 사이드바 이벤트와 연동
- **백엔드 통합**: 더 복잡한 데이터 분석이 필요할 경우 `app.py`의 API 엔드포인트를 `script.js`에서 `fetch()`로 호출하도록 전환 가능
