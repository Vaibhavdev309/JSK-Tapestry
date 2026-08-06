import React from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGE, HERO_PLACEHOLDER } from "../utils/icons.jsx";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/*
        Hero image behaves differently by breakpoint so it stays readable everywhere:
        - Mobile / tablet (<lg): a normal block banner on top; text sits below it.
        - Desktop (lg+): absolutely positioned full-bleed background; text overlays
          the empty wall space on the left.
      */}
      <img
        src={HERO_IMAGE}
        alt="JSK Handloom tapestries and wall hangings displayed in a traditional Indian home"
        className="block w-full h-64 sm:h-80 object-cover object-[68%_center]
                   lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-cover lg:object-center"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = HERO_PLACEHOLDER;
        }}
      />

      {/* Readability scrim over the image — desktop only, where text overlays the image. */}
      <div className="hidden lg:block lg:absolute lg:inset-0 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/35 lg:to-transparent" />

      {/* Content */}
      <div className="relative">
        <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center lg:min-h-[82vh]">
            <div className="w-full max-w-xl py-10 sm:py-12 lg:py-24 lg:max-w-lg">
              <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-amber-200/80 text-amber-800 lg:bg-amber-400/20 lg:text-amber-100">
                JSK Handloom · Handcrafted in India
              </span>
              <h1 className="prata-regular mb-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl sm:leading-tight text-stone-900 lg:text-white">
                Handloom Tapestries &amp; Wall Hangings
                <br />
                <span className="text-amber-700 lg:text-amber-300">Woven with tradition,</span>
                <br />
                delivered with care.
              </h1>
              <p className="text-base md:text-lg leading-relaxed text-stone-600 lg:text-stone-100">
                Decorate your home with authentic handloom tapestries—divine, festive, and nature-inspired designs. Each piece is handpicked for quality and craftsmanship, perfect for walls and living spaces.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  to="/collection"
                  className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md sm:w-auto bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Shop Collection
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center h-12 font-semibold transition-colors duration-200 text-stone-700 hover:text-amber-700 lg:text-stone-100 lg:hover:text-amber-300"
                >
                  Our Story →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
