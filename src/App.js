import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const referenceRanges = {
  Hemoglobin: { low: 12, high: 16, explanation: "Low hemoglobin may cause tiredness, weakness." },
  HbA1c: { low: 4, high: 5.6, explanation: "HbA1c indicates blood sugar control over months." },
  LDL: { low: 0, high: 100, explanation: "LDL cholesterol (bad cholesterol)." },
  HDL: { low: 40, high: 60, explanation: "HDL cholesterol (good cholesterol)." },
  WBC: { low: 4000, high: 11000, explanation: "White blood cells help fight infection." }
};

function App() {
  const [parameter, setParameter] = useState("");
  const [value, setValue] = useState("");
  const [reportData, setReportData] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [audioMode, setAudioMode] = useState(false);

  // Load glossary & saved reports on mount
  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    setSavedReports(reports);
  }, []);

  // Save reports to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("reports", JSON.stringify(savedReports));
  }, [savedReports]);

  const addParameter = () => {
    if (!parameter || isNaN(parseFloat(value))) {
      alert("Please enter valid parameter and value.");
      return;
    }
    const newData = [
      ...reportData,
      { parameter, value: parseFloat(value), date: new Date().toISOString() }
    ];
    setReportData(newData);
    setParameter("");
    setValue("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const rows = evt.target.result.split("\n");
      const newEntries = rows
        .map((row) => {
          const [param, val] = row.split(",");
          if (param && !isNaN(parseFloat(val))) {
            return {
              parameter: param.trim(),
              value: parseFloat(val),
              date: new Date().toISOString()
            };
          }
          return null;
        })
        .filter(Boolean);
      setReportData((prev) => [...prev, ...newEntries]);
    };
    reader.readAsText(file);
  };

  const saveReport = () => {
    setSavedReports([...savedReports, reportData]);
    alert("Report saved!");
  };

  const seedReports = () => {
    const sample1 = [
      { parameter: "Hemoglobin", value: 11, date: new Date().toISOString() },
      { parameter: "HbA1c", value: 6.2, date: new Date().toISOString() }
    ];
    const sample2 = [
      { parameter: "LDL", value: 130, date: new Date().toISOString() },
      { parameter: "HDL", value: 35, date: new Date().toISOString() }
    ];
    setSavedReports([sample1, sample2]);
  };

  const toggleAudio = () => {
    setAudioMode(!audioMode);
    alert("Audio mode " + (!audioMode ? "ON" : "OFF"));
  };

  const getStatus = (param, val) => {
    const ref = referenceRanges[param];
    if (!ref) return { status: "Unknown", className: "", explanation: "No info available." };
    if (val < ref.low) return { status: "Low", className: "abnormal", explanation: ref.explanation };
    if (val > ref.high) return { status: "High", className: "abnormal", explanation: ref.explanation };
    return { status: "Normal", className: "normal", explanation: "Within healthy range." };
  };

  // Charts data
  const barData = {
    labels: reportData.map((r) => r.parameter),
    datasets: [
      {
        label: "Your Value",
        data: reportData.map((r) => r.value),
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }
    ]
  };

  const lineData = {
    labels: reportData.map((r) => new Date(r.date).toLocaleString()),
    datasets: [
      {
        label: "Value Trend",
        data: reportData.map((r) => r.value),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false
      }
    ]
  };

  return (
    <div className="container">
      <h1>🩸 Blood Report Analyzer</h1>

      {/* Input Section */}
      <section className="card">
        <h2>Enter Report</h2>
        <div className="input-group">
          <label>Parameter:</label>
          <input
            type="text"
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            placeholder="e.g., Hemoglobin"
          />
        </div>
        <div className="input-group">
          <label>Value:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., 13.5"
          />
        </div>
        <button onClick={addParameter}>Add Parameter</button>
        <hr />
        <h3>Or Upload CSV</h3>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </section>

      {/* Results Section */}
      <section className="card">
        <h2>Results</h2>
        <table id="resultsTable">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Your Value</th>
              <th>Reference Range</th>
              <th>Status</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, idx) => {
              const { status, className, explanation } = getStatus(item.parameter, item.value);

              if (audioMode) {
                const msg = new SpeechSynthesisUtterance(`${item.parameter}: ${status}`);
                window.speechSynthesis.speak(msg);
              }

              return (
                <tr key={idx} className={className}>
                  <td>{item.parameter}</td>
                  <td>{item.value}</td>
                  <td>
                    {referenceRanges[item.parameter]
                      ? `${referenceRanges[item.parameter].low} - ${referenceRanges[item.parameter].high}`
                      : "N/A"}
                  </td>
                  <td>{status}</td>
                  <td>{explanation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Charts */}
      <section className="card">
        <h2>Visual Insights</h2>
        {reportData.length > 0 && <Bar data={barData} />}
        {reportData.length > 0 && <Line data={lineData} />}
      </section>

      {/* Glossary */}
      <section className="card">
        <h2>Glossary</h2>
        <div id="glossary">
          {Object.entries(referenceRanges).map(([param, ref]) => (
            <p key={param}>
              <b>{param}:</b> {ref.explanation}
            </p>
          ))}
        </div>
      </section>

      {/* Saved Reports */}
      <section className="card">
        <h2>Saved Reports</h2>
        <button onClick={saveReport}>Save Current Report</button>
        <button onClick={seedReports}>Seed Example Reports</button>
        <ul id="savedReports">
          {savedReports.map((report, idx) => (
            <li key={idx} onClick={() => setReportData(report)}>
              Report {idx + 1}
            </li>
          ))}
        </ul>
      </section>

      {/* Accessibility */}
      <section className="card">
        <h2>Accessibility</h2>
        <button onClick={toggleAudio}>🔊 Toggle Audio Mode</button>
      </section>
    </div>
  );
}

export default App;
