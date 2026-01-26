import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="grid gap-8 sm:gap-10 row-gap-6 mb-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link to="/" aria-label="Tapestry home" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold tracking-wide text-amber-400 uppercase prata-regular">
                Tapestry
              </span>
            </Link>
            <div className="mt-6 lg:max-w-sm">
              <p className="text-sm text-stone-400 leading-relaxed">
                We curate authentic Indian handloom tapestries and wall art—from divine and festive motifs to nature and folklore. Each piece is chosen for quality and craftsmanship.
              </p>
              <p className="mt-4 text-sm text-stone-400 leading-relaxed">
                Handcrafted in India, delivered with care to your door.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-base font-bold tracking-wide text-stone-100">Contact</p>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Phone:</span>
              <a href="tel:+91-XXXX-XXX-XXX" aria-label="Phone" className="transition-colors text-amber-400 hover:text-amber-300">
                +91 XXXXX XXXXX
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Email:</span>
              <a href="mailto:hello@tapestry.in" aria-label="Email" className="transition-colors text-amber-400 hover:text-amber-300">
                hello@tapestry.in
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Address:</span>
              <span className="text-stone-400">India</span>
            </div>
          </div>
          <div>
            <p className="text-base font-bold tracking-wide text-stone-100">Connect</p>
            <div className="flex items-center mt-3 gap-4">
              <a href="#" className="text-stone-400 transition-colors hover:text-amber-400" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-stone-400 transition-colors hover:text-amber-400" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 0H2C.895 0 0 .895 0 2v20c0 1.105.895 2 2 2h11v-9h-3v-4h3V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763V11h4.44l-1 4h-3.44v9H22c1.105 0 2-.895 2-2V2c0-1.105-.895-2-2-2z"/></svg>
              </a>
              <a href="#" className="text-stone-400 transition-colors hover:text-amber-400" aria-label="Pinterest">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </a>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              Follow us for new arrivals and weaving stories.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-6 sm:pt-8 pb-8 sm:pb-10 border-t border-stone-700">
          <p className="text-sm text-stone-500 order-2 sm:order-1">
            © {new Date().getFullYear()} Tapestry. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-3 sm:gap-6 mb-0">
            <li>
              <Link to="/about" className="text-sm text-stone-500 transition-colors hover:text-amber-400">About</Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm text-stone-500 transition-colors hover:text-amber-400">Contact</Link>
            </li>
            <li>
              <a href="#" className="text-sm text-stone-500 transition-colors hover:text-amber-400">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="text-sm text-stone-500 transition-colors hover:text-amber-400">Terms & Conditions</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
