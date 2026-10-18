/* ===== POLL: one vote per browser (demo) ===== */

const POLL_KEY = "cvlis_poll";
let votes = POLL_OPTIONS.map(() => 0);
let hasVoted = false;

function loadPoll() {
  const saved = readStore(POLL_KEY, null);
  if (saved && saved.q === POLL_QUESTION && Array.isArray(saved.votes) &&
      saved.votes.length === POLL_OPTIONS.length) {
    votes = saved.votes;
    hasVoted = !!saved.hasVoted;
  }
}

function savePoll() {
  writeStore(POLL_KEY, { q: POLL_QUESTION, votes, hasVoted });
}

function renderPoll() {
  const total = votes.reduce((a, b) => a + b, 0) || 1;
  $("#poll").innerHTML = `<p>${POLL_QUESTION}</p>` + POLL_OPTIONS.map((option, i) => {
    const pct = Math.round((votes[i] / total) * 100);
    return `
      <div>${option} ${hasVoted ? `(${pct}%)` : ""}</div>
      <div class="bar"><i style="width:${hasVoted ? pct : 0}%"></i></div>
      ${hasVoted ? "" : `<button class="out" style="color:var(--ink);margin-bottom:8px;padding:5px 12px" onclick="vote(${i})">Vote</button>`}`;
  }).join("");
}

function vote(index) {
  if (hasVoted) return;
  votes[index]++;
  hasVoted = true;
  savePoll();
  renderPoll();
}

loadPoll();