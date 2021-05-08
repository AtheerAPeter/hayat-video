import { useEffect, useState } from "react";
import { PageHeader, Button, Descriptions, Input } from "antd";
import {
  AppstoreOutlined,
  VideoCameraAddOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const [tab, setTab] = useState("1");

  useEffect(() => {});

  const StartNewRoom = () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch("http://localhost:4000", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        router.push(`/room/${result.roomId}`);
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <div className="container home">
        <div className="content">
          <div>
            <div className="logo">
              <img src="./images/logo.svg" alt="" />
              <h1>Al-Hayat Scientific Office</h1>
            </div>

            <div className="controls">
              <Button
                onClick={StartNewRoom}
                icon={<VideoCameraAddOutlined />}
                className="new"
                type="primary"
                size={"large"}
              >
                New Call
              </Button>
              <p className="label">Enter Room ID To Join</p>
              <div className="join-container">
                <Input placeholder="room id" className="join" />
                <Button
                  size={"large"}
                  className="join-input"
                  type="primary"
                  icon={<RightOutlined />}
                  className="arrow"
                />
              </div>
            </div>
          </div>
          <div className="footer">
            <p>Designed By Atheer</p>
            <Link href="https://atheer-port.netlify.app/" className="contact">
              <a target="__blank">Contact</a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
