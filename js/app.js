/* 静心 — App Shell (3 tabs) */
window.JingXin = window.JingXin || {};

JingXin.App = {
  async init() {
    if (JingXin.Checkin && JingXin.Checkin.init) await JingXin.Checkin.init();
    if (JingXin.Journal && JingXin.Journal.init) await JingXin.Journal.init();
    if (JingXin.Trends && JingXin.Trends.init) await JingXin.Trends.init();
  }
};

document.addEventListener('DOMContentLoaded', () => JingXin.App.init());
