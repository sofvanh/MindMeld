import { amberButtonColors, cardClasses, greenButtonColors, interactiveCardClasses, primaryButtonClasses, redButtonColors, secondaryButtonClasses, subtleCardClasses, textFieldClasses, tooltipClasses } from '../styles/defaultStyles';

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
        <div className="mb-8">
          <h3>Text Colors</h3>
          <div>
            <p className="text-slate-900 mb-2"><b>Primary Text (slate-900)</b></p>
            <p className="text-slate-700 mb-2">Default paragraph text (slate-700)</p>
            <p className="text-slate-500 mb-2">Subtle Text (slate-500)</p>
            <a href="#" className="mb-2">Link Text (blue-500, hover blue-700)</a>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="mb-4">Base UI Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className={cardClasses + " h-16"} />
              <p className="text-sm font-medium">white (background)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-50`} />
              <p className="text-sm font-medium">slate-50 (subtle background)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-100`} />
              <p className="text-sm font-medium">slate-100 (hover states)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-slate-200`} />
              <p className="text-sm font-medium">slate-200 (borders)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-blue-500`} />
              <p className="text-sm font-medium">blue-500 (primary actions)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-blue-600`} />
              <p className="text-sm font-medium">blue-600 (primary hover)</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="mb-4">Status Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className={cardClasses + " h-16 !bg-green-500"} />
              <p className="text-sm font-medium">green-500 (success)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-red-500`} />
              <p className="text-sm font-medium">red-500 (failure)</p>
            </div>
            <div className="space-y-2">
              <div className={`${cardClasses} h-16 !bg-amber-500`} />
              <p className="text-sm font-medium">amber-500 (warning)</p>
            </div>
          </div>
        </div>
      </section>


      <section className="mb-12">
        <h2 className="mb-8">Interactive Elements</h2>
        {/* Buttons */}
        <div className="mb-8">
          <h3 className="mb-4">Buttons</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className={primaryButtonClasses}>
              Primary Button
            </button>
            <button className={secondaryButtonClasses}>
              Secondary Button
            </button>
            <button className={`py-2 px-4 rounded ${greenButtonColors}`}>
              Success Button
            </button>
            <button className={`py-2 px-4 rounded ${redButtonColors}`}>
              Error Button
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div className="mb-8">
          <h3 className="mb-4">Form Elements</h3>
          <div className="max-w-sm">
            <input
              type="text"
              placeholder="Text input"
              className={textFieldClasses + " w-full mb-4"}
            />
            <textarea
              className={textFieldClasses + " w-full"}
              placeholder="Text area"
              rows={3}
            />
          </div>
        </div>

        {/* Tooltips */}
        <div className="mb-8">
          <h3 className="mb-4">Tooltips</h3>
          <div className="h-16 flex items-center gap-4">
            <button
              className={`${secondaryButtonClasses} ${tooltipClasses}`}
              data-tooltip="Regular tooltip"
            >
              Hover me
            </button>
            <button
              className={`${primaryButtonClasses} ${tooltipClasses}`}
              data-tooltip="Primary button tooltip"
            >
              Primary with tooltip
            </button>
          </div>
        </div>

        {/* Cards */}
        <div>
          <h3 className="mb-4">Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cardClasses}>
              <h3 className="mb-2">Primary card</h3>
              <p>Standard card for content grouping</p>
            </div>
            <div className={interactiveCardClasses}>
              <h3 className="mb-2">Interactive card</h3>
              <p>Hover me for shadow effect</p>
            </div>
            <div className={subtleCardClasses}>
              <p><b>Subtle card,</b> for secondary information</p>
            </div>
          </div>
        </div>
      </section >

    </div >
  );
};

export default DesignSystemView;