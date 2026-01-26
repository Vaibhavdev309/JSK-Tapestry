import React from "react";
import { Link } from "react-router-dom";
import { ABOUT_IMAGE, ABOUT_PLACEHOLDER } from "../utils/icons.jsx";

const About = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-20 min-w-0">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold tracking-wider text-amber-800 uppercase rounded-full bg-amber-200/80">
              Our Story
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 prata-regular mb-6">
              Weaving heritage into every home
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed mb-6">
              Tapestry grew from a simple idea: to bring authentic Indian handloom wall art and tapestries to people who value craftsmanship and tradition. Each piece we curate tells a story—of weavers, motifs, and the rich culture they come from.
            </p>
            <Link
              to="/collection"
              className="inline-flex items-center justify-center h-12 px-6 font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors"
            >
              Explore the collection
            </Link>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2">
            <img
              src={ABOUT_IMAGE}
              alt="Indian handloom and tapestries"
              className="w-full rounded-2xl shadow-xl object-cover aspect-[4/3] lg:aspect-auto lg:max-h-[420px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ABOUT_PLACEHOLDER;
              }}
            />
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 prata-regular text-center mb-12">
          What we do
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Curate with care</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              We source tapestries from skilled weavers and workshops across India. Every design is handpicked for quality, finish, and authenticity—from divine and festive motifs to nature and folklore.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Honour the craft</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Handloom is at the heart of what we do. We work with weavers who preserve traditional techniques, so each tapestry carries the warmth and character of something made by hand.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Deliver to your door</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              We pack each order with care and ship across India. You can shop with confidence—we offer easy returns and exchanges so you find the right piece for your space.
            </p>
          </div>
        </div>
      </section>

      {/* Values / Promise */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 prata-regular text-center mb-12">
            Our promise to you
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 mb-2">Quality</p>
              <p className="text-stone-600 text-sm">Only pieces that meet our standards for texture, colour, and finish.</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 mb-2">Authenticity</p>
              <p className="text-stone-600 text-sm">Genuine handloom and heritage-inspired designs, not mass-produced prints.</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 mb-2">Care</p>
              <p className="text-stone-600 text-sm">Safe packaging and reliable delivery, with support when you need it.</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 mb-2">Trust</p>
              <p className="text-stone-600 text-sm">Transparent policies, honest descriptions, and an easy exchange process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-3xl p-8 sm:p-12 text-center border border-amber-100/80">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 prata-regular mb-3">
            Ready to find your piece?
          </h2>
          <p className="text-stone-600 mb-6 max-w-lg mx-auto">
            Browse our collection of tapestries—from divine art and festivals to nature and stories—and bring a touch of Indian heritage home.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center justify-center h-12 px-8 font-medium text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;
