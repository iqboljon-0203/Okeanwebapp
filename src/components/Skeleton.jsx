import React from 'react';

const Skeleton = ({ width, height, radius = '12px', className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius: radius 
      }}
    />
  );
};

export default Skeleton;
