import logo from './logo.svg';
import './App.css';
import SearchForm from './components/SearchForm';
import TequilaState from './Contexts/Tequila/TequilaState';

function App() {
  return (
    <TequilaState>
      <div className="App">
        <SearchForm />
      </div>
    </TequilaState>

  );
}

export default App;
