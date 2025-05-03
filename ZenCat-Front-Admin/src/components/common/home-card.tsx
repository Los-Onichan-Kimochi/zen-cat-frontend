import React from 'react';

interface HomeCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string | number;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  icon, 
  iconBgColor, 
  title, 
  description 
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 min-w-[350px]">
      <div className={`p-4 rounded-full ${iconBgColor}`}> 
        {icon} 
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-gray-800 text-2xl font-semibold">{description}</p>
      </div>
    </div>
  );
};

export default HomeCard;
