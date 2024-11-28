import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-4 text-center h-16 flex items-center justify-center text-sm text-slate-400">
      <div className="flex justify-between w-full">
        <p className="text-slate-400">
          Crafted by
          <span className="hover:text-slate-600"> Niki</span> {/* TODO Add Niki's website once it exists */}
          and&nbsp;
          <a href="https://sofiavanhanen.fi" target="_blank" rel="noopener noreferrer">Sofi</a>
        </p>
        <a href="https://github.com/sofvanh/mindmeld" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
          <FaGithub className="w-4 h-4 mr-1" />
          Source
        </a>
      </div>
    </footer >
  );
}