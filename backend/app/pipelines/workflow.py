from langchain_anthropic import AnthropicLLM
from langgraph.graph import END, StateGraph

from app.pipelines.agents.collector import RSSCollectorAgent
from app.pipelines.agents.summarizer import SummarizerAgent
from app.pipelines.states import GraphState


def create_workflow(llm: AnthropicLLM) -> StateGraph:
    # agent instances
    collector = RSSCollectorAgent()
    summarizer = SummarizerAgent(llm)

    # create graph
    workflow = StateGraph(GraphState)

    # add nodes
    workflow.add_node("collect", collector.collect_rss)
    workflow.add_node("summary", summarizer.summarize_news)

    # add edges
    workflow.set_entry_point("collect")
    workflow.add_edge("collect", "summary")
    workflow.add_edge("summary", END)

    return workflow.compile()