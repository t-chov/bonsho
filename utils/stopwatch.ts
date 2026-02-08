/**
 * 経過秒をストップウォッチ表示向けの文字列に整形
 * 1時間未満は mm:ss、1時間以上は hh:mm:ss で表示する
 * @param {number} elapsedSeconds - 経過秒
 * @returns {string} フォーマット済み時刻
 */
export function formatStopwatchTime(elapsedSeconds: number): string {
  const total = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 現在の状態で1秒カウントを進めるべきか判定
 * @param {DocumentVisibilityState} visibilityState - ドキュメント可視状態
 * @param {boolean} hasFocus - ウィンドウフォーカス状態
 * @returns {boolean} 加算する場合 true
 */
export function shouldCountStopwatch(
  visibilityState: DocumentVisibilityState,
  hasFocus: boolean,
): boolean {
  return visibilityState === 'visible' && hasFocus;
}
