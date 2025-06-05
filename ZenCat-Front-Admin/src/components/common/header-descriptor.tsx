import React from 'react';
// import styles from './header-descriptor.module.css'; // Remove CSS Module import

interface HeaderDescriptorProps {
  title: string;
  subtitle?: string; // Add optional subtitle prop
}

const HeaderDescriptor: React.FC<HeaderDescriptorProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-10 relative inline-block"> 
      <h1 className="font-montserrat text-5xl font-black text-black m-0 p-0 pb-2.5 inline-block tracking-wide">
        {title}
      </h1>
      
      <div className="my-2 w-[40%] h-[5px] bg-black"></div>

      {subtitle && (
        <p className="font-montserrat text-xl font-extrabold text-black mt-3 tracking-wider">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeaderDescriptor;
