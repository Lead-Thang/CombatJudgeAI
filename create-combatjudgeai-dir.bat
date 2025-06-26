@echo off
SETLOCAL

cd /d %~dp0%

REM Create main project directory
if not exist "CombatJudgeAI" (
    mkdir "CombatJudgeAI"
    echo Created CombatJudgeAI directory
)

REM Create subdirectories
if not exist "CombatJudgeAI\src" (
    mkdir "CombatJudgeAI\src"
    echo Created src directory
)

if not exist "CombatJudgeAI\src\components" (
    mkdir "CombatJudgeAI\src\components"
    echo Created components directory
)

if not exist "CombatJudgeAI\src\pages" (
    mkdir "CombatJudgeAI\src\pages"
    echo Created pages directory
)

if not exist "CombatJudgeAI\src\services" (
    mkdir "CombatJudgeAI\src\services"
    echo Created services directory
)

if not exist "CombatJudgeAI\public" (
    mkdir "CombatJudgeAI\public"
    echo Created public directory
)

pause