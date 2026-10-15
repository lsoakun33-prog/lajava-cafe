import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScannerModal({ isOpen, onClose, onSelectTable, tables = [] }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        () => {
          // parse error, ignore frames
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Kamera tidak dapat diakses atau izin ditolak. Silakan pilih meja secara manual.');
      setIsScanning(false);
      setActiveTab('manual');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  };

  const handleDecoded = (decodedText) => {
    stopCamera();
    // Check if URL has ?table=Meja%2001
    try {
      const url = new URL(decodedText);
      const tableParam = url.searchParams.get('table');
      if (tableParam) {
        onSelectTable(tableParam);
        onClose();
        return;
      }
    } catch {
      // not a valid URL, check if string matches table directly
      if (decodedText.startsWith('Meja') || decodedText.startsWith('VIP')) {
        onSelectTable(decodedText);
        onClose();
        return;
      }
    }

    // Default fallback: extract or pass text
    onSelectTable(decodedText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white text-black rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Scan QR Code Meja</h2>
              <p className="text-xs text-zinc-400">Pindai kode QR fisik yang tertempel di meja Anda</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-1 m-4 rounded-xl">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'camera' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Kamera Scanner
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('manual');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manual' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Pilih Meja Manual
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          {activeTab === 'camera' ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-black border border-zinc-800 aspect-square flex items-center justify-center">
                <div id="qr-reader-container" className="w-full h-full"></div>
                {!isScanning && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-white" />
                    <span className="text-xs">Mengaktifkan kamera...</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <p className="text-[11px] text-center text-zinc-500">
                Arahkan kamera tepat ke QR Code Meja yang tersedia di atas meja Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Pilih nomor meja tempat Anda duduk saat ini:
              </p>
              <div className="grid grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <button
                      key={table.id || table.table_number}
                      onClick={() => {
                        onSelectTable(table.table_number);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-white hover:text-black hover:border-white transition-all text-center group"
                    >
                      <div className="text-xs font-bold tracking-wider">{table.table_number}</div>
                      <div className="text-[10px] text-zinc-500 group-hover:text-zinc-700">
                        Kapasitas {table.capacity}
                      </div>
                    </button>
                  ))
                ) : (
                  ['Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05', 'Meja 06', 'VIP Room 01'].map((tName) => (
                    <button
                      key={tName}
                      onClick={() => {
                        onSelectTable(tName);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-white hover:text-black hover:border-white transition-all text-center"
                    >
                      <div className="text-xs font-bold tracking-wider">{tName}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
