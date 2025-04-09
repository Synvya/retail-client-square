
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/">
      <div className="border-2 border-synvya-dark rounded-md px-4 py-2 inline-block">
        <span className="font-bold text-synvya-dark">Logo</span>
      </div>
    </Link>
  );
};

export default Logo;
