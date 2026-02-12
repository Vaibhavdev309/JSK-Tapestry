import React from "react";

const OurPolicy = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
      <h2 className="text-stone-800 text-3xl sm:text-4xl font-extrabold text-center mb-4">
        Why Choose JSK Handloom
      </h2>
      <p className="text-stone-500 text-center mb-12 max-w-2xl mx-auto">
        We bring you authentic handloom tapestries with a promise of quality, care, and support. Every piece is chosen with care for your home.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-2xl sm:max-w-none mx-auto">
        {/* Handwoven Quality */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-stone-100">
          <div className="p-8">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M3 12h18M5 7l7 7 7-7M5 17l7-7 7 7" />
              </svg>
            </div>
            <h3 className="text-stone-800 text-xl font-semibold mb-3">
              Handwoven Quality
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Each tapestry is sourced from skilled Indian weavers. We curate only pieces that meet our standards for texture, finish, and durability.
            </p>
          </div>
        </div>

        {/* Safe Packaging & Delivery */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-stone-100">
          <div className="p-8">
            <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-rose-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <h3 className="text-stone-800 text-xl font-semibold mb-3">
              Safe Packaging & Delivery
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Your tapestries are carefully packed to avoid damage in transit. We ship across India with reliable partners so your order reaches you in perfect condition.
            </p>
          </div>
        </div>

        {/* Easy Exchange */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-stone-100">
          <div className="p-8">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4 4 4" />
                <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
                <path d="M3 12h10" />
              </svg>
            </div>
            <h3 className="text-stone-800 text-xl font-semibold mb-3">
              Easy Exchange
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Not the right fit? Our exchange policy makes it simple to swap for another design or size. We’re here to help you find the perfect piece.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPolicy;
