import { useState, useEffect } from 'react';
import Header from '@components/header';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
function Home() {
  const history = useHistory();
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log(22222);
  });
  return (
    <div className="home">
      <Header />
      <p>{count}</p>
      <Button type="primary" shape="circle" onClick={() => setCount(count + 1)}>
        +1
      </Button>
      <Button type="primary" shape="circle" onClick={() => history.goBack()}>
        back
      </Button>
    </div>
  );
}
export default Home;
