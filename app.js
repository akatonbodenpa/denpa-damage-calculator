function byId(id) { return document.getElementById(id); }
const CLOSED_LABEL = "-----その他の詳細入力▼-----";
const OPEN_LABEL = "-----その他の詳細を格納▲-----";
const ATTRS = ["火", "水", "電気", "土", "風", "氷", "闇", "光"];

const state = {
  attackers: [],
  defender: {
    defensePower: "",
    defenseStage: "0",
    autoGuard: "無し",
    targetHp: "",
    attrResistance: Object.fromEntries(ATTRS.map((a) => [a, "0"])),
    attrStatus: Object.fromEntries(ATTRS.map((a) => [a, "none"])),
  },
  toggles: {
    defenderPhysical: false,
    defenderAttribute: false,
  },
};

function defaultAttacker() {
  return {
    damageType: "打撃",
    attackPower: "",
    attackStage: "0",
    attackMultiplier: "",
    hitCount: "1",
    criticalCount: "0",
    attributeLevel: "50",
    attributeType: "火",
    skillMultiplier: "",
    attributeRateStage: "none",
    attributeHitCount: "1",
    jankenResult: "無し、あいこ",
    penetration: "無し",
    detailOpen: false,
  };
}

function stageOptions(min, max, current) {
  let html = "";
  for (let i = min; i <= max; i += 1) {
    const label = i > 0 ? `+${i}` : `${i}`;
    html += `<option value="${i}"${String(i) === String(current) ? " selected" : ""}>${label}</option>`;
  }
  return html;
}

function renderAttackers() {
  const wrap = byId("attackerList");
  wrap.innerHTML = "";

  state.attackers.forEach((a, idx) => {
    const card = document.createElement("section");
    card.className = "side-panel attacker-panel attacker-card";

    card.innerHTML = `
      <div class="attacker-head">
        <h2>攻撃する側 ${idx + 1}人目</h2>
        ${idx > 0 ? `<button type="button" class="delete-attacker" data-idx="${idx}">削除×</button>` : ""}
      </div>

      <div class="damage-type-group">
        <span>攻撃手段</span>
        <label><input type="radio" name="damageType-${idx}" value="打撃" ${a.damageType === "打撃" ? "checked" : ""}/> 打撃</label>
        <label><input type="radio" name="damageType-${idx}" value="特技(全体属性)" ${a.damageType === "特技(全体属性)" ? "checked" : ""}/> 特技(全体属性)</label>
      </div>

      ${a.damageType === "打撃" ? `
        <label>攻撃力
          <input data-field="attackPower" data-idx="${idx}" type="number" min="1" step="1" value="${a.attackPower}" />
        </label>
      ` : `
        <div class="level-radio-group">
          <span>攻撃する側のレベル</span>
          <label><input type="radio" name="attributeLevel-${idx}" value="50" ${a.attributeLevel === "50" ? "checked" : ""}/>50レベル</label>
          <label><input type="radio" name="attributeLevel-${idx}" value="100" ${a.attributeLevel === "100" ? "checked" : ""}/>100レベル</label>
        </div>
        <label>属性
          <select data-field="attributeType" data-idx="${idx}">${ATTRS.map((x)=>`<option ${x===a.attributeType?"selected":""}>${x}</option>`).join("")}</select>
        </label>
      `}

      <button type="button" class="detail-toggle" data-toggle-idx="${idx}">${a.detailOpen ? OPEN_LABEL : CLOSED_LABEL}</button>
      <div class="${a.detailOpen ? "" : "hidden"}">
        ${a.damageType === "打撃" ? `
          <label>攻撃力のバフ、デバフ状態
            <select data-field="attackStage" data-idx="${idx}">${stageOptions(-9, 9, a.attackStage)}</select>
          </label>
          <label>攻撃倍率+値（未入力なら等倍）
            <input data-field="attackMultiplier" data-idx="${idx}" type="number" step="0.01" placeholder="デカグロのみの例 : 0.7" value="${a.attackMultiplier}" />
          </label>
          <div class="inline-two">
            <label>攻撃ヒット数
              <select data-field="hitCount" data-idx="${idx}">
                <option value="1" ${a.hitCount==="1"?"selected":""}>1回</option>
                <option value="2" ${a.hitCount==="2"?"selected":""}>2回</option>
                <option value="3" ${a.hitCount==="3"?"selected":""}>3回</option>
              </select>
            </label>
            <label>クリティカル発生回数
              <select data-field="criticalCount" data-idx="${idx}">
                ${Array.from({length:Number(a.hitCount)+1},(_,i)=>`<option value="${i}" ${String(i)===String(a.criticalCount)?"selected":""}>${i}回</option>`).join("")}
              </select>
            </label>
          </div>
        ` : `
          <label>特技倍率+値（未入力なら等倍）
            <input data-field="skillMultiplier" data-idx="${idx}" type="number" step="0.01" placeholder="親アヒルのみの例：0.5" value="${a.skillMultiplier}" />
          </label>
          <label>${a.attributeType}属性倍率
            <select data-field="attributeRateStage" data-idx="${idx}">
              <option value="none" ${a.attributeRateStage==="none"?"selected":""}>無し</option>
              ${Array.from({length:9},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(a.attributeRateStage)?"selected":""}>+${i+1}</option>`).join("")}
            </select>
          </label>
          <label>属性特技ヒット数
            <select data-field="attributeHitCount" data-idx="${idx}">
              <option value="1" ${a.attributeHitCount==="1"?"selected":""}>1回</option>
              <option value="2" ${a.attributeHitCount==="2"?"selected":""}>2回</option>
              <option value="3" ${a.attributeHitCount==="3"?"selected":""}>3回</option>
            </select>
          </label>
        `}

        <label>攻撃側のじゃんけん勝敗
          <select data-field="jankenResult" data-idx="${idx}">
            <option ${a.jankenResult==="無し、あいこ"?"selected":""}>無し、あいこ</option>
            <option ${a.jankenResult==="勝ち"?"selected":""}>勝ち</option>
            <option ${a.jankenResult==="負け"?"selected":""}>負け</option>
          </select>
        </label>
        <label>貫通
          <select data-field="penetration" data-idx="${idx}">
            <option ${a.penetration==="無し"?"selected":""}>無し</option>
            <option ${a.penetration==="有り"?"selected":""}>有り</option>
          </select>
        </label>
      </div>
    `;

    wrap.appendChild(card);
  });

  byId("addAttackerBtn").style.display = state.attackers.length >= 8 ? "none" : "inline-block";
}

function selectedModes() {
  return new Set(state.attackers.map((a) => a.damageType));
}

function selectedAttributeTypes() {
  return Array.from(new Set(state.attackers.filter((a) => a.damageType === "特技(全体属性)").map((a) => a.attributeType)));
}

function renderDefenderByModes() {
  const modes = selectedModes();
  const hasPhysical = modes.has("打撃");
  const hasAttr = modes.has("特技(全体属性)");

  byId("defenderPhysicalBlock").classList.toggle("hidden", !hasPhysical);
  byId("defenderAttributeBlock").classList.toggle("hidden", !hasAttr);

  if (hasAttr) {
    const attrs = selectedAttributeTypes();
    byId("defenderAttributeFields").innerHTML = attrs.map((attr) => `
      <label>${attr}属性耐性
        <select data-def-attr="resist" data-attr="${attr}">
          ${stageOptions(-4, 9, state.defender.attrResistance[attr])}
        </select>
      </label>
    `).join("");

    byId("defenderAttributeStatusFields").innerHTML = attrs.map((attr) => `
      <label>${attr}属性状態異常
        <select data-def-attr="status" data-attr="${attr}">
          <option value="none" ${state.defender.attrStatus[attr]==="none"?"selected":""}>無し</option>
          ${Array.from({length:9},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(state.defender.attrStatus[attr])?"selected":""}>+${i+1}</option>`).join("")}
        </select>
      </label>
    `).join("");
  }
}

function computeTotal() {
  if (state.attackers.length === 0) return { error: "攻撃する側を追加してください" };
  let sum = { avg: 0, min: 0, max: 0 };

  for (const a of state.attackers) {
    const result = a.damageType === "打撃"
      ? DamageCalculator.calculatePhysical({
          attackPower: a.attackPower,
          attackStage: a.attackStage,
          attackMultiplier: a.attackMultiplier,
          hitCount: a.hitCount,
          criticalCount: a.criticalCount,
          defensePower: state.defender.defensePower,
          defenseStage: state.defender.defenseStage,
          jankenResult: a.jankenResult,
          autoGuard: state.defender.autoGuard,
          penetration: a.penetration,
          targetHp: "",
        })
      : DamageCalculator.calculateAttributeSpecial({
          attributeLevel: a.attributeLevel,
          skillMultiplier: a.skillMultiplier,
          attributeRateStage: a.attributeRateStage,
          attributeResistanceStage: state.defender.attrResistance[a.attributeType],
          attributeStatusStage: state.defender.attrStatus[a.attributeType],
          attributeHitCount: a.attributeHitCount,
          jankenResult: a.jankenResult,
          autoGuard: state.defender.autoGuard,
          penetration: a.penetration,
          targetHp: "",
        });

    if (result.error) return result;
    sum.avg += result.total.avg;
    sum.min += result.total.min;
    sum.max += result.total.max;
  }

  const hpText = state.defender.targetHp.trim();
  if (hpText !== "") {
    const hp = Number.parseInt(hpText, 10);
    if (!Number.isInteger(hp) || hp <= 0) return { error: "HPは正の整数で入力してください" };
    return {
      total: sum,
      remainingHp: {
        avg: Math.max(0, hp - sum.avg),
        max: Math.max(0, hp - sum.min),
        min: Math.max(0, hp - sum.max),
      },
    };
  }

  return { total: sum };
}

function renderResult(result) {
  const out = byId("output");
  if (result.error) {
    out.innerHTML = `<p class="error">${result.error}</p>`;
    return;
  }
  const hp = result.remainingHp ? `
    <h4>残りHP</h4>
    <ul>
      <li>平均残りHP: ${result.remainingHp.avg.toFixed(4)}</li>
      <li>上限残りHP: ${result.remainingHp.max}</li>
      <li>下限残りHP: ${result.remainingHp.min}</li>
    </ul>` : "";

  out.innerHTML = `<section><h3>ダメージ計算結果</h3><ul>
    <li>平均ダメージ: ${result.total.avg.toFixed(4)}</li>
    <li>下限ダメージ: ${result.total.min}</li>
    <li>上限ダメージ: ${result.total.max}</li>
  </ul>${hp}</section>`;
}

function rerender() {
  renderAttackers();
  renderDefenderByModes();
  renderResult(computeTotal());
}

function main() {
  fillStageSelect("defenseStage");
  fillAttributeSelects();

  state.attackers.push(defaultAttacker());

  byId("addAttackerBtn").addEventListener("click", () => {
    if (state.attackers.length >= 8) return;
    state.attackers.push(defaultAttacker());
    rerender();
  });

  byId("attackerList").addEventListener("click", (e) => {
    const del = e.target.closest(".delete-attacker");
    if (del) {
      const idx = Number(del.dataset.idx);
      state.attackers.splice(idx, 1);
      rerender();
      return;
    }
    const tog = e.target.closest(".detail-toggle[data-toggle-idx]");
    if (tog) {
      const idx = Number(tog.dataset.toggleIdx);
      state.attackers[idx].detailOpen = !state.attackers[idx].detailOpen;
      rerender();
    }
  });

  byId("attackerList").addEventListener("input", (e) => {
    const idx = Number(e.target.dataset.idx);
    const field = e.target.dataset.field;
    if (Number.isInteger(idx) && field) {
      state.attackers[idx][field] = e.target.value;
      if (field === "hitCount" && Number(state.attackers[idx].criticalCount) > Number(e.target.value)) {
        state.attackers[idx].criticalCount = e.target.value;
      }
      rerender();
    }
  });

  byId("attackerList").addEventListener("change", (e) => {
    const t = e.target;
    if (t.name && t.name.startsWith("damageType-")) {
      const idx = Number(t.name.split("-")[1]);
      state.attackers[idx].damageType = t.value;
      rerender();
      return;
    }
    if (t.name && t.name.startsWith("attributeLevel-")) {
      const idx = Number(t.name.split("-")[1]);
      state.attackers[idx].attributeLevel = t.value;
      rerender();
      return;
    }
  });

  function setupToggle(btnId, panelId, key) {
    byId(btnId).addEventListener("click", () => {
      state.toggles[key] = !state.toggles[key];
      byId(panelId).classList.toggle("hidden", !state.toggles[key]);
      byId(btnId).textContent = state.toggles[key] ? OPEN_LABEL : CLOSED_LABEL;
    });
  }
  setupToggle("defenderPhysicalToggle", "defenderPhysicalDetails", "defenderPhysical");
  setupToggle("defenderAttributeToggle", "defenderAttributeDetails", "defenderAttribute");

  ["defensePower", "defenseStage", "autoGuard", "targetHp"].forEach((id) => {
    byId(id).addEventListener("input", () => { state.defender[id] = byId(id).value; rerender(); });
    byId(id).addEventListener("change", () => { state.defender[id] = byId(id).value; rerender(); });
  });

  byId("defenderAttributeBlock").addEventListener("change", (e) => {
    const kind = e.target.dataset.defAttr;
    const attr = e.target.dataset.attr;
    if (!kind || !attr) return;
    if (kind === "resist") state.defender.attrResistance[attr] = e.target.value;
    if (kind === "status") state.defender.attrStatus[attr] = e.target.value;
    rerender();
  });

  rerender();
}

document.addEventListener("DOMContentLoaded", main);
