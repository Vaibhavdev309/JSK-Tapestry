import React from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "What sizes do you offer?",
    a: "We offer tapestries in multiple dimensions to suit different spaces. Exact size options are listed on each product page. If you need a specific size, mention it in your message on the Contact page or when requesting a price—we may be able to help with custom orders.",
  },
  {
    q: "How do I hang and care for the tapestry?",
    a: "Proper framing is ideal for hanging and helps protect the tapestry. You can use a wooden or metal frame with a rod pocket, or hang with clips. For care: avoid direct sunlight to prevent fading, and dust gently. We can share more care tips when you order.",
  },
  {
    q: "Do you ship across India? How long does delivery take?",
    a: "Yes, we ship all over India. Approximate delivery time is 7 days from order confirmation. You will receive updates on your order status.",
  },
  {
    q: "How does “Request price approval” work?",
    a: "When you add items to the cart and click “Request price approval”, we receive your request. We will call or message you as soon as possible to discuss the product and prices. Once we agree on the details, you can complete the order.",
  },
];

const Faq = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20 min-w-0">
        <header className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold tracking-wider text-amber-800 uppercase rounded-full bg-amber-200/80">
            Help
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 prata-regular mb-4">
            Frequently asked questions
          </h1>
          <p className="text-stone-600">
            Quick answers to common questions about our tapestries and orders.
          </p>
        </header>

        <ul className="space-y-6">
          {faqs.map((faq) => (
            <li key={faq.q} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-stone-900 mb-2">{faq.q}</h2>
              <p className="text-stone-600 text-sm leading-relaxed">{faq.a}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-stone-600 text-sm">
          Still have a question?{" "}
          <Link to="/contact" className="font-medium text-amber-600 hover:text-amber-700">
            Contact us
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Faq;
