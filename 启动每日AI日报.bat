@echo off
chcp 65001 > nul
title AI 每日日报定时任务

echo ========================================
echo     🤖 AI 每日日报自动运行系统
echo ========================================
echo.
echo ⏰ 运行时间: 每天早上 9:00 自动生成
echo 📂 保存位置: combined-daily\digests\
echo 🔢 保留份数: 20份（自动清理旧文件）
echo.
echo [提示] 保持窗口开启即可自动运行
echo [退出] 按 Ctrl+C 停止
echo ========================================
echo.

cd /d "%~dp0combined-daily"
node scheduler.js

pause
