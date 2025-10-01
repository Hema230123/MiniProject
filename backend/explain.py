def status_to_icon(s): return {"normal":"✅","borderline":"⚠️","high":"🔴","low":"🔴"}.get(s,"⚠️")

MAP = {
  "HBA1C": {
    "normal":"HbA1c is in the healthy range.",
    "borderline":"HbA1c is in prediabetic range; lifestyle changes can help.",
    "high":"HbA1c suggests diabetes risk; consult your doctor.",
    "low":"HbA1c is unusually low; check with your doctor if symptomatic."
  },
  "HB": {
    "normal":"Hemoglobin looks fine.",
    "low":"Low hemoglobin → possible anemia; can cause tiredness/weakness.",
    "high":"High hemoglobin may indicate dehydration or other causes."
  },
  "LDL": {
    "normal":"LDL is within recommended range.",
    "borderline":"LDL is borderline high; consider diet/exercise.",
    "high":"LDL is high; discuss heart-risk reduction with your doctor."
  }
}

def explain_param(code, status):
    if code in MAP and status in MAP[code]:
        return MAP[code][status]
    default = {
      "normal":"is within the normal range.",
      "borderline":"is borderline; monitor and adjust lifestyle.",
      "high":"is above the normal range; please consult your doctor.",
      "low":"is below the normal range; please consult your doctor."
    }
    return f"This value {default.get(status,'needs review')}"
