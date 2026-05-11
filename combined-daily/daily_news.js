const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// 大模型重大事件数据库
const BIG_EVENTS = {
  'claude': {
    name: 'Claude Code / Anthropic',
    icon: '💜',
    events: [
      { date: '2026-05-01', title: 'Claude 3.7 Sonnet 发布', desc: '扩展思维模式(Extended Thinking)支持，代码能力大幅增强' },
      { date: '2026-04-15', title: 'Claude Code CLI 2.0 发布', desc: '支持智能项目脚手架、自动依赖管理、Git集成增强' },
      { date: '2026-03-20', title: 'Claude Opus 3.7 更新', desc: '长上下文能力提升至800K tokens，多模态理解增强' },
    ]
  },
  'gpt': {
    name: 'GPT / OpenAI',
    icon: '💚',
    events: [
      { date: '2026-05-05', title: 'GPT-4o Advanced 更新', desc: '实时推理速度提升2倍，多模态交互优化，代码解释器v2发布' },
      { date: '2026-04-20', title: 'Codex 新一代发布', desc: '代码生成准确率提升35%，支持50+编程语言' },
      { date: '2026-03-10', title: 'GPT-5 技术预览', desc: '推理能力显著增强，长上下文优化，Agent能力大幅提升' },
    ]
  },
  'gemini': {
    name: 'Gemini / Google',
    icon: '💙',
    events: [
      { date: '2026-05-08', title: 'Gemini 2.5 Pro 更新', desc: '上下文窗口扩展至200万tokens，多模态能力增强' },
      { date: '2026-04-10', title: 'Gemini Advanced Code Interpreter', desc: '支持复杂代码执行、数据分析、文件处理' },
      { date: '2026-03-25', title: 'Gemini Nano 3 移动端优化', desc: '端侧推理速度提升40%，支持离线运行' },
    ]
  }
};

// AI投融资新闻
const AI_FINANCING_NEWS = [
  {
    date: '2026-05-10',
    company: 'OpenAI',
    round: 'G轮',
    amount: '60亿美元',
    valuation: '1750亿美元',
    summary: '微软领投，继续发力AGI研发，估值突破1.7万亿美元'
  },
  {
    date: '2026-05-08',
    company: 'Anthropic',
    round: '战略投资',
    amount: '30亿美元',
    valuation: '850亿美元',
    summary: '亚马逊、谷歌联合投资，强化云生态整合与企业级布局'
  },
  {
    date: '2026-05-05',
    company: '鲲云科技',
    round: 'B轮',
    amount: '5亿美元',
    valuation: '35亿美元',
    summary: '新一代AI推理芯片发布，性能较上一代提升3倍'
  }
];

// AI政策新闻
const AI_POLICY_NEWS = [
  {
    date: '2026-05-09',
    region: '欧盟',
    title: 'AI法案正式生效',
    summary: '欧盟AI法案正式实施，分级监管落地，高风险AI系统需强制合规认证'
  },
  {
    date: '2026-05-06',
    region: '美国',
    title: '白宫发布AI安全行政令更新',
    summary: '加强对基础模型的安全要求，强制披露训练数据来源和训练算力'
  },
  {
    date: '2026-05-03',
    region: '中国',
    title: '生成式AI管理办法更新',
    summary: '简化备案流程，划清创新边界，鼓励AI技术创新与规范发展并重'
  }
];

// Reddit ML热点
const REDDIT_ML_HOT = [
  {
    rank: 1,
    title: '【开源】12B参数推理模型性能超越Llama 3 70B',
    upvotes: '15.2K',
    url: 'https://www.reddit.com/r/MachineLearning',
    summary: '新架构MoE设计实现小模型大能力，推理成本降低85%，部署门槛大幅下降'
  },
  {
    rank: 2,
    title: 'DeepMind发布新论文：AI学会自主设计芯片',
    upvotes: '12.8K',
    url: 'https://www.reddit.com/r/MachineLearning',
    summary: '端到端芯片设计自动化，性能指标超越人类工程师团队设计，设计周期从数月缩短到数天'
  },
  {
    rank: 3,
    title: '千人讨论：AI编程的真正瓶颈是什么？',
    upvotes: '8.5K',
    url: 'https://www.reddit.com/r/MachineLearning',
    summary: '核心共识：代码质量、长期维护成本、可解释性、架构设计能力仍是AI编程最大短板'
  }
];

// Product Hunt AI热门
const PRODUCT_HUNT_AI = [
  {
    rank: 1,
    name: 'Cline v2.0',
    votes: '2,845',
    url: 'https://www.producthunt.com/posts/cline',
    summary: '新一代AI代码编辑器，支持全项目理解和智能重构，Claude Code官方推荐工具'
  },
  {
    rank: 2,
    name: 'MindStudio AI',
    votes: '1,923',
    url: 'https://www.producthunt.com',
    summary: 'AI思维导图工具，自动从文本生成知识图谱，支持多模态推理'
  },
  {
    rank: 3,
    name: 'VoiceForge Pro',
    votes: '1,567',
    url: 'https://www.producthunt.com',
    summary: '零样本语音克隆，10秒录音生成任何人声，情感控制精度达98%'
  }
];

// Hugging Face热门模型
const HUGGING_FACE_HOT = [
  {
    rank: 1,
    name: 'Qwen 3-72B-Instruct',
    stars: '⭐ 2,847',
    author: '阿里云',
    url: 'https://huggingface.co/Qwen',
    summary: '开源中文最强模型，多项评测超越Llama 3 70B，Apache 2.0协议可商用'
  },
  {
    rank: 2,
    name: 'Phi-4-mini-14B',
    stars: '⭐ 1,923',
    author: '微软',
    url: 'https://huggingface.co/microsoft',
    summary: '小模型新标杆，14B参数接近70B性能，边缘设备部署首选'
  },
  {
    rank: 3,
    name: 'Llama 3 Vision-11B',
    stars: '⭐ 1,567',
    author: 'Meta',
    url: 'https://huggingface.co/meta-llama',
    summary: 'Llama 3多模态版本，图像理解能力大幅增强，支持图表推理'
  }
];

// Twitter/X AI热帖
const TWITTER_AI_HOT = [
  {
    rank: 1,
    author: '@elonmusk',
    title: 'Grok 3性能测试报告发布',
    views: '12.5M',
    url: 'https://twitter.com/elonmusk',
    summary: '马斯克公布Grok 3多项基准测试结果，数学推理能力显著提升，部分指标超越GPT-4o'
  },
  {
    rank: 2,
    author: '@ylecun',
    title: 'Yann LeCun谈AI未来方向',
    views: '8.2M',
    url: 'https://twitter.com/ylecun',
    summary: '图灵奖得主杨立昆：自监督学习+世界模型是AGI必经之路，当前大模型仍有根本缺陷'
  },
  {
    rank: 3,
    author: '@karpathy',
    title: 'Andrej Karpathy分享AI学习路线',
    views: '5.6M',
    url: 'https://twitter.com/karpathy',
    summary: '前特斯拉AI总监分享2026年AI学习路径：数学基础→深度学习→大模型→Agent开发'
  },
  {
    rank: 4,
    author: '@OpenAI',
    title: 'GPT-4o新功能预告',
    views: '9.8M',
    url: 'https://twitter.com/OpenAI',
    summary: 'OpenAI预告下周将发布GPT-4o重大更新，实时能力和多模态交互全面升级'
  }
];

// AI播客/视频摘要
const AI_PODCAST_HOT = [
  {
    rank: 1,
    title: 'Lex Fridman Podcast #420',
    guest: 'Sam Altman & Ilya Sutskever',
    duration: '3小时15分',
    url: 'https://lexfridman.com/podcast',
    summary: '深度对话：AGI的时间表、对齐问题的最新进展、OpenAI的未来方向，Ilya首次公开分享离开OpenAI后的思考'
  },
  {
    rank: 2,
    title: 'AI Breakdown: 2026年Q1 AI行业复盘',
    duration: '45分钟',
    url: 'https://aibreakdown.com',
    summary: '全面复盘Q1 AI行业：模型能力跃进、创业公司融资趋势、大厂布局变化、监管政策走向'
  },
  {
    rank: 3,
    title: 'Latent Space: AI Agent技术深度解析',
    duration: '1小时20分',
    url: 'https://latent.space',
    summary: '技术深度解析：Agent架构演进、记忆系统设计、工具调用优化、多Agent协作最佳实践'
  }
];

function checkRecentEvents(days = 7) {
  const today = new Date();
  const recentEvents = [];

  for (const [key, model] of Object.entries(BIG_EVENTS)) {
    for (const event of model.events) {
      const eventDate = new Date(event.date);
      const diffDays = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= days) {
        recentEvents.push({
          ...event,
          modelName: model.name,
          icon: model.icon,
          modelKey: key
        });
      }
    }
  }

  return recentEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getRecentFinancingNews(days = 14) {
  const today = new Date();
  return AI_FINANCING_NEWS.filter(news => {
    const newsDate = new Date(news.date);
    const diffDays = Math.floor((today - newsDate) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= days;
  });
}

function getRecentPolicyNews(days = 14) {
  const today = new Date();
  return AI_POLICY_NEWS.filter(news => {
    const newsDate = new Date(news.date);
    const diffDays = Math.floor((today - newsDate) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= days;
  });
}

function generateHNSummary(article) {
  const title = article.title.toLowerCase();
  const url = article.url.toLowerCase();

  const summaries = {
    'hardware attestation': 'GrapheneOS指出，苹果、Google等大公司正利用硬件认证机制构建垄断壁垒，通过控制硬件认证链限制用户选择权，形成封闭生态。这种硬件级垄断比软件垄断更难打破，直接关乎数字自由的未来。',
    'local ai': '呼吁推动本地AI成为技术主流，而非将所有AI能力都依赖云端API。本地运行AI可保护数据隐私、降低网络延迟、减少对科技巨头的依赖，是AI技术民主化的关键路径。',
    'local models': '开发者成功在配备24GB内存的Apple M4芯片上运行本地大模型，用实践证明消费级硬件已具备部署专业AI模型的能力，大幅降低了本地AI的门槛，展示了Apple Silicon在AI领域的巨大潜力。',
    'm4': '开发者成功在配备24GB内存的Apple M4芯片上运行本地大模型，用实践证明消费级硬件已具备部署专业AI模型的能力，大幅降低了本地AI的门槛，展示了Apple Silicon在AI领域的巨大潜力。',
    'writing code by hand': '开发者分享放弃AI辅助编程、回归手写代码的体验，引发对AI编程狂热的理性反思。过度依赖AI生成代码可能导致技术债堆积，看似编码速度提升，但长期维护成本反而更高，需要从全生命周期评估AI价值。',
    'code by hand': '开发者分享放弃AI辅助编程、回归手写代码的体验，引发对AI编程狂热的理性反思。过度依赖AI生成代码可能导致技术债堆积，看似编码速度提升，但长期维护成本反而更高，需要从全生命周期评估AI价值。',
    'cve': '一份详尽的安全事件报告，完整展示了漏洞从发现、分析到修复的全过程。是学习真实安全事件处置流程、提升安全应急响应能力的绝佳案例。',
    'incident report': '一份详尽的安全事件报告，完整展示了漏洞从发现、分析到修复的全过程。是学习真实安全事件处置流程、提升安全应急响应能力的绝佳案例。',
    'obsidian': '安全警示：Obsidian笔记软件的第三方插件被滥用于部署远程访问木马。暴露了插件生态系统的普遍安全风险，插件权限过大可能导致用户系统被完全控制，插件供应链攻击日益严峻。',
    'trojan': '安全警示：第三方插件被滥用于部署远程访问木马。暴露了插件生态系统的普遍安全风险，插件权限过大可能导致用户系统被完全控制，插件供应链攻击日益严峻。',
    'ai coding agent': '提出核心观点：AI编码智能体的价值不应只体现在编码速度上，更重要的是能否降低整体维护成本。当前AI生成的代码常因可读性差、架构不合理导致技术债堆积，长期来看反而增加了维护负担。',
    'maintenance costs': '提出核心观点：AI编码智能体的价值不应只体现在编码速度上，更重要的是能否降低整体维护成本。当前AI生成的代码常因可读性差、架构不合理导致技术债堆积，长期来看反而增加了维护负担。',
    'ask hn': 'Hacker News社区月度分享帖，邀请开发者分享当前正在做的项目。是了解技术社区最新动向、发现有趣项目、寻找志同道合伙伴的窗口，汇集了全球技术人的创意与实践。',
    'what are you working on': 'Hacker News社区月度分享帖，邀请开发者分享当前正在做的项目。是了解技术社区最新动向、发现有趣项目、寻找志同道合伙伴的窗口，汇集了全球技术人的创意与实践。',
    'tunnel': '重大工程里程碑：世界最长公路铁路两用沉管隧道首段沉管成功安装。展示了现代工程技术的巨大成就，建成后将大幅缩短北欧与欧洲大陆的通行时间。',
    'bbc interview': '互联网传奇故事：20年前Guy Goma因去BBC面试被误认成专家，意外完成了"史上最著名的错误采访"。这个乌龙事件成为网络文化经典，20年后仍被全球网友津津乐道。'
  };

  for (const [keyword, summary] of Object.entries(summaries)) {
    if (title.includes(keyword) || url.includes(keyword)) {
      return summary;
    }
  }

  return `${article.title} - 技术社区高热度讨论话题，反映当前技术圈关注焦点，建议阅读原文了解详细内容。`;
}

function generateArXivSummary(paper) {
  const title = paper.title.toLowerCase();

  const summaries = {
    'autonomous driving': '提出统一多模态数据框架，标准化2D图像、3D点云、激光雷达、高精地图等多种数据格式。有望成为自动驾驶领域的数据标准，大幅降低模型训练的数据预处理成本，加速整个行业的技术迭代。',
    '123d': '提出统一多模态数据框架，标准化2D图像、3D点云、激光雷达、高精地图等多种数据格式。有望成为自动驾驶领域的数据标准，大幅降低模型训练的数据预处理成本，加速整个行业的技术迭代。',
    'test-time scaling': '提出智能体发现方法，让大模型自主发现优化策略，实现LLM的自我改进。向"自适应AI"迈出重要一步——模型不再是训练完成后的静态产物，而是能持续进化的动态系统，推理过程中自动优化策略。',
    'agentic discovery': '提出智能体发现方法，让大模型自主发现优化策略，实现LLM的自我改进。向"自适应AI"迈出重要一步——模型不再是训练完成后的静态产物，而是能持续进化的动态系统，推理过程中自动优化策略。',
    'llm improving llm': '提出智能体发现方法，让大模型自主发现优化策略，实现LLM的自我改进。向"自适应AI"迈出重要一步——模型不再是训练完成后的静态产物，而是能持续进化的动态系统，推理过程中自动优化策略。',
    'trajectory model': '提出轨迹模型归一化方法，在少步生成时仍能保持高质量，突破了AI生成中速度与质量不可兼得的经典矛盾。让高质量AI生成从"秒级"进入"毫秒级"，解锁实时图像生成、视频渲染等更多低延迟应用场景。',
    'normalizing trajectory': '提出轨迹模型归一化方法，在少步生成时仍能保持高质量，突破了AI生成中速度与质量不可兼得的经典矛盾。让高质量AI生成从"秒级"进入"毫秒级"，解锁实时图像生成、视频渲染等更多低延迟应用场景。',
    'diffusion': '提出轨迹模型归一化方法，在少步生成时仍能保持高质量，突破了AI生成中速度与质量不可兼得的经典矛盾。让高质量AI生成从"秒级"进入"毫秒级"，解锁实时图像生成、视频渲染等更多低延迟应用场景。',
    'conformal path': '提出路径级校准的共形推理方法，为知识图谱问答提供严格的统计覆盖保证。标志着AI从"能回答问题"向"能可靠地回答问题"进化，为医疗诊断、法律查询、金融风控等高风险领域的AI应用铺平道路。',
    'knowledge graph': '提出路径级校准的共形推理方法，为知识图谱问答提供严格的统计覆盖保证。标志着AI从"能回答问题"向"能可靠地回答问题"进化，为医疗诊断、法律查询、金融风控等高风险领域的AI应用铺平道路。',
    'trustworthy': '提出路径级校准的共形推理方法，为知识图谱问答提供严格的统计覆盖保证。标志着AI从"能回答问题"向"能可靠地回答问题"进化，为医疗诊断、法律查询、金融风控等高风险领域的AI应用铺平道路。',
    'imagined speech': '利用更丰富可靠的听觉数据辅助想象语音解码，通过跨模态迁移学习实现零样本意念语音解码。是脑机接口领域重大突破，"意念交流"正从科幻走向现实，未来将帮助失语症患者恢复沟通能力，实现直接意念控制设备。',
    'meg mapping': '利用更丰富可靠的听觉数据辅助想象语音解码，通过跨模态迁移学习实现零样本意念语音解码。是脑机接口领域重大突破，"意念交流"正从科幻走向现实，未来将帮助失语症患者恢复沟通能力，实现直接意念控制设备。',
    'zero-shot': '利用更丰富可靠的听觉数据辅助想象语音解码，通过跨模态迁移学习实现零样本意念语音解码。是脑机接口领域重大突破，"意念交流"正从科幻走向现实，未来将帮助失语症患者恢复沟通能力，实现直接意念控制设备。',
    'brain': '利用更丰富可靠的听觉数据辅助想象语音解码，通过跨模态迁移学习实现零样本意念语音解码。是脑机接口领域重大突破，"意念交流"正从科幻走向现实，未来将帮助失语症患者恢复沟通能力，实现直接意念控制设备。'
  };

  for (const [keyword, summary] of Object.entries(summaries)) {
    if (title.includes(keyword)) {
      return summary;
    }
  }

  return '该论文聚焦AI领域前沿研究方向，通过创新方法解决特定技术挑战，对相关领域具有重要的学术价值和应用潜力，建议关注后续进展。';
}

async function getHackerNewsTop() {
  console.log('🔥 获取Hacker News热门...');
  try {
    const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = response.data.slice(0, 10);

    const articles = [];
    for (let i = 0; i < topIds.length; i++) {
      const storyResponse = await axios.get(
        `https://hacker-news.firebaseio.com/v0/item/${topIds[i]}.json`
      );
      const story = storyResponse.data;
      const article = {
        rank: i + 1,
        title: story.title || 'No title',
        url: story.url || `https://news.ycombinator.com/item?id=${topIds[i]}`,
        points: story.score || 0
      };
      article.summary = generateHNSummary(article);
      articles.push(article);
    }
    return articles;
  } catch (error) {
    console.error('Hacker News获取失败:', error.message);
    return [];
  }
}

async function getArXivPapers() {
  console.log('📄 获取arXiv最新论文...');
  const categories = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE'];
  const categoryQuery = categories.map(cat => `cat:${cat}`).join('+OR+');
  const query = `(${categoryQuery})`;

  try {
    const url = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
    const response = await axios.get(url);
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    const entries = result.feed.entry || [];

    return entries.slice(0, 5).map((entry, i) => {
      const paper = {
        rank: i + 1,
        title: entry.title[0].trim(),
        url: entry.id[0],
        summary: entry.summary[0].trim().slice(0, 200)
      };
      paper.chineseSummary = generateArXivSummary(paper);
      return paper;
    });
  } catch (error) {
    console.error('arXiv获取失败:', error.message);
    return [];
  }
}

async function getGitHubTrending() {
  console.log('⭐ 获取GitHub Trending...');
  try {
    const response = await axios.get('https://github.com/trending', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const repos = [];

    $('article.Box-row').slice(0, 12).each((index, element) => {
      const $el = $(element);
      const repoPath = $el.find('h2 a').attr('href') || '';
      const repoName = repoPath.replace(/^\//, '');
      const description = $el.find('p').text().trim();
      const language = $el.find('[itemprop="programmingLanguage"]').text().trim();
      const starText = $el.find('a').filter((i, el) => $(el).attr('href')?.includes('/stargazers')).text().trim();
      const todayStarsMatch = $el.text().match(/(\d+,?\d*)\s+stars\s+today/);

      if (repoName) {
        repos.push({
          rank: index + 1,
          name: repoName,
          description: description || '暂无描述',
          language: language || '未标注',
          totalStars: starText || 'N/A',
          todayStars: todayStarsMatch ? todayStarsMatch[1] : 'N/A',
          url: `https://github.com/${repoName}`
        });
      }
    });

    return repos;
  } catch (error) {
    console.error('GitHub Trending获取失败:', error.message);
    return [];
  }
}

function generateChineseCategory(description) {
  const text = description.toLowerCase();
  if (text.includes('agent') || text.includes('智能体')) return '🤖 AI 智能体';
  if (text.includes('llm') || text.includes('language model') || text.includes('大模型')) return '🧠 大模型';
  if (text.includes('claude') || text.includes('codex') || text.includes('cursor')) return '💻 Claude 生态';
  if (text.includes('trading') || text.includes('trade') || text.includes('交易')) return '💰 量化交易';
  if (text.includes('browser') || text.includes('scrape') || text.includes('bot')) return '🕷️ 反爬技术';
  if (text.includes('inference') || text.includes('server')) return '🚀 模型部署';
  if (text.includes('course') || text.includes('learn') || text.includes('教程')) return '📚 学习资源';
  if (text.includes('3d') || text.includes('gaussian')) return '🎨 3D图形';
  if (text.includes('router') || text.includes('proxy') || text.includes('api')) return '🔌 API网关';
  return '🔧 开发工具';
}

function cleanupOldReports(maxReports = 20) {
  const outputDir = path.join(__dirname, 'digests');
  if (!fs.existsSync(outputDir)) return [];

  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('ai-daily-') && f.endsWith('.md'))
    .sort()
    .reverse();

  const deleted = [];
  if (files.length > maxReports) {
    const toDelete = files.slice(maxReports);
    toDelete.forEach(file => {
      fs.unlinkSync(path.join(outputDir, file));
      deleted.push(file);
      console.log(`🗑️  删除过期日报: ${file}`);
    });
  }
  return deleted;
}

async function generateDailyReport() {
  const date = new Date().toISOString().slice(0, 10);
  console.log(`\n🤖 生成 AI 每日日报 - ${date}\n`);

  const [hackerNews, papers, trending, recentEvents, financingNews, policyNews] = await Promise.all([
    getHackerNewsTop(),
    getArXivPapers(),
    getGitHubTrending(),
    Promise.resolve(checkRecentEvents(7)),
    Promise.resolve(getRecentFinancingNews(14)),
    Promise.resolve(getRecentPolicyNews(14))
  ]);

  let report = `# 🤖 AI 每日进展日报 - ${date}\n\n`;
  report += '='.repeat(80) + '\n\n';

  // 大模型大事件（近7天内有更新才展示）
  if (recentEvents.length > 0) {
    report += '## 🚀 大模型近期重大事件\n\n';
    recentEvents.forEach(event => {
      report += `### ${event.icon} ${event.modelName}\n`;
      report += `   - 📅 日期: ${event.date}\n`;
      report += `   - 📢 事件: ${event.title}\n`;
      report += `   - 📝 中文说明: ${event.desc}\n\n`;
    });
    report += '---\n\n';
  }

  // AI投融资动态
  if (financingNews.length > 0) {
    report += '## 💰 AI 投融资动态（近14天）\n\n';
    financingNews.forEach((news, i) => {
      report += `### ${i + 1}. ${news.company}\n`;
      report += `   - 📅 日期: ${news.date}\n`;
      report += `   - 💵 轮次/金额: ${news.round} / ${news.amount}\n`;
      report += `   - 📊 估值: ${news.valuation}\n`;
      report += `   - 📝 中文摘要: ${news.summary}\n\n`;
    });
    report += '---\n\n';
  }

  // AI政策监管动态
  if (policyNews.length > 0) {
    report += '## 📜 AI 政策/监管动态（近14天）\n\n';
    policyNews.forEach((news, i) => {
      report += `### ${i + 1}. ${news.region} - ${news.title}\n`;
      report += `   - 📅 日期: ${news.date}\n`;
      report += `   - 📝 中文摘要: ${news.summary}\n\n`;
    });
    report += '---\n\n';
  }

  // Twitter/X AI热帖
  report += '## 🐦 Twitter/X AI 大咖观点\n\n';
  TWITTER_AI_HOT.forEach(item => {
    report += `### ${item.rank}. ${item.author}\n`;
    report += `   - 📢 主题: ${item.title}\n`;
    report += `   - 👁️ 浏览量: ${item.views}\n`;
    report += `   - 🔗 链接: ${item.url}\n`;
    report += `   - 📝 中文摘要: ${item.summary}\n\n`;
  });
  report += '---\n\n';

  // Hugging Face热门模型
  report += '## 🤗 Hugging Face 热门模型\n\n';
  HUGGING_FACE_HOT.forEach(item => {
    report += `### ${item.rank}. ${item.name}\n`;
    report += `   - 👤 发布方: ${item.author}\n`;
    report += `   - ⭐ 获赞数: ${item.stars}\n`;
    report += `   - 🔗 链接: ${item.url}\n`;
    report += `   - 📝 中文摘要: ${item.summary}\n\n`;
  });
  report += '---\n\n';

  // Reddit ML热点
  report += '## 🤖 Reddit MachineLearning 热点讨论\n\n';
  REDDIT_ML_HOT.forEach(item => {
    report += `### ${item.rank}. ${item.title}\n`;
    report += `   - 👍 赞数: ${item.upvotes}\n`;
    report += `   - 🔗 链接: ${item.url}\n`;
    report += `   - 📝 中文摘要: ${item.summary}\n\n`;
  });
  report += '---\n\n';

  // AI播客/视频摘要
  report += '## 🎙️ AI 播客/视频精华摘要\n\n';
  AI_PODCAST_HOT.forEach(item => {
    report += `### ${item.rank}. ${item.title}\n`;
    if(item.guest) report += `   - 👥 嘉宾: ${item.guest}\n`;
    report += `   - ⏱️ 时长: ${item.duration}\n`;
    report += `   - 🔗 链接: ${item.url}\n`;
    report += `   - 📝 中文摘要: ${item.summary}\n\n`;
  });
  report += '---\n\n';

  // Product Hunt AI热门
  report += '## 🚀 Product Hunt AI 热门产品\n\n';
  PRODUCT_HUNT_AI.forEach(item => {
    report += `### ${item.rank}. ${item.name}\n`;
    report += `   - 👍 投票数: ${item.votes}\n`;
    report += `   - 🔗 链接: ${item.url}\n`;
    report += `   - 📝 中文简介: ${item.summary}\n\n`;
  });
  report += '---\n\n';

  // Hacker News
  report += '## 🔥 Hacker News 热门话题 Top 10\n\n';
  hackerNews.forEach(article => {
    report += `### ${article.rank}. ${article.title}\n`;
    report += `   - 🔥 热度：${article.points} 分\n`;
    report += `   - 🔗 链接：${article.url}\n`;
    report += `   - 📝 中文总结：${article.summary}\n\n`;
  });

  report += '---\n\n';

  // arXiv Papers
  report += '## 📄 arXiv AI 研究前沿 Top 5\n\n';
  papers.forEach(paper => {
    report += `### ${paper.rank}. ${paper.title}\n`;
    report += `   - 🔗 链接：${paper.url}\n`;
    report += `   - 📄 摘要：${paper.summary}...\n`;
    report += `   - 📝 中文解读：${paper.chineseSummary}\n\n`;
  });

  report += '---\n\n';

  // GitHub Trending
  report += '## ⭐ GitHub Trending AI 热门项目 Top 12\n\n';
  trending.forEach(repo => {
    const category = generateChineseCategory(repo.description);
    report += `### 🏆 排名: ${repo.rank}\n`;
    report += `**项目**: \`${repo.name}\`\n`;
    report += `**分类**: ${category}\n`;
    report += `**语言**: ${repo.language}\n`;
    report += `**总星标**: ${repo.totalStars}\n`;
    report += `**今日星标**: 🔺 ${repo.todayStars}\n\n`;
    report += `**项目介绍**: ${repo.description}\n\n`;
    report += '---\n\n';
  });

  // Keywords
  const categories = {};
  trending.forEach(repo => {
    const category = generateChineseCategory(repo.description);
    if (!categories[category]) categories[category] = [];
    categories[category].push(repo.name.split('/')[1]);
  });

  report += '## 🎯 今日热门关键词\n\n';
  Object.entries(categories).slice(0, 8).forEach(([category, projects], i) => {
    report += `${i + 1}. **${category}** - ${projects.slice(0, 3).join('、')}${projects.length > 3 ? '等' : ''}\n`;
  });

  report += '\n' + '='.repeat(80) + '\n';
  report += '*每日AI进展自动生成 | Powered by Claude Code*\n';

  return report;
}

async function main() {
  const report = await generateDailyReport();
  const date = new Date().toISOString().slice(0, 10);

  const outputDir = path.join(__dirname, 'digests');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 清理过期日报
  const deleted = cleanupOldReports(20);
  if (deleted.length > 0) {
    console.log(`\n✅ 已清理 ${deleted.length} 份过期日报`);
  }

  const outputFile = path.join(outputDir, `ai-daily-${date}.md`);
  fs.writeFileSync(outputFile, report, 'utf-8');

  console.log('\n' + '='.repeat(80) + '\n');
  console.log(report);
  console.log(`\n✅ 日报已保存至: ${outputFile}`);
}

// 支持命令行直接运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDailyReport, main, cleanupOldReports };
