import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex gap-2 items-center mb-1">
      <p className="text-stone-500">
        {text1} <span className="text-stone-800 font-semibold">{text2}</span>
      </p>
      <span className="w-8 sm:w-12 h-0.5 sm:h-1 bg-amber-500/80 rounded-full" aria-hidden />
    </div>
  );
};

export default Title;
