import os
import re
import json
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

from tools import tools

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.sqlite import SqliteSaver

Path("data").mkdir(exist_ok=True)

ALLOWED_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash"]
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

SYSTEM_PROMPT = """
You are a helpful Agentic AI assistant named GPTy.

CRITICAL RULES:
- For greetings, small talk, opinions, or general knowledge questions, respond directly. Do NOT call any tool.
- Example: user says "hi", "how are you", "what's the capital of France" → answer directly, no tools.
- Only call search_uploaded_documents if the user's message clearly references "the document", "the file", "the PDF", "my notes", or similar.
- Only call tavily_search for time-sensitive or current-events questions.
- Only call remember_this / recall_memory when the user asks to remember or recall something.
- Only call calculator for arithmetic.
- If the user's message contains numbers and asks for a calculation, percentage,
  square root, or arithmetic result (e.g. "what's 45 times 12", "square root of 144"),
  you MUST call the calculator tool. Do not compute math yourself in your head.
If you are not sure a tool is needed, do not use one — just answer.
"""


def normalize_model_name(model_name: str | None) -> str:
    """
    Validate selected model from frontend.
    If model is missing or not allowed, fallback to DEFAULT_MODEL.
    """

    if not model_name:
        return DEFAULT_MODEL

    model_name = model_name.strip()

    if model_name not in ALLOWED_MODELS:
        return DEFAULT_MODEL

    return model_name


def try_parse_fake_tool_call(content) -> dict | None:
    """
    Some Ollama models occasionally emit a tool call as plain text JSON
    instead of using the real structured tool-call mechanism, e.g.:
    {"name": "tavily_search", "parameters": {"query": "news"}}

    This detects that pattern and extracts it so it can be routed
    through the real tool-execution path instead of leaking to the user.
    """

    if not isinstance(content, str) or not content.strip():
        return None

    match = re.search(
        r'\{.*"name"\s*:\s*".+?".*"parameters"\s*:\s*\{.*?\}\s*\}',
        content,
        re.DOTALL
    )

    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None

    if "name" in parsed and "parameters" in parsed:
        return parsed

    return None


def build_agent(model_name: str):
    """
    Build one LangGraph agent for a selected model.
    """

    selected_model = normalize_model_name(model_name)

    llm = ChatGoogleGenerativeAI(
        model=selected_model,
        temperature=0.3,
    )

    llm_with_tools = llm.bind_tools(tools)

    def chatbot_node(state: MessagesState):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]

        response = llm_with_tools.invoke(messages)

        # Debug logging — remove once tool-calling is confirmed stable
        print("TOOL CALLS:", response.tool_calls)
        print("CONTENT:", repr(response.content))

        # Fallback: catch models that emit a tool call as plain text
        # instead of a real structured tool call
        if not response.tool_calls:
            fake_call = try_parse_fake_tool_call(response.content)

            if fake_call:
                response.tool_calls = [{
                    "name": fake_call["name"],
                    "args": fake_call.get("parameters", {}),
                    "id": "manual_fix_1",
                    "type": "tool_call"
                }]
                response.content = ""

        return {
            "messages": [response]
        }

    tool_node = ToolNode(tools)

    workflow = StateGraph(MessagesState)

    workflow.add_node("chatbot", chatbot_node)
    workflow.add_node("tools", tool_node)

    workflow.add_edge(START, "chatbot")
    workflow.add_conditional_edges("chatbot", tools_condition)
    workflow.add_edge("tools", "chatbot")

    conn = sqlite3.connect(
        "data/langgraph_checkpoints.sqlite",
        check_same_thread=False
    )

    checkpointer = SqliteSaver(conn)

    return workflow.compile(checkpointer=checkpointer)


_AGENT_CACHE = {}


def get_agent(model_name: str | None = None):
    """
    Return cached LangGraph agent for selected model.
    If not created yet, create it once and reuse it.
    """

    selected_model = normalize_model_name(model_name)

    if selected_model not in _AGENT_CACHE:
        _AGENT_CACHE[selected_model] = build_agent(selected_model)

    return _AGENT_CACHE[selected_model]
