@echo off
cd /d d:\domic-care_web
echo Staging files...
git add package.json package-lock.json
echo Committing changes...
git commit -m "fix: upgrade minimatch to v11.0.5 to patch CVE-2026-118764"
echo Pushing to GitHub...
git push
echo.
echo ==============================================
echo Agar success ho gaya to window close kar dein.
echo ==============================================
pause
