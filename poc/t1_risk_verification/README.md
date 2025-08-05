# T1 Risk Verification PoC - Secure State Transfer

## 개요

이 PoC는 '마음로그 V4.0' 프로젝트의 **Phase 0: PoC** 단계에서 수행되는 **T1 리스크 검증**입니다. 민감한 정보(예: 데이터베이스 비밀번호, API 키)를 안전하게 생성, 저장, 조회하는 과정을 통해 보안 상태 전달 메커니즘을 검증합니다.

## 주요 목표

- ✅ **보안성**: 민감 정보가 Git 저장소나 로그에 노출되지 않음
- ✅ **안전한 저장**: GCP Secret Manager를 활용한 암호화된 저장
- ✅ **인증 보안**: 서비스 계정 기반 인증으로 안전한 접근 제어
- ✅ **자동화**: Terraform을 통한 Infrastructure as Code

## 프로젝트 구조

```
poc/t1_risk_verification/
├── main.tf              # Terraform 메인 구성 파일
├── terraform.tfvars     # Terraform 변수 파일 (비민감 정보만)
├── secret_retriever.py  # 비밀 정보 조회 Python 스크립트
├── requirements.txt     # Python 의존성
└── README.md           # 이 문서
```

## 사전 요구사항

### GCP 프로젝트 설정
- **프로젝트 ID**: `iness-467105`
- **조직**: `argo.ai.kr` (ID: `38646727271`)
- **리전**: `us-central1`

### 필요한 GCP API 활성화
```bash
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 권한 요구사항
실행하는 서비스 계정에 다음 권한이 필요합니다:
- `secretmanager.admin` 또는 `secretmanager.secretAccessor`
- `secretmanager.versions.access`

## 실행 방법

### 1단계: Terraform 초기화 및 적용

```bash
# Terraform 초기화
cd poc/t1_risk_verification
terraform init

# 계획 확인
terraform plan

# 리소스 생성
terraform apply
```

실행 결과로 다음 리소스가 생성됩니다:
- `maeum-log-v4-db-password`: 32자리 랜덤 데이터베이스 비밀번호
- `maeum-log-v4-api-key`: 64자리 랜덤 API 키

### 2단계: Python 의존성 설치

```bash
pip install -r requirements.txt
```

### 3단계: 비밀 정보 조회 테스트

```bash
python secret_retriever.py
```

예상 출력:
```
2024-01-XX XX:XX:XX - INFO - Using default credentials for project: iness-467105
2024-01-XX XX:XX:XX - INFO - === Verifying Secret Existence ===
maeum-log-v4-db-password       ✓ EXISTS
maeum-log-v4-api-key          ✓ EXISTS

2024-01-XX XX:XX:XX - INFO - === Retrieving Secret Values (Demo) ===
maeum-log-v4-db-password       Retrieved (masked): AbC1...Xy9Z
maeum-log-v4-api-key          Retrieved (masked): DeF2...Vw8X

2024-01-XX XX:XX:XX - INFO - === T1 Risk Verification Complete ===
2024-01-XX XX:XX:XX - INFO - ✓ Secrets can be securely stored in GCP Secret Manager
2024-01-XX XX:XX:XX - INFO - ✓ Secrets can be retrieved using service account authentication  
2024-01-XX XX:XX:XX - INFO - ✓ No sensitive data exposed in code or logs
```

## 보안 특징

### 1. 비밀 정보 생성
- Terraform의 `random_password` 리소스를 사용하여 보안 강도 높은 랜덤 값 생성
- 생성된 값은 Terraform 상태 파일에만 저장되고 코드나 로그에 노출되지 않음

### 2. 안전한 저장
- GCP Secret Manager에 암호화되어 저장
- 적절한 라벨링으로 분류 및 관리
- 자동 복제 정책으로 가용성 보장

### 3. 접근 제어
- 서비스 계정 기반 인증
- IAM 정책을 통한 세밀한 권한 제어
- 감사 로그를 통한 접근 추적

### 4. 코드 보안
- 하드코딩된 비밀 정보 없음
- 환경 변수나 설정 파일에 민감 정보 저장하지 않음
- 마스킹을 통한 안전한 디버깅

## 검증 완료 항목

- [x] **T1.1**: 민감 정보가 Git 저장소에 커밋되지 않음
- [x] **T1.2**: 민감 정보가 로그에 평문으로 출력되지 않음  
- [x] **T1.3**: GCP Secret Manager를 통한 안전한 저장소 사용
- [x] **T1.4**: 서비스 계정 인증을 통한 안전한 접근
- [x] **T1.5**: Infrastructure as Code를 통한 재현 가능한 배포

## 정리 방법

테스트 완료 후 생성된 리소스를 정리하려면:

```bash
terraform destroy
```

## 연관 문서

- [GCP Secret Manager 공식 문서](https://cloud.google.com/secret-manager/docs)
- [Terraform Google Provider 문서](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- 마음로그 V4.0 최종 신사업 기획서 (6페이지 State Generation Matrix)

## 기술 스택

- **Infrastructure**: Terraform
- **Cloud Platform**: Google Cloud Platform  
- **Secret Management**: GCP Secret Manager
- **Programming Language**: Python 3.x
- **Authentication**: GCP Service Account
- **Region**: us-central1

---

**작성자**: Infrastructure Architect AI (Gemini Code Assist)  
**작성일**: 2024-XX-XX  
**프로젝트**: 마음로그 V4.0 Phase 0 PoC