import React, { useEffect } from 'react';
import { Store } from 'redux';
import { useSelector } from 'react-redux';
import { getSpecificSource } from 'arca-redux-v4';
import { socket } from '../redux/store';

const App: React.FunctionComponent = () => {
  const aau = useSelector((state: Store) => getSpecificSource(state, 'AAU'));

  useEffect(() => {
    socket.select('AAU');
  }, []);

  return (
    <div className='page'>
      {
        JSON.stringify(aau)
      }
    </div>
  );
};

export default App;
