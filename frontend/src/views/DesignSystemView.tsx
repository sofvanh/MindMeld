import { cardClasses, interactiveCardClasses, primaryButtonClasses, secondaryButtonClasses, subtleCardClasses, textFieldClasses } from '../styles/defaultStyles';

const DesignSystemView = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="mb-12">MindMeld Design System</h1>

      <section className="mb-12">
        <h2 className="mb-8">Typography</h2>
        <div className="space-y-4">
          <h1>Heading One</h1>
          <h2>Heading Two</h2>
          <h3>Heading Three</h3>
          <p>Regular paragraph text</p>
          <p className="text-sm">Small paragraph text</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-8">Colors</h2>
        <div>
          <h3>Text Colors</h3>
          <div>
            <p className="mb-2">Primary Text (slate-900)</p>
            <p className="text-slate-700 mb-2">Secondary Text (slate-700)</p>
            <p className="text-slate-500 mb-2">Subtle Text (slate-500)</p>
            <a href="#" className="mb-2">Link Text (blue-500)</a>
          </div>
        </div>
        <div>
          <h3 className="mt-8">UI Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className={cardClasses + "h-16"} />
              <p className="text-sm font-medium">white</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-100`} />
              <p className="text-sm font-medium">slate-100</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-500`} />
              <p className="text-sm font-medium">slate-500</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-700`} />
              <p className="text-sm font-medium">slate-700</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-900`} />
              <p className="text-sm font-medium">slate-900</p>
            </div>
          </div>
        </div>
      </section>


      <section className="mb-12">
        <h2>Elements</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          <button className={primaryButtonClasses + " w-full"}>
            Primary Button
          </button>
          <button className={secondaryButtonClasses + " w-full"}>
            Text Button
          </button>
          <div className="space-y-4 w-full">
            <input
              type="text"
              placeholder="Text input"
              className={textFieldClasses + " w-full"}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={cardClasses}>
            <h2>Primary card</h2>
            <p>More text ...</p>
          </div>
          <div className={interactiveCardClasses}>
            <h2>Interactive card</h2>
          </div>
          <div className={subtleCardClasses}>
            <h3>Secondary card</h3>
          </div>
        </div>
      </section >

    </div >
  );
};

export default DesignSystemView;