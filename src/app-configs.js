export const APP_CONFIGS = {
  accidents: {
    id: 'accidents',
    title: '交通事故発生マップ',
    eyebrow: '山城ヤサカ交通 安全管理',
    sourceName: '事故データ',
    listTitle: '事故一覧',
    mapLabel: '事故発生地点の地図',
    searchPlaceholder: '場所・損傷部位・原因概要',
    summaryLabels: {
      total: '表示件数',
      topCategory: '最多カテゴリ',
      topTimeBand: '最多時間帯',
      topLocation: '重点場所',
    },
    filterLabels: {
      type: '事故区分',
      category: 'カテゴリ',
    },
    tableLabels: {
      date: '発生日',
      time: '時間',
      location: '場所',
      type: '事故区分',
      category: 'カテゴリ',
      detail: '損傷部位',
      cause: '原因概要',
    },
    stats: {
      time: '時間帯別',
      category: 'カテゴリ別',
      location: '場所別',
      prevention: '再発防止ポイント',
    },
    generatedPoints: {
      '後退時接触': '後退開始前の降車確認、誘導者確認、バックモニター確認を標準動作として再点検する。',
      '追突': '車間距離と速度管理を朝礼で確認し、前方不注意が起きやすい時間帯を共有する。',
      '歩行者接触': '横断歩道・乗降場所付近では徐行と左右確認を徹底し、死角確認の声かけを行う。',
      '物損': '狭路・駐車場では一時停止、ミラー確認、切り返し判断を早める。',
    },
  },
  violations: {
    id: 'violations',
    title: '交通違反マップ',
    eyebrow: '山城ヤサカ交通 コンプライアンス確認',
    sourceName: '違反データ',
    listTitle: '違反一覧',
    mapLabel: '交通違反発生地点の地図',
    searchPlaceholder: '場所・対象・違反概要',
    summaryLabels: {
      total: '表示件数',
      topCategory: '最多違反',
      topTimeBand: '最多時間帯',
      topLocation: '重点場所',
    },
    filterLabels: {
      type: '違反区分',
      category: '違反カテゴリ',
    },
    tableLabels: {
      date: '確認日',
      time: '時間',
      location: '場所',
      type: '違反区分',
      category: '違反カテゴリ',
      detail: '対象',
      cause: '違反概要',
    },
    stats: {
      time: '時間帯別',
      category: '違反カテゴリ別',
      location: '場所別',
      prevention: '改善ポイント',
    },
    generatedPoints: {
      '一時停止不履行': '一時停止線の手前で完全停止し、左右確認を声出しで徹底する。',
      '速度超過': '速度が上がりやすい区間を点呼で共有し、法定速度と社内基準速度を再確認する。',
      '進入禁止': '標識確認が必要な交差点を地図で共有し、進入前の標識確認を習慣化する。',
      'ながら運転': '運転中の端末操作を禁止し、連絡は安全な停車後に行う。',
    },
  },
};

export function getCurrentAppConfig() {
  return APP_CONFIGS[document.body.dataset.app] ?? APP_CONFIGS.accidents;
}
