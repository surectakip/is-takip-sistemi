async function loadHTML(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

async function initializeApp() {
  const tabIds = ['entry', 'results', 'data', 'query', 'edit', 'charts'];

  // HTML modüllerini sırayla yükle
  await Promise.all([
    loadHTML('navbar', 'components/navbar.html'),
    loadHTML('tab-entry', 'components/tab-entry.html'),
    loadHTML('tab-results', 'components/tab-results.html'),
    loadHTML('tab-data', 'components/tab-data.html'),
    loadHTML('tab-query', 'components/tab-query.html'),
    loadHTML('tab-edit', 'components/tab-edit.html'),
    loadHTML('tab-charts', 'components/tab-charts.html'),
  ]);

  // Sekme düğmelerine tıklama olaylarını bağla
  tabIds.forEach(t => {
    const btn = document.getElementById('btn-' + t);
    const tab = document.getElementById('tab-' + t);

    if (btn && tab) {
      btn.addEventListener('click', () => {
        // Tüm sekmeleri gizle, sadece ilgili olanı göster
        tabIds.forEach(x => {
          document.getElementById('btn-' + x)?.classList.toggle('active', x === t);
          document.getElementById('tab-' + x)?.classList.toggle('active', x === t);
        });

        // Sadece 'Takip' sekmesine geçince loadData çağrılır
        if (t === 'data') {
          loadData(); // hata burada oluşuyordu
        }
      });
    }
  });

  // Giriş sekmesini varsayılan olarak başlat
  document.getElementById('btn-entry')?.click();
}

window.onload = initializeApp;
