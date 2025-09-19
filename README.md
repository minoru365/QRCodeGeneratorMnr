<!-- Language: 日本語 / English -->

# QRCodeGeneratorGH PCF

日本語 / Japanese | [English](#english)

Power Apps でテキストから QR コードを生成して表示する PCF コントロールです。キャンバス/モデル駆動どちらでも利用できます。生成した QR の PNG データ URL を出力プロパティ `qrDataUrl` で取得でき、Power Automate などに連携できます。

## 前提条件
- Node.js LTS (推奨 v18)
- Microsoft Power Platform CLI (`pac`)
- .NET 6 SDK もしくは Visual Studio Build Tools（ソリューション作成時）

## セットアップ
1. 依存関係のインストール

```pwsh
npm install
```

2. 型を生成（必要に応じて）
```pwsh
npm run refreshTypes
```

## ビルドとローカル確認
- ビルド
```pwsh
npm run build
```
- ウォッチ + サンドボックス起動
```pwsh
npm start
```
ブラウザで http://localhost:8181 を開くと、コントロールをサンドボックスで確認できます。

## Dataverse ソリューション化（このリポジトリには含めません）

リポジトリにはソリューションを含めていません（`.gitignore` で `Solutions/` を除外）。必要に応じてローカルで生成してください。

手順（例: Publisher=minoru/mnr, Managed 出力）:
```pwsh
# リポジトリのルートで実行
pac solution init --publisher-name "minoru" --publisher-prefix "mnr" --outputDirectory .\Solutions
pac solution add-reference --path .\PCFProject --solution-directory .\Solutions

# Managed 出力にする（Solutions/Solutions.cdsproj を編集）
# <SolutionPackageType>Managed</SolutionPackageType>

# Release ビルド実行
cd Solutions
dotnet build -c Release
```
生成物（Managed）: `Solutions/bin/Release/Solutions.zip`

インポート手順:
1) 管理センターまたは Maker Portal で環境を開く
2) ソリューション > インポート
3) 上記 `Solutions.zip`（Managed）を指定

### 別環境でソリューションを一から作る場合（参考）
```pwsh
# 1) ソリューションのひな形を作成（発行者名/Prefixを指定）
pac solution init --publisher-name "minoru" --publisher-prefix "mnr" --outputDirectory .\Solutions

# 2) PCF プロジェクト（.pcfproj）をソリューションへ参照追加
pac solution add-reference --path .\PCFProject --solution-directory .\Solutions

# 3) Managed 出力にしたい場合は Solutions.cdsproj を編集
#    <SolutionPackageType>Managed</SolutionPackageType>

# 4) Release ビルドで zip 生成
cd Solutions
dotnet build -c Release
```

注記:
- pac solution init は --solution-name ではなく、出力先 `--outputDirectory` を指定します（ソリューション名は `Solutions/src/Other/Solution.xml` に記述）。
- Publisher は `--publisher-name`（表示名）と `--publisher-prefix`（接頭辞）の2つを指定します。

## コントロール プロパティ
- textToEncode: エンコードする文字列（バインド可）
- errorCorrection: エラー訂正レベル L/M/Q/H（既定: M）
- size: 画像/キャンバスのサイズ px（既定: 256）
- margin: 静寂域（モジュール数、既定: 4）
- foregroundColor: 前景色 HEX（既定: #000000）
- backgroundColor: 背景色 HEX（既定: #ffffff）
- asImage: true で <img>、false で <canvas> に描画（既定: false）

出力:
- qrDataUrl: 生成した QR の PNG Data URL（SingleLine.Text）。画像コントロールの Image に `QRCodeGeneratorGH_1.qrDataUrl` のように設定可能。Power Automate にも渡せます。

## 既知の注意点
- 入力テキストが空の場合はプレースホルダー表示になります。
- 入力が空のときは `qrDataUrl` は空文字になります。

## ライセンス
This project uses the MIT-licensed `qrcode` npm package.

---

## English

Power Apps PCF control to generate and display QR codes from text. Works in both Canvas and Model-driven apps. The generated QR PNG data URL is exposed via the output property `qrDataUrl`, which can be used in Power Automate and other processes.

### Prerequisites
- Node.js LTS (recommended v18)
- Microsoft Power Platform CLI (`pac`)
- .NET 6 SDK or Visual Studio Build Tools (for solution packaging)

### Setup
1. Install dependencies
```pwsh
npm install
```
2. Generate types (when you change manifest)
```pwsh
npm run refreshTypes
```

### Build and local sandbox
- Build
```pwsh
npm run build
```
- Watch + sandbox
```pwsh
npm start
```
Open http://localhost:8181 to test the control in the sandbox.

### Dataverse Solution (not included in this repo)
This repository does not contain the packaged solution (`Solutions/` is ignored). Generate it locally when needed.

Steps (e.g., Publisher=minoru/mnr, Managed output):
```pwsh
# Run at repo root
pac solution init --publisher-name "minoru" --publisher-prefix "mnr" --outputDirectory .\Solutions
pac solution add-reference --path .\PCFProject --solution-directory .\Solutions

# Enable Managed output (edit Solutions/Solutions.cdsproj)
# <SolutionPackageType>Managed</SolutionPackageType>

# Build release
cd Solutions
dotnet build -c Release
```
Output (Managed): `Solutions/bin/Release/Solutions.zip`

Import steps:
1) Open your environment in Admin Center or Maker Portal
2) Solutions > Import
3) Select the Managed `Solutions.zip` above

### Build a fresh solution in another environment (reference)
```pwsh
# 1) Initialize a solution skeleton with publisher info
pac solution init --publisher-name "minoru" --publisher-prefix "mnr" --outputDirectory .\Solutions

# 2) Add your PCF project (.pcfproj) as a reference
pac solution add-reference --path .\PCFProject --solution-directory .\Solutions

# 3) To output Managed package, edit Solutions.cdsproj
#    <SolutionPackageType>Managed</SolutionPackageType>

# 4) Build Release zip
cd Solutions
dotnet build -c Release
```

Notes:
- pac solution init uses `--outputDirectory` rather than `--solution-name`; the actual solution name is in `Solutions/src/Other/Solution.xml`.
- Publisher has two parts: `--publisher-name` (display name) and `--publisher-prefix` (customization prefix).

### Control properties
- textToEncode: string to encode (bindable)
- errorCorrection: L/M/Q/H (default: M)
- size: canvas/image size in px (default: 256)
- margin: quiet zone in modules (default: 4)
- foregroundColor: HEX (default: #000000)
- backgroundColor: HEX (default: #ffffff)
- asImage: true to render as <img>, false for <canvas> (default: false)

Output:
- qrDataUrl: PNG Data URL (SingleLine.Text). You can set an image control's Image property to `QRCodeGeneratorGH_1.qrDataUrl` in Canvas apps, or pass it to Power Automate.

### Notes
- If the input text is empty, a placeholder is displayed.
- When the input is empty, `qrDataUrl` becomes an empty string.

### License
This project uses the MIT-licensed `qrcode` npm package.
