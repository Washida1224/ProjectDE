document.addEventListener('DOMContentLoaded', function () {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbxHznIqroagy0pqhhbRx2ccqOVfDKJeaaNk7rxsZoeUKCM8YIUkg3SczuhbDMRmjNLEqQ/exec';

  const addTripButton = document.getElementById('add-trip-button');
  const tripLogContainer = document.getElementById('trip-log-container');
  let tripCount = 0;
  const MAX_TRIPS = 8;

  addTrip();
  addTripButton.addEventListener('click', addTrip);

  function addTrip() {
    if (tripCount >= MAX_TRIPS) return;
    tripCount++;

    const tripItem = document.createElement('div');
    tripItem.classList.add('trip-log-item');

    tripItem.innerHTML = `
      <div class="grid-cell input-cell" style="grid-column: 1 / span 5;"><input type="text" name="B${22 + tripCount}" placeholder="便名"></div>
      <div class="grid-cell input-cell" style="grid-column: 6 / span 6;"><input type="text" name="F${22 + tripCount}" placeholder="例: 09:00"></div>
      <div class="grid-cell input-cell" style="grid-column: 12 / span 6;"><input type="text" name="I${22 + tripCount}" placeholder="例: 12:30"></div>
      <div class="grid-cell input-cell" style="grid-column: 18 / span 9;"><input type="number" name="L${22 + tripCount}" placeholder="人数"></div>
    `;

    tripLogContainer.appendChild(tripItem);

    if (tripCount >= MAX_TRIPS) {
      addTripButton.style.display = 'none';
    }
  }


  const form = document.querySelector('form');
  const submitBtn = form.querySelector('.submit-button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();


    const payload = collectPayloadFromForm(form);


    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '作成中...';

    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });


      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', text);
        result = { success: false, error: 'サーバーからJSONで返ってきませんでした', raw: text };
      }

      console.log('GAS result:', result);

      if (res.ok && result && result.success && result.fileUrlExcel) {

        window.location.href = result.fileUrlExcel;
      } else {
        const msg = (result && (result.error || result.message || result.raw)) || `HTTP ${res.status}`;
        alert('日報作成に失敗しました：\n' + msg);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました：\n' + String(err));
    } finally {

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function collectPayloadFromForm(formEl) {
    const data = {};
    const elements = formEl.querySelectorAll('input, select, textarea');

    elements.forEach((el) => {
      const name = el.name && el.name.trim();
      if (!name) return;

      if (!/^[A-Z]+[0-9]+$/.test(name)) return;

      if (el.type === 'checkbox') {
        data[name] = el.checked ? '✓' : '';
      } else {
        data[name] = el.value ?? '';
      }
    });

    return data;
  }
});








