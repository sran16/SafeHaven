## Mobile Utilities

tokenValidator.js
- isTokenValid(token: string): boolean
- tokenWillExpireSoon(token: string): boolean
- clearAuthData(): void
- getCurrentToken(): { token: string|null, isValid: boolean }

Example
```js
import { getCurrentToken, clearAuthData } from '@/utils/tokenValidator'
const { token, isValid } = getCurrentToken()
if (!isValid) clearAuthData()
```

api.js
- isIOSEnvironment(): boolean
- getApiUrl(): string
- getAuthHeaders(): { headers: { Authorization?: string, 'Content-Type': 'application/json' } }

Example
```js
import axios from 'axios'
import { getApiUrl, getAuthHeaders } from '@/utils/api'

const apiUrl = getApiUrl()
const res = await axios.get(`${apiUrl}/health`, getAuthHeaders())
```
