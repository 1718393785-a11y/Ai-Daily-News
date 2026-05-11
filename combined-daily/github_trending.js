const axios = require('axios');
const cheerio = require('cheerio');

async function fetchGitHubTrending() {
  console.log('📊 正在获取 GitHub Trending...\n');

  try {
    const response = await axios.get('https://github.com/trending', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const repos = [];

    $('article.Box-row').each((index, element) => {
      const $el = $(element);
      const repoPath = $el.find('h2 a').attr('href') || '';
      const repoName = repoPath.replace(/^\//, '');
      const description = $el.find('p').text().trim();
      const language = $el.find('[itemprop="programmingLanguage"]').text().trim();

      const starText = $el.find('a').filter((i, el) => $(el).attr('href')?.includes('/stargazers')).text().trim();
      const totalStars = starText || 'N/A';

      const todayStarsMatch = $el.text().match(/(\d+,?\d*)\s+stars\s+today/);
      const todayStars = todayStarsMatch ? todayStarsMatch[1] : 'N/A';

      if (repoName) {
        repos.push({
          rank: index + 1,
          name: repoName,
          description: description || '暂无描述',
          language: language || '未标注',
          totalStars,
          todayStars,
          url: `https://github.com/${repoName}`
        });
      }
    });

    return repos.slice(0, 15);
  } catch (error) {
    console.error('获取Trending失败:', error.message);
    return [];
  }
}

async function fetchRepoDetails(repo) {
  console.log(`📖 正在获取详情: ${repo.name}`);

  try {
    const response = await axios.get(repo.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    const readme = $('#readme').text().trim() || '';
    const about = $('p.f4.my-3').text().trim() || repo.description;

    return {
      ...repo,
      about,
      readmePreview: readme.slice(0, 500)
    };
  } catch (error) {
    return repo;
  }
}

function generateChineseSummary(repo) {
  const text = (repo.about + ' ' + repo.readmePreview).toLowerCase();

  let category = '通用工具';
  let useCase = [];

  if (text.includes('agent') || text.includes('智能体')) {
    category = '🤖 AI 智能体';
    useCase.push('构建AI智能体应用');
  }
  if (text.includes('llm') || text.includes('language model') || text.includes('大模型')) {
    category = '🧠 大模型相关';
    useCase.push('大模型开发与部署');
  }
  if (text.includes('claude') || text.includes('codex') || text.includes('cursor')) {
    category = '💻 Claude Code 生态';
    useCase.push('增强AI编码体验');
  }
  if (text.includes('trading') || text.includes('trade') || text.includes('交易')) {
    category = '💰 量化交易';
    useCase.push('自动化交易策略');
  }
  if (text.includes('browser') || text.includes('scrape') || text.includes('crawl') || text.includes('bot')) {
    category = '🕷️ 爬虫/反检测';
    useCase.push('网页自动化、数据采集');
  }
  if (text.includes('inference') || text.includes('deploy') || text.includes('server')) {
    category = '🚀 模型部署';
    useCase.push('LLM推理服务部署');
  }
  if (text.includes('course') || text.includes('tutorial') || text.includes('learn') || text.includes('课程')) {
    category = '📚 学习资源';
    useCase.push('编程学习、技术教程');
  }
  if (text.includes('3d') || text.includes('gaussian') || text.includes('splat')) {
    category = '🎨 3D/图形';
    useCase.push('3D可视化、图形处理');
  }
  if (text.includes('router') || text.includes('proxy') || text.includes('api')) {
    category = '🔌 API 网关';
    useCase.push('多API统一管理、负载均衡');
  }

  return { category, useCase: useCase.length > 0 ? useCase : ['开发工具'] };
}

async function main() {
  const repos = await fetchGitHubTrending();

  if (repos.length === 0) {
    console.log('无法获取Trending数据，使用提供的数据分析...');
    return;
  }

  console.log(`\n✅ 获取到 ${repos.length} 个热门项目\n`);
  console.log('='.repeat(80) + '\n');

  const keywords = new Set();
  const categories = {};

  for (const repo of repos) {
    const details = await fetchRepoDetails(repo);
    const summary = generateChineseSummary(details);

    if (!categories[summary.category]) {
      categories[summary.category] = [];
    }
    categories[summary.category].push(details.name.split('/')[1]);

    console.log(`  排名: ${repo.rank}`);
    console.log(`  项目: ${repo.name}`);
    console.log(`  分类: ${summary.category}`);
    console.log(`  语言: ${repo.language}`);
    console.log(`  总星标: ${repo.totalStars}`);
    console.log(`  今日星标: 🔺 ${repo.todayStars}`);
    console.log(`  简介: ${repo.description}`);
    console.log(`  用途: ${summary.useCase.join('、')}`);
    console.log('  ────────────────────────────────────────');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n  🎯 今日热门关键词\n');

  Object.entries(categories).forEach(([category, projects], index) => {
    console.log(`  ${index + 1}. ${category} - ${projects.slice(0, 3).join('、')}${projects.length > 3 ? '等' : ''}`);
  });

  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);
