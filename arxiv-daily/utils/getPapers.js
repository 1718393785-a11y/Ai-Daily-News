const axios = require('axios');

async function getPapers(date) {
  const today = new Date(date);
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const categories = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE'];
  const categoryQuery = categories.map(cat => `cat:${cat}`).join('+OR+');

  const query = `(${categoryQuery})+AND+lastUpdatedDate:[${yesterdayStr}+TO+${dateStr}]`;

  try {
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=10&sortBy=lastUpdatedDate&sortOrder=descending`,
      { headers: { 'Accept': 'application/json' } }
    );

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const entries = xmlDoc.getElementsByTagName('entry');

    let content = `## AI arXiv Papers Daily - ${dateStr}\n\n`;

    for (let i = 0; i < Math.min(10, entries.length); i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName('title')[0].textContent.trim();
      const summary = entry.getElementsByTagName('summary')[0].textContent.trim().slice(0, 300);
      const id = entry.getElementsByTagName('id')[0].textContent;

      content += `### ${i + 1}. ${title}\n`;
      content += `${summary}...\n`;
      content += `[Read more](${id})\n\n`;
    }

    return content;
  } catch (error) {
    console.error('Error fetching arxiv papers:', error);
    return `## AI arXiv Papers Daily - ${dateStr}\n\nFailed to fetch papers. Please try again later.`;
  }
}

module.exports = getPapers;
