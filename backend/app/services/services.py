import asyncio
import logging

from langchain.messages import HumanMessage
from langchain_anthropic import ChatAnthropic
# This Anthropic LLM is deprecated. Please use `from langchain_anthropic import ChatAnthropic` instead
from app.core.configs import Config
from app.db.schemas import SummaryResponseSchema
from app.pipelines.states import GraphState
from app.pipelines.workflow import create_workflow


# logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


async def get_langgraph_news():
    try:
        # define LLM
        llm = ChatAnthropic(
            model_name=Config.MODEL,
            max_tokens_to_sample=Config.MAX_TOKENS,
            api_key=Config.ANTHROPIC_API_KEY
        )

        # run workflow
        app = create_workflow(llm)

        initial_state = GraphState(
            messages=[HumanMessage(content="Google News RSS process activating")]
        )
        final_state = (await app.ainvoke(initial_state))["summarized_news"]

        # save and print the output'
        # raw_news = final_state.get("raw_news", {})
        # for cat, news in raw_news.items():
        #     print(f"[{cat}] ({len(news)}) : [{news[0].title}, ...]")
        response = { k:
            SummaryResponseSchema(
                persona_id=v.persona_id,
                title=v.title,
                category=v.category,
                published=v.published_kst,
                source=v.source,
                news_url=v.news_url,
                content=v.summary,
            ) for k, v in final_state.items()
        }
        return response

    except Exception as e:
        logger.exception("While running main workflow: {e}")


if __name__ == "__main__":
    asyncio.run(get_langgraph_news())