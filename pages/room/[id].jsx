import { Button, Tooltip } from "antd";
import { useRouter } from "next/router";
import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import socketIOClient, { io } from "socket.io-client";
import { FundProjectionScreenOutlined } from "@ant-design/icons";
import { MdScreenShare } from "react-icons/md";
import {
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// var Peer = null;
// if (typeof window !== "undefined") Peer = require("peerjs");

const Room = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const roomid = router.query.id;
  const [peer, setPeer] = useState();
  const [socket, setSocket] = useState(() =>
    socketIOClient("http://localhost:4000", {
      transports: ["websocket", "polling", "flashsocket"],
    })
  );

  const [camera, setCamera] = useState(true);
  const [stream, setStream] = useState();
  const [streams, setStreams] = useState([]);
  const [myId, setMyId] = useState();
  const [isMic, setIsMic] = useState(true);
  const [isVideo, setIsVideo] = useState(true);
  useEffect(() => {
    stream &&
      stream.getTracks().forEach(function (track) {
        if (track.readyState == "live") {
          track.stop();
        }
      });
    if (camera) {
      setup();
    } else {
      handleRecord();
    }
  }, [camera]);

  useEffect(() => {
    console.log(streams);
  }, [streams]);

  useEffect(() => {
    setPeer(new Peer());
    setup();
    // handleRecord();
  }, [router]);

  const setup = () => {
    if (peer && socket) {
      peer.on("open", (id) => {
        setMyId(id);
        console.log("peer open", roomid, "myid", id);
        if (roomid) socket.emit("join-room", roomid, id);
      });
      navigator.mediaDevices
        .getUserMedia({
          video: { width: 1280, height: 720, frameRate: { max: 30 } },
          audio: true,
        })
        .then((stream) => {
          handleStream(stream);
          socket.emit("reload");
        })
        .catch((err) => {
          console.error("error:", err);
        });

      return () => socket.disconnect();
    }
  };

  const handleRecord = async () => {
    peer.on("open", (id) => {
      console.log("peer open", roomid);
      if (roomid) socket.emit("join-room", roomid, id);
    });

    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })
      .then((stream) => {
        handleStream(stream);
        socket.emit("reload");
      });

    // const mediaRecorder = new MediaRecorder(stream, {
    //   mimeType: "video/webm; codecs=vp9",
    // });

    // console.log(mediaRecorder.ondataavailable);
    // // mediaRecorder.start();
  };

  const handleStream = (stream) => {
    setStream(stream);
    // when getting a call
    peer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        setStreams([
          ...streams,
          {
            stream: userVideoStream,
            userId: call.peer,
          },
        ]);
        renderStreams();
      });
    });

    //set my video
    let video = videoRef.current;
    video.srcObject = stream;
    video.play();

    socket.on("user-disconnected", (id, username) => {
      streams.filter((item) => item.userId !== id);
      renderStreams();
    });

    // when new user connects we call the reverse of the first
    socket.on("user-connected", async (userId) => {
      console.log(userId, "disconnected");
      const call = await peer.call(userId, stream);

      call.on("stream", (userVideoStream) => {
        setStreams([
          ...streams,
          {
            stream: userVideoStream,
            userId,
          },
        ]);
        renderStreams();
      });
      call.on("close", () => {
        console.log("closed");
        // video.remove();
      });

      // peers[userId] = call;
    });
  };

  const renderStreams = () => {
    return (
      streams &&
      streams.map((vid, index) => (
        <li key={index}>
          <Video stream={vid.stream} />
        </li>
      ))
    );
  };

  const handleMute = () => {
    const enabled = stream.getAudioTracks()[0].enabled;

    if (enabled) {
      setIsMic(false);
      socket.emit("mute-mic");
      stream.getAudioTracks()[0].enabled = false;
    } else {
      setIsMic(true);
      socket.emit("unmute-mic");
      stream.getAudioTracks()[0].enabled = true;
    }
  };

  const handleVideo = () => {
    const enabled = stream.getVideoTracks()[0].enabled;
    if (enabled) {
      setIsVideo(false);
      socket.emit("stop-video");
      stream.getVideoTracks()[0].enabled = false;
    } else {
      setIsVideo(true);
      socket.emit("play-video");
      stream.getVideoTracks()[0].enabled = true;
    }
  };
  return (
    <div className="call-screen">
      <div className="controls">
        <Tooltip title="End Call">
          <Button
            className="btn"
            danger
            type="primary"
            icon={
              <IoClose
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 25,
                }}
              />
            }
            size={"large"}
            onClick={() => {
              stream.getTracks().forEach(function (track) {
                if (track.readyState == "live") {
                  track.stop();
                }
              });
              router.replace("/");
            }}
          />
        </Tooltip>
        <Tooltip title={camera ? "Present Screen" : "Stop Presenting"}>
          <Button
            className="btn"
            size={"large"}
            type="primary"
            onClick={() => {
              setCamera(!camera);
            }}
            icon={<MdScreenShare />}
          ></Button>
        </Tooltip>
        <Tooltip title={isVideo ? "Stop Video" : "Start Video"}>
          <Button
            className="btn"
            size={"large"}
            type="default"
            onClick={handleVideo}
            danger={isVideo ? false : true}
            icon={isVideo ? <FaVideo /> : <FaVideoSlash />}
          ></Button>
        </Tooltip>
        <Tooltip title={isMic ? "Mute" : "Unmute"}>
          <Button
            className="btn"
            size={"large"}
            type="default"
            onClick={handleMute}
            danger={isMic ? false : true}
            icon={isMic ? <FaMicrophone /> : <FaMicrophoneSlash />}
          ></Button>
        </Tooltip>
      </div>
      <ul className="videos">
        <li>
          <video ref={videoRef} muted className="video" />
        </li>
        {renderStreams()}
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

  return <video className="video" ref={localVideo} autoPlay />;
};
