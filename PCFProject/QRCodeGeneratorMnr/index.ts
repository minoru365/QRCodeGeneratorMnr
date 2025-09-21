/// <reference types="powerapps-component-framework" />
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as QRCode from "qrcode";

// ECC (Error Correction Level): QR の誤り訂正レベルを表す型
// L: 約7%復元 / M: 約15%復元 / Q: 約25%復元 / H: 約30%復元
// 値を高くするほど汚れ・欠損に強いが、データ密度が上がりサイズや読み取りに影響
type ECC = "L" | "M" | "Q" | "H";

/**
 * QRCodeGeneratorMnr コントロール本体。
 * - 入力テキストから QR コードを生成し、`<img>` に表示します。
 * - 生成した PNG の Data URL を出力プロパティ `qrDataUrl` として返します。
 */
export class QRCodeGeneratorMnr implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  // コントロールのルート要素（この中に img やメッセージを描画）
  private _container!: HTMLDivElement;
  // Power Apps から渡される実行時コンテキスト（プロパティ値取得などに使用）
  private _context!: ComponentFramework.Context<IInputs>;
  // 出力値が変わったことをホストに通知するコールバック（getOutputs が再評価される）
  private _notifyOutputChanged!: () => void;
  // 表示用の <img> 要素（QR の Data URL を src に設定）
  private _img?: HTMLImageElement;
  // 生成済みの PNG Data URL（出力プロパティとして返す値）
  private _qrDataUrl: string = "";

  // constructor は空実装のため省略可（init 内で初期化を実施）
  constructor() {}

  /**
   * コントロールの初期化（DOM のセットアップや初回描画）
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;

    // ルート要素を作成し、ホストから渡されたコンテナにぶら下げる
    this._container = document.createElement("div");
    this._container.className = "QRCode.QRCodeGeneratorMnr";
    container.appendChild(this._container);

    // 初回描画
    this.render();
  }

  /**
   * 入力プロパティ/サイズ/テーマの変化などで高頻度に呼ばれる。ここで再描画する。
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
    this.render();
  }

  /**
   * コントロールのクリーンアップ（DOM から要素を取り外す）
   */
  public destroy(): void {
    if (this._img?.parentElement) this._img.parentElement.removeChild(this._img);
  }

  /**
   * 画面描画ロジック：入力から QR を生成し、img に表示。qrDataUrl も更新。
   */
  private render(): void {
    // 入力値を取得（マニフェストで定義したプロパティ）。未設定時は既定値を採用。
    const text = this._context.parameters.textToEncode.raw ?? "";
    const ecc = (this._context.parameters.errorCorrection?.raw as ECC) || "M";
    const size = this._context.parameters.size?.raw ?? 256;
    const margin = this._context.parameters.margin?.raw ?? 4;
    const colorDark = this._context.parameters.foregroundColor?.raw || "#000000";
    const colorLight = this._context.parameters.backgroundColor?.raw || "#ffffff";
    // このコントロールは常に <img> で表示します（canvas は使用しません）

    // 既存の子要素を一度クリア（再描画時に重複しないように）
    while (this._container.firstChild) this._container.removeChild(this._container.firstChild);

    // 入力テキストが空の場合は、プレースホルダーを表示して出力を空にする
    if (!text) {
      const placeholder = document.createElement("div");
      placeholder.className = "qr-placeholder";
      placeholder.textContent = "Enter text to generate QR";
      this._container.appendChild(placeholder);
      if (this._qrDataUrl !== "") {
        this._qrDataUrl = "";
        this._notifyOutputChanged();
      }
      return;
    }

    // qrcode ライブラリに渡すオプション（誤り訂正、余白、色、サイズ）
    const opts: any = {
      errorCorrectionLevel: ecc,
      margin,
      color: { dark: colorDark, light: colorLight },
      width: size,
    };

    // img 要素を生成してコンテナに追加。Data URL が生成されたら src に設定。
    this._img = document.createElement("img");
    this._img.alt = "QR Code";
    this._container.appendChild(this._img);
    QRCode.toDataURL(text, opts, (err, url) => {
      if (err) return this.showError(err);
      if (url) {
        this._img!.src = url;
        this._qrDataUrl = url;
        // 出力変更を通知（ホストが getOutputs を再取得する）
        this._notifyOutputChanged();
      }
    });
  }

  /**
   * 失敗時の簡易エラーレンダリング（画面にメッセージを表示）
   */
  private showError(e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const err = document.createElement("div");
    err.className = "qr-error";
    err.textContent = `QR generation failed: ${msg}`;
    this._container.appendChild(err);
  }

  /**
   * ホストへ返す出力値（qrDataUrl）。notifyOutputChanged 後に呼ばれる。
   */
  public getOutputs(): IOutputs {
    return {
      qrDataUrl: this._qrDataUrl,
    };
  }
}

// PCF ライフサイクル（標準コントロール）概要
// - init(context, notifyOutputChanged, state, container):
//     初期化。DOM 構築やイベント購読などを行う（1度だけ）
// - updateView(context):
//     入力プロパティの変化、サイズ/テーマの変化などで高頻度に呼ばれる。画面更新はここで行う
// - notifyOutputChanged():
//     出力が変わったときにコール。直後にホストから getOutputs() が呼ばれるトリガー
// - getOutputs():
//     現在の出力値を返す（副作用は持たせない）
// - destroy():
//     破棄時に呼ばれる。タイマー/購読解除、DOM 片付けなど
//
// 本コントロールでは：
// - init でルートDOMを作成し render() を実行
// - updateView で context を更新して render() を再実行
// - QR の Data URL 生成時に notifyOutputChanged() → getOutputs() で qrDataUrl を返す
// - destroy で追加した要素を片付ける
