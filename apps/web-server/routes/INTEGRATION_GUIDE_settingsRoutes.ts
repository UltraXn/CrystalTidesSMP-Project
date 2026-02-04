/**
 * INTEGRATION GUIDE: Settings Routes with Staff Authorization
 * 
 * This file shows how to integrate the new staff role middleware into settingsRoutes.ts
 * 
 * STEPS TO INTEGRATE:
 * 
 * 1. Add import at the top of settingsRoutes.ts:
 *    ```typescript
 *    import { requireStaffRole } from '../middleware/staffAuth';
 *    ```
 * 
 * 2. Update the PUT route to include requireStaffRole middleware:
 *    ```typescript
 *    // Before:
 *    router.put('/settings/:key', requireAuth, settingsController.update);
 *    
 *    // After:
 *    router.put('/settings/:key', requireAuth, requireStaffRole, settingsController.update);
 *    ```
 * 
 * 3. (Optional) If you want different permission levels for different settings:
 *    ```typescript
 *    import { requireMinRole } from '../middleware/staffAuth';
 *    
 *    // Only admins and above can change critical settings
 *    router.put('/settings/maintenance_mode', requireAuth, requireMinRole('admin'), settingsController.update);
 *    
 *    // Developers can manage gamification
 *    router.put('/settings/medal_definitions', requireAuth, requireMinRole('developer'), settingsController.update);
 *    router.put('/settings/achievement_definitions', requireAuth, requireMinRole('developer'), settingsController.update);
 *    ```
 * 
 * EXAMPLE COMPLETE ROUTE FILE:
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireStaffRole, requireMinRole } from '../middleware/staffAuth';
// import settingsController from '../controllers/settingsController'; // Adjust path as needed

const router = Router();

// Public read access
router.get('/settings', (req, res) => {
    // ... existing GET logic
});

// Staff-only write access
router.put('/settings/:key', requireAuth, requireStaffRole, (req, res) => {
    // ... existing PUT logic
    // This now requires user to have developer, moderator, admin, killu, or neroferno role
});

// Example: Granular permissions for specific settings
router.put('/settings/medal_definitions', requireAuth, requireMinRole('developer'), (req, res) => {
    // Developers and above can edit medals
});

router.put('/settings/achievement_definitions', requireAuth, requireMinRole('developer'), (req, res) => {
    // Developers and above can edit achievements
});

router.put('/settings/maintenance_mode', requireAuth, requireMinRole('admin'), (req, res) => {
    // Only admins and above can toggle maintenance mode
});

export default router;

/**
 * MANUAL STEPS REQUIRED:
 * 
 * Since I cannot access the actual settingsRoutes.ts file due to file system issues,
 * you need to manually:
 * 
 * 1. Open: apps/web-server/routes/settingsRoutes.ts
 * 2. Add the import: import { requireStaffRole } from '../middleware/staffAuth';
 * 3. Find the PUT route for /settings/:key
 * 4. Add requireStaffRole to the middleware chain
 * 
 * The route should look like:
 * router.put('/settings/:key', requireAuth, requireStaffRole, settingsController.update);
 *                                           ^^^^^^^^^^^^^^^^^ ADD THIS
 */
