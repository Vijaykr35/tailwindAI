import math
from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_tavily import TavilySearch
from database import save_memory, search_memory
from rag import retrieve_from_rag

import re


load_dotenv()


CURRENT_THREAD_ID = "default"


def set_current_thread_id(thread_id: str):
    global CURRENT_THREAD_ID
    CURRENT_THREAD_ID = thread_id


web_search = TavilySearch(
    max_results=5,
    topic="general",
    search_depth="advanced"
)


@tool
def calculator(expression: str) -> str:
    """
    Perform mathematical calculations. Use this tool whenever the user asks
    a math question, including arithmetic, percentages, square roots, or
    any numeric calculation — e.g. "what is 45 * 12", "square root of 144",
    "20% of 350", "2 + 2".
    Input must be a valid Python math expression (use ** for power, not ^).
    """

    try:
        clean_expr = expression.strip()

        # Strip trailing "=" or "= ?" some models append
        clean_expr = re.sub(r"=\s*\??\s*$", "", clean_expr).strip()

        # Normalize common non-Python math notation
        clean_expr = clean_expr.replace("^", "**")
        clean_expr = clean_expr.replace("x", "*")
        clean_expr = clean_expr.replace("÷", "/")

        # Handle "X% of Y" phrasing directly, since eval can't parse "%"" as "percent of"
        percent_match = re.match(
            r"^\s*([\d.]+)\s*%\s*of\s*([\d.]+)\s*$",
            clean_expr,
            re.IGNORECASE
        )
        if percent_match:
            percent, base = percent_match.groups()
            result = (float(percent) / 100) * float(base)
            return str(result)

        if not clean_expr:
            return "Calculation error: empty expression."

        # Only allow safe characters — blocks injection attempts via eval
        if not re.fullmatch(r"[0-9\.\+\-\*\/\(\)\s,a-zA-Z_]+", clean_expr):
            return "Calculation error: expression contains invalid characters."

        allowed = {
            "math": math,
            "abs": abs,
            "round": round,
            "min": min,
            "max": max,
            "sum": sum
        }

        result = eval(clean_expr, {"__builtins__": {}}, allowed)
        return str(result)

    except ZeroDivisionError:
        return "Calculation error: division by zero."

    except Exception as e:
        return f"Calculation error: {str(e)}"

@tool
def search_uploaded_documents(query: str) -> str:
    """
    Search uploaded documents for relevant information.
    Use this when the user asks about uploaded PDFs, DOCX, TXT, notes, files, or documents.
    """

    return retrieve_from_rag(
        query=query,
        thread_id=CURRENT_THREAD_ID
    )


@tool
def remember_this(memory: str) -> str:
    """
    Save an important user preference or fact into long-term memory.
    Use this when the user asks you to remember something.
    """

    return save_memory(
        thread_id=CURRENT_THREAD_ID,
        memory=memory
    )


@tool
def recall_memory(query: str) -> str:
    """
    Recall saved long-term memories about the user or this conversation.
    """

    return search_memory(
        thread_id=CURRENT_THREAD_ID,
        query=query
    )


tools = [
    calculator,
    search_uploaded_documents,
    remember_this,
    recall_memory,
    web_search

]
