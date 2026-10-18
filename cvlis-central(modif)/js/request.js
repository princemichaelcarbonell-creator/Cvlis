/* ===== DOCUMENT REQUEST: builds an email to the registrar ===== */

function sendRequest() {
  const val = (id) => $(id).value.trim();
  if (!val("#rName") || !val("#rLrn") || !val("#rEmail")) {
    alert("Please fill in name, LRN and email.");
    return;
  }
  const body = [
    `Name: ${val("#rName")}`,
    `LRN: ${val("#rLrn")}`,
    `Email: ${val("#rEmail")}`,
    `Document: ${$("#rDoc").value}`,
    `Purpose: ${val("#rPurpose")}`
  ].join("\n");
  const subject = "Document Request: " + $("#rDoc").value;
  location.href = `mailto:${REGISTRAR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initRequest() {
  $("#sendReq").onclick = sendRequest;
}