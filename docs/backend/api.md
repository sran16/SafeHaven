## Backend API

Base URL
- Local: http://localhost:3000
- Render: https://safehaven-hy8s.onrender.com

Auth
- JWT bearer in header: Authorization: Bearer <token>
- Session validity is enforced server-side via ActiveSessions.

Response format
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Health and test
- GET / → 200 text "API SafeHaven est en ligne"
- GET /health → 200 { success, message }
- GET /api/test → 200 { success, message, timestamp }
- GET /api/chat/test → 200 { message }

Users
- POST /api/users (Register)
  - Body: { name: string (2-80), email: string (email), password: string (6-128) }
  - 201 → { success, message, data: { user, token } }
  - Example
  ```bash
  curl -X POST "$BASE/api/users" \
    -H 'Content-Type: application/json' \
    -d '{"name":"alice","email":"alice@example.com","password":"secret123"}'
  ```
- POST /api/users/sessions (Login)
  - Body: { name: string, password: string }
  - 200 → { success, message, data: { user, token } }
- DELETE /api/users/sessions/current (Logout) [auth]
  - 200 → { success, message }
- GET /api/users/me (Profile) [auth]
  - 200 → { success, message, data: { id_user, username, createdAt, posts } }
- PUT /api/users/me (Update profile) [auth]
  - Body: { username?: string (2-80), bio?: string (<=500) }
  - 200 → { success, message, data: user }
- GET /api/users/session (Verify token) [auth]
  - 200 → { success, message, data: { user } }
- PUT /api/users/me/password (Change password) [auth]
  - Body: { currentPassword: string, newPassword: string }
  - 200 → { success, message }

Moods [auth]
- POST /api/moods
  - Body: { moodType: string (<=30), description?: string (<=500) }
  - 201 → { success, message, data: mood }
- GET /api/moods
  - 200 → { success, message, data: mood[] }
- GET /api/moods/stats?startDate=ISO&endDate=ISO
  - 200 → { success, message, data: stats }

Experiences [auth]
- POST /api/experiences
  - Body: { content: string (1-2000) }
  - Moderation may block with 400 and { success:false, message, data: { blocked:true, warning } }
  - 201 → { success, message, data: experience }
- GET /api/experiences
  - 200 → { success, message, data: experience[] }
- GET /api/experiences/:id
  - 200 → { success, message, data: experience }
- PUT /api/experiences/:id/likes
  - Idempotent like
  - 200 → { success, message, data: { isLiked:boolean, likes:number } }
- DELETE /api/experiences/:id/likes
  - Idempotent unlike (same response shape as like)
- POST /api/experiences/:id/comments
  - Body: { content: string }
  - 201 → { success, message, data: { id, content, author, createdAt } }

Chatbot [auth]
- POST /api/chat/sessions
  - 201 → { success, message, data: session }
- DELETE /api/chat/sessions/current
  - 200 → { success, message, data: session }
- GET /api/chat/sessions
  - 200 → { success, message, data: grouped sessions by date }
- POST /api/chat/sessions/current/messages
  - Body: { message: string }
  - 200 → { success, message, data: { response: string, emergencyResources? } }
- GET /api/chat/sessions/current/analysis
  - 200 → { success, message, data: analysis }
- GET /api/chat/sessions/current/recommendations
  - 200 → { success, message, data: recommendations }
- GET /api/chat/sessions/current/report
  - 200 → { success, message, data: report }
- GET /api/chat/sessions/reports
  - 200 → { success, message, data: { reports } }
- GET /api/chat/sessions/reports/:reportId
  - 200 → { success, message, data: { report } }

Axios example (with Authorization)
```js
import axios from 'axios'

const api = axios.create({ baseURL: process.env.VITE_API_URL || 'http://localhost:3000' })

api.get('/api/moods', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).then(r => console.log(r.data))
```

curl example (like experience)
```bash
curl -X PUT "$BASE/api/experiences/123/likes" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
```
