import React from 'react';
import LogoImg from '../assets/images/robo.png'

const Header = ({ title, subtitle }) => {
  return (
    <header className="header">
      <img src={LogoImg} className='logo' alt='Logo'/>
      <h1> {title} </h1>
    </header>
  );
};

export default Header;