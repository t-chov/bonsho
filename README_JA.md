# bonsho

[![CI](https://github.com/t-chov/bonsho/actions/workflows/ci.yml/badge.svg)](https://github.com/t-chov/bonsho/actions/workflows/ci.yml)

bonsho は、ソーシャルメディアや動画配信サイトとの付き合い方を見直すための、禅をテーマにしたブラウザ拡張です。
一定間隔でリマインダーを表示し、利用時間の統計を記録します。

## 主な機能

- **マインドフル・リマインダー**: 定期的に「一度立ち止まる」ためのオーバーレイや通知を表示します。
- **利用時間トラッキング**: 対応サイトでの滞在時間を自動で記録します。
- **ミニストップウォッチ**: 対象サイト閲覧中の経過時間を右下/左下に表示し、必要に応じて非表示にできます。
- **利用状況ダッシュボード**: 拡張機能のポップアップから当日の利用状況を確認できます。
- **データエクスポート**: 利用データを JSON / CSV 形式で出力できます。
- **プライバシー重視**: データはブラウザ内にのみ保存され、外部送信は行いません。
- **カスタマイズ可能**:
    - リマインダー間隔の調整（1〜120分）
    - 監視対象サイトの切り替え
    - 拡張機能全体の有効 / 無効切り替え

## 対応サイト

- YouTube (`youtube.com`)
- Twitter (`twitter.com`)
- X (`x.com`)
- Facebook (`facebook.com`)
- Instagram (`instagram.com`)
- TikTok (`tiktok.com`)
- Reddit (`reddit.com`)

## インストール（利用者向け）

1. [Releases](https://github.com/t-chov/bonsho/releases) ページを開きます。
2. 利用するブラウザ向けのアーカイブをダウンロードします。
   - Chromium 系ブラウザ: `bonsho-<version>-chrome.zip`
   - Firefox: `bonsho-<version>-firefox.zip`

### Chromium（Chrome / Edge / Brave）

1. `bonsho-<version>-chrome.zip` を展開します。
2. `chrome://extensions`（または `edge://extensions`）を開きます。
3. **デベロッパー モード** を有効にします。
4. **パッケージ化されていない拡張機能を読み込む** をクリックし、展開したフォルダを選択します。

### Firefox

1. `bonsho-<version>-firefox.zip` を展開します。
2. `about:debugging#/runtime/this-firefox` を開きます。
3. **一時的なアドオンを読み込む...** をクリックし、展開したフォルダ内の `manifest.json` を選択します。

## インストール（開発者向け）

1. **リポジトリをクローン**
2. **依存関係をインストール**:
   ```bash
   pnpm install
   ```
3. **開発サーバーを起動**:
   ```bash
   pnpm dev
   ```
   新しい Chrome インスタンスが起動し、拡張機能が読み込まれます。

## ビルド

本番向けにビルドするには以下を実行します。

```bash
pnpm build
```

出力は `.output` ディレクトリに生成されます。

## 技術スタック

- [WXT](https://wxt.dev/) - Web Extension Framework
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
