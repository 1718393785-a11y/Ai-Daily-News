import requests
import feedparser
from datetime import datetime, timedelta

def get_papers(date=None):
    if date is None:
        date = datetime.now()

    yesterday = date - timedelta(days=1)
    date_str = date.strftime('%Y-%m-%d')
    yesterday_str = yesterday.strftime('%Y-%m-%d')

    categories = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE']
    category_query = ' OR '.join([f'cat:{cat}' for cat in categories])

    query = f'({category_query}) AND lastUpdatedDate:[{yesterday_str} TO {date_str}]'

    url = f'http://export.arxiv.org/api/query?search_query={query}&start=0&max_results=10&sortBy=lastUpdatedDate&sortOrder=descending'

    try:
        response = requests.get(url, timeout=30)
        feed = feedparser.parse(response.text)

        content = f'## AI arXiv Papers Daily - {date_str}\n\n'

        for i, entry in enumerate(feed.entries[:10], 1):
            title = entry.title.strip()
            summary = entry.summary.strip()[:300]
            paper_id = entry.id

            content += f'### {i}. {title}\n'
            content += f'{summary}...\n'
            content += f'[Read more]({paper_id})\n\n'

        return content
    except Exception as e:
        print(f'Error fetching arxiv papers: {e}')
        return f'## AI arXiv Papers Daily - {date_str}\n\nFailed to fetch papers. Please try again later.'

if __name__ == '__main__':
    print(get_papers())
