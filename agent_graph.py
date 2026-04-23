import os
import sqlite3
from typing import Annotated, TypedDict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage # Added for persona
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.sqlite import SqliteSaver
from tools import tools
from runtime_config import CHECKPOINTS_DB_PATH

load_dotenv()

DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

# 1. Define State
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# 2. Setup LLM & Tools
llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
    openai_api_base=DEEPSEEK_BASE_URL,
    temperature=0
)
llm_with_tools = llm.bind_tools(tools)

# 3. Define Nodes
def call_model(state: AgentState):
    """
    Node for LLM reasoning with a professional persona and structured logic.
    """
    # Define the core instructions for the AI
# 在 call_model 函数中修改 SystemMessage
    system_message = SystemMessage(content="""You are the 'U2CHAT bot', a professional stock analysis assistant.
Your goal is to provide objective and analytical financial guidance.

Core Directives:
1. Language: Respond exclusively in English.
2. Brevity & Structure: Be concise. Use clear headings (###), bullet points, and short paragraphs. Avoid "walls of text".
3. Clean Formatting: Strictly DO NOT use double asterisks (**) for emphasis within sentences or around single words. Use standard Markdown headers for organization only.
4. Data Visualization: Whenever analyzing a stock (e.g., K-line trends, price history), you MUST provide the data in a structured JSON block wrapped in ```json-chart``` tags.
   Format:
   ```json-chart
   {
     "type": "line",
     "title": "Title of the Chart",
     "labels": ["Jan", "Feb", "Mar"],
     "data": [100, 120, 110]
   }
   ```
   Supported types: "line", "bar". Ensure 'labels' and 'data' arrays have the same length.

Response Template:
### Market Overview: (1-2 sentences on current status)
### Key Data: (Include the json-chart block here if applicable, or a Markdown Table)
### Technical Analysis: (Brief bullet points on trends/indicators)
### Visual Trend: (A simple ASCII-based visual or directional emoji chart)

Tone: Professional, objective, and analytical.""")
    
    # Inject the system message at the start of the conversation
    messages = [system_message] + state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def route_logic(state: AgentState):
    """Router to decide if tools are needed."""
    last_msg = state["messages"][-1]
    return "tools_executor" if last_msg.tool_calls else END

# 4. Persistence Setup
# Connection remains open for the lifecycle of the app
conn = sqlite3.connect(str(CHECKPOINTS_DB_PATH), check_same_thread=False)
memory = SqliteSaver(conn)

# 5. Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("llm_reasoning", call_model)
workflow.add_node("tools_executor", ToolNode(tools))

workflow.set_entry_point("llm_reasoning")
workflow.add_conditional_edges("llm_reasoning", route_logic)
workflow.add_edge("tools_executor", "llm_reasoning")

# 6. Compile with Checkpointer
stock_agent_app = workflow.compile(checkpointer=memory)
