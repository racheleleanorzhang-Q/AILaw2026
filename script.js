const approvalRows = [
  {
    kind: "project",
    type: "立项审批",
    name: "北京新望资本 常法顾问续约项目",
    info: "服务范围扩至融资合规与董事会治理",
    initiator: "产品经理超级管理员",
    status: "审批中",
    node: "团队负责人审批",
    createdAt: "2026-08-19",
    arrivedAt: "2026-08-19"
  },
  {
    kind: "risk",
    type: "利益冲突审批",
    name: "蓝石半导体 B 轮专项",
    info: "对手方关联命中历史并购项目",
    initiator: "律师 张晨",
    status: "待补材料",
    node: "风控复核",
    createdAt: "2026-08-18",
    arrivedAt: "2026-08-19"
  },
  {
    kind: "finance",
    type: "报价审批",
    name: "中国移动银行与融资专项",
    info: "固定费 + 成功费，折扣 12%",
    initiator: "BD 王璟",
    status: "审批中",
    node: "财务负责人审批",
    createdAt: "2026-08-18",
    arrivedAt: "2026-08-19"
  },
  {
    kind: "project",
    type: "文书外发审批",
    name: "新望资本 融资合规意见备忘录",
    info: "Memo V5 | 今晚对外发送",
    initiator: "律师 陈安",
    status: "审批中",
    node: "合伙人终审",
    createdAt: "2026-08-19",
    arrivedAt: "2026-08-19"
  },
  {
    kind: "risk",
    type: "合同条款偏离审批",
    name: "智衡数据 常年顾问合同",
    info: "客户要求无限责任 + 4h SLA",
    initiator: "律师 李越",
    status: "待我审批",
    node: "管理合伙人",
    createdAt: "2026-08-17",
    arrivedAt: "2026-08-18"
  },
  {
    kind: "finance",
    type: "开票申请审批",
    name: "启元医疗 劳动专项项目",
    info: "第二笔服务费 18 万 | 专票",
    initiator: "财务 许楠",
    status: "审批中",
    node: "团队负责人确认",
    createdAt: "2026-08-18",
    arrivedAt: "2026-08-18"
  }
];

const priorityItems = [
  {
    title: "高风险文书外发审批",
    meta: "新望资本 | 合伙人终审 | 剩余 SLA 1 小时 20 分钟"
  },
  {
    title: "非标责任条款审批",
    meta: "智衡数据 | 无限责任 + 响应 SLA 偏离标准模板"
  },
  {
    title: "折扣例外审批",
    meta: "中国移动银行与融资专项 | 折扣 12% | 需财务复核毛利"
  }
];

const viewButtons = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".content-view");
const jumpButtons = document.querySelectorAll("[data-jump]");
const tableBody = document.getElementById("approval-table-body");
const queueSearch = document.getElementById("queue-search");
const menuLinks = document.querySelectorAll(".menu-link");
const priorityList = document.getElementById("priority-list");
const launchSteps = document.querySelectorAll("[data-launch-step]");
const launchPanels = document.querySelectorAll("[data-launch-panel]");
const launchPrev = document.getElementById("launch-prev");
const launchNext = document.getElementById("launch-next");
const launchSideAction = document.getElementById("launch-side-action");
const launchSideTitle = document.getElementById("launch-side-title");
const launchChainPreview = document.getElementById("launch-chain-preview");
const launchSla = document.getElementById("launch-sla");

const launchFields = {
  type: document.getElementById("launch-approval-type"),
  client: document.getElementById("launch-client"),
  project: document.getElementById("launch-project"),
  object: document.getElementById("launch-object"),
  risk: document.getElementById("launch-risk"),
  urgency: document.getElementById("launch-urgency"),
  summary: document.getElementById("launch-summary")
};

const reviewTargets = {
  type: document.querySelector('[data-review="type"]'),
  client: document.querySelector('[data-review="client"]'),
  project: document.querySelector('[data-review="project"]'),
  object: document.querySelector('[data-review="object"]'),
  risk: document.querySelector('[data-review="risk"]'),
  urgency: document.querySelector('[data-review="urgency"]'),
  summary: document.querySelector('[data-review="summary"]')
};

const launchStepRequirements = {
  1: ["type"],
  2: ["client", "project", "object"],
  3: ["risk", "urgency", "summary"]
};

const launchDefaultValues = Object.fromEntries(
  Object.entries(launchFields).map(([key, field]) => [key, field?.value || ""])
);

let activeFilter = "";
let currentLaunchStep = 1;
let launchSubmitted = false;

function renderPriority() {
  priorityList.innerHTML = priorityItems
    .map(
      (item) => `
        <div class="priority-item">
          <strong>${item.title}</strong>
          <div class="priority-meta">${item.meta}</div>
        </div>
      `
    )
    .join("");
}

function typeClass(kind) {
  if (kind === "risk") return "risk";
  if (kind === "finance") return "finance";
  return "project";
}

function renderTable() {
  const keyword = (queueSearch?.value || "").trim();
  const rows = approvalRows.filter((row) => {
    const hitFilter = !activeFilter || row.type === activeFilter;
    const hitSearch =
      !keyword ||
      `${row.type}${row.name}${row.info}${row.initiator}${row.node}`.includes(keyword);
    return hitFilter && hitSearch;
  });

  tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td><span class="approval-type ${typeClass(row.kind)}">${row.type}</span></td>
          <td>${row.name}</td>
          <td>${row.info}</td>
          <td>${row.initiator}</td>
          <td>${row.status}</td>
          <td>${row.node}</td>
          <td>${row.createdAt}</td>
          <td>${row.arrivedAt}</td>
        </tr>
      `
    )
    .join("");
}

function setActiveView(id, options = {}) {
  if (id === "launch" && options.resetLaunch) {
    resetLaunchWizard();
  }

  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === id);
  });
  views.forEach((view) => {
    view.classList.toggle("active", view.id === id);
  });
}

function updateLaunchReview() {
  Object.entries(launchFields).forEach(([key, field]) => {
    if (!reviewTargets[key]) return;
    reviewTargets[key].textContent = field.value.trim() || "-";
  });
}

function isLaunchFieldComplete(key) {
  const field = launchFields[key];
  if (!field) return true;
  return field.value.trim().length > 0;
}

function isLaunchStepComplete(step) {
  const keys = launchStepRequirements[step] || [];
  return keys.every(isLaunchFieldComplete);
}

function getLaunchMaxStep() {
  if (!isLaunchStepComplete(1)) return 1;
  if (!isLaunchStepComplete(2)) return 2;
  if (!isLaunchStepComplete(3)) return 3;
  return 5;
}

function getLaunchSla(type, risk, urgency) {
  if (urgency === "紧急") return "预计 SLA：4 小时内";
  if (risk === "高") return "预计 SLA：1 个工作日";
  if (["报价审批", "折扣/减免审批", "开票申请审批"].includes(type)) {
    return "预计 SLA：8 小时内";
  }
  return "预计 SLA：2 个工作日";
}

function getLaunchChain(type, risk) {
  const nodes = ["系统校验：客户档案 / 历史利冲"];

  if (type === "利益冲突审批") {
    nodes.push("风控复核");
  } else {
    nodes.push("复核律师审批");
  }

  if (["报价审批", "折扣/减免审批", "开票申请审批"].includes(type)) {
    nodes.push("财务负责人审批");
  } else {
    nodes.push("项目负责人审批");
  }

  if (risk === "高" || ["利益冲突审批", "对外法律意见/正式文书审批"].includes(type)) {
    nodes.push("合伙人终审");
  } else {
    nodes.push("团队负责人审批");
  }

  if (type === "新项目立项审批") {
    nodes.push("通过后自动建项目并生成审批记录");
  } else if (type === "开票申请审批") {
    nodes.push("通过后同步开票申请与应收记录");
  } else if (type === "对外法律意见/正式文书审批") {
    nodes.push("通过后锁版并允许发送");
  } else {
    nodes.push("通过后自动留痕并回写业务对象");
  }

  return nodes;
}

function updateLaunchChainPreview() {
  const type = launchFields.type?.value.trim() || "";
  const risk = launchFields.risk?.value.trim() || "";
  const urgency = launchFields.urgency?.value.trim() || "";
  const nodes = getLaunchChain(type, risk);
  const approvalNodes = nodes.slice(0, -1);
  const finalNode = nodes[nodes.length - 1];

  if (launchChainPreview) {
    launchChainPreview.innerHTML = [
      ...approvalNodes.map(
        (node, index) =>
          `<div class="chain-node${index === approvalNodes.length - 1 ? " emphasis" : ""}">${node}</div>`
      ),
      `<div class="chain-node">${finalNode}</div>`
    ].join("");
  }

  if (launchSla) {
    launchSla.textContent = getLaunchSla(type, risk, urgency);
  }
}

function validateLaunchStep(step) {
  return isLaunchStepComplete(step);
}

function resetLaunchWizard() {
  launchSubmitted = false;
  currentLaunchStep = 1;

  Object.entries(launchDefaultValues).forEach(([key, value]) => {
    if (launchFields[key]) {
      launchFields[key].value = value;
    }
  });

  updateLaunchUi();
}

function updateLaunchUi() {
  const maxStep = getLaunchMaxStep();

  if (!launchSubmitted && currentLaunchStep > maxStep) {
    currentLaunchStep = maxStep;
  }

  launchSteps.forEach((stepBtn) => {
    const step = Number(stepBtn.dataset.launchStep);
    stepBtn.classList.toggle("active", step === currentLaunchStep);
    stepBtn.classList.toggle("done", step < currentLaunchStep);
    stepBtn.disabled = launchSubmitted || step > maxStep;
  });

  launchPanels.forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.launchPanel) === currentLaunchStep);
  });

  if (launchPrev) {
    launchPrev.disabled = currentLaunchStep === 1 || launchSubmitted;
  }

  const isFinalStep = currentLaunchStep === 5;
  const isPreviewStep = currentLaunchStep >= 4;
  const canAdvance = launchSubmitted
    ? false
    : currentLaunchStep >= 4 || validateLaunchStep(currentLaunchStep);

  if (launchNext) {
    launchNext.textContent = launchSubmitted ? "已提交" : isFinalStep ? "提交审批" : "下一步";
    launchNext.disabled = !canAdvance;
  }

  if (launchSideAction) {
    launchSideAction.textContent = launchSubmitted ? "已提交" : isFinalStep ? "提交审批" : "下一步";
    launchSideAction.disabled = !canAdvance;
  }

  if (launchSideTitle) {
    launchSideTitle.textContent = launchSubmitted ? "审批已提交" : isPreviewStep ? "预览审批链" : "审批链预览";
  }

  updateLaunchReview();
  updateLaunchChainPreview();
}

function setLaunchStep(step) {
  const maxStep = launchSubmitted ? 5 : getLaunchMaxStep();
  currentLaunchStep = Math.min(maxStep, Math.max(1, step));
  updateLaunchUi();
}

function advanceLaunchStep() {
  if (launchSubmitted) return;

  if (currentLaunchStep < 5) {
    if (!validateLaunchStep(currentLaunchStep)) {
      updateLaunchUi();
      return;
    }

    setLaunchStep(currentLaunchStep + 1);
    return;
  }

  launchSubmitted = true;
  updateLaunchUi();
}

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveView(btn.dataset.view, { resetLaunch: btn.dataset.view === "launch" && launchSubmitted });
  });
});

jumpButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveView(btn.dataset.jump, { resetLaunch: btn.dataset.jump === "launch" });
  });
});

menuLinks.forEach((btn) => {
  btn.addEventListener("click", () => {
    menuLinks.forEach((link) => link.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter || "";
    renderTable();
  });
});

queueSearch?.addEventListener("input", renderTable);

launchSteps.forEach((stepBtn) => {
  stepBtn.addEventListener("click", () => {
    const targetStep = Number(stepBtn.dataset.launchStep);
    if (launchSubmitted || targetStep > getLaunchMaxStep()) return;
    setLaunchStep(targetStep);
  });
});

launchPrev?.addEventListener("click", () => {
  setLaunchStep(currentLaunchStep - 1);
});

launchNext?.addEventListener("click", advanceLaunchStep);
launchSideAction?.addEventListener("click", advanceLaunchStep);

Object.values(launchFields).forEach((field) => {
  field?.addEventListener("input", updateLaunchUi);
  field?.addEventListener("change", updateLaunchUi);
});

renderPriority();
renderTable();
updateLaunchUi();
