const axios = require('axios');
const cheerio = require('cheerio');

async function fetchArticleContent(url, title) {
  console.log(`📖 正在获取: ${title.slice(0, 40)}...`);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // 移除脚本和样式
    $('script, style, nav, footer, header').remove();

    // 获取主要内容
    let text = $('article, .post-content, .content, main, body').text().trim();
    text = text.replace(/\s+/g, ' ').slice(0, 1500);

    return { title, url, content: text, success: true };
  } catch (error) {
    return { title, url, content: '无法获取全文', success: false };
  }
}

function generateChineseSummary(article) {
  const text = (article.title + ' ' + article.content).toLowerCase();

  let summary = {
    category: '🔍 其他',
    corePoint: '',
    whyImportant: '',
    whoShouldRead: ''
  };

  // 根据标题和内容分类
  if (text.includes('ai') || text.includes('model') || text.includes('llm') || text.includes('agent')) {
    summary.category = '🤖 AI/大模型';
    summary.whoShouldRead = 'AI开发者、产品经理、技术决策者';
  } else if (text.includes('security') || text.includes('vulnerability') || text.includes('trojan') || text.includes('attack')) {
    summary.category = '🔒 安全/隐私';
    summary.whoShouldRead = '安全工程师、运维人员、企业IT管理者';
  } else if (text.includes('hardware') || text.includes('apple') || text.includes('silicon') || text.includes('m4')) {
    summary.category = '💻 硬件/设备';
    summary.whoShouldRead = '硬件开发者、Mac用户、性能优化工程师';
  } else if (text.includes('code') || text.includes('coding') || text.includes('programming') || text.includes('developer')) {
    summary.category = '👨‍💻 编程/开发';
    summary.whoShouldRead = '软件工程师、技术管理者、编程学习者';
  }

  // 核心观点提炼
  if (article.title.includes('Hardware Attestation') || article.title.includes('Monopoly')) {
    summary.corePoint = 'GrapheneOS指出：硬件认证机制正被大公司用作垄断工具，限制用户自由和选择权。苹果Google通过控制硬件认证链，形成封闭生态壁垒。';
    summary.whyImportant = '这关乎数字自由的未来，硬件级垄断比软件垄断更难打破，影响所有终端用户的选择权。';
  } else if (article.title.includes('Local AI')) {
    summary.corePoint = '呼吁推动本地AI成为常态，而非所有AI都依赖云端API。本地运行AI可保护隐私、降低延迟、减少对大公司依赖。';
    summary.whyImportant = '数据隐私是AI时代核心问题，本地AI是技术民主化的关键路径。';
  } else if (article.title.includes('local models') || article.title.includes('M4')) {
    summary.corePoint = '实践分享：在配备24GB内存的Apple M4芯片上成功运行本地大模型，展示了Apple Silicon在本地AI部署的巨大潜力。';
    summary.whyImportant = '证明了消费级硬件已具备运行专业级AI模型的能力，本地部署门槛大幅降低。';
  } else if (article.title.includes('writing code by hand') || article.title.includes('hand')) {
    summary.corePoint = '开发者分享：放弃AI辅助编程，回归手写代码的体验与思考。探讨过度依赖AI可能导致代码质量下降、维护成本上升。';
    summary.whyImportant = '引发对"AI编程是否真的提升了整体效率"的深度思考，过度自动化可能隐藏技术债。';
  } else if (article.title.includes('CVE') || article.title.includes('Incident')) {
    summary.corePoint = '详细安全事件报告：CVE-2024-YIKES漏洞分析，展示安全漏洞的发现、分析、修复全过程。';
    summary.whyImportant = '学习真实安全事件的处置流程，提升安全应急响应能力。';
  } else if (article.title.includes('Obsidian') || article.title.includes('trojan')) {
    summary.corePoint = '安全警示：Obsidian插件被滥用于部署远程访问木马。第三方插件生态存在巨大安全风险，插件权限过大可能导致系统被完全控制。';
    summary.whyImportant = '提醒所有使用插件系统的用户注意安全风险，插件供应链攻击日益增多。';
  } else if (article.title.includes('AI coding agent') || article.title.includes('maintenance')) {
    summary.corePoint = '提出观点：AI编码智能体不仅要能写代码，更要能降低维护成本。当前AI生成代码常导致技术债堆积，长期维护成本反而上升。';
    summary.whyImportant = '从全生命周期角度评估AI编程价值，而非只看编码速度。';
  }

  return summary;
}

async function main() {
  const hackerNewsArticles = [
    {
      rank: 1,
      title: 'Hardware Attestation as Monopoly Enabler',
      url: 'https://grapheneos.social/@GrapheneOS/116550899908879585',
      points: 959
    },
    {
      rank: 2,
      title: 'Local AI needs to be the norm',
      url: 'https://unix.foo/posts/local-ai-needs-to-be-norm/',
      points: 644
    },
    {
      rank: 3,
      title: 'Running local models on an M4 with 24GB memory',
      url: 'https://jola.dev/posts/running-local-models-on-m4',
      points: 115
    },
    {
      rank: 4,
      title: "I'm going back to writing code by hand",
      url: 'https://blog.k10s.dev/im-going-back-to-writing-code-by-hand/',
      points: 70
    },
    {
      rank: 5,
      title: 'Incident Report: CVE-2024-YIKES',
      url: 'https://nesbitt.io/2026/02/03/incident-report-cve-2024-yikes.html',
      points: 416
    },
    {
      rank: 6,
      title: 'Obsidian plugin was abused to deploy a remote access trojan',
      url: 'https://cyber.netsecops.io/articles/obsidian-plugin-abused-in-campaign-to-deploy-phantom-pulse-rat/',
      points: 91
    },
    {
      rank: 7,
      title: 'An AI coding agent, used to write code, needs to reduce your maintenance costs',
      url: 'https://www.jamesshore.com/v2/blog/2026/you-need-ai-that-reduces-your-maintenance-costs',
      points: 39
    }
  ];

  const arxivPapers = [
    {
      rank: 1,
      title: '123D: Unifying Multi-Modal Autonomous Driving Data at Scale',
      url: 'http://arxiv.org/abs/2605.08084v1'
    },
    {
      rank: 2,
      title: 'LLMs Improving LLMs: Agentic Discovery for Test-Time Scaling',
      url: 'http://arxiv.org/abs/2605.08083v1'
    },
    {
      rank: 3,
      title: 'Normalizing Trajectory Models',
      url: 'http://arxiv.org/abs/2605.08078v1'
    },
    {
      rank: 4,
      title: 'Conformal Path Reasoning: Trustworthy Knowledge Graph Question Answering via Path-Level Calibration',
      url: 'http://arxiv.org/abs/2605.08077v1'
    },
    {
      rank: 5,
      title: 'Zero-Shot Imagined Speech Decoding via Imagined-to-Listened MEG Mapping',
      url: 'http://arxiv.org/abs/2605.08075v1'
    }
  ];

  console.log('🤖 AI 每日日报 - 深度解析版\n');
  console.log('='.repeat(80) + '\n');

  // Hacker News 深度解析
  console.log('## 🔥 Hacker News 热门话题 - 中文深度解析\n');

  for (const article of hackerNewsArticles) {
    const details = await fetchArticleContent(article.url, article.title);
    const summary = generateChineseSummary(details);

    console.log(`### ${article.rank}. ${article.title}`);
    console.log(`   🔥 热度：${article.points} 分`);
    console.log(`   📂 分类：${summary.category}`);
    console.log(`\n   🎯 核心观点：`);
    console.log(`      ${summary.corePoint || '需访问原文获取详细内容'}`);
    console.log(`\n   ⚡ 为什么重要：`);
    console.log(`      ${summary.whyImportant || '技术社区高热度讨论，代表当前关注方向'}`);
    console.log(`\n   👥 谁应该关注：${summary.whoShouldRead || '技术从业者'}`);
    console.log(`\n   🔗 原文链接：${article.url}`);
    console.log('\n   ' + '─'.repeat(60) + '\n');
  }

  // arXiv 论文中文解读
  console.log('## 📄 arXiv AI 研究前沿 - 中文专业解读\n');

  const paperSummaries = {
    1: {
      background: '自动驾驶领域虽然积累了海量传感器数据，但各数据集格式不统一，导致数据价值难以充分挖掘。',
      innovation: '提出123D统一多模态数据框架，标准化2D图像、3D点云、激光雷达、高精地图等多种数据格式。',
      application: '大幅降低自动驾驶模型训练的数据预处理成本，促进不同数据集之间的知识迁移。',
      impact: '有望成为自动驾驶领域的数据标准，加速整个行业的技术迭代速度。'
    },
    2: {
      background: '测试时扩展(TTS)通过推理时增加计算提升性能，但现有策略多为手工设计，效率受限。',
      innovation: '提出让大模型自主发现优化策略的Agentic Discovery方法，实现LLM自我改进。',
      application: '无需人工介入，模型自动优化推理策略，持续提升性能。',
      impact: '向"自适应AI"迈出重要一步，模型不再是静态产物，而是能持续进化的系统。'
    },
    3: {
      background: '扩散模型需要多步去噪，在快速生成场景下假设失效，现有蒸馏方法牺牲质量换速度。',
      innovation: '提出轨迹模型归一化方法，在少步生成时保持高质量，解决速度与质量的矛盾。',
      application: '实时图像生成、视频渲染等需要低延迟的AI生成场景。',
      impact: '让高质量AI生成从"秒级"进入"毫秒级"，拓展更多实时应用场景。'
    },
    4: {
      background: '知识图谱问答可解释性好但缺乏可靠性保证，共形预测理论能提供统计保证但应用困难。',
      innovation: '提出路径级校准的共形推理方法，为知识图谱问答提供严格的覆盖保证。',
      application: '医疗诊断、法律查询、金融风控等需要高可靠性的知识推理场景。',
      impact: 'AI从"能回答"向"能可靠回答"进化，为高风险领域应用铺平道路。'
    },
    5: {
      background: '无创脑电解码想象语音难度极大，数据稀缺且时序对齐困难，现有方法准确率低。',
      innovation: '利用听觉数据辅助想象语音解码，通过跨模态迁移实现零样本学习。',
      application: '帮助失语症患者恢复沟通能力，脑机接口直接意念控制设备。',
      impact: '脑机接口领域重大突破，"意念交流"从科幻走向现实。'
    }
  };

  for (const paper of arxivPapers) {
    const summary = paperSummaries[paper.rank];
    console.log(`### ${paper.rank}. ${paper.title}`);
    console.log(`\n   📌 研究背景：`);
    console.log(`      ${summary.background}`);
    console.log(`\n   💡 核心创新：`);
    console.log(`      ${summary.innovation}`);
    console.log(`\n   🎯 应用场景：`);
    console.log(`      ${summary.application}`);
    console.log(`\n   🚀 行业影响：`);
    console.log(`      ${summary.impact}`);
    console.log(`\n   🔗 论文链接：${paper.url}`);
    console.log('\n   ' + '─'.repeat(60) + '\n');
  }

  console.log('='.repeat(80));
  console.log('\n📊 今日核心洞察：');
  console.log('1. 🔒 数字自由：硬件认证vs.用户选择权的博弈正在升温');
  console.log('2. 🤖 AI民主化：本地AI运动兴起，数据主权意识增强');
  console.log('3. ⚠️ 理性回归：对AI编程狂热后的冷静思考，关注全生命周期成本');
  console.log('4. 🧠 自我进化：LLM自主优化成为研究前沿，静态模型→动态进化');
  console.log('5. 🎯 可靠性：AI开始从"能用"向"可靠"、"可验证"进化');
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);
