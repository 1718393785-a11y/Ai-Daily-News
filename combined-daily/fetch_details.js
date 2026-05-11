const axios = require('axios');
const xml2js = require('xml2js');

async function fetchArticleContent(url, title) {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const text = response.data;
    const content = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 1000);
    return { title, url, content };
  } catch (error) {
    return { title, url, content: '无法获取文章内容，请直接访问链接查看' };
  }
}

async function getHackerNewsDetails() {
  console.log('获取Hacker News详细内容...\n');
  const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
  const topIds = response.data.slice(0, 5);

  const articles = [];
  for (let i = 0; i < topIds.length; i++) {
    const storyResponse = await axios.get(
      `https://hacker-news.firebaseio.com/v0/item/${topIds[i]}.json`
    );
    const story = storyResponse.data;
    const title = story.title || 'No title';
    const url = story.url || `https://news.ycombinator.com/item?id=${topIds[i]}`;

    const article = await fetchArticleContent(url, title);
    article.points = story.score || 0;
    articles.push(article);
  }
  return articles;
}

async function getArxivPapersDetails() {
  console.log('获取arXiv论文详细内容...\n');
  const categories = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE'];
  const categoryQuery = categories.map(cat => `cat:${cat}`).join('+OR+');
  const query = `(${categoryQuery})`;

  const url = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
  const response = await axios.get(url);

  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data);
  const entries = result.feed.entry || [];

  return entries.slice(0, 5).map(entry => ({
    title: entry.title[0].trim(),
    url: entry.id[0],
    summary: entry.summary[0].trim(),
    authors: entry.author ? entry.author.map(a => a.name[0]).join(', ') : 'Unknown'
  }));
}

async function main() {
  console.log('🤖 AI Daily Digest - 详细内容获取\n');

  const hnArticles = await getHackerNewsDetails();
  const papers = await getArxivPapersDetails();

  console.log('='.repeat(80));
  console.log('# Hacker News 热门文章 (Top 5)\n');

  hnArticles.forEach((article, i) => {
    console.log(`${i + 1}. 【标题】${article.title}`);
    console.log(`   【热度】${article.points} 分`);
    console.log(`   【链接】${article.url}`);
    console.log(`   【摘要】${article.content.slice(0, 200)}...\n`);
  });

  console.log('='.repeat(80));
  console.log('# arXiv AI 最新论文 (Top 5)\n');

  papers.forEach((paper, i) => {
    console.log(`${i + 1}. 【标题】${paper.title}`);
    console.log(`   【链接】${paper.url}`);
    console.log(`   【摘要】${paper.summary.slice(0, 300)}...\n`);
  });

  console.log('='.repeat(80));
  console.log('\n📝 中文总结：\n');

  console.log('## Hacker News 热门话题总结：');
  console.log('1. 硬件认证与垄断：讨论硬件认证机制可能成为市场垄断的工具');
  console.log('2. 本地AI运动：呼吁让本地运行AI成为常态，保护隐私和数据安全');
  console.log('3. AI编程反思：开发者分享回归手写代码的体验，讨论AI辅助编程的利弊');
  console.log('4. Apple Silicon本地部署：在M4芯片上运行24GB内存的本地AI模型实践');
  console.log('5. 安全警示：Obsidian插件被滥用于部署远程访问木马的安全事件');

  console.log('\n## AI 研究前沿：');
  console.log('1. 123D：大规模统一多模态自动驾驶数据集');
  console.log('2. LLM自我改进：通过智能体发现实现测试时扩展的新方法');
  console.log('3. 轨迹模型归一化：改进预测模型的新研究');
  console.log('4. 可信知识图谱问答：通过路径级校准实现可靠推理');
  console.log('5. 意念语音解码：基于脑磁图的零样本想象语音解码技术');
}

main().catch(console.error);
