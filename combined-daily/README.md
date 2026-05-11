# AI Daily Digest

每日AI进展推送 - 整合 Hacker News 头条、arXiv 最新论文、GitHub Trending 项目

## 功能特性

- 🔥 Hacker News Top 10 新闻
- 📄 arXiv AI 领域最新论文（cs.AI, cs.LG, cs.CL, cs.CV, cs.NE）
- ⭐ GitHub Trending AI 热门项目
- 📝 统一的 Markdown 格式输出

## 安装使用

```bash
cd combined-daily
pip install -r requirements.txt
python ai_daily_digest.py
```

## 每日运行

使用系统定时任务每日运行：

- Windows: Task Scheduler
- Linux/Mac: cron

## 输出

生成的日报保存在 `digests/` 目录下，文件名格式：`ai-digest-YYYY-MM-DD.md`
