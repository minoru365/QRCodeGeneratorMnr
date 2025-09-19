# QRCodeGeneratorGH PCF

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

## Dataverse ソリューション化（本リポジトリに含まれます）

本リポジトリには既にソリューション プロジェクトが含まれています。
- ソリューション フォルダ: `Solutions`（Publisher: minoru/mnr, Managed）
- PCF プロジェクト（.pcfproj）: `PCFProject`

Release ビルドで Managed zip を生成済みです。再ビルドする場合は以下。
```pwsh
cd Solutions
dotnet build -c Release
```
生成物（Managed）: `Solutions/bin/Release/Solutions.zip`

インポート手順:
1) 管理センターまたは Maker Portal で環境を開く
2) ソリューション > インポート
3) 上記 `Solutions.zip`（Managed）を指定

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
