function byId(id) {
  return document.getElementById(id);
}

const CLOSED_LABEL = "-----その他の詳細入力▼-----";
const OPEN_LABEL = "-----その他の詳細を格納▲-----";

function fillStageSelect(id) {
  const el = byId(id);
  for (let i = -9; i <= 9; i += 1) {
    const op = document.createElement("option");
    op.value = String(i);
    op.textContent = i > 0 ? `+${i}` : String(i);
    if (i === 0) op.selected = true;
    el.appendChild(op);
  }
}

function fillAttributeSelects() {
  const rate = byId("attributeRateStage");
  rate.innerHTML = '<option value="none" selected>無し</option>';
  for (let i = 1; i <= 9; i += 1) rate.innerHTML += `<option value="${i}">+${i}</option>`;

  const resist = byId("attributeResistanceStage");
  resist.innerHTML = "";
  for (let i = -4; i <= 9; i += 1) {
    const label = i > 0 ? `+${i}` : String(i);
    const selected = i === 0 ? " selected" : "";
    resist.innerHTML += `<option value="${i}"${selected}>${label}</option>`;
  }

  const status = byId("attributeStatusStage");
  status.innerHTML = '<option value="none" selected>無し</option>';
  for (let i = 1; i <= 9; i += 1) status.innerHTML += `<option value="${i}">+${i}</option>`;
}

function syncCriticalCountOptions() {
  const hitCount = Number.parseInt(byId("hitCount").value, 10);
  const criticalEl = byId("criticalCount");
  const previous = Number.parseInt(criticalEl.value || "0", 10);

  criticalEl.innerHTML = "";
  for (let i = 0; i <= hitCount; i += 1) {
    const op = document.createElement("option");
    op.value = String(i);
    op.textContent = `${i}回`;
    criticalEl.appendChild(op);
  }

  const safeValue = Math.min(previous, hitCount);
  criticalEl.value = String(Number.isNaN(safeValue) ? 0 : safeValue);
}

function updateAttributeLabels() {
  const attr = byId("attributeType").value;
  byId("attributeRateLabel").childNodes[0].textContent = `${attr}属性倍率`;
  byId("attributeResistLabel").childNodes[0].textContent = `${attr}属性耐性`;
  byId("attributeStatusLabel").childNodes[0].textContent = `${attr}属性状態異常`;
}

function getDamageType() {
  const checked = document.querySelector('input[name="damageType"]:checked');
  return checked ? checked.value : "打撃";
}

function getAttributeLevel() {
  const checked = document.querySelector('input[name="attributeLevel"]:checked');
  return checked ? checked.value : "50";
}

function updateModeVisibility() {
  const mode = getDamageType();
  document.querySelectorAll(".physical-only").forEach((el) => el.classList.toggle("hidden", mode !== "打撃"));
  document.querySelectorAll(".attribute-only").forEach((el) => el.classList.toggle("hidden", mode !== "特技(全体属性)"));
}

function setupDetailToggle(buttonId, detailId) {
  const button = byId(buttonId);
  const detail = byId(detailId);
  button.textContent = CLOSED_LABEL;
  detail.classList.add("hidden");

  button.addEventListener("click", () => {
    detail.classList.toggle("hidden");
    button.textContent = detail.classList.contains("hidden") ? CLOSED_LABEL : OPEN_LABEL;
  });
}

function renderResult(result) {
  const output = byId("output");
  if (result.error) {
    output.innerHTML = `<p class="error">${result.error}</p>`;
    return;
  }

  const hpBlock = result.remainingHp
    ? `
      <h4>残りHP</h4>
      <ul>
        <li>平均残りHP: ${result.remainingHp.avg.toFixed(4)}</li>
        <li>上限残りHP: ${result.remainingHp.max}</li>
        <li>下限残りHP: ${result.remainingHp.min}</li>
      </ul>
    `
    : "";

  output.innerHTML = `
    <section>
      <h3>ダメージ計算結果</h3>
      <ul>
        <li>平均ダメージ: ${result.total.avg.toFixed(4)}</li>
        <li>下限ダメージ: ${result.total.min}</li>
        <li>上限ダメージ: ${result.total.max}</li>
      </ul>
      ${hpBlock}
    </section>
  `;
}

function recalculate() {
  const damageType = getDamageType();

  const result = damageType === "打撃"
    ? DamageCalculator.calculatePhysical({
      attackPower: byId("attackPower").value.trim(),
      attackStage: byId("attackStage").value,
      attackMultiplier: byId("attackMultiplier").value.trim(),
      hitCount: byId("hitCount").value,
      criticalCount: byId("criticalCount").value,
      defensePower: byId("defensePower").value.trim(),
      defenseStage: byId("defenseStage").value,
      jankenResult: byId("jankenResult").value,
      autoGuard: byId("autoGuard").value,
      penetration: byId("penetration").value,
      targetHp: byId("targetHp").value.trim(),
    })
    : DamageCalculator.calculateAttributeSpecial({
      attributeLevel: getAttributeLevel(),
      attributeType: byId("attributeType").value,
      skillMultiplier: byId("skillMultiplier").value.trim(),
      attributeRateStage: byId("attributeRateStage").value,
      attributeResistanceStage: byId("attributeResistanceStage").value,
      attributeStatusStage: byId("attributeStatusStage").value,
      attributeHitCount: byId("attributeHitCount").value,
      jankenResult: byId("jankenResultAttr").value,
      autoGuard: byId("autoGuardAttr").value,
      penetration: byId("penetrationAttr").value,
      targetHp: byId("targetHpAttr").value.trim(),
    });

  renderResult(result);
}

function main() {
  fillStageSelect("attackStage");
  fillStageSelect("defenseStage");
  fillAttributeSelects();
  syncCriticalCountOptions();
  updateModeVisibility();
  updateAttributeLabels();

  setupDetailToggle("attackerPhysicalToggle", "attackerPhysicalDetails");
  setupDetailToggle("attackerAttributeToggle", "attackerAttributeDetails");
  setupDetailToggle("defenderPhysicalToggle", "defenderPhysicalDetails");
  setupDetailToggle("defenderAttributeToggle", "defenderAttributeDetails");

  const watchIds = [
    "attackPower", "attackStage", "attackMultiplier", "hitCount", "criticalCount",
    "defensePower", "defenseStage", "jankenResult", "autoGuard", "penetration", "targetHp",
    "attributeType", "skillMultiplier", "attributeRateStage", "attributeResistanceStage",
    "attributeStatusStage", "attributeHitCount", "jankenResultAttr", "autoGuardAttr",
    "penetrationAttr", "targetHpAttr",
  ];

  watchIds.forEach((id) => {
    const el = byId(id);
    el.addEventListener("input", recalculate);
    el.addEventListener("change", recalculate);
  });

  byId("hitCount").addEventListener("change", () => {
    syncCriticalCountOptions();
    recalculate();
  });

  document.querySelectorAll('input[name="damageType"]').forEach((el) => {
    el.addEventListener("change", () => {
      updateModeVisibility();
      recalculate();
    });
  });

  document.querySelectorAll('input[name="attributeLevel"]').forEach((el) => {
    el.addEventListener("change", recalculate);
  });

  byId("attributeType").addEventListener("change", () => {
    updateAttributeLabels();
    recalculate();
  });

  recalculate();
}

document.addEventListener("DOMContentLoaded", main);
