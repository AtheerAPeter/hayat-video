import { Form, Input, Button, Checkbox, message } from "antd";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

const Register = () => {
  const Router = useRouter();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    fetch("https://zoom-clone-back.herokuapp.com/v1/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      redirect: "follow",
    })
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        Cookies.set("token", result.data.token, { expires: 360 });
        Cookies.set("user", JSON.stringify(result.data.user), { expires: 360 });
        Router.push("/");
      })
      .catch((error) => console.log("error", error));
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div>
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
          <h1 className="login-h1">SIGNUP</h1>
          <div>
            <p>Username</p>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input size={"large"} placeholder="John Doe" />
            </Form.Item>
          </div>
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
              loading={loading}
              disabled={loading}
              size={"large"}
              type="primary"
              htmlType="submit"
              className="submit"
            >
              Submit
            </Button>
          </Form.Item>
          <p style={{ textAlign: "center" }}>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Register;
