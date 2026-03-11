'use client';

import styles from './LoadingSpinner.module.css';

/**
 * Круговой спиннер загрузки (кольцо).
 * @param {number} [size=20] — размер в пикселях (ширина и высота)
 * @param {string} [className] — дополнительный класс
 * @param {object} [style] — инлайн-стили (например, marginRight)
 */
const LoadingSpinner = ({ size = 20, className = '', style = {} }) => (
  <span
    className={`${styles.spinner} ${className}`.trim()}
    style={{
      width: size,
      height: size,
      ...style,
    }}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
