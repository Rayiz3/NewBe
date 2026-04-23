from typing import Annotated, Any
from pydantic import BaseModel, ConfigDict, Field
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class RawNewsState(BaseModel):
    persona_id      : str = ""
    title           : str = ""
    category        : str = ""
    published_kst   : str = ""
    source          : str = ""
    google_news_url : str = ""
    news_url        : str = ""
    content         : str = ""

class SummarizedNewsState(RawNewsState):
    summary     : str = ""

class GraphState(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    messages         : Annotated[list[BaseMessage], add_messages] = Field(default_factory=list)
    raw_news         : dict[str, RawNewsState]                    = Field(default_factory=dict)
    summarized_news  : dict[str, SummarizedNewsState]             = Field(default_factory=dict)
    error_log        : list[str]                                  = []