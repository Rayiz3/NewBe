from collections import defaultdict
import re
import json
import asyncio
import logging
from anyio import Path
import feedparser
import trafilatura

from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from feedparser import FeedParserDict
from googlenewsdecoder import gnewsdecoder

from app.core.prompts import PERSONAS
from app.pipelines.states import RawNewsState, GraphState
from app.core.configs import Config

# URL constants
URL_GOOGLE_NEWS = "https://news.google.com"
KOREA_PARAMS = "hl=k0&gl=KR&ceid=KR:ko"

# logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)


# Agent: collector
class RSSCollectorAgent:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.feed = None
        self._sem = asyncio.Semaphore(Config.SEMA_COLLECT)  # for concurrency
    
    ''' load feed from rss url '''
    def load_feed(self, url) -> None:
        self.feed = feedparser.parse(url)
    
    ''' exception handler: Chosun '''
    @staticmethod
    def extract_chosun_content(html_content):
        # extract JSON part from the variable 'Fusion.globalContent'
        pattern = r"Fusion\.globalContent\s*=\s*({.*?});"
        match = re.search(pattern, html_content, re.DOTALL)  # DOTALL : ignore '\n' while searching

        if match:
            try:
                content_data = json.loads(match.group(1))
                texts = []

                if "content_elements" in content_data:
                    for element in content_data["content_elements"]:
                        # extract only content with type 'text'
                        if element.get("type") == "text" and "content" in element:
                            texts.append(element["content"])
                
                return "\n\n".join(texts)
            
            except json.JSONDecodeError:
                pass
        
        return ""
    
    ''' get original news url from the Goolge News url '''
    def get_news_url(self, url: str) -> str | None:
        try:
            decoded_url = gnewsdecoder(url, interval=1)

            if decoded_url.get("status"):
                return decoded_url["decoded_url"]
            else:
                self.logger.error(f"While get_news_url: {decoded_url['message']}")
                return None
        
        except Exception as e:
            self.logger.error(f"While get_news_url: {e}")
    
    ''' get feed content from the news '''
    def get_content(self, url:str, news: str) -> str:
        try:
            content = ""

            if "chosun.com" in url:
                content = self.extract_chosun_content(news)
            else:
                content = trafilatura.extract(
                            news,
                            include_comments=False,
                            include_images=False,
                            include_links=False,
                            target_language="ko",
                        )
            if not content:
                soup = BeautifulSoup(news, 'lxml')
                content = soup.get_text(separator='\n', strip=True)
            
            return content
        
        except Exception as e:
            self.logger.error("While get_content: {e}")

    ''' get feed content from the entry '''
    async def parse_entry(self, id: str, cat: str, entry: FeedParserDict) -> RawNewsState | None:
        async with self._sem:
            google_news_url = f"{entry.link}&{KOREA_PARAMS}"

            # convert GMT -> KST
            time_gmt = datetime.strptime(entry.published, "%a, %d %b %Y %H:%M:%S GMT")
            time_kst = time_gmt + timedelta(hours=9)
            published_kst = time_kst.strftime("%Y-%m-%d %H:%M:%S")

            # today
            published_kst = datetime.today().strftime("%Y-%m-%d %H:%M:%S")

            placeholder = RawNewsState(
                persona_id=id,
                title="",
                category=cat,
                published_kst=published_kst,
                source="",
                google_news_url=google_news_url,
                news_url="",
                content=""
            )

            # get the original news url
            news_url = await asyncio.to_thread(self.get_news_url, google_news_url)
            if not news_url:
                self.logger.warning("Fail to get the news url")
                return placeholder
            
            # get the news from the news url
            news = await asyncio.to_thread(trafilatura.fetch_url, news_url)
            if not news:
                self.logger.warning("Fail to get the news content")
                return placeholder
            
            # get main content from the news
            content = await asyncio.to_thread(self.get_content, news_url, news)
            if content == "":
                self.logger.warning("Fail to get the news content")
                return placeholder

            return RawNewsState(
                persona_id=id,
                title=entry.title,
                category=cat,
                published_kst=published_kst,
                source=entry.source.get("title", "unknown"),
                google_news_url=google_news_url,
                news_url=news_url,
                content=content
            )
    
    ''' Node function '''
    async def collect_rss(self, state: GraphState) -> GraphState:
        try:
            tasks = []

            for persona in PERSONAS:
                cat = persona["persona_id"].split("_")[1]
                url = f"{URL_GOOGLE_NEWS}/rss/headlines/section/topic/{cat}?{KOREA_PARAMS}"
                self.load_feed(url)
            
                tasks += [self.parse_entry(persona["persona_id"], cat, entry) for entry in self.feed.entries[:1]]
                
            results = await asyncio.gather(*tasks)
            results = [news for news in results if news is not None]

            # update state
            state.raw_news = { news.persona_id: news for news in results }

            return state
        
        except Exception as e:
            self.logger.error(f"While collecting RSS feeds: {e}")
            return state