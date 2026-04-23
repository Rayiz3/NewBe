import asyncio
import json
import logging

from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

from app.core.configs import Config
from app.core.prompts import PERSONAS, Prompts
from app.pipelines.states import GraphState, RawNewsState, SummarizedNewsState

# logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

class SummarizerAgent:
    def __init__(self, llm: ChatAnthropic):
        self.logger = logging.getLogger(__name__)
        self.model = llm
        self.prompts = {}

        for persona in PERSONAS:
            persona_id = persona["persona_id"]
            self.prompts[persona_id] = ChatPromptTemplate.from_messages([
                ("system", f"{Prompts.SUMMARY_SYSTEM}\n\n{Prompts.get_persona_guide(persona_id)}"),
                ("human", Prompts.SUMMARY_HUMAN)
            ])
        self._sem = asyncio.Semaphore(Config.SEMA_SUMMARIZE)  # for concurrency

    ''' summarize single news '''
    async def summarize(self, persona_id: str, news: RawNewsState) -> SummarizedNewsState:
        async with self._sem:
            content = news.content

            try:
                if content == "":
                    return SummarizedNewsState(
                        **news.model_dump(),
                        summary=Prompts.DEFAULT_MESSAGE
                    )
            
                chain = self.prompts[persona_id] | self.model
                response = await chain.ainvoke({
                    "title": news.title,
                    "content": content[:500],
                })
                summary = response.content.strip()
                summary = summary.replace("\n\n", "\n")
                summary = summary.replace("\n\n\n", "\n")

                return SummarizedNewsState(
                    **news.model_dump(),
                    summary=summary or content
                )
            
            except Exception as e:
                self.logger.error(f"While summarizing '{news.title}': {e}")

                return SummarizedNewsState(
                    **news.model_dump(),
                    summary=content
                )
        
    ''' Node function '''
    async def summarize_news(self, state: GraphState) -> GraphState:
        try:
            tasks = []

            for persona in PERSONAS:
                persona_id = persona["persona_id"]
                raw_news = state.raw_news[persona_id]
            
                tasks.append(self.summarize(persona_id, raw_news))
                
            results = await asyncio.gather(*tasks)
            results = [news for news in results if news is not None]

            # update state
            state.summarized_news = { news.persona_id: news for news in results }

            return state
        
        except Exception as e:
            self.logger.error(f"While summarizing news: {e}")
            return state