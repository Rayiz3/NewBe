### pytest test suite for RSSCollectorAgent ###

import json
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock

import pytest

from app.piplines.agents.collector import RSSCollectorAgent, KOREA_PARAMS

# Sample values
TITLE = "[속보] 여야 26.2조 추경안 합의…오후 본회의 처리 - 한겨레"
LINK = "https://news.google.com/rss/articles/CBMidEFVX3lxTFBTa1EtTWNCMGRuX1g0VGloZjl5SU0zZkxGckNkLXR5dVBNUUl4emVzSUJ4Rlg4QU1tNnFHY2VDeEo3WlJhVnd2ejZJdWQyYWlfWFRQMGt0eUR3SUNfWHVURTVsTG5SWDJHTm5PYnFydDhGY3dO?oc=5"
PUBLISHED = "Fri, 10 Apr 2026 04:49:00 GMT"
SOURCE="한겨레"
LINK_ORIGIN = "https://www.hani.co.kr/arti/politics/politics_general/1253627.html"


# Fixtures
@pytest.fixture
def agent():
    return RSSCollectorAgent()


def make_entry(
    title=TITLE,
    link=LINK,
    published=PUBLISHED,
    source_title=SOURCE,
):
    entry = MagicMock()
    entry.title = title
    entry.link = link
    entry.published = published
    entry.source = {"title": source_title}
    return entry

# ──────────────────────────────────────────────
#  get_news_url
# ──────────────────────────────────────────────

class TestGetNewsUrl:
    def test_returns_decoded_url_on_success(self, agent):
        assert agent.get_news_url(LINK) == LINK_ORIGIN

    def test_returns_none_on_failure_status(self, agent):
        assert agent.get_news_url("https://fakeurl") is None

    @patch("collector.gnewsdecoder")  # replace newsdecoder into fake object 'mock_decoder'
    def test_returns_none_on_exception(self, mock_decoder, agent):
        mock_decoder.side_effect = Exception("network error")

        assert agent.get_news_url(LINK) is None

''' by Claude
# ──────────────────────────────────────────────
#  get_content
# ──────────────────────────────────────────────

class TestGetContent:

    @patch.object(RSSCollectorAgent, "extract_chosun_content", return_value="조선 본문")
    def test_uses_chosun_extractor_for_chosun_url(self, mock_chosun, agent):
        """chosun.com URL이면 extract_chosun_content를 사용하는지 확인합니다."""
        result = agent.get_content("https://www.chosun.com/article/123", "<html/>")

        mock_chosun.assert_called_once()
        assert result == "조선 본문"

    @patch("collector.trafilatura.extract", return_value="trafilatura 본문")
    def test_uses_trafilatura_for_non_chosun_url(self, mock_extract, agent):
        """chosun.com이 아닌 URL이면 trafilatura를 사용하는지 확인합니다."""
        result = agent.get_content("https://www.khan.co.kr/article/123", "<html/>")

        mock_extract.assert_called_once()
        assert result == "trafilatura 본문"

    @patch("collector.trafilatura.extract", return_value=None)
    @patch("collector.BeautifulSoup")
    def test_falls_back_to_beautifulsoup_when_trafilatura_returns_none(
        self, mock_bs, mock_extract, agent
    ):
        """trafilatura가 None을 반환하면 BeautifulSoup으로 폴백하는지 확인합니다."""
        mock_soup_instance = MagicMock()
        mock_soup_instance.get_text.return_value = "BeautifulSoup 본문"
        mock_bs.return_value = mock_soup_instance

        result = agent.get_content("https://www.khan.co.kr/article/123", "<html/>")

        mock_bs.assert_called_once()
        assert result == "BeautifulSoup 본문"


# ──────────────────────────────────────────────
#  parse_entry
# ──────────────────────────────────────────────

class TestParseEntry:

    @pytest.mark.asyncio
    @patch("collector.trafilatura.fetch_url", return_value="<html>기사 HTML</html>")
    @patch.object(RSSCollectorAgent, "get_content", return_value="파싱된 본문")
    @patch.object(RSSCollectorAgent, "get_news_url", return_value="https://www.khan.co.kr/article/123")
    async def test_returns_raw_news_state_on_success(
        self, mock_url, mock_content, mock_fetch, agent
    ):
        """정상 흐름에서 RawNewsState를 반환하는지 확인합니다."""
        entry = make_entry()

        result = await agent.parse_entry(entry)

        assert isinstance(result, RawNewsState)
        assert result.title == "테스트 기사 제목 - 경향신문"
        assert result.source == "경향신문"
        assert result.content == "파싱된 본문"

    @pytest.mark.asyncio
    async def test_returns_none_when_get_news_url_fails(self, agent):
        """get_news_url이 None을 반환하면 parse_entry도 None을 반환하는지 확인합니다."""
        entry = make_entry()

        with patch.object(agent, "get_news_url", return_value=None):
            result = await agent.parse_entry(entry)

        assert result is None

    @pytest.mark.asyncio
    @patch.object(RSSCollectorAgent, "get_news_url", return_value="https://www.khan.co.kr/article/123")
    @patch("collector.trafilatura.fetch_url", return_value=None)
    async def test_returns_none_when_fetch_url_fails(self, mock_fetch, mock_url, agent):
        """trafilatura.fetch_url이 None을 반환하면 None을 반환하는지 확인합니다."""
        entry = make_entry()

        result = await agent.parse_entry(entry)

        assert result is None

    @pytest.mark.asyncio
    @patch("collector.trafilatura.fetch_url", return_value="<html/>")
    @patch.object(RSSCollectorAgent, "get_content", return_value="")
    @patch.object(RSSCollectorAgent, "get_news_url", return_value="https://www.khan.co.kr/article/123")
    async def test_returns_none_when_content_is_empty(
        self, mock_url, mock_content, mock_fetch, agent
    ):
        """get_content가 빈 문자열을 반환하면 None을 반환하는지 확인합니다."""
        entry = make_entry()

        result = await agent.parse_entry(entry)

        assert result is None

    @pytest.mark.asyncio
    @patch("collector.trafilatura.fetch_url", return_value="<html/>")
    @patch.object(RSSCollectorAgent, "get_content", return_value="본문")
    @patch.object(RSSCollectorAgent, "get_news_url", return_value="https://www.khan.co.kr/article/123")
    async def test_converts_gmt_to_kst(self, mock_url, mock_content, mock_fetch, agent):
        """GMT 시간이 KST(+9h)로 올바르게 변환되는지 확인합니다."""
        entry = make_entry(published="Wed, 08 Apr 2026 00:00:00 GMT")  # UTC 자정

        result = await agent.parse_entry(entry)

        assert result.published_kst == "2026-04-08 09:00:00"  # KST = UTC+9

    @pytest.mark.asyncio
    @patch("collector.trafilatura.fetch_url", return_value="<html/>")
    @patch.object(RSSCollectorAgent, "get_content", return_value="본문")
    @patch.object(RSSCollectorAgent, "get_news_url", return_value="https://www.khan.co.kr/article/123")
    async def test_google_news_url_contains_korea_params(
        self, mock_url, mock_content, mock_fetch, agent
    ):
        """google_news_url에 KOREA_PARAMS가 포함되는지 확인합니다."""
        entry = make_entry()

        result = await agent.parse_entry(entry)

        assert KOREA_PARAMS in result.google_news_url

    @pytest.mark.asyncio
    @patch("collector.trafilatura.fetch_url", return_value="<html/>")
    @patch.object(RSSCollectorAgent, "get_content", return_value="본문")
    @patch.object(RSSCollectorAgent, "get_news_url", return_value="https://example.com/no-source")
    async def test_source_defaults_to_unknown(self, mock_url, mock_content, mock_fetch, agent):
        """entry.source에 title 키가 없으면 'unknown'으로 설정되는지 확인합니다."""
        entry = make_entry()
        entry.source = {}  # title 키 없음

        result = await agent.parse_entry(entry)

        assert result.source == "unknown"


# ──────────────────────────────────────────────
#  collect_rss (Node function)
# ──────────────────────────────────────────────

class TestCollectRss:

    def make_state(self) -> GraphState:
        return GraphState()

    @pytest.mark.asyncio
    async def test_updates_state_raw_news(self, agent):
        """collect_rss 실행 후 state.raw_news가 갱신되는지 확인합니다."""
        mock_news = MagicMock(spec=RawNewsState)
        agent.feed = MagicMock()
        agent.feed.entries = [make_entry(), make_entry()]

        state = self.make_state()

        with patch.object(agent, "parse_entry", new=AsyncMock(return_value=mock_news)):
            result = await agent.collect_rss(state)

        assert len(result.raw_news) == 2

    @pytest.mark.asyncio
    async def test_filters_out_none_results(self, agent):
        """parse_entry가 None을 반환한 항목은 raw_news에서 제외되는지 확인합니다."""
        mock_news = MagicMock(spec=RawNewsState)
        agent.feed = MagicMock()
        agent.feed.entries = [make_entry(), make_entry(), make_entry()]

        state = self.make_state()

        with patch.object(
            agent, "parse_entry", new=AsyncMock(side_effect=[mock_news, None, None])
        ):
            result = await agent.collect_rss(state)

        assert len(result.raw_news) == 1

    @pytest.mark.asyncio
    async def test_calls_load_feed_when_feed_is_none(self, agent):
        """self.feed가 None이면 load_feed를 호출하는지 확인합니다."""
        agent.feed = None

        with patch.object(agent, "load_feed") as mock_load:
            def set_feed():
                agent.feed = MagicMock()
                agent.feed.entries = []
            mock_load.side_effect = set_feed

            state = self.make_state()
            await agent.collect_rss(state)

        mock_load.assert_called_once()

    @pytest.mark.asyncio
    async def test_respects_max_news_cnt(self, agent):
        """Config.MAX_NEWS_CNT 개수만큼만 entries를 처리하는지 확인합니다."""
        from configs import Config

        agent.feed = MagicMock()
        agent.feed.entries = [make_entry() for _ in range(50)]

        call_count = 0

        async def fake_parse(entry):
            nonlocal call_count
            call_count += 1
            return MagicMock(spec=RawNewsState)

        state = self.make_state()

        with patch.object(agent, "parse_entry", new=fake_parse):
            await agent.collect_rss(state)

        assert call_count == Config.MAX_NEWS_CNT
'''