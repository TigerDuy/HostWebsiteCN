# 📡 Report System API Reference

## Base URL
```
http://localhost:5000/report
```

## Authentication
All endpoints (except public endpoints) require:
```
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

---

## Endpoints

### 1️⃣ POST `/report/recipe/:id` - Submit Report

**Description:** User submits a report about a recipe

**Parameters:**
- `id` (URL): Recipe ID (required)

**Request Body:**
```json
{
  "reason": "Hình ảnh không phù hợp"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:5000/report/recipe/5 \
  -H "Authorization: Bearer abc123" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Hình ảnh không phù hợp"}'
```

**Success Response (201 Created):**
```json
{
  "message": "✅ Báo cáo thành công",
  "report": {
    "id": 1,
    "recipe_id": 5,
    "user_id": 12,
    "reason": "Hình ảnh không phù hợp",
    "status": "pending",
    "rejected_reason": null,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Bài viết không tồn tại | Recipe ID invalid |
| 400 | Lý do báo cáo không được trống | Reason is empty |
| 409 | Bạn đã báo cáo bài viết này | Already reported (pending or accepted) |
| 401 | Token hết hạn | Invalid/expired token |

**Constraints:**
- Reason: max 500 characters
- UNIQUE: (recipe_id, user_id) - only if status is pending or accepted
- Can report again if previous status is "rejected"

---

### 2️⃣ DELETE `/report/recipe/:id` - Cancel Report

**Description:** User cancels a pending report

**Parameters:**
- `id` (URL): Recipe ID (required)

**Request Example:**
```bash
curl -X DELETE http://localhost:5000/report/recipe/5 \
  -H "Authorization: Bearer abc123"
```

**Success Response (200 OK):**
```json
{
  "message": "✅ Hủy báo cáo thành công"
}
```

**Error Responses:**

| Status | Message | Cause |
|--------|---------|-------|
| 404 | Báo cáo không tồn tại | No report found |
| 400 | Chỉ có thể hủy báo cáo chưa xử lý | Status is not "pending" |
| 401 | Không có quyền | Not report owner |

**Constraints:**
- Only pending reports can be cancelled
- User can only cancel their own reports
- After cancellation, user can submit a new report

---

### 3️⃣ GET `/report/my-reports` - View My Reports

**Description:** User views all their reports

**Query Parameters:**
- None (returns all statuses)

**Request Example:**
```bash
curl -X GET http://localhost:5000/report/my-reports \
  -H "Authorization: Bearer abc123"
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "recipe_id": 5,
    "recipe_title": "Cơm Tấm Sài Gòn",
    "reason": "Hình ảnh không phù hợp",
    "status": "pending",
    "rejected_reason": null,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "recipe_id": 8,
    "recipe_title": "Phở Bò",
    "reason": "Nội dung vi phạm",
    "status": "accepted",
    "rejected_reason": null,
    "created_at": "2025-01-14T15:20:00.000Z",
    "updated_at": "2025-01-14T16:45:00.000Z"
  },
  {
    "id": 3,
    "recipe_id": 12,
    "recipe_title": "Bánh Mì",
    "reason": "Spam",
    "status": "rejected",
    "rejected_reason": "Nội dung không phải spam",
    "created_at": "2025-01-13T09:15:00.000Z",
    "updated_at": "2025-01-13T10:00:00.000Z"
  }
]
```

**Empty Array Response:**
```json
[]
```

**Error Responses:**

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Token hết hạn | Invalid/expired token |

---

### 4️⃣ GET `/report?status=pending` - View Pending Reports (Admin)

**Description:** Admin/Moderator views reports waiting for processing

**Query Parameters:**
- `status` (optional): "pending" | "accepted" | "rejected" (default: "pending")

**Request Examples:**
```bash
# View pending reports
curl -X GET "http://localhost:5000/report?status=pending" \
  -H "Authorization: Bearer abc123"

# View accepted reports
curl -X GET "http://localhost:5000/report?status=accepted" \
  -H "Authorization: Bearer abc123"

# View rejected reports
curl -X GET "http://localhost:5000/report?status=rejected" \
  -H "Authorization: Bearer abc123"
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "recipe_id": 5,
    "recipe_title": "Cơm Tấm Sài Gòn",
    "user_id": 12,
    "reporter_name": "Nguyễn Văn A",
    "reporter_email": "nguyenvana@gmail.com",
    "author_id": 3,
    "author_name": "Chủ Bài Viết",
    "author_email": "chubaiviet@gmail.com",
    "reason": "Hình ảnh không phù hợp",
    "status": "pending",
    "total_reports_for_recipe": 2,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
]
```

**Authorization:**
- Only admin or moderator role
- Returns 403 Forbidden if user is not admin/moderator

---

### 5️⃣ PUT `/report/:id/status` - Process Report (Admin)

**Description:** Admin/Moderator approves or rejects a report

**Parameters:**
- `id` (URL): Report ID (required)

**Request Body - Approve:**
```json
{
  "status": "accepted"
}
```

**Request Body - Reject:**
```json
{
  "status": "rejected",
  "rejectedReason": "Nội dung không phải spam"
}
```

**Request Examples:**
```bash
# Approve report
curl -X PUT http://localhost:5000/report/1/status \
  -H "Authorization: Bearer abc123" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'

# Reject report
curl -X PUT http://localhost:5000/report/1/status \
  -H "Authorization: Bearer abc123" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "rejectedReason": "Nội dung không phải spam"}'
```

**Success Response (200 OK):**
```json
{
  "message": "✅ Cập nhật báo cáo thành công"
}
```

**Email Actions on Approval:**
```
1. Email to Author:
   Subject: ⚠️ Bài viết của bạn vi phạm quy tắc cộng đồng
   Content: Warning + reason for violation

2. Email to Reporter:
   Subject: ✅ Cảm ơn bạn đã báo cáo
   Content: Thank you + confirmation message

3. Email to Admin:
   Subject: 📊 Báo cáo được xác nhận
   Content: Log message + details
```

**Email Actions on Rejection:**
```
1. Email to Reporter:
   Subject: ℹ️ Báo cáo của bạn đã được xem xét
   Content: Rejection reason + can report again message
```

**Error Responses:**

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Status không hợp lệ | Invalid status value |
| 400 | Chỉ báo cáo pending mới được xử lý | Already processed |
| 400 | Lý do bác bỏ bắt buộc | Missing rejectedReason |
| 404 | Báo cáo không tồn tại | Invalid report ID |
| 403 | Chỉ admin/moderator | Not authorized |
| 401 | Token hết hạn | Invalid token |

**Constraints:**
- Only pending reports can be processed
- rejectedReason is required if status = "rejected"
- rejectedReason must be max 500 characters
- Only admin/moderator authorized

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required/failed |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate report exists |
| 500 | Server Error |

---

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Bài viết không tồn tại" | Check recipe ID, recipe may be deleted |
| "Lý do báo cáo không được trống" | Provide a reason (1-500 chars) |
| "Bạn đã báo cáo bài viết này" | Can only report once (unless rejected) |
| "Token hết hạn" | Re-login to get new token |
| "Chỉ admin/moderator" | User role insufficient |
| "Báo cáo không tồn tại" | Check report ID |

---

## Rate Limiting

No rate limiting implemented (can be added later)

---

## Sorting & Pagination

Not implemented (can be added for large datasets)

**Future Enhancement:**
```bash
GET /report?status=pending&limit=20&offset=0&sort=-created_at
```

---

## Webhook Events

Not implemented (can be added for integrations)

**Future Enhancement:**
```
POST /webhooks/report-approved
POST /webhooks/report-rejected
```

---

## Batch Operations

Not implemented (can be added for bulk actions)

**Future Enhancement:**
```bash
PUT /report/bulk-status
{
  "ids": [1, 2, 3],
  "status": "accepted"
}
```

---

## Testing with Postman

### Setup
1. Import collection or create new
2. Set Base URL: `http://localhost:5000`
3. Add Bearer token to Authorization tab

### Test Sequence
```
1. POST /report/recipe/5 → Get report ID
   Body: {"reason": "Test reason"}

2. GET /report/my-reports → See created report

3. GET /report?status=pending → View as admin

4. PUT /report/:id/status → Approve/Reject
   Body: {"status": "accepted"}

5. DELETE /report/recipe/5 → Cancel (if pending)
```

---

## cURL Examples

### Submit Report
```bash
curl -X POST http://localhost:5000/report/recipe/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Hình ảnh không phù hợp"}'
```

### View My Reports
```bash
curl -X GET http://localhost:5000/report/my-reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Pending (Admin)
```bash
curl -X GET "http://localhost:5000/report?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve Report
```bash
curl -X PUT http://localhost:5000/report/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

### Reject Report
```bash
curl -X PUT http://localhost:5000/report/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "rejectedReason": "Nội dung không vi phạm"}'
```

### Cancel Report
```bash
curl -X DELETE http://localhost:5000/report/recipe/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Examples by Scenario

### Scenario 1: Submit Report (Success)
```
Request:  POST /report/recipe/5
Body:     {"reason": "Spam content"}
Response: 201 Created
{
  "message": "✅ Báo cáo thành công",
  "report": {
    "id": 10,
    "recipe_id": 5,
    "user_id": 12,
    "reason": "Spam content",
    "status": "pending",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Scenario 2: Duplicate Report
```
Request:  POST /report/recipe/5
Body:     {"reason": "Another reason"}
Response: 409 Conflict
{
  "message": "❌ Bạn đã báo cáo bài viết này"
}
```

### Scenario 3: Admin Approves
```
Request:  PUT /report/10/status
Body:     {"status": "accepted"}
Response: 200 OK
{
  "message": "✅ Cập nhật báo cáo thành công"
}
[Emails sent to author, reporter, admin]
```

### Scenario 4: Admin Rejects
```
Request:  PUT /report/10/status
Body:     {"status": "rejected", "rejectedReason": "Not actual spam"}
Response: 200 OK
{
  "message": "✅ Cập nhật báo cáo thành công"
}
[Email sent to reporter with rejection reason]
```

---

## Best Practices

1. **Always include Authorization header**
2. **Validate reason length before submitting**
3. **Handle 409 conflict gracefully (already reported)**
4. **Show proper error messages to users**
5. **Log all admin actions for audit trail**
6. **Rate limit reports per user (future)**
7. **Monitor email delivery status**

---

**Last Updated:** 2025-01-15
**Version:** 1.0
**Status:** Complete ✅
