import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

const page = (
  <div className='chrome'>
    <div className='wrapper'>
      <nav className='navigation -white -floating'>
        <a className='navigation__logo' href='/admin'><span>DoSomething.org</span></a>
        <div className='navigation__menu'>
          <ul className='navigation__primary'>
            <li>
              <a href='/admin/communicate'>
                <strong className='navigation__title'>Communicate</strong>
                <span className='navigation__subtitle'>Keywords, Flows, Broadcasts</span>
              </a>
            </li>
            <li>
              <a href='/admin/support'>
                <strong className='navigation__title'>Support</strong>
                <span className='navigation__subtitle'>1:1 support messaging</span>
              </a>
            </li>
            <li>
              <a href='/admin/settings'>
                <strong className='navigation__title'>Settings</strong>
                <span className='navigation__subtitle'>Feature flags, Config</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <header className='header' role='banner'>
        <div className='wrapper'>
          <h1 className='header__title'>Jarvis</h1>
          <p className='header__subtitle'>Natural Language Interface</p>
        </div>
      </header>
      <main>
        <App />
      </main>
    </div>
  </div>
);

ReactDOM.render(page, document.getElementById('root'));
