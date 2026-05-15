import { commitCsvToGithub, hasToken, openTokenDialog } from './github-sync.js';

const CATEGORY_OPTIONS = {
  accidents: {
    type: ['物損', '人身'],
    category: ['追突', '後退時接触', '出会い頭', '右左折時接触', '駐車中接触', '巻き込み', '車線変更時接触', 'その他'],
    csvHeaders: ['id', 'date', 'time', 'location', 'lat', 'lng', 'type', 'category', 'damaged_part', 'cause', 'prevention'],
    idPrefix: 'A',
    fileName: 'accidents.csv',
    githubPath: 'data/accidents.csv',
  },
  violations: {
    type: ['道路交通法違反', '社内基準違反'],
    category: ['速度超過', '一時停止不履行', '進入禁止', 'ながら運転', '信号無視', '駐停車違反', 'シートベルト', 'その他'],
    csvHeaders: ['id', 'date', 'time', 'location', 'lat', 'lng', 'type', 'category', 'detail', 'cause', 'prevention'],
    idPrefix: 'V',
    fileName: 'violations.csv',
    githubPath: 'data/violations.csv',
  },
};

export function setupRecordForm(appConfig, getRecords, addRecord, onStatus) {
  const opts = CATEGORY_OPTIONS[appConfig.id] ?? CATEGORY_OPTIONS.accidents;
  const dialog = buildDialog(opts, appConfig);
  document.body.appendChild(dialog);

  document.querySelector('#addButton')?.addEventListener('click', () => {
    const records = getRecords();
    const nextId = generateNextId(records, opts.idPrefix);
    const form = dialog.querySelector('form');
    form.reset();
    form.elements.id.value = nextId;
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    updateSyncIndicator(dialog);
    dialog.showModal();
  });

  dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'submit') return;
    const form = dialog.querySelector('form');
    const data = Object.fromEntries(new FormData(form));
    const newRecord = {
      id: data.id || generateNextId(getRecords(), opts.idPrefix),
      date: data.date,
      time: data.time,
      location: data.location,
      lat: Number(data.lat),
      lng: Number(data.lng),
      type: data.type,
      category: data.category,
      detail: data.detail,
      cause: data.cause,
      prevention: data.prevention,
    };
    addRecord(newRecord);

    if (hasToken()) {
      try {
        onStatus?.('GitHubに保存中...');
        const csv = buildCsv(getRecords(), opts);
        await commitCsvToGithub(
          opts.githubPath,
          csv,
          `${appConfig.title}: ${newRecord.id} ${newRecord.location} を追加`,
        );
        onStatus?.(`GitHubに保存しました。1〜2分後にサイトに反映されます。`);
      } catch (error) {
        console.error(error);
        onStatus?.(`GitHubへの保存に失敗: ${error.message}（CSV保存で手動アップロードしてください）`);
      }
    } else {
      onStatus?.('ローカルに追加しました。GitHub設定で自動保存を有効にできます。');
    }
  });

  document.querySelector('#downloadButton')?.addEventListener('click', () => {
    downloadCsv(getRecords(), opts);
  });

  document.querySelector('#tokenButton')?.addEventListener('click', () => {
    openTokenDialog(() => {
      updateSyncIndicator(dialog);
      onStatus?.(hasToken() ? 'GitHub自動保存が有効になりました。' : 'GitHub自動保存を解除しました。');
    });
  });

  updateSyncIndicator(dialog);
}

function updateSyncIndicator(dialog) {
  const indicator = dialog.querySelector('.record-form__sync');
  if (!indicator) return;
  if (hasToken()) {
    indicator.textContent = '✓ 追加後、自動でGitHubに保存されます';
    indicator.dataset.state = 'on';
  } else {
    indicator.textContent = '⚠ GitHub設定が未完了。今は地図上のみに反映されます';
    indicator.dataset.state = 'off';
  }
  const tokenBtn = document.querySelector('#tokenButton');
  if (tokenBtn) tokenBtn.dataset.state = hasToken() ? 'on' : 'off';
}

function buildDialog(opts, appConfig) {
  const dialog = document.createElement('dialog');
  dialog.id = 'recordDialog';
  dialog.className = 'record-dialog';
  dialog.innerHTML = `
    <form method="dialog" class="record-form">
      <header class="record-form__head">
        <h2>${appConfig.title}に追加</h2>
        <button type="button" class="record-form__close" value="cancel" aria-label="閉じる">×</button>
      </header>
      <div class="record-form__grid">
        <label>ID<input name="id" required></label>
        <label>発生日<input name="date" type="date" required></label>
        <label>時間<input name="time" type="time" required></label>
        <label class="record-form__wide">場所<input name="location" placeholder="例: 宇治橋西詰交差点" required></label>
        <label>緯度<input name="lat" type="number" step="0.000001" min="-90" max="90" placeholder="34.890830" required></label>
        <label>経度<input name="lng" type="number" step="0.000001" min="-180" max="180" placeholder="135.806110" required></label>
        <label>区分
          <select name="type">
            <option value="">選択</option>
            ${opts.type.map((v) => `<option>${v}</option>`).join('')}
          </select>
        </label>
        <label>カテゴリ
          <select name="category">
            <option value="">選択</option>
            ${opts.category.map((v) => `<option>${v}</option>`).join('')}
          </select>
        </label>
        <label class="record-form__wide">対象 / 損傷部位<input name="detail" placeholder="例: 前部バンパー / 交差点進入"></label>
        <label class="record-form__wide">原因・概要<input name="cause"></label>
        <label class="record-form__wide">再発防止 / 改善ポイント<input name="prevention"></label>
      </div>
      <footer class="record-form__foot">
        <p class="record-form__sync" data-state="off"></p>
        <div>
          <button type="submit" value="cancel" class="record-form__cancel">キャンセル</button>
          <button type="submit" value="submit" class="record-form__submit">追加して保存</button>
        </div>
      </footer>
    </form>
  `;
  dialog.querySelector('.record-form__close').addEventListener('click', () => {
    dialog.close('cancel');
  });
  return dialog;
}

function generateNextId(records, prefix) {
  const max = records
    .map((r) => {
      const m = String(r.id).match(new RegExp(`^${prefix}-(\\d+)$`));
      return m ? Number(m[1]) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function buildCsv(records, opts) {
  const lines = [opts.csvHeaders.join(',')];
  for (const r of records) {
    const row = opts.csvHeaders.map((h) => {
      const v = h === 'damaged_part' ? r.detail : r[h];
      return csvCell(v);
    });
    lines.push(row.join(','));
  }
  return lines.join('\n') + '\n';
}

function downloadCsv(records, opts) {
  const csv = buildCsv(records, opts);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = opts.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
