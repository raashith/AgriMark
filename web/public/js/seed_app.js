async function fetchVarieties() {
  const out = document.getElementById("variety-output");
  out.innerHTML = "Fetching varieties...";
  try {
    const res = await fetch("/api/v1/seed/varieties/");
    const data = await res.json();
    let html = "<ul>";
    data.forEach(v => {
      html += `<li><strong>${v.variety_name}</strong> (${v.variety_code})<br>` +
              `Crop: ${v.crop_name} | Producer: ${v.producer_name}<br>` +
              `Expected Yield: ${v.min_yield_kg_per_acre} - ${v.max_yield_kg_per_acre} kg/acre (Non-Guaranteed) ` +
              `<span class="badge">${v.evidence_level}</span></li><br>`;
    });
    html += "</ul>";
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = "<span style='color:#ef4444'>Error loading varieties</span>";
  }
}

async function verifyBatch() {
  const batchNo = document.getElementById("batch-input").value || "BATCH-PADDY-001";
  const out = document.getElementById("auth-output");
  out.innerHTML = "Verifying batch...";
  try {
    const res = await fetch("/api/v1/seed/authenticity/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch_number: batchNo })
    });
    const data = await res.json();
    out.innerHTML = `<div style="background:#0f172a; padding:10px; border-radius:6px;">` +
                    `<strong>Batch:</strong> ${data.batch_number}<br>` +
                    `<strong>Authentic Status:</strong> ${data.is_authentic ? "VALID" : "FLAGGED"}<br>` +
                    `<strong>Risk Status:</strong> ${data.risk_status}<br>` +
                    `<strong>Certification:</strong> ${data.certification_status}</div>`;
  } catch (err) {
    out.innerHTML = "<span style='color:#ef4444'>Error verifying batch</span>";
  }
}

async function loadBioInputs() {
  const out = document.getElementById("bio-output");
  out.innerHTML = "Loading bio-products...";
  try {
    const res = await fetch("/api/v1/bioinputs/");
    const data = await res.json();
    let html = "<ul>";
    data.forEach(bp => {
      html += `<li><strong>${bp.product_name}</strong> (${bp.product_type})<br>` +
              `Manufacturer: ${bp.manufacturer}<br>` +
              `Approval Status: ${bp.approval_status}</li><br>`;
    });
    html += "</ul>";
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = "<span style='color:#ef4444'>Error loading bio-inputs</span>";
  }
}
