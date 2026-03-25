import { FiStar, FiHeart, FiMapPin, FiCoffee, FiActivity, FiMonitor, FiMusic, FiSmile, FiFolder } from 'react-icons/fi';

/**
 * Maps category slugs to professional Feather Icons.
 * Used across the app instead of emoji icons from the database.
 */
const categoryIconMap = {
  lifestyle: FiStar,
  beauty: FiHeart,
  travel: FiMapPin,
  food: FiCoffee,
  fitness: FiActivity,
  tech: FiMonitor,
  music: FiMusic,
  humor: FiSmile,
};

/**
 * Get the icon component for a category slug.
 * @param {string} slug - Category slug
 * @returns {React.ComponentType} Icon component from react-icons
 */
export function getCategoryIcon(slug) {
  return categoryIconMap[slug] || FiFolder;
}

/**
 * Render category icon as JSX.
 * @param {string} slug - Category slug
 * @param {number} size - Icon size in pixels
 * @returns {JSX.Element}
 */
export function CategoryIcon({ slug, size = 16, className = '' }) {
  const Icon = getCategoryIcon(slug);
  return <Icon size={size} className={className} />;
}
