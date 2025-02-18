import { Link } from 'react-router-dom';
import { IMPORTANCE_COLOR, CONSENSUS_COLOR, FRAGMENTATION_COLOR } from '../utils/colors';
import { useState } from 'react';

export default function Legend() {
  const [isOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  const legendItems = [
    { color: CONSENSUS_COLOR, label: 'High consensus score', description: 'Surprising agreement' },
    { color: FRAGMENTATION_COLOR, label: 'High divergence score', description: 'Surprising disagreement' },
    { color: IMPORTANCE_COLOR, label: 'Important', description: 'Both consensus and divergence are high. This node seems important!' },
  ];

  return (
    <details open={isOpen} className="bg-white/80 rounded-lg shadow-sm flex flex-col max-w-[220px]">
      <summary className="py-3 p-2 cursor-pointer text-sm text-stone-700 font-semibold min-h-10 items-center justify-center">
        Legend
      </summary>
      <div className="bg-white rounded-lg p-2">
        {legendItems.map(({ color, label, description }) => (
          <div key={label} className="flex gap-2 mt-2">
            <div
              className="w-4 h-4 rounded flex-shrink-0"
              style={{
                backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs text-stone-700 font-semibold">{label}</span>
              <span className="text-xs text-stone-500">{description}</span>
            </div>
          </div>
        ))}
        <small className="block py-2 text-stone-700">Connections between nodes show semantic relatedness, weighted by quality.</small>
        <Link to="/scores" className="flex items-center text-xs py-2">What do the scores mean?</Link>
      </div>
    </details>
  );
}
