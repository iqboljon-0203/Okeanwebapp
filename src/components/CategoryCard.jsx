import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/catalog?category=${category.id}`} className="category-card">
      <div className="icon-box">
        {category.image ? (
          <img src={category.image} alt={category.name} className="cat-img" loading="lazy" />
        ) : (
          <span className="emoji">{category.icon || '📦'}</span>
        )}
      </div>
      <span className="name">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
