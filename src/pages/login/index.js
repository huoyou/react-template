import Header from '@components/header';
import { Form, Input, Button, Checkbox } from 'antd';
import { useHistory } from 'react-router-dom';
function Login() {
  const history = useHistory();
  const layout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 16
    }
  };
  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16
    }
  };

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const submit = () => {
    history.push('/home', { Id: 1 }); // 跳转到首页，并传参数
  };
  return (
    <div className="login">
      <Header />
      <Form {...layout} name="basic" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout} name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
      </Form>
      <Button type="primary" htmlType="submit" onClick={submit}>
        Submit
      </Button>
    </div>
  );
}
export default Login;
