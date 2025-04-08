import { Link } from 'react-router-dom';

const CategoryHero = ({ title, description, image, ctaText, ctaLink }) => {
  return (
    <div className="relative bg-white mt-16 sm:mt-20">
      {/* Background Image with improved contrast and rounded corners */}
      <div className="absolute inset-0 overflow-hidden h-[200px] sm:h-[250px] md:h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Content with improved positioning and readability */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl bg-black/40 p-4 sm:p-6 rounded-2xl backdrop-blur-sm shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-100">
            {description}
          </p>
          {ctaText && ctaLink && (
            <div className="mt-4 sm:mt-6">
              <Link
                to={ctaLink}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#39b54a] hover:bg-[#2d9240] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryHero; 