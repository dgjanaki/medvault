import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'motion/react';
import { X, Camera } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
    });

    scanner.render((result) => {
      // Result is usually a URL in this app
      const patientId = result.split('/').pop();
      onScan(patientId);
      scanner.clear();
      onClose();
    }, (error) => {
      // Console error is expected for missing QR
    });

    return () => scanner.clear();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-[100] flex flex-col p-6"
    >
      <div className="flex justify-between items-center text-white mb-8">
        <div className="flex items-center gap-2">
          <Camera size={20} />
          <h2 className="font-bold uppercase tracking-widest text-sm">Scan QR Code</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          id="reader" 
          className="w-full bg-black rounded-3xl overflow-hidden border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
        ></div>
        <p className="text-white/60 text-sm mt-8 text-center max-w-[250px]">
          Point your camera at the patient's QR code displayed on their MedVault dashboard.
        </p>
      </div>
    </motion.div>
  );
}
