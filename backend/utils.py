from ranges import RANGES

def get_limits(code, sex=None):
    r = RANGES.get(code)
    if not r: return None
    def pick(k):
        if sex and f"{k}_{sex}" in r:
            return r[f"{k}_{sex}"]
        return r.get(k)
    return {
        "min": pick("normal_min"),
        "max": pick("normal_max"),
        "bmax": r.get("borderline_max"),
        "unit": r.get("unit"),
    }

def classify_value(code, value, sex=None):
    lim = get_limits(code, sex)
    if not lim: return {"status":"unknown"}
    lo, hi, bmax = lim["min"], lim["max"], lim["bmax"]
    if lo is None and hi is not None:
        if value <= hi: return {"status":"normal"}
        if bmax and value <= bmax: return {"status":"borderline"}
        return {"status":"high"}
    if hi is None and lo is not None:
        if value >= lo: return {"status":"normal"}
        return {"status":"low"}
    if lo is not None and hi is not None:
        if lo <= value <= hi: return {"status":"normal"}
        if value < lo: return {"status":"low"}
        if bmax and value <= bmax: return {"status":"borderline"}
        return {"status":"high"}
    return {"status":"unknown"}
