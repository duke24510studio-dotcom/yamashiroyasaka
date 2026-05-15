const REPO_OWNER = 'duke24510studio-dotcom';
const REPO_NAME = 'yamashiroyasaka';
const TOKEN_KEY = 'yasaka_github_token';

export function hasToken() {
  return Boolean(getToken());
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function commitCsvToGithub(path, csvText, commitMessage) {
  const token = getToken();
  if (!token) throw new Error('GitHubトークンが未設定です。');

  const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  // 1) Get current file SHA
  const headResp = await fetch(`${apiBase}?ref=main`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!headResp.ok) {
    if (headResp.status === 401) throw new Error('トークンが無効です。再設定してください。');
    if (headResp.status === 404) throw new Error(`ファイルが見つかりません: ${path}`);
    throw new Error(`GitHubファイル取得エラー: ${headResp.status}`);
  }
  const head = await headResp.json();
  const sha = head.sha;

  // 2) Encode CSV as base64 (UTF-8 safe)
  const utf8Bytes = new TextEncoder().encode(csvText);
  let binary = '';
  for (const b of utf8Bytes) binary += String.fromCharCode(b);
  const base64 = btoa(binary);

  // 3) PUT new content
  const putResp = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64,
      sha,
      branch: 'main',
    }),
  });
  if (!putResp.ok) {
    const err = await putResp.text();
    throw new Error(`GitHubコミットエラー: ${putResp.status} ${err}`);
  }
  return putResp.json();
}

export function openTokenDialog(onSaved) {
  let dialog = document.querySelector('#tokenDialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'tokenDialog';
    dialog.className = 'record-dialog';
    dialog.innerHTML = `
      <form method="dialog" class="record-form">
        <header class="record-form__head">
          <h2>GitHubトークン設定</h2>
          <button type="button" class="record-form__close" aria-label="閉じる">×</button>
        </header>
        <div class="token-form__body">
          <p>入力した事故・違反データを自動で GitHub に保存するために、Personal Access Token (PAT) を1回だけ設定します。</p>
          <ol class="token-steps">
            <li>下のリンクからトークン作成画面を開く（既にログイン済み前提）</li>
            <li>Note: <code>yasaka-map</code> など分かる名前を入力</li>
            <li>Expiration: <strong>No expiration</strong> または長め</li>
            <li>Repository access: <strong>Only select repositories</strong> → <code>yamashiroyasaka</code></li>
            <li>Repository permissions → <strong>Contents: Read and write</strong></li>
            <li>「Generate token」→ 表示された <code>github_pat_...</code> または <code>ghp_...</code> をコピー</li>
            <li>下に貼り付け → 保存</li>
          </ol>
          <p>
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" class="token-link">
              GitHub でトークンを作成 →
            </a>
          </p>
          <label class="token-input">
            トークン
            <input id="tokenValue" type="password" placeholder="github_pat_xxxxxx..." autocomplete="off">
          </label>
          <p class="token-warn">
            ⚠ トークンはお使いのブラウザ内（localStorage）に保存されます。共有PCでの利用は避けてください。
          </p>
        </div>
        <footer class="record-form__foot">
          <p class="record-form__hint">クリア後はフォームの自動保存が一時停止し、CSV保存→手動アップロードに戻ります。</p>
          <div>
            <button type="button" class="record-form__cancel" id="tokenClearButton">クリア</button>
            <button type="button" class="record-form__submit" id="tokenSaveButton">保存</button>
          </div>
        </footer>
      </form>
    `;
    document.body.appendChild(dialog);
    dialog.querySelector('.record-form__close').addEventListener('click', () => dialog.close());
  }
  const input = dialog.querySelector('#tokenValue');
  input.value = getToken() ?? '';
  dialog.querySelector('#tokenSaveButton').onclick = () => {
    const value = input.value.trim();
    if (value) setToken(value);
    else clearToken();
    dialog.close();
    onSaved?.();
  };
  dialog.querySelector('#tokenClearButton').onclick = () => {
    clearToken();
    input.value = '';
    onSaved?.();
  };
  dialog.showModal();
}
