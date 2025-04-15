
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/">
      <div className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/0f1afaac-f235-42eb-85f7-c186a64f7818.png" 
          alt="Synvya Logo" 
          className="h-10 w-auto"
        />
      </div>
    </Link>
  );
};

export default Logo;
