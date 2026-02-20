function byId(id) {
  return document.getElementById(id);
}

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
  for (let i = 1; i <= 9; i += 1) {
    rate.innerHTML += `<option value="${i}">+${i}</option>`;
  }

  const resist = byId("attributeResistanceStage");
  resist.innerHTML = "";
  for (let i = -4; i <= 9; i += 1) {
    const label = i > 0 ? `+${i}` : String(i);
    const selected = i === 0 ? " selected" : "";
    resist.innerHTML += `<option value="${i}"${selected}>${label}</option>`;
  }

  const status = byId("attributeStatusStage");
  status.innerHTML = '<option value="none" selected>無し</option>';
  for (let i = 1; i <= 9; i += 1) {
    status.innerHTML += `<option value="${i}">+${i}</option>`;
  }
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

function setToggleLabel(toggleId, expanded) {
  byId(toggleId).textContent = expanded
    ? "-----その他の詳細を格納▲-----"
    : "-----その他の詳細入力▼-----";
}

function updateModeVisibility() {
  const mode = getDamageType();
  document.querySelectorAll(".physical-only").forEach((el) => {
    el.classList.toggle("hidden", mode !== "打撃");
  });
  document.querySelectorAll(".attribute-only").forEach((el) => {
    el.classList.toggle("hidden", mode !== "特技(全体属性)");
  });
}

function toggleDetails(panelKey, forceExpanded) {
  const mode = getDamageType();
  const isAttacker = panelKey === "attacker";
  const physicalDetails = byId(`${panelKey}PhysicalDetails`);
  const attributeDetails = byId(`${panelKey}AttributeDetails`);
  const toggleId = `${panelKey}DetailsToggle`;

  const expanded = typeof forceExpanded === "boolean"
    ? forceExpanded
    : byId(toggleId).dataset.expanded !== "true";

  byId(toggleId).dataset.expanded = expanded ? "true" : "false";
  setToggleLabel(toggleId, expanded);

  if (!expanded) {
    physicalDetails.classList.add("hidden");
    attributeDetails.classList.add("hidden");
    return;
  }

  if (mode === "打撃") {
    physicalDetails.classList.remove("hidden");
    attributeDetails.classList.add("hidden");
  } else {
    physicalDetails.classList.add("hidden");
    attributeDetails.classList.remove("hidden");
  }

  if (!isAttacker && mode === "特技(全体属性)") {
    physicalDetails.classList.remove("hidden");
  }
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

  const common = {
    jankenResult: byId("jankenResult").value,
    autoGuard: byId("autoGuard").value,
    penetration: byId("penetration").value,
    targetHp: byId("targetHp").value.trim(),
  };

  const result = damageType === "打撃"
    ? DamageCalculator.calculatePhysical({
      attackPower: byId("attackPower").value.trim(),
      attackStage: byId("attackStage").value,
      attackMultiplier: byId("attackMultiplier").value.trim(),
      hitCount: byId("hitCount").value,
      criticalCount: byId("criticalCount").value,
      defensePower: byId("defensePower").value.trim(),
      defenseStage: byId("defenseStage").value,
      ...common,
    })
    : DamageCalculator.calculateAttributeSpecial({
      attributeLevel: getAttributeLevel(),
      attributeType: byId("attributeType").value,
      skillMultiplier: byId("skillMultiplier").value.trim(),
      attributeRateStage: byId("attributeRateStage").value,
      attributeResistanceStage: byId("attributeResistanceStage").value,
      attributeStatusStage: byId("attributeStatusStage").value,
      attributeHitCount: byId("attributeHitCount").value,
      ...common,
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

  setToggleLabel("attackerDetailsToggle", false);
  setToggleLabel("defenderDetailsToggle", false);
  byId("attackerDetailsToggle").dataset.expanded = "false";
  byId("defenderDetailsToggle").dataset.expanded = "false";

  const watchIds = [
    "attackPower", "attackStage", "attackMultiplier", "hitCount", "criticalCount",
    "defensePower", "defenseStage", "jankenResult", "autoGuard", "penetration", "targetHp",
    "attributeType", "skillMultiplier", "attributeRateStage", "attributeResistanceStage",
    "attributeStatusStage", "attributeHitCount",
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

  byId("attackerDetailsToggle").addEventListener("click", () => {
    toggleDetails("attacker");
  });

  byId("defenderDetailsToggle").addEventListener("click", () => {
    toggleDetails("defender");
  });

  document.querySelectorAll('input[name="damageType"]').forEach((el) => {
    el.addEventListener("change", () => {
      updateModeVisibility();
      toggleDetails("attacker", byId("attackerDetailsToggle").dataset.expanded === "true");
      toggleDetails("defender", byId("defenderDetailsToggle").dataset.expanded === "true");
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
