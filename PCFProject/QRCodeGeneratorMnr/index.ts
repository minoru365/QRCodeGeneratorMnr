/// <reference types="powerapps-component-framework" />
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as QRCode from "qrcode";

type ECC = "L" | "M" | "Q" | "H";

export class QRCodeGeneratorMnr implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container!: HTMLDivElement;
  private _context!: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged!: () => void;
  private _img?: HTMLImageElement;
  private _canvas?: HTMLCanvasElement;
  private _qrDataUrl: string = "";

  constructor() {}

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = document.createElement("div");
    this._container.className = "QRCode.QRCodeGeneratorMnr";
    container.appendChild(this._container);
    this.render();
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
    this.render();
  }

  public destroy(): void {
    if (this._img?.parentElement) this._img.parentElement.removeChild(this._img);
    if (this._canvas?.parentElement) this._canvas.parentElement.removeChild(this._canvas);
  }

  private render(): void {
    const text = this._context.parameters.textToEncode.raw ?? "";
    const ecc = (this._context.parameters.errorCorrection?.raw as ECC) || "M";
    const size = this._context.parameters.size?.raw ?? 256;
    const margin = this._context.parameters.margin?.raw ?? 4;
    const colorDark = this._context.parameters.foregroundColor?.raw || "#000000";
    const colorLight = this._context.parameters.backgroundColor?.raw || "#ffffff";
    const asImage = !!(this._context.parameters as any).asImage?.raw;

    while (this._container.firstChild) this._container.removeChild(this._container.firstChild);

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

    const opts: any = {
      errorCorrectionLevel: ecc,
      margin,
      color: { dark: colorDark, light: colorLight },
      width: size,
    };

    if (asImage) {
      this._img = document.createElement("img");
      this._img.alt = "QR Code";
      this._container.appendChild(this._img);
      QRCode.toDataURL(text, opts, (err, url) => {
        if (err) return this.showError(err);
        if (url) {
          this._img!.src = url;
          this._qrDataUrl = url;
          this._notifyOutputChanged();
        }
      });
    } else {
      this._canvas = document.createElement("canvas");
      this._canvas.width = size;
      this._canvas.height = size;
      this._container.appendChild(this._canvas);
      QRCode.toCanvas(this._canvas, text, opts, (err) => {
        if (err) {
          this.showError(err);
          return;
        }
        try {
          const url = this._canvas!.toDataURL("image/png");
          this._qrDataUrl = url;
          this._notifyOutputChanged();
        } catch (e) {
          this.showError(e);
        }
      });
    }
  }

  private showError(e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const err = document.createElement("div");
    err.className = "qr-error";
    err.textContent = `QR generation failed: ${msg}`;
    this._container.appendChild(err);
  }

  public getOutputs(): IOutputs {
    return {
      qrDataUrl: this._qrDataUrl,
    };
  }
}
