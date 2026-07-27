/* 静心 — App Shell (4 核心) */
window.JingXin = window.JingXin || {};

JingXin.App = {
  async init() {
    if (JingXin.Checkin && JingXin.Checkin.init) await JingXin.Checkin.init();
    if (JingXin.LightCBT && JingXin.LightCBT.init) await JingXin.LightCBT.init();
    if (JingXin.Decision && JingXin.Decision.init) await JingXin.Decision.init();
    if (JingXin.Report && JingXin.Report.init) await JingXin.Report.init();
    if (JingXin.Chat && JingXin.Chat.init) await JingXin.Chat.init();
  }
};

document.addEventListener('DOMContentLoaded', () => JingXin.App.init());
