const React = require('react');

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchModifier: ''
    }
  }

  render() {
    return (
      <div className="container__block -half">
        <input type="text" className="text-field -{this.state.searchModifier}" placeholder="test@dosomething.org"></input>
        <p className="footnote">Supports phone, northstar user id, email.</p>
      </div>
    );
  }
}

export default Search;
