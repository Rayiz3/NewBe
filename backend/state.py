###  defines state variables of langgraph  ###

from typing import Annotated, Any
from pydantic import BaseModel, ConfigDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class NewState(BaseModel):
    # aribitrary_types_allowed : allow to use type that is not defined in pydantic
    # in this case, BaseMessage
    model_config = ConfigDict(arbitrary_types_allowed=True)

    messages         : Annotated[list[BaseMessage], add_messages] = []
    raw_news         : list[dict[str, Any]]                       = []
    summarized_news  : list[dict[str, Any]]                       = []
    categorized_news : dict[str, list[dict[str, Any]]]            = {}
    final_report     : str                                        = ""
    error_log        : list[str]                                  = []