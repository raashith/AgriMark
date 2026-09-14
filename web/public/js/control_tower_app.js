async function runDecisionEngine() {
  const out = document.getElementById("decision-output");
  out.innerHTML = "Synthesizing unified decision...";
  try {
    const res = await fetch("/api/v1/unified/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop_name: "Paddy", district: "Thanjavur" })
    });
    const card = await res.json();
    out.innerHTML = `<div style="background:#090d16; padding:12px; border-radius:6px; font-size:0.9rem;">` +
                    `<strong>Recommendation:</strong> ${card.recommendation}<br><br>` +
                    `<strong>Evidence:</strong> <span class="badge">${card.evidence_status}</span> (${(card.confidence_score * 100).toFixed(0)}% Confidence)<br><br>` +
                    `<strong>Benefit:</strong> ${card.expected_benefit}</div>`;
  } catch (err) {
    out.innerHTML = "<span style='color:#ef4444'>Error synthesizing decision</span>";
  }
}

async function checkProviders() {
  const out = document.getElementById("provider-output");
  out.innerHTML = "Checking provider health...";
  try {
    const res = await fetch("/api/v1/unified/providers");
    const providers = await res.json();
    let html = "<ul>";
    providers.forEach(p => {
      html += `<li><strong>${p.name}</strong> (${p.category}): <span style="color:#10b981">${p.status}</span><br>` +
              `Fallback: ${p.fallback_strategy}</li><br>`;
    });
    html += "</ul>";
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = "<span style='color:#ef4444'>Error fetching providers</span>";
  }
}
