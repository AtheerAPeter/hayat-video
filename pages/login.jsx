import { Form, Input, Button, Checkbox, message } from "antd";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const Router = useRouter();
  useEffect(() => {
    check();
  }, []);
  const check = async () => {
    const token = await Cookies.get("token");
    if (token) Router.push("/");
    else setIsVisible(true);
  };

  const onFinish = async (values) => {
    setLoading(true);
    const req = await fetch("https://zoom-clone-back.herokuapp.com/v1/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    });
    console.log(values);
    const data = await req.json();
    if (!data.status) {
      return message.error(data.error);
    }
    if (data) setLoading(true);
    console.log(data);
    Cookies.set("token", data.data.token, { expires: 360 });
    Cookies.set("user", JSON.stringify(data.data.user), { expires: 360 });
    Router.push("/");
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    isVisible && (
      <div className="login">
        <Form
          className="login-form"
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <h1 className="login-h1">LOGIN</h1>
          <div>
            <p>Email</p>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input size={"large"} placeholder="example@domain.com" />
            </Form.Item>
          </div>

          <div>
            <p>Password</p>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password size={"large"} placeholder="password" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              size={"large"}
              type="primary"
              htmlType="submit"
              className="submit"
              loading={loading}
              disabled={loading}
            >
              Submit
            </Button>
          </Form.Item>
          <p style={{ textAlign: "center" }}>
            Dont have an account? <Link href="/register">Register</Link>
          </p>
        </Form>
      </div>
    )
  );
};

export default Login;
