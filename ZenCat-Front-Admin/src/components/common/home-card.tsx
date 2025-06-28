import React from 'react';

interface HomeCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string | number;
  descColor?: string;
  isLoading?: boolean;
}

const HomeCard: React.FC<HomeCardProps> = ({
  icon,
  iconBgColor,
  title,
  description,
  descColor = 'text-gray-800',
  isLoading = false,
}) => {
  return (
    <div
      className={`bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 min-w-[350px] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${isLoading ? 'animate-pulse' : ''}`}
    >
      <div
        className={`p-4 rounded-full ${iconBgColor} transition-colors duration-200 hover:scale-110 ${isLoading ? 'animate-spin' : ''}`}
      >
        {isLoading ? (
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
        ) : (
          icon
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium transition-colors duration-200">
          {title}
        </p>
        {isLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
        ) : (
          <p
            className={`${descColor} text-2xl font-semibold transition-colors duration-200`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomeCard;
