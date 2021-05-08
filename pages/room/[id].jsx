import { Button, Tooltip } from "antd";
import { useRouter } from "next/router";
import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import socketIOClient from "socket.io-client";

// var Peer = null;
// if (typeof window !== "undefined") Peer = require("peerjs");

const Room = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const videoRef2 = useRef(null);
  const roomid = router.query.id;

  useEffect(() => {
    setup();
  }, [router]);

  const setup = () => {
    const peer = new Peer();
    let socket = socketIOClient("https://hayat-node.herokuapp.com/", {
      transports: ["websocket", "polling", "flashsocket"],
    });

    peer.on("open", (id) => {
      console.log("peer open", roomid);
      if (roomid) socket.emit("join-room", roomid, id);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        peer.on("call", (call) => {
          console.log(call);
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            videoRef2.current.srcObject = userVideoStream;
            videoRef2.current.play();
            console.log("new stream");
          });
        });

        let video = videoRef.current;
        video.srcObject = stream;
        video.play();

        socket.on("user-connected", (userId) => {
          console.log("conntectedd", userId);
          const call = peer.call(userId, stream);
          // const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            // addVideoStream(video, userVideoStream);
            videoRef2.current.srcObject = userVideoStream;
            videoRef2.current.play();
            console.log("new stream");
          });
          call.on("close", () => {
            console.log("closed");
            // video.remove();
          });

          // peers[userId] = call;
        });
      })
      .catch((err) => {
        console.error("error:", err);
      });

    return () => socket.disconnect();
  };

  return (
    <div className="call-screen">
      <Tooltip title="End Call">
        <Button
          className="close-btn"
          danger
          type="primary"
          icon={<CloseOutlined />}
          size={"large"}
          onClick={() => {
            router.replace("/");
          }}
        />
      </Tooltip>
      <ul className="videos">
        <li>
          <video style={{ width: "100%" }} ref={videoRef} />
        </li>
        <li>
          {" "}
          <video style={{ width: "100%" }} ref={videoRef2} />
        </li>
      </ul>
    </div>
  );
};

export default Room;

const Video = ({ stream }) => {
  const localVideo = useRef();

  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return <video style={{ width: "100%" }} ref={localVideo} autoPlay />;
};
