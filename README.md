# 🤖 AI 每日进展日报

自动生成 AI 行业每日动态汇总，涵盖大模型新闻、投融资、政策监管、开源项目、研究论文等全维度信息。

## ✨ 功能特性

| 板块 | 说明 |
|------|------|
| 🚀 **大模型重大事件** | Claude/GPT/Gemini 近7天更新动态 |
| 💰 **AI 投融资动态** | AI 行业近14天融资、并购信息 |
| 📜 **政策监管动态** | 全球 AI 监管政策变化 |
| 🐦 **Twitter 大咖观点** | Musk、Yann LeCun、Karpathy 等行业领袖推文 |
| 🤗 **Hugging Face 热门模型** | 最新开源大模型推荐 |
| 🤖 **Reddit ML 热点** | 机器学习社区热门讨论 |
| 🎙️ **AI 播客精华** | Lex Fridman 等深度对话摘要 |
| 🚀 **Product Hunt AI 产品** | 最新 AI 工具和产品 |
| 🔥 **Hacker News Top 10** | 技术社区热点 + 中文总结 |
| 📄 **arXiv 研究前沿** | 最新 AI 论文 + 中文深度解读 |
| ⭐ **GitHub Trending** | AI 热门开源项目 Top 12 + 智能分类 |
| 🎯 **热门关键词** | 自动生成当日热点趋势 |

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0

### 安装运行

```bash
cd combined-daily
npm install
node daily_news.js
```

### ⏰ 定时运行（每天早上9点）

Windows 系统直接双击：
```
启动每日AI日报.bat
```

或者手动启动定时脚本：
```bash
cd combined-daily
node scheduler.js
```

## 📁 项目结构

```
.
├── combined-daily/
│   ├── daily_news.js     # 主程序 - 生成日报
│   ├── scheduler.js      # 定时任务脚本
│   ├── package.json      # 依赖配置
│   └── digests/          # 生成的日报目录（自动清理20份以上）
├── 启动每日AI日报.bat    # Windows 一键启动脚本
├── .gitignore            # Git 忽略文件配置
└── README.md             # 项目说明文档
```

## 📄 日报示例

日报生成后保存在 `combined-daily/digests/ai-daily-YYYY-MM-DD.md`

格式示例：
```markdown
## 🐦 Twitter/X AI 大咖观点

### 1. @elonmusk
   - 📢 主题: Grok 3性能测试报告发布
   - 👁️ 浏览量: 12.5M
   - 🔗 链接: https://twitter.com/elonmusk
   - 📝 中文摘要: 马斯克公布Grok 3多项基准测试结果...
```

## ⚙️ 自定义配置

可以在 `daily_news.js` 中修改：
- 数据来源
- 显示的板块数量
- 日报清理阈值（默认20份）
- 定时运行时间（默认9:00）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License
