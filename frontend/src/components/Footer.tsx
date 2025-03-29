import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 px-4 flex text-sm text-stone-400">
      <div className="flex flex-col sm:flex-row items-center text-center sm:items-start sm:text-left justify-between w-full max-w-screen-md mx-auto my-16 gap-4 sm:px-4">
        <div className="flex flex-col">
          <div>
            <Link to="/" className="nexus-logo text-2xl">Nexus</Link>
          </div>
          <div className="text-stone-400">
            An open-source project by <a href="https://mosaic-labs.org" target="_blank" rel="noopener noreferrer">Mosaic Labs</a>
          </div>
          <div className="text-stone-400">
            Built with support from <a href="https://lightspeedgrants.org/" target="_blank" rel="noopener noreferrer">Lightspeed Grants</a>
          </div>
          <div className="text-stone-400">
            © {new Date().getFullYear()}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-stone-400 font-semibold pb-2">LINKS</div>
          <div className="flex flex-col text-stone-400">
            <Link to="/">Home</Link>
            <Link to="/docs">Docs</Link>
            <a href="https://github.com/sofvanh/mindmeld" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
              GitHub
            </a>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-stone-400 font-semibold pb-2">ABOUT</div>
          <div className="flex flex-col text-stone-400">
            <a href="https://mosaic-labs.org" target="_blank" rel="noopener noreferrer">Mosaic Labs</a>
            <a href="mailto:hello@mosaic-labs.org">Get in touch</a>
          </div>
        </div>

      </div>
    </footer >
  );
}
