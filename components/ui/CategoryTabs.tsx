'use client';

interface Props {
  categorias: string[];
  ativa: string;
  contagens?: Record<string, number>;
  onChange: (categoria: string) => void;
}

export default function CategoryTabs({ categorias, ativa, contagens, onChange }: Props) {
  const todas = ['Todos', ...categorias];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ touchAction: 'pan-x' }}>
      {todas.map((cat) => {
        const isAtiva = ativa === cat;
        const count = contagens?.[cat];

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition ${
              isAtiva
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {cat}
            {count !== undefined && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 leading-none font-bold ${
                  isAtiva ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
