#!/bin/bash

echo "=== Тестування Task API ==="
echo ""

BASE_URL="http://localhost:3000"

echo "1. GET /tasks (отримання всіх завдань)"
echo "---"
curl -s -X GET "$BASE_URL/tasks"
echo -e "\n"

echo "2. POST /tasks (створення нового завдання)"
echo "---"
TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестове завдання",
    "description": "Опис тестового завдання",
    "status": "todo",
    "priority": "high",
    "deadline": "2025-12-31"
  }')
echo "$TASK_RESPONSE"
TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "\n"

if [ -n "$TASK_ID" ]; then
  echo "3. GET /tasks/$TASK_ID (отримання завдання за ID)"
  echo "---"
  curl -s -X GET "$BASE_URL/tasks/$TASK_ID"
  echo -e "\n"

  echo "4. PUT /tasks/$TASK_ID (оновлення завдання)"
  echo "---"
  curl -s -X PUT "$BASE_URL/tasks/$TASK_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Оновлене завдання",
      "status": "in-progress"
    }'
  echo -e "\n"

  echo "5. GET /tasks?status=in-progress (фільтрація за status)"
  echo "---"
  curl -s -X GET "$BASE_URL/tasks?status=in-progress"
  echo -e "\n"

  echo "6. GET /tasks?priority=high (фільтрація за priority)"
  echo "---"
  curl -s -X GET "$BASE_URL/tasks?priority=high"
  echo -e "\n"

  echo "7. DELETE /tasks/$TASK_ID (видалення завдання)"
  echo "---"
  curl -s -X DELETE "$BASE_URL/tasks/$TASK_ID"
  echo -e "\n"
fi

echo "8. Тестування валідації - невірні дані (має повернути 400)"
echo "---"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "description": "Тест",
    "status": "invalid-status",
    "priority": "high"
  }'
echo -e "\n"

echo "9. Тестування 404 - неіснуючий ID"
echo "---"
curl -s -X GET "$BASE_URL/tasks/non-existent-id"
echo -e "\n"

echo "=== Тестування завершено ==="

