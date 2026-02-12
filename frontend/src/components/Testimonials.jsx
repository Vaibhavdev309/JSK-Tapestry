import React from "react";

const Star = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const testimonials = [
  {
    name: "Priya",
    location: "Varanasi",
    initial: "P",
    text: "Radha Krishna piece is even better in person—smooth weave, rich colours. Now the centre of our living room. Would recommend.",
  },
  {
    name: "Raj",
    location: "Lucknow",
    initial: "R",
    text: "Got the Lakshmi ji one for my parents’ anniversary. They loved it. Packing was good, delivery was on time.",
  },
  {
    name: "Anjali",
    location: "Delhi",
    initial: "A",
    text: "Good variety—spiritual, festive, nature. I picked two for different rooms. Quality is consistent.",
  },
  {
    name: "Kavita",
    location: "Patna",
    initial: "K",
    text: "Adds a warm, traditional feel to the home. You can tell it’s handloom. Planning to order one more.",
  },
  {
    name: "Arun",
    location: "Mumbai",
    initial: "A",
    text: "Ganesh ji wall hanging looks great. Customer support was helpful when I had a query. Worth it.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-stone-50/80">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          What Our Customers Say
        </h2>
        <p className="text-center text-stone-500 mt-2 max-w-xl mx-auto">
          Real reviews from people who’ve brought a piece of JSK Handloom into their homes.
        </p>

        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="rounded-xl bg-white p-6 shadow-sm border border-stone-100 sm:p-7"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-semibold text-lg">
                  {t.initial}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} />
                    ))}
                  </div>
                  <p className="mt-1 font-medium text-stone-900">{t.name}{t.location ? `, ${t.location}` : ""}</p>
                </div>
              </div>
              <p className="mt-4 text-stone-600 text-sm leading-relaxed">
                {t.text}
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
