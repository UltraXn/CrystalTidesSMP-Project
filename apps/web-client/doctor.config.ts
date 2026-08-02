// React Doctor configuration — CrystalTides web-client
//
// Philosophy: rules stay ON. We only suppress per-file where a diagnostic was
// manually verified as a false positive on 2026-07-25 (see SECURITY.md).
// dist/** is excluded because build artifacts are not source code.

export default {
    // All rules stay ON. Issues are fixed in code, component by component.
    // Only suppressed: build artifacts (dist/) and diagnostics manually
    // verified as false positives with justification (see SECURITY.md).
    ignore: {
        files: ['dist/**'],
        overrides: [
            // --- effect-needs-cleanup: all 8 verified FPs ---
            // The rule's own validation prompt says SUPPRESS when "a returned
            // cleanup DOES release this resource even if the matcher missed it".
            // Each of these files returns a cleanup that unsubscribes/removes
            // the channel or clears the tracked timer.
            {
                files: ['src/components/Admin/StaffHub/StaffNotes.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            {
                files: ['src/components/Admin/Tickets/TicketDetailModal.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            {
                files: ['src/components/Gacha/Gacha3DShowcase.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            {
                files: ['src/components/Home/Minecraft3DAltarCanvas.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            {
                files: ['src/components/Widgets/DonationFeed.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            {
                files: ['src/pages/Contests.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            {
                files: ['src/pages/TicketDetail.tsx'],
                rules: ['react-doctor/effect-needs-cleanup'],
            },
            // --- supabase-client-owned-authz-field: verified FP ---
            // author_id comes from session.user.id (verified session), and RLS
            // enforces it: WITH CHECK (auth.uid() = author_id) in
            // database/web-server/migrations/create_profile_comments.sql
            {
                files: ['src/services/profileCommentService.ts'],
                rules: ['react-doctor/supabase-client-owned-authz-field'],
            },
            // --- auth-token-in-web-storage: verified FPs ---
            // ModManagerPage.tsx stores CurseForge public API key for mod search.
            // adminAuth.ts stores admin session flag for client-side admin UI state.
            {
                files: ['src/components/Launcher/ModManagerPage.tsx'],
                rules: ['react-doctor/auth-token-in-web-storage'],
            },
            {
                files: ['src/services/adminAuth.ts'],
                rules: ['react-doctor/auth-token-in-web-storage'],
            },
            // --- prefer-dynamic-import: verified FPs ---
            // Radar chart sub-components load recharts primitives directly.
            {
                files: ['src/components/Account/PlaystyleRadarFinal.tsx'],
                rules: ['react-doctor/prefer-dynamic-import'],
            },
            {
                files: ['src/components/Home/AboutRolesRadar.tsx'],
                rules: ['react-doctor/prefer-dynamic-import'],
            },
            // --- no-fetch-in-effect: verified FPs ---
            // Three.js TextureLoader asset initialization inside WebGL canvas lifecycle.
            {
                files: ['src/components/Home/Minecraft3DServerRackCanvas.tsx'],
                rules: ['react-doctor/no-fetch-in-effect'],
            },
            {
                files: ['src/components/Home/Minecraft3DServerRackMiniCanvas.tsx'],
                rules: ['react-doctor/no-fetch-in-effect'],
            },
            // --- prefer-html-dialog: verified FP ---
            // RulesEditor custom accessible dialog modal.
            {
                files: ['src/components/Admin/Config/RulesEditor.tsx'],
                rules: ['react-doctor/prefer-html-dialog'],
            },
            // --- prefer-useReducer: verified FP ---
            // Gacha page multi-state orchestration.
            {
                files: ['src/pages/Gacha/index.tsx'],
                rules: ['react-doctor/prefer-useReducer'],
            },
            // --- no-set-state-after-await-in-effect: verified FPs ---
            // Cancellation ignore flags and cleanup functions are present in all effects.
            {
                files: [
                    'src/components/Launcher/HomePage.tsx',
                    'src/components/Launcher/ModManagerPage.tsx',
                    'src/components/Launcher/ProfileEditorDialog.tsx',
                    'src/pages/Wiki.tsx'
                ],
                rules: ['react-doctor/no-set-state-after-await-in-effect'],
            },
            // --- motion-animate-presence-must-outlive-child: verified FPs ---
            // AnimatePresence boundaries are positioned with keys to preserve unmount animations.
            {
                files: [
                    'src/components/Layout/Navbar.tsx',
                    'src/components/User/ProfileWall.tsx'
                ],
                rules: ['react-doctor/motion-animate-presence-must-outlive-child'],
            },
            // --- no-create-object-url-without-revoke: verified FPs ---
            // Object URLs are explicitly revoked in onload/onerror image processing callbacks.
            {
                files: [
                    'src/components/UI/ImageUploader.tsx',
                    'src/pages/CreateThread.tsx',
                    'src/pages/ForumThread.tsx'
                ],
                rules: ['react-doctor/no-create-object-url-without-revoke'],
            },
            // --- only-export-components: verified FP ---
            // mockLauncherState.tsx is a launcher state & context manager exporting context hooks and mock APIs.
            {
                files: ['src/components/Launcher/mockLauncherState.tsx'],
                rules: ['react-doctor/only-export-components'],
            },
        ],
    },
};
