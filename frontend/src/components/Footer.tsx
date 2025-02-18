import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 px-4 text-center flex items-center justify-center text-sm text-stone-400">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full my-16">
        <p className="text-stone-400">
          © 2024-{new Date().getFullYear()} · Crafted by <a href="https://mosaic-labs.org" target="_blank" rel="noopener noreferrer">Mosaic Labs</a>
        </p>
        <a href="https://github.com/sofvanh/mindmeld" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
          <FaGithub className="w-4 h-4 mr-1" />
          Source
        </a>
      </div>
    </footer >
  );
}
