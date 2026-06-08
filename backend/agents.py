import os, json, re
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

def call_gemini(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )
    return response.text

def pro_agent(question, evidence):
    ev = "\n".join([f"[{e['id']}] ({e['source']}): {e['text']}" for e in evidence])
    return call_gemini(f"""You argue FOR: "{question}"
Use ONLY this evidence. Every claim must cite a [chunk_id].

EVIDENCE:
{ev}

Write a strong opening argument (3-4 paragraphs).""")

def anti_agent(question, evidence):
    ev = "\n".join([f"[{e['id']}] ({e['source']}): {e['text']}" for e in evidence])
    return call_gemini(f"""You argue AGAINST: "{question}"
Use ONLY this evidence. Every claim must cite a [chunk_id].

EVIDENCE:
{ev}

Write a strong opposing argument (3-4 paragraphs).""")

def cross_exam_agent(pro_arg, anti_arg, pro_ev, anti_ev):
    p = "\n".join([f"[{e['id']}]: {e['text']}" for e in pro_ev])
    a = "\n".join([f"[{e['id']}]: {e['text']}" for e in anti_ev])
    result = call_gemini(f"""You are a cross-examiner. Find weaknesses and uncited claims.

PRO ARGUMENT: {pro_arg}
ANTI ARGUMENT: {anti_arg}
PRO EVIDENCE: {p}
ANTI EVIDENCE: {a}

Respond ONLY with JSON, no markdown:
{{"attack_on_pro": ["..."], "attack_on_anti": ["..."]}}""")
    try:
        return json.loads(re.sub(r"```json|```", "", result).strip())
    except:
        return {"attack_on_pro": [result], "attack_on_anti": []}

def judge_agent(question, pro_arg, anti_arg, cross, pro_ev, anti_ev):
    result = call_gemini(f"""You are a neutral judge for: "{question}"

PRO: {pro_arg}
ANTI: {anti_arg}
CROSS-EXAM: {cross}

Score each side 1-10 on: groundedness, evidence_diversity, contradiction_handling, persuasiveness.
Respond ONLY with JSON, no markdown:
{{"pro_scores":{{...}}, "anti_scores":{{...}}, "winner":"Pro or Anti", "verdict":"one sentence reason"}}""")
    try:
        return json.loads(re.sub(r"```json|```", "", result).strip())
    except:
        return {"winner": "Unknown", "verdict": result, "pro_scores": {}, "anti_scores": {}}