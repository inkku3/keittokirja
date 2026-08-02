Rollback instructions: Revert React dark-mode toggle and restore legacy localStorage behavior

If the React dark-mode toggle causes regressions in staging/production, revert with these steps.

1) Revert the frontend changes (recommended):
   - Create a revert commit or use git to reset/checkout the previous commit that removed/changed the legacy behavior.
   - Example (safe revert of the darkmode branch):
       git checkout main
       git revert <commit-hash-that-added-useDarkMode-and-components>
       git push origin main

2) Remove the React dark-mode component and re-enable legacy behavior:
   - Delete or disable the React component files (e.g., frontend/src/hooks/useDarkMode.ts, frontend/src/components/DarkModeButton.tsx).
   - Restore any references where the component is rendered (ActionButtons/Navigation).
   - Commit and push the revert.

3) Restore localStorage behavior exactly to legacy JS semantics:
   - Ensure the legacy script toggled document.body.classList.toggle('dark-mode') and used localStorage key 'isDarkMode' storing 'true'/'false'.
   - Re-add a small inline script or static JS that runs on page load (place under legacy/ or served static) with the exact logic from legacy/darkmode.js.
     Example snippet (pseudo):
       const val = localStorage.getItem('isDarkMode');
       const isDark = val === null ? true : val === 'true';
       if (isDark) document.body.classList.add('dark-mode');
       // wire up #toggleDark button click to flip class and localStorage

4) Data/config rollback (if DB or API changes were deployed alongside):
   - No DB schema changes expected for dark mode. If any migrations were applied, revert per your DB migration tool (e.g., alembic downgrade).

5) Post-rollback verification:
   - Load the site, toggle the button, refresh, and confirm that the body has the same class state and the localStorage key 'isDarkMode' contains 'true' or 'false'.
   - Verify labels on the toggle button are exactly: "Vaalea tila" when dark active, "Tumma tila" when dark inactive.

6) Optional: create a hotfix branch with minimal legacy JS restored and ship as a patch release.

If you want, I can prepare the revert commits (identify the exact commits to revert) and open a PR that reverts the dark-mode component and reintroduces the legacy script. Include the commit hashes or tell me to pick the most recent commits that added dark-mode files and I will create the revert PR for you.
