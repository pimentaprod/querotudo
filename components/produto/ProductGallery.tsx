'use client';

import { useState, useEffect, useCallback } from 'react';
import { cloudinaryUrl } from '@/lib/cloudinary-url';

interface Props {
  imagens: string[];
  nome: string;
}

export default function ProductGallery({ imagens, nome }: Props) {
  const [ativa, setAtiva] = useState(0);
  const [animando, setAnimando] = useState(false);

  const trocar = useCallback(
    (index: number) => {
      if (index === ativa || animando) return;
      setAnimando(true);
      setTimeout(() => {
        setAtiva(index);
        setAnimando(false);
      }, 150);
    },
    [ativa, animando]
  );

  const anterior = useCallback(() => trocar((ativa - 1 + imagens.length) % imagens.length), [ativa, imagens.length, trocar]);
  const proxima  = useCallback(() => trocar((ativa + 1) % imagens.length), [ativa, imagens.length, trocar]);

  // Navegação por teclado
  useEffect(() => {
    if (imagens.length <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  anterior();
      if (e.key === 'ArrowRight') proxima();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [anterior, proxima, imagens.length]);

  if (imagens.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-300 text-6xl">📷</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagem principal */}
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
        <img
          key={ativa}
          src={cloudinaryUrl(imagens[ativa], 700, 700)}
          alt={`${nome} — foto ${ativa + 1}`}
          className={`w-full h-full object-contain transition-opacity duration-150 ${animando ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Setas de navegação — só com múltiplas imagens */}
        {imagens.length > 1 && (
          <>
            <button
              onClick={anterior}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 transition"
            >
              ‹
            </button>
            <button
              onClick={proxima}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 transition"
            >
              ›
            </button>
            {/* Contador */}
            <span className="absolute bottom-2 right-3 text-xs text-gray-500 bg-white/80 rounded-full px-2 py-0.5">
              {ativa + 1}/{imagens.length}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {imagens.length > 1 && (
        <div className="flex gap-2">
          {imagens.map((img, i) => (
            <button
              key={i}
              onClick={() => trocar(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                i === ativa
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={cloudinaryUrl(img, 64, 64)}
                alt={`${nome} miniatura ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
