@echo off
SETLOCAL

cd /d %~dp0%

REM Create AI analysis component directory
if not exist "CombatJudge\src\components\ai-analysis" (
    mkdir "CombatJudge\src\components\ai-analysis"
    echo Created ai-analysis directory
)

REM Create subdirectories
if not exist "CombatJudge\src\components\ai-analysis\ui" (
    mkdir "CombatJudge\src\components\ai-analysis\ui"
    echo Created ui subdirectory
)

if not exist "CombatJudge\src\components\ai-analysis\hooks" (
    mkdir "CombatJudge\src\components\ai-analysis\hooks"
    echo Created hooks subdirectory
)

pause