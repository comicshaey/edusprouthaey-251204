// =========================
// 공통 유틸
// =========================

// 숫자 변환 (비어 있으면 0)
function toNumber(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// 3자리 콤마 + " 원"
function formatWon(n) {
  return n.toLocaleString("ko-KR") + " 원";
}

// HTML 이스케이프 (이름 등에 사용)
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =========================
// 1. 월간 집계 검증
// =========================

const monthlyBtn = document.getElementById("btnVerifyMonthly");
const monthlyResetBtn = document.getElementById("btnResetMonthly");
const monthlyResultEl = document.getElementById("monthlyResult");

if (monthlyBtn) {
  monthlyBtn.addEventListener("click", () => {
    const label = document.getElementById("monthLabel").value.trim() || "해당 월 관내여비";
    const decidedTotal = toNumber(document.getElementById("decidedTotal").value);
    const halfCount = toNumber(document.getElementById("halfCount").value);
    const fullCount = toNumber(document.getElementById("fullCount").value);
    const unitHalf = toNumber(document.getElementById("unitHalf").value);
    const unitFull = toNumber(document.getElementById("unitFull").value);

    // 기본 입력 검증
    if (halfCount < 0 || fullCount < 0) {
      alert("반일/종일 건수는 0 이상으로 입력해 주세요.");
      return;
    }
    if (unitHalf <= 0 || unitFull <= 0) {
      alert("단가는 0보다 큰 값으로 입력해 주세요.");
      return;
    }
    if (decidedTotal <= 0) {
      alert("지출결의 총액을 입력해 주세요.");
      return;
    }

    const expected = halfCount * unitHalf + fullCount * unitFull;
    const diff = decidedTotal - expected;

    let statusText = "";
    let statusClass = "";
    if (diff === 0) {
      statusText = "지출결의 총액이 규정상 예상액과 일치합니다.";
      statusClass = "local-accent";
    } else if (diff > 0) {
      statusText = `지출결의 총액이 규정상 예상액보다 ${formatWon(diff)} 만큼 큽니다. (과지급 가능성)`;
      statusClass = "local-accent";
    } else {
      statusText = `지출결의 총액이 규정상 예상액보다 ${formatWon(Math.abs(diff))} 만큼 작습니다. (미지급 또는 건수 누락 가능성)`;
      statusClass = "local-accent";
    }

    monthlyResultEl.style.display = "block";
    monthlyResultEl.innerHTML = `
      <p><strong>${escapeHtml(label)} 검증 결과</strong></p>
      <div class="row between">
        <span>반일 건수 × 단가</span>
        <span>${halfCount}건 × ${formatWon(unitHalf)} = ${formatWon(halfCount * unitHalf)}</span>
      </div>
      <div class="row between">
        <span>종일 건수 × 단가</span>
        <span>${fullCount}건 × ${formatWon(unitFull)} = ${formatWon(fullCount * unitFull)}</span>
      </div>
      <hr />
      <div class="row between">
        <span><strong>규정상 예상 합계</strong></span>
        <span><strong>${formatWon(expected)}</strong></span>
      </div>
      <div class="row between">
        <span>지출결의 총액</span>
        <span>${formatWon(decidedTotal)}</span>
      </div>
      <div class="row between">
        <span>차이(지출결의 - 예상액)</span>
        <span>${formatWon(diff)}</span>
      </div>
      <p class="${statusClass}" style="margin-top:8px;">${statusText}</p>
      <p class="muted local-small">
        · 관내 왕복 2km 이상, 4시간 기준 반일/종일 정액만 고려한 결과입니다.<br />
        · 왕복 2km 이내 근거리 실비, 운전원 특례, 1일 2회 이상 출장 상한 등은 별도로 검토해야 합니다.
      </p>
    `;
  });
}

if (monthlyResetBtn) {
  monthlyResetBtn.addEventListener("click", () => {
    document.getElementById("monthLabel").value = "";
    document.getElementById("decidedTotal").value = "";
    document.getElementById("halfCount").value = "";
    document.getElementById("fullCount").value = "";
    document.getElementById("unitHalf").value = 10000;
    document.getElementById("unitFull").value = 20000;
    monthlyResultEl.style.display = "none";
    monthlyResultEl.innerHTML = "";
  });
}

// =========================
// 2. 개별 지급내역 행 단위 검증
// =========================

const detailTableBody = document.querySelector("#detailTable tbody");
const btnAddRow = document.getElementById("btnAddRow");
const btnClearRows = document.getElementById("btnClearRows");
const btnVerifyDetails = document.getElementById("btnVerifyDetails");
const detailSummaryEl = document.getElementById("detailSummary");

function rebuildRowNumbers() {
  const rows = detailTableBody.querySelectorAll("tr");
  rows.forEach((tr, idx) => {
    const noCell = tr.querySelector("td[data-type='no']");
    if (noCell) noCell.textContent = String(idx + 1);
  });
}

// 행 추가 함수
function addDetailRow(name = "", type = "half", amount = "") {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td data-type="no" style="text-align:center;"></td>
    <td>
      <input type="text" class="detail-name" placeholder="성명" value="${escapeHtml(name)}" />
    </td>
    <td>
      <select class="detail-type">
        <option value="half"${type === "half" ? " selected" : ""}>관내-반일(4시간 미만)</option>
        <option value="full"${type === "full" ? " selected" : ""}>관내-종일(4시간 이상)</option>
      </select>
    </td>
    <td>
      <input type="number" class="detail-paid numeric" min="0" step="100" placeholder="지급액" value="${amount !== "" ? escapeHtml(amount) : ""}" />
    </td>
    <td class="detail-expected numeric">-</td>
    <td class="detail-result" style="text-align:left; font-size:0.95rem;">-</td>
  `;

  detailTableBody.appendChild(row);
  rebuildRowNumbers();
}

// 초기 상태에서 행 하나 정도는 깔아두기
if (detailTableBody && detailTableBody.children.length === 0) {
  addDetailRow();
}

// 행 추가 버튼
if (btnAddRow) {
  btnAddRow.addEventListener("click", () => {
    addDetailRow();
  });
}

// 전체 행 삭제
if (btnClearRows) {
  btnClearRows.addEventListener("click", () => {
    if (!confirm("모든 행을 삭제하시겠습니까?")) {
      return;
    }
    detailTableBody.innerHTML = "";
    addDetailRow();
    detailSummaryEl.style.display = "none";
    detailSummaryEl.innerHTML = "";
  });
}

// 행 단위 검증
if (btnVerifyDetails) {
  btnVerifyDetails.addEventListener("click", () => {
    const unitHalf = toNumber(document.getElementById("detailUnitHalf").value);
    const unitFull = toNumber(document.getElementById("detailUnitFull").value);

    if (unitHalf <= 0 || unitFull <= 0) {
      alert("반일/종일 단가를 0보다 큰 값으로 입력해 주세요.");
      return;
    }

    const rows = detailTableBody.querySelectorAll("tr");
    if (rows.length === 0) {
      alert("검증할 행이 없습니다. 행을 추가해 주세요.");
      return;
    }

    let totalExpected = 0;
    let totalPaid = 0;
    let mismatchCount = 0;

    rows.forEach((tr) => {
      const nameInput = tr.querySelector(".detail-name");
      const typeSelect = tr.querySelector(".detail-type");
      const paidInput = tr.querySelector(".detail-paid");
      const expectedCell = tr.querySelector(".detail-expected");
      const resultCell = tr.querySelector(".detail-result");

      const name = (nameInput.value || "").trim();
      const type = typeSelect.value;
      const paid = toNumber(paidInput.value);

      // 지급액이 0이고 이름도 없으면 "빈 행"으로 간주하고 건너뛴다
      if (!name && paid === 0) {
        expectedCell.textContent = "-";
        resultCell.textContent = "입력 없음";
        resultCell.style.color = "#666";
        return;
      }

      const expected = type === "half" ? unitHalf : unitFull;

      expectedCell.textContent = expected ? expected.toLocaleString("ko-KR") : "-";
      totalExpected += expected;
      totalPaid += paid;

      if (paid === expected) {
        resultCell.textContent = "일치";
        resultCell.style.color = "#15803d"; // 녹색 느낌
      } else {
        mismatchCount += 1;
        const diff = paid - expected;
        const diffText =
          diff > 0
            ? `과지급 가능성: +${diff.toLocaleString("ko-KR")}원`
            : `미지급/누락 가능성: ${diff.toLocaleString("ko-KR")}원`;
        resultCell.textContent = `불일치 (${diffText})`;
        resultCell.style.color = "#b91c1c"; // 붉은색 느낌
      }
    });

    const totalDiff = totalPaid - totalExpected;

    detailSummaryEl.style.display = "block";
    detailSummaryEl.innerHTML = `
      <p><strong>행 단위 검증 요약</strong></p>
      <div class="row between">
        <span>규정상 기대 총액</span>
        <span>${formatWon(totalExpected)}</span>
      </div>
      <div class="row between">
        <span>입력된 지급액 총합</span>
        <span>${formatWon(totalPaid)}</span>
      </div>
      <div class="row between">
        <span>차이(지급합계 - 기대액)</span>
        <span>${formatWon(totalDiff)}</span>
      </div>
      <p class="local-small muted" style="margin-top:8px;">
        · 불일치 행 수: <strong>${mismatchCount}개</strong><br />
        · 나이스 원자료 엑셀 각 행의 “관내-반일/종일” 구분과 금회지급액을 그대로 입력해서, 행별로 다시 확인해 볼 수 있습니다.<br />
        · 수당·실비가 섞여 있거나, 왕복 2km 이내 근거리·운전원 특례 등은 별도 검토가 필요합니다.
      </p>
    `;
  });
}
