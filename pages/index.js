import { Button, Avatar, Popover } from "antd";

import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Home = () => {
  const Router = useRouter();

  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);

  const startNewRoom = async () => {
    setLoading(true);
    const token = await Cookies.get("token");
    var myHeaders = new Headers();
    myHeaders.append("token", token);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("http://localhost:4000/v1/uuid", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        if (result.status) {
          Router.push(`/room/${result.data.roomId}`);
        }
      })
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    getAndSet();
  }, []);

  const getAndSet = async () => {
    const user = await Cookies.get("user");
    if (user) setUser(JSON.parse(user));
  };
  const logout = async () => {
    await Cookies.remove("user");
    await Cookies.remove("token");
    Router.push("/login");
  };

  const content = (
    <div>
      <Button onClick={logout} icon={<LogoutOutlined />} type="link" danger>
        Logout
      </Button>
    </div>
  );
  return user ? (
    <>
      <div className="home">
        <nav>
          <div className="container">
            <h1 className="logo">Logo</h1>
            <Popover content={content}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p style={{ marginRight: 10, fontWeight: "bold" }}>
                  {user.username}
                </p>

                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  className="avatar"
                />
              </div>
            </Popover>
          </div>
        </nav>
        <div className="content">
          <div className="hero">
            <Button
              icon={
                <AiOutlineVideoCameraAdd
                  style={{ marginRight: 10, transform: "translateY(2px)" }}
                />
              }
              type="primary"
              size="large"
              className="new"
              onClick={startNewRoom}
              loading={loading}
              disabled={loading}
            >
              New Room
            </Button>
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export default Home;
