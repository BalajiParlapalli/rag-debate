import os, json, re
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

def call_gemini(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )
    return response.text

def extract_sides(question: str) -> tuple:
    """Extract FOR and AGAINST labels from question like 'A vs B' or 'Should X'"""
    q = question.strip()
    for sep in [" vs ", " versus ", " or "]:
        if sep in q.lower():
            parts = re.split(sep, q, flags=re.IGNORECASE, maxsplit=1)
            if len(parts) == 2:
                return parts[0].strip(), parts[1].strip()
    return "For", "Against"

def pro_agent(question, evidence):
    for_label, _ = extract_sides(question)
    if evidence:
        ev = "\n".join([f"[{e['id']}] ({e['source']}): {e['text']}" for e in evidence])
        evidence_section = f"Use ONLY this evidence. Every claim must cite a [chunk_id].\n\nEVIDENCE:\n{ev}"
    else:
        evidence_section = "No documents uploaded. Use your general knowledge. Be factual."

    return call_gemini(f"""You argue FOR "{for_label}" in this debate: "{question}"
{evidence_section}

Write a strong opening argument (3-4 paragraphs).""")

def anti_agent(question, evidence):
    _, against_label = extract_sides(question)
    if evidence:
        ev = "\n".join([f"[{e['id']}] ({e['source']}): {e['text']}" for e in evidence])
        evidence_section = f"Use ONLY this evidence. Every claim must cite a [chunk_id].\n\nEVIDENCE:\n{ev}"
    else:
        evidence_section = "No documents uploaded. Use your general knowledge. Be factual."

    return call_gemini(f"""You argue FOR "{against_label}" in this debate: "{question}"
{evidence_section}

Write a strong opposing argument (3-4 paragraphs).""")

def cross_exam_agent(pro_arg, anti_arg, pro_ev, anti_ev):
    p = "\n".join([f"[{e['id']}]: {e['text']}" for e in pro_ev]) if pro_ev else "General knowledge used."
    a = "\n".join([f"[{e['id']}]: {e['text']}" for e in anti_ev]) if anti_ev else "General knowledge used."
    result = call_gemini(f"""You are a cross-examiner. Find weaknesses and uncited claims.

SIDE A ARGUMENT: {pro_arg}
SIDE B ARGUMENT: {anti_arg}
SIDE A EVIDENCE: {p}
SIDE B EVIDENCE: {a}

Respond ONLY with JSON, no markdown:
{{"attack_on_pro": ["..."], "attack_on_anti": ["..."]}}""")
    try:
        return json.loads(re.sub(r"```json|```", "", result).strip())
    except:
        return {"attack_on_pro": [result], "attack_on_anti": []}

def judge_agent(question, pro_arg, anti_arg, cross, pro_ev, anti_ev):
    result = call_gemini(f"""You are a neutral judge for: "{question}"

SIDE A: {pro_arg}
SIDE B: {anti_arg}
CROSS-EXAM: {cross}

Score each side 1-10 on: groundedness, evidence_diversity, contradiction_handling, persuasiveness.
Respond ONLY with JSON, no markdown:
{{"pro_scores":{{...}}, "anti_scores":{{...}}, "winner":"Side A or Side B", "verdict":"one sentence reason"}}""")
    try:
        return json.loads(re.sub(r"```json|```", "", result).strip())
    except:
        return {"winner": "Unknown", "verdict": result, "pro_scores": {}, "anti_scores": {}}
    