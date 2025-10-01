import React, { useState } from "react";
import { interpret } from "./api";

const PARAMS = [
  ["HBA1C","%"],["GLU_FAST","mg/dL"],["HB","g/dL"],["LDL","mg/dL"],["HDL","mg/dL"],
  ["TG","mg/dL"],["TC","mg/dL"],["WBC","10^3/µL"],["PLT","10^3/µL"],["CREAT","mg/dL"]
];

export default function App(){
  const [sex, setSex] = useState("");
  const [values, setValues] = useState({});
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  const onAnalyze = async ()=>{
    const fields = Object.fromEntries(Object.entries(values).filter(([,v])=>v!=="" && v!=null));
    if(!Object.keys(fields).length) return alert("Enter at least one value.");
    setBusy(true);
    try{
      const data = await interpret({ meta:{ sex: sex || null }, fields });
      setResults(data);
    }catch(e){ console.error(e); alert("Analyze failed. Is backend running?"); }
    finally{ setBusy(false); }
  };

  const badgeClass = (s)=> s==="normal"?"ok":s==="borderline"?"warn":"bad";

  return (
    <div className="wrap">
      <h1>Blood Report Analyzer — Phase 1 (Manual)</h1>
      <p className="muted">This tool does not provide a medical diagnosis. Please consult a doctor.</p>

      <div className="card">
        <div className="row">
          <h3>Manual Entry</h3>
          <div>
            Sex:&nbsp;
            <select value={sex} onChange={(e)=>setSex(e.target.value)}>
              <option value="">—</option><option value="M">Male</option><option value="F">Female</option>
            </select>
            <button onClick={onAnalyze} disabled={busy} style={{marginLeft:8}}>
              {busy ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        <div className="grid">
          {PARAMS.map(([code,unit])=>(
            <div key={code}>
              <label htmlFor={`f_${code}`}>{code} <span className="muted">({unit})</span></label>
              <input id={`f_${code}`} type="number" step="0.01"
                value={values[code] ?? ""} placeholder="—"
                onChange={(e)=>setValues(v=>({...v, [code]: e.target.value}))}/>
            </div>
          ))}
        </div>
      </div>

      {results.map(it=>(
        <div className="card" key={it.code}>
          <div className="row">
            <div>
              <strong>{it.code}</strong> — {it.value} {it.unit}
              <div className="muted">Reference: {it.range_text}</div>
            </div>
            <div className={"badge " + badgeClass(it.status)}>
              {it.icon} {it.status.toUpperCase()}
            </div>
          </div>
          <div style={{marginTop:8}}>{it.message}</div>
        </div>
      ))}
    </div>
  );
}
