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

let activeFilter = "";

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

function setActiveView(id) {
  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === id);
  });
  views.forEach((view) => {
    view.classList.toggle("active", view.id === id);
  });
}

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveView(btn.dataset.view));
});

jumpButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveView(btn.dataset.jump));
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

renderPriority();
renderTable();
