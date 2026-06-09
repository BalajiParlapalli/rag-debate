import time
from retriever import retrieve
from agents import pro_agent, anti_agent, cross_exam_agent, judge_agent

def run_debate(question: str) -> dict:
    pro_ev = retrieve(question, "pro")
    anti_ev = retrieve(question, "anti")

    pro_arg = pro_agent(question, pro_ev)
    time.sleep(2)
    anti_arg = anti_agent(question, anti_ev)
    time.sleep(2)
    cross = cross_exam_agent(pro_arg, anti_arg, pro_ev, anti_ev)
    time.sleep(2)
    verdict = judge_agent(question, pro_arg, anti_arg, cross, pro_ev, anti_ev)

    return {
        "question": question,
        "pro": {"argument": pro_arg, "evidence": pro_ev},
        "anti": {"argument": anti_arg, "evidence": anti_ev},
        "cross_exam": cross,
        "verdict": verdict,
    }