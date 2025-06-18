document.addEventListener('DOMContentLoaded', () => {
  const tabs = ['entry','results','data','query','edit','charts'];
  tabs.forEach(t => {
    const btn = document.getElementById('btn-' + t);
    const tab = document.getElementById('tab-' + t);
    if (btn && tab) {
      btn.onclick = () => {
        tabs.forEach(x => {
          document.getElementById('btn-' + x)?.classList.toggle('active', x === t);
          document.getElementById('tab-' + x)?.classList.toggle('active', x === t);
        });
        if (t === 'data') loadData();
      };
    }
  });

  const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3FYXQ_1zylldMKZ73oBRLvbE0QgfOfdZoR6ZP6Pay-D_YH2uuiptRt5XsJIQekxOkbwRplBBGNT4u/pub?output=csv';

  const loadingEl = document.getElementById('loading');
  const theadEl = document.getElementById('table-head');
  const tbodyEl = document.getElementById('table-body');
  const refreshBtn = document.getElementById('refresh-btn');
  const selResp = document.getElementById('filter-responsible');
  const selStat = document.getElementById('filter-status');
  const selPrio = document.getElementById('filter-priority');
  const dateFrom = document.getElementById('filter-start-from');
  const dateTo = document.getElementById('filter-start-to');
  const txtFilter = document.getElementById('filter-text');
  const applyBtn = document.getElementById('apply-btn');
  const resetBtn = document.getElementById('reset-btn');
  const qHead = document.getElementById('query-head');
  const qBody = document.getElementById('query-body');

  let allRows = [], headers = [];

  window.loadData = async function () {
    loadingEl.style.display = 'flex';
    theadEl.innerHTML = '';
    tbodyEl.innerHTML = '';
    document.getElementById('record-count').textContent = '';
    [selResp, selStat, selPrio].forEach(s => s.innerHTML = '<option value=\"\">Tümü</option>');
    qBody.innerHTML = '';
    allRows = [];

    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const rows = text.trim().split('\\n').map(r => r.split(','));
      headers = rows.shift();
      allRows = rows;

      theadEl.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
      tbodyEl.innerHTML = allRows.map(row => {
        const statusClass = getStatusClass(row[6]);
        return `<tr>` +
          row.map((cell, i) =>
            i === 6 ? `<td><span class=\"status-badge ${statusClass}\">${cell}</span></td>`
                    : `<td>${cell}</td>`).join('') +
          `</tr>`;
      }).join('');

      document.getElementById('record-count').textContent = `${allRows.length} kayıt`;
      populate(selResp, 3);
      populate(selStat, 6);
      populate(selPrio, 7);
      qHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('');
    } catch (err) {
      document.getElementById('record-count').textContent = 'Veri alınamadı';
      document.getElementById('record-count').style.color = '#e53e3e';
    } finally {
      loadingEl.style.display = 'none';
    }
  };

  function getStatusClass(statusText) {
    const status = (statusText || '').toLowerCase();
    if (status.includes('tamam')) return 'status-completed';
    if (status.includes('devam')) return 'status-inprogress';
    return 'status-pending';
  }

  function populate(sel, idx) {
    Array.from(new Set(allRows.map(r => r[idx]))).sort().forEach(v => {
      const o = document.createElement('option');
      o.value = o.textContent = v;
      sel.appendChild(o);
    });
  }

  function applyFilter() {
    let f = allRows.slice();
    if (selResp.value) f = f.filter(r => r[3] === selResp.value);
    if (selStat.value) f = f.filter(r => r[6] === selStat.value);
    if (selPrio.value) f = f.filter(r => r[7] === selPrio.value);
    if (dateFrom.value) f = f.filter(r => new Date(r[4]) >= new Date(dateFrom.value));
    if (dateTo.value) f = f.filter(r => new Date(r[4]) <= new Date(dateTo.value));
    if (txtFilter.value) {
      const t = txtFilter.value.toLowerCase();
      f = f.filter(r => r.some(c => c.toLowerCase().includes(t)));
    }
    document.getElementById('results-info').textContent = `${f.length} sonuç bulundu (Toplam ${allRows.length} kayıt)`;
    qBody.innerHTML = f.map(r => '<tr>' + r.map(c => `<td>${c || ''}</td>`).join('') + '</tr>').join('');
  }

  function resetFilter() {
    selResp.value = selStat.value = selPrio.value = '';
    dateFrom.value = dateTo.value = txtFilter.value = '';
    qBody.innerHTML = '';
    document.getElementById('results-info').textContent = '';
  }

  if (refreshBtn) refreshBtn.onclick = loadData;
  if (applyBtn) applyBtn.onclick = applyFilter;
  if (resetBtn) resetBtn.onclick = resetFilter;

  // İlk yüklemede tabloyu da çek
  loadData();
});
