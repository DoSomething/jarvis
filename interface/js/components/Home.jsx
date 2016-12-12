import Search from './Search.jsx';

const React = require('react');

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchModifier: ''
    }
  }

  render() {
    return (
      <div className="container -padded">
        <div className="wrapper">
          <div className="container__block">
            <h2 className="heading -emphasized"><span>Welcome</span></h2>
          </div>
          <div className="container__block">
            <Search />
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
