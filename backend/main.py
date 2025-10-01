from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from schema import InterpretRequest, InterpretResult
from utils import classify_value, get_limits
from explain import explain_param, status_to_icon

app = FastAPI(title="Blood Report Analyzer - Phase 1 (Manual Only)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

def range_text(code, sex):
    lim = get_limits(code, sex)
    if not lim: return "Reference range unavailable"
    lo, hi, unit = lim["min"], lim["max"], lim["unit"]
    if lo is not None and hi is not None: return f"{lo}–{hi} {unit}"
    if lo is not None: return f"≥ {lo} {unit}"
    if hi is not None: return f"≤ {hi} {unit}"
    return unit or ""

@app.post("/interpret")
def interpret(req: InterpretRequest) -> List[InterpretResult]:
    out = []
    sex = req.meta.sex
    for code, val in req.fields.items():
        cls = classify_value(code, val, sex)
        s = cls["status"]
        lim = get_limits(code, sex) or {}
        unit = lim.get("unit", "")
        msg = explain_param(code, s)
        out.append(InterpretResult(
            code=code, value=val, unit=unit, status=s,
            icon=status_to_icon(s),
            range_text=range_text(code, sex),
            message=msg
        ))
    return out
