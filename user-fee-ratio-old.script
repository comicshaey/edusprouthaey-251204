
//  원단위 절삭
// -----------------------------
function round10(v) {
  const n = Number(v) || 0;
  return Math.floor(n / 10) * 10;
}

// DOM 헬퍼
function $(id) {
  return document.getElementById(id);
}

// 원화 포맷
function formatWon(v) {
  if (isNaN(v)) return "0원";
  return v.toLocaleString("ko-KR") + "원";
}

// -----------------------------
//  비율 설정
// -----------------------------

// 국민연금 9% (기관:개인 1:1)
const R_PENSION_EMP = 0.045;
const R_PENSION_ORG = 0.045;

// 건강보험 7.09% (기관:개인 1:1)
const R_HEALTH_EMP = 0.03545;
const R_HEALTH_ORG = 0.03545;

// 장기요양보험 (건강보험료의 12.95%)
const R_LONGTERM_EMP = 0.1295;
const R_LONGTERM_ORG = 0.1295;

// 고용보험
const R_EMPLOY_EMP = 0.009;
const R_EMPLOY_ORG = 0.0175;

// 산재보험
const R_ACCIDENT_ORG = 0.00966;

// ★ 통상임금 반영 가정 버전 (과거에 쓰던 값)
const R_RETIRE = 1 / 12;     // DC형 퇴직연금
const R_ANNUAL_LEAVE = 0.12; // 연차 미사용 수당 증가분

// -----------------------------
//  순환식 근사 계산
// -----------------------------
function calcCoachDistribution(studentCount, unitFee) {

  const totalCollectedRaw = studentCount * unitFee;

  if (studentCount <= 0 || unitFee <= 0) {
    return {
      totalCollected: 0,
      netPay: 0,
      pensionEmp: 0,
      pensionOrg: 0,
      healthEmp: 0,
      healthOrg: 0,
      longtermEmp: 0,
      longtermOrg: 0,
      employEmp: 0,
      employOrg: 0,
      accidentOrg: 0,
      retirement: 0,
      annualLeave: 0,
      sumEmp: 0,
      sumOrg: 0,
      totalDeductions: 0,
      iterations: 0
    };
  }

  const totalCollected = round10(totalCollectedRaw);

  // 처음엔 "대충 절반 정도 받겠지" 하고 던져놓고 시작
  let netPay = totalCollected * 0.6;
  let lastNetPay = 0;

  const maxIter = 80;
  const tolerance = 10;

  let iterations = 0;

  let pensionEmp, pensionOrg;
  let healthEmp, healthOrg;
  let longtermEmp, longtermOrg;
  let employEmp, employOrg;
  let accidentOrg;
  let retirement;
  let annualLeave;
  let sumEmp, sumOrg;
  let totalDeductions;

  for (let i = 0; i < maxIter; i++) {
    iterations = i + 1;

    const base = netPay; // 기준 보수월액이라고 생각

    // 국민연금
    pensionEmp = round10(base * R_PENSION_EMP);
    pensionOrg = round10(base * R_PENSION_ORG);

    // 건강보험
    healthEmp = round10(base * R_HEALTH_EMP);
    healthOrg = round10(base * R_HEALTH_ORG);

    // 장기요양 (건보 기준)
    longtermEmp = round10(healthEmp * R_LONGTERM_EMP);
    longtermOrg = round10(healthOrg * R_LONGTERM_ORG);

    // 고용보험
    employEmp = round10(base * R_EMPLOY_EMP);
    employOrg = round10(base * R_EMPLOY_ORG);

    // 산재
    accidentOrg = round10(base * R_ACCIDENT_ORG);

    // ★ 여기서부터 “이전 버전”의 핵심
    retirement = round10(base * R_RETIRE);
    annualLeave = round10(base * R_ANNUAL_LEAVE);

    // 개인 부담 합계
    sumEmp =
      pensionEmp +
      healthEmp +
      longtermEmp +
      employEmp;

    // 기관 부담 합계 (사회보험 + 산재 + 퇴직 + 연차)
    sumOrg =
      pensionOrg +
      healthOrg +
      longtermOrg +
      employOrg +
      accidentOrg +
      retirement +
      annualLeave;

    // 총 공제
    totalDeductions = round10(sumEmp + sumOrg);

    // 새 실수령액 업데이트
    lastNetPay = netPay;
    netPay = round10(totalCollected - totalDeductions);

    if (Math.abs(netPay - lastNetPay) < tolerance) break;
  }

  return {
    totalCollected,
    netPay,
    pensionEmp,
    pensionOrg,
    healthEmp,
    healthOrg,
    longtermEmp,
    longtermOrg,
    employEmp,
    employOrg,
    accidentOrg,
    retirement,
    annualLeave,
    sumEmp,
    sumOrg,
    totalDeductions,
    iterations
  };
}

// -----------------------------
//  화면 갱신
// -----------------------------
function updateView(result) {
  $("totalCollected").textContent = formatWon(result.totalCollected);

  $("pensionEmp").textContent = formatWon(result.pensionEmp);
  $("pensionOrg").textContent = formatWon(result.pensionOrg);

  $("healthEmp").textContent = formatWon(result.healthEmp);
  $("healthOrg").textContent = formatWon(result.healthOrg);

  $("longtermEmp").textContent = formatWon(result.longtermEmp);
  $("longtermOrg").textContent = formatWon(result.longtermOrg);

  $("employEmp").textContent = formatWon(result.employEmp);
  $("employOrg").textContent = formatWon(result.employOrg);

  $("accidentOrg").textContent = formatWon(result.accidentOrg);

  $("retirement").textContent = formatWon(result.retirement);
  $("annualLeave").textContent = formatWon(result.annualLeave);

  $("sumEmp").textContent = formatWon(result.sumEmp);
  $("sumOrg").textContent = formatWon(result.sumOrg);

  $("totalDeductions").textContent = formatWon(result.totalDeductions);
  $("netPay").textContent = formatWon(result.netPay);

  $("iterInfo").textContent =
    result.iterations > 0
      ? `반복 계산 ${result.iterations}회 수행 (10원 단위 수렴)`
      : "계산하기 버튼 눌러야 결과 나옴";
}

// -----------------------------
//  버튼 이벤트
// -----------------------------
function handleCalculate() {
  const students = parseInt($("students").value || "0", 10);
  const unitFee = parseInt($("unitFee").value || "0", 10);

  const result = calcCoachDistribution(students, unitFee);
  updateView(result);
}
