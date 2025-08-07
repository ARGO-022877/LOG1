#!/bin/bash

# Firebase 프로젝트 활성화 스크립트
PROJECT_ID="iness-467105"
ACCESS_TOKEN=$(gcloud auth print-access-token)

echo "Firebase 프로젝트 활성화 시도 중..."

# Firebase 프로젝트 추가
curl -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"${PROJECT_ID}\",
    \"timeZone\": \"America/Los_Angeles\",
    \"regionCode\": \"US\",
    \"locationId\": \"us-central\"
  }" \
  "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}:addFirebase"

echo -e "\n\nFirebase 프로젝트 상태 확인..."

# 프로젝트 상태 확인
curl -s \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}" | python3 -m json.tool