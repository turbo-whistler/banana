## 개요
바나나는 병아리 엔진 기반의 많은 편리한 기능 탑재를 목표로 하는 나무픽스 호환 엔진입니다.  
banana is a wiki engine that supports many convinient features. (English is not supported yet)

버전은 기존 엔진 버전 번호를 이어서 9부터 시작합니다. *(참고로 기존 새위키 엔진은 더 이상 본인도 가지고 있지 않다. 영구 삭제 후 영상 파일로 여러 번 덮어쓰기했습니다.)*

## 요구 환경
Windows 7(Node.js 7.6 이상)

## 기능
굵게 표시한 것을 모두 만들면 베타로 전환.
- [X] **문서 읽기**
- [X] **편집, 생성**
- [X] **이동 및 삭제**
- [X] **RAW, 비교, 편집 복구**
- [X] **역링크**
- [X] **문서 역사**
- [X] **최근 변경, 최근 토론**
- [X] **사용자별 기여 목록**
- [X] **ACL**
- [X] **로그인, 로그아웃, 가입**
- [ ] **사용자 정보 수정 도구** (진행 중)
- [X] **IP 차단**
- [X] **사용자 차단**
- [X] **권한 부여**
- [X] **위키 설정 도구**
- [ ] **편집요청(토론을 기반으로 만듬)** (진행 중)
- [X] **화일 올리기 도구**
- [ ] **화일 페이지**
- [X] **검색**
- [ ] **분류 페이지**
- [X] API
- [X] 플러그 인
- [X] 문서함(엔진에서는 "주시문서 목록"이라 부름)
- [ ] 토론함
- [ ] 자동 로그인(진행 중)
- [ ] 하위 위키(진행 중)
- [ ] 다국어 지원(진행 중)
- [ ] 로그인 내역
- [ ] 일관 편집, 생성, 및 삭제
- [ ] 완전한 UI 트윅 기능

## 삭제된 릴리즈
### \[4.5.9] 12.5.9 (알파)

 - 특수 방식으로 오류 번호 생성

### \[4.5.8] 12.5.8 (알파)
 - 표현 오류 수정

### \[4.5.7] 12.5.7 (알파)
 - 모든 주소에서의 접속 차단 가능

### \[4.5.6] 12.5.6 (알파)
 - 이동 관련 버그 수정

### \[4.5.5] 12.5.5 (알파)
 - 버그 수정

### \[4.5.4] 12.5.4 (알파)
 - session-file-store 사용으로 서버 재시작 시에도 로그인 상태 유지됨
 
### \[1.1.0] 9.1.0 (알파)
- 기본적인 기능
    - 문서 읽기
    - 문서 편집
    - 토론
        - 토론 발제
        - 댓글 달기
        - 댓글 숨기기
        - 토론 종경, 동결
        - 토론 주제변경
        - 토론 문서 변경
        - 토론 삭제
    - 로그인
    - 계정 생성
    - 문서 역사
    - 최근 변경 내역
    - 최근 토론
    - 사용자 기여 목록(수정, 토론)

## 사용하는 외부 라이브러리
### path
[[라이선스]](https://github.com/jinder/path/blob/master/LICENSE)

### captchapng
[[NPM]](npmjs.com/package/captchapng) \[라이선스: BSD] \[저작권자: George Chan]

### wait-console-input
[[NPM]](https://www.npmjs.com/package/wait-console-input) [[라이선스]](https://github.com/peeyush-pant/wait-console-input/blob/master/LICENSE)

### sha3
[[NPM]](https://www.npmjs.com/package/sha3) [[라이선스]](https://github.com/phusion/node-sha3/blob/master/LICENSE)

### sqlite3
[[NPM]](https://www.npmjs.com/package/sqlite3) [[라이선스]](https://github.com/mapbox/node-sqlite3/blob/master/LICENSE)

### express
[[NPM]](https://www.npmjs.com/package/express) [[라이선스]](https://github.com/expressjs/express/blob/master/LICENSE)

### swig
[[NPM]](https://www.npmjs.com/package/swig) [[라이선스]](https://github.com/paularmstrong/swig/blob/master/LICENSE)
- dateformatter.js 사용 (날짜를 시간대에 맞추기)

### md5
[[NPM]](https://www.npmjs.com/package/md5) [[라이선스]](https://github.com/pvorb/node-md5/blob/master/LICENSE)

### ip-range-check
[[NPM]](https://www.npmjs.com/package/ip-range-check) [[라이선스]](https://github.com/danielcompton/ip-range-check/blob/master/LICENSE)

### nodemailer
[[NPM]](https://www.npmjs.com/package/nodemailer) [[라이선스]](https://github.com/nodemailer/nodemailer/blob/master/LICENSE)

### jQuery, jQuery UI
(C)저작권자 JS 파운데이션 및 기타 기여자들 [[라이선스]](https://jquery.org/license/)

### ionicons
(C) 저작권자 present Ionic (2015) / [[라이선스]](https://github.com/ionic-team/ionicons) (MIT)

### nunjucks
[[NPM]](https://www.npmjs.com/package/nunjucks) [[라이선스]](https://github.com/mozilla/nunjucks/blob/master/LICENSE)

### js-namumark
(C)저작권자 LiteHell(2017) / AGPL-3.0 / [[라이선스]](https://github.com/LiteHell/js-namumark/blob/master/LICENSE)
 * ~~일부 소스를 수정했읍니다 - 수정된 소스 코드는 [[이곳]](https://github.com/gdl-888/js-namumark)에서...~~ <-- 소스 변경은 취소했으며, 렌더링 끝난 HTML을 서버에서 다듬는 방식으로 변경
 
### jsdifflib
(C)저작권자 cemerick 2007~2011 [[깃허브]](https://github.com/cemerick/jsdifflib)

## 기타 라이선스
- 아직 라이선스는 미정이나 아파치, MIT, ISC 중 하나가 될 가능성이 높으며, 엔진에 있는 각 기능의 저작권은 그 기능을 만든 사람에게 있습니다.

- 스킨 호환 관련: [the seed](https://theseed.io/License), [openNAMU](https://github.com/2du/openNAMU#%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4)

- 대한민국 기준 프로그램코드역분석 법률에 따라 코드 수정을 통해 the seed 엔진을 모방하거나 이 엔진을 상업적으로 쓰지 않는 것을 강력히 권장합니다.
