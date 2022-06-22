
import './style.css';
import React from 'react';

const Header = ({ signIn, signOut, currentUser, create }) => {
  return (
    <div id="header">
      <div id="appName">
        <div id="appTitle">
          Real Estate App
        </div>
        <div id="newProperty" onClick={create}>+</div>
      </div>
      <div id="user">
        {currentUser ? <div>
          <span>{currentUser}</span>
          <button onClick={signOut}>Sign out</button></div> : <button onClick={signIn}>Log in</button>}
      </div>
    </div>

  );
}

export default Header;
