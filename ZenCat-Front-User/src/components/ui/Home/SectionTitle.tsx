import * as React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
    {children}
  </h2>
);

export default SectionTitle;
