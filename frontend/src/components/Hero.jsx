import React from "react";
import { Link } from "react-router-dom";
import { HERO_IMAGE, HERO_PLACEHOLDER } from "../utils/icons.jsx";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="flex flex-col py-12 sm:py-16 pt-12 sm:pt-16 lg:pt-0 lg:flex-row lg:pb-0 lg:min-h-[80vh]">
        <div className="flex flex-col items-start w-full max-w-xl px-4 sm:px-6 mx-auto lg:px-8 lg:max-w-screen-xl lg:justify-center lg:w-2/5">
          <div className="mb-12 lg:my-16 lg:max-w-xl lg:pr-6">
            <div className="max-w-xl mb-6">
              <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold tracking-wider text-amber-800 uppercase rounded-full bg-amber-200/80">
                JSK Handloom · Handcrafted in India
              </span>
              <h1 className="prata-regular max-w-lg mb-6 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl sm:leading-tight md:text-4xl lg:text-5xl">
                Handloom Tapestries &amp; Wall Hangings
                <br className="hidden sm:block" />
                <span className="text-amber-700">Woven with tradition,</span>
                <br className="hidden sm:block" />
                delivered with care.
              </h1>
              <p className="text-base text-stone-600 md:text-lg leading-relaxed">
                Decorate your home with authentic handloom tapestries—divine, festive, and nature-inspired designs. Each piece is handpicked for quality and craftsmanship, perfect for walls and living spaces.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/collection"
                className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md sm:w-auto bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Shop Collection
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center font-semibold text-stone-700 transition-colors duration-200 hover:text-amber-700"
              >
                Our Story →
              </Link>
            </div>
          </div>
        </div>
        <div className="relative w-full max-w-xl px-4 sm:px-6 mx-auto lg:pl-8 lg:pr-0 lg:mb-0 lg:mx-0 lg:w-3/5 lg:max-w-none lg:flex lg:items-center lg:justify-end min-w-0">
          <img
            className="object-contain w-full h-auto max-h-[40rem] lg:max-h-[45rem] rounded-tl-2xl sm:rounded-tl-3xl rounded-br-2xl sm:rounded-br-3xl shadow-xl"
            src={HERO_IMAGE}
            alt="JSK Handloom handloom tapestries and wall hangings"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = HERO_PLACEHOLDER;
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
