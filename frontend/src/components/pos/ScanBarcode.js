import { useEffect, useRef, useState } from "react";
import {
    Html5QrcodeScanner,
    Html5QrcodeSupportedFormats
} from "html5-qrcode";

export default function ScanBarcode({ open, onDetected, onClose }) {
    const [error, setError] = useState("");

    useEffect(() => {
  if (!open) return;

  const scanner = new Html5QrcodeScanner(
    "barcode-reader",
    {
      fps: 10,
      qrbox: { width: 300, height: 150 },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39
      ]
    },
    false
  );

  scanner.render(
    (decodedText) => {
      onDetected?.(decodedText);
      scanner.clear();
      onClose?.();
    },
    () => {}
  );

  return () => {
    scanner.clear();
  };
}, [open]);

    if (!open) return null;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3 p-3 shadow"
                style={{ width: 420, maxWidth: "95%" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Quét mã barcode</h6>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>

                <div
                    id="barcode-reader"
                    style={{ width: "100%", minHeight: 300 }}
                />

                {error && (
                    <div className="alert alert-warning mt-2 mb-0">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}