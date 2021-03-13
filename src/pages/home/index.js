import Header from '@components/header';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
function Home() {
  const history = useHistory();
  return (
    <div className="home">
      <Header />
      <p>222222</p>
      <Button type="primary" shape="circle" onClick={() => history.goBack()}>
        back
      </Button>
    </div>
  );
}
export default Home;
