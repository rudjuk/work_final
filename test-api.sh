#!/bin/bash

echo "=== Тестування Task API ==="
echo ""

# Кольори для виводу
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}1. GET /tasks (отримання всіх завдань)${NC}"
curl -s -X GET "$BASE_URL/tasks" | jq '.' || echo "Помилка"
echo ""

echo -e "${YELLOW}2. POST /tasks (створення нового завдання)${NC}"
TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестове завдання",
    "description": "Опис тестового завдання",
    "status": "todo",
    "priority": "high",
    "deadline": "2025-12-31"
  }')
echo "$TASK_RESPONSE" | jq '.' || echo "$TASK_RESPONSE"
TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.id' 2>/dev/null)
echo ""

if [ "$TASK_ID" != "null" ] && [ -n "$TASK_ID" ]; then
  echo -e "${YELLOW}3. GET /tasks/$TASK_ID (отримання завдання за ID)${NC}"
  curl -s -X GET "$BASE_URL/tasks/$TASK_ID" | jq '.' || echo "Помилка"
  echo ""

  echo -e "${YELLOW}4. PUT /tasks/$TASK_ID (оновлення завдання)${NC}"
  curl -s -X PUT "$BASE_URL/tasks/$TASK_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Оновлене завдання",
      "status": "in-progress"
    }' | jq '.' || echo "Помилка"
  echo ""

  echo -e "${YELLOW}5. GET /tasks?status=in-progress (фільтрація за status)${NC}"
  curl -s -X GET "$BASE_URL/tasks?status=in-progress" | jq '.' || echo "Помилка"
  echo ""

  echo -e "${YELLOW}6. GET /tasks?priority=high (фільтрація за priority)${NC}"
  curl -s -X GET "$BASE_URL/tasks?priority=high" | jq '.' || echo "Помилка"
  echo ""

  echo -e "${YELLOW}7. GET /tasks?status=in-progress&priority=high (комбінована фільтрація)${NC}"
  curl -s -X GET "$BASE_URL/tasks?status=in-progress&priority=high" | jq '.' || echo "Помилка"
  echo ""

  echo -e "${YELLOW}8. DELETE /tasks/$TASK_ID (видалення завдання)${NC}"
  curl -s -X DELETE "$BASE_URL/tasks/$TASK_ID" | jq '.' || echo "Помилка"
  echo ""

  echo -e "${YELLOW}9. GET /tasks/$TASK_ID (перевірка видалення - має повернути 404)${NC}"
  curl -s -X GET "$BASE_URL/tasks/$TASK_ID" | jq '.' || echo "Помилка"
  echo ""
fi

echo -e "${YELLOW}10. Тестування валідації - невірні дані (має повернути 400)${NC}"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "description": "Тест",
    "status": "invalid-status",
    "priority": "high"
  }' | jq '.' || echo "Помилка"
echo ""

echo -e "${YELLOW}11. Тестування 404 - неіснуючий ID${NC}"
curl -s -X GET "$BASE_URL/tasks/non-existent-id" | jq '.' || echo "Помилка"
echo ""

echo -e "${GREEN}=== Тестування завершено ===${NC}"

