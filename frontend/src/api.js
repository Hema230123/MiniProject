const BASE = (process.env.REACT_APP_API_BASE || "http://localhost:8000").replace(/\/$/, "");

export async function interpret(payload){
  const r = await fetch(`${BASE}/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
