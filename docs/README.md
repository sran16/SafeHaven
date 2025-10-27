## SafeHaven Documentation

This documentation covers all public backend API endpoints and the mobile app's public modules (utilities, stores, router) and reusable components.

- Backend API: see backend/api.md
- Mobile utilities: see frontend/mobile/utils.md
- Mobile stores: see frontend/mobile/stores.md
- Mobile components: see frontend/mobile/components.md
- Mobile router: see frontend/mobile/router.md

Conventions
- All responses follow a consistent JSON envelope: { success: boolean, message: string, data?: any }
- Authenticated routes require the HTTP header: Authorization: Bearer <JWT>
