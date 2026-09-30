# EBS AI Prompt Battle

EBS AI DAY 2026용 3인 멀티플레이 프롬프트 역추적 게임 MVP.

## 게임 흐름
1. 방장이 방 생성
2. 팀원들이 5자리 코드 또는 초대 링크로 참가
3. AI가 제시 이미지를 생성
4. 150초 안에 각자 프롬프트 입력
5. 각 프롬프트로 AI 이미지 생성
6. 비전 모델이 정답 이미지와 유사도를 0~100점으로 채점
7. 전원 제출/시간 종료 후 랭킹 공개

## 필요한 Vercel 환경변수
- `OPENAI_API_KEY`
- `DATABASE_URL`
- `OPENAI_MODEL` (기존 값 사용 가능)
- `IMAGE_MODEL=gpt-image-2` (선택)
- `VISION_MODEL` (선택)

## 구성
- `index.html`: 모바일/PC 게임 UI
- `api/`: 방 생성, 참가, 라운드, 제출, 채점, 결과 API
- Neon Postgres: 방/참가자/라운드/제출 결과 저장

첫 API 호출 시 `pb_rooms`, `pb_players`, `pb_rounds`, `pb_submissions` 테이블을 자동 생성합니다.
