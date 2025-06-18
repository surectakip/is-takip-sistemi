// 1. Yardımcı fonksiyon
function getStatusClass(statusText) {
  const status = (statusText || '').toLowerCase();
  if (status.includes('tamam')) return 'status-completed';
  if (status.includes('devam')) return 'status-inprogress';
  return 'status-pending';
}

// 2. Veri yükleme fonksiyonu
async function loadData() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3FYXQ_1zy1ldlWNkZ73O8RLVbE0QgFOfdZoR6ZP6Ay-D_YH2uuiptRtSXSJIQekxOkbWp0l8BGNT4/pub?output=csv';

  const loadingEl = document.getElementById('loading');
  const theadEl = document.getElementById('table-head');
  const tbodyEl = document.getElementById('table-body');
  const recordCountEl = document.getElementById('record-count');
  const selResp = document.getElementById('filter-responsible');
  const selStat = document.getElementById('filter-status');
  const selPrio = document.getElementById('filter-priority');
  const qHead = document.getElementById('query-head');
  const qBody = document.getElementById('query-body');

  let allRows = [], headers = [];

  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    const res = await fetch(sheetUrl);
    const text = await res.text();
    const rows = text.trim().split('\n').map(r => r.split(','));
    headers = rows.shift();
    allRows = rows;

    theadEl.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    tbodyEl.innerHTML = allRows.map(row => {
      const statusClass = getStatusClass(row[6]);
      return `<tr>` + row.map((cell, i) =>
        i === 6
          ? `<td><span class="status-badge ${statusClass}">${cell}</span></td>`
          : `<td>${cell}</td>`
      ).join('') + `</tr>`;
    }).join('');

    recordCountEl.textContent = `${allRows.length} kayıt`;
    [selResp, selStat, selPrio].forEach((s, i) => {
      if (!s) return;
      const idx = [3, 6, 7][i];
      const values = [...new Set(allRows.map(r => r[idx]))].sort();
      s.innerHTML = '<option value="">Tümü</option>' + values.map(v => `<option>${v}</option>`).join('');
    });

    qHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    qBody.innerHTML = '';
  } catch (err) {
    recordCountEl.textContent = 'Veri alınamadı';
    recordCountEl.style.color = '#e53e3e';
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// 3. HTML parça yükleyici
async function loadHTML(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

// 4. Uygulamayı başlat
async function initializeApp() {
  const tabIds = ['entry', 'results', 'data', 'query', 'edit', 'charts'];

  await Promise.all([
    loadHTML('navbar', 'components/navbar.html'),
    loadHTML('tab-entry', 'components/tab-entry.html'),
    loadHTML('tab-results', 'components/tab-results.html'),
    loadHTML('tab-data', 'components/tab-data.html'),
    loadHTML('tab-query', 'components/tab-query.html'),
    loadHTML('tab-edit', 'components/tab-edit.html'),
    loadHTML('tab-charts', 'components/tab-charts.html'),
  ]);

  tabIds.forEach(t => {
    const btn = document.getElementById('btn-' + t);
    const tab = document.getElementById('tab-' + t);
    if (btn && tab) {
      btn.addEventListener('click', () => {
        tabIds.forEach(x => {
          document.getElementById('btn-' + x)?.classList.toggle('active', x === t);
          document.getElementById('tab-' + x)?.classList.toggle('active', x === t);
        });
        if (t === 'data') loadData();
      });
    }
  });

  document.getElementById('btn-entry')?.click();
}

window.onload = initializeApp;
