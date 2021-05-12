import { useEffect, useRef, useState } from "react";
import {
  FaCommentAlt,
  FaPaperPlane,
  FaMicrophone,
  FaVideo,
  FaUserPlus,
  FaUserFriends,
  FaVideoSlash,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import socketIOClient from "socket.io-client";
import { message } from "antd";

const Room = () => {
  const Router = useRouter();
  const roomId = Router.query.id;
  const videoRef = useRef();

  const [chats, setChats] = useState(false);
  const [participants, setParticipants] = useState(false);
  const [user, setUser] = useState();
  const [socket, setSocket] = useState(() =>
    socketIOClient("http://localhost:4000", {
      transports: ["websocket", "polling", "flashsocket"],
    })
  );
  const [peer, setPeer] = useState();
  const [myID, setMyID] = useState();
  const [myStream, setMyStream] = useState();
  const [isVideo, setIsVideo] = useState(true);
  const [isMic, setIsMic] = useState(true);
  const gridRef = useRef();
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    setPeer(new Peer());
    getAndSet();

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        startCall(stream);
      })
      .catch((e) => console.log(e));
  }, [Router]);

  const getAndSet = async () => {
    const user = await Cookies.get("user");
    if (user) setUser(JSON.parse(user));
  };

  // !start of call

  const startCall = async (stream) => {
    var peers = {};
    peer &&
      user &&
      peer.on("open", (id) => {
        socket.emit("join-room", roomId, id, user.username);
        setMyID(id);
      });
    setMyStream(stream);
    videoRef.current.srcObject = stream;

    peer &&
      peer.on("call", (call) => {
        console.log("got call");
        call.answer(stream);

        call.on("stream", (userVideoStream) => {
          console.log("got stream");
          setStreams([...streams, userVideoStream]);
        });
      });

    socket &&
      socket.on("user-connected", (userID, username) => {
        // connectNewUser(userID, stream);
        if (peer) {
          const call = peer.call(userID, stream);

          call.on("stream", (userVideoStream) => {
            console.log("got stream");
            setStreams([...streams, userVideoStream]);
          });

          // call.on("close", () => {
          //   video.remove();
          // });

          // peers[userID] = call;
          // systemMessage(username, true);
        }
      });

    // socket && socket.emit("participants");
  };

  // !end of call

  // const connectNewUser = (userID, stream) => {

  // };

  const systemMessage = (username, join = false) => {
    const date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    const format = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    const container = document.querySelector(".main__chat__box");
    const list = document.createElement("li");
    list.className = "system-message";
    list.innerHTML = `<span>${hours}:${minutes}${format}</span><span>${username} has ${
      join ? "joined" : "left"
    } the meeting</span>`;

    lists.append(list);
    container.scrollTop = container.scrollHeight;
  };

  const handleVideo = () => {
    const enabled = myStream.getVideoTracks()[0].enabled;
    if (enabled) {
      setIsVideo(false);
      socket.emit("stop-video");
      myStream.getVideoTracks()[0].enabled = false;
    } else {
      setIsVideo(true);
      socket.emit("play-video");
      myStream.getVideoTracks()[0].enabled = true;
    }
  };
  const handleMicrophone = () => {
    const enabled = myStream.getAudioTracks()[0].enabled;

    if (enabled) {
      setIsMic(false);
      socket.emit("mute-mic");
      myStream.getAudioTracks()[0].enabled = false;
    } else {
      setIsMic(true);
      socket.emit("unmute-mic");
      myStream.getAudioTracks()[0].enabled = true;
    }
  };

  const handleInvite = () => {
    navigator.clipboard
      .writeText(roomId)
      .then((e) => message.success("Room invitation code has been copied"));
  };
  return user ? (
    <>
      <main role="main">
        <div className="main__left screen-full">
          <div className="main__videos">
            <div id="video-grid" ref={gridRef}>
              <div className="video-container">
                <video ref={videoRef} muted className="video" autoPlay />
              </div>
              {streams.length > 0 &&
                streams.map((item) => <Video stream={item} />)}
            </div>
            <div id="share-screen"></div>
          </div>
          <div className="main__controls">
            <div className="main__controls__block">
              <div
                className="main__controls__button mute-btn"
                onClick={handleMicrophone}
              >
                {isMic ? (
                  <FaMicrophone className="icon" />
                ) : (
                  <FaMicrophoneSlash
                    className="icon"
                    style={{ color: "#eb534b" }}
                  />
                )}
                {isMic ? <span>Mute</span> : <span>Unmute</span>}
              </div>
              <div
                className="main__controls__button video-btn"
                onClick={handleVideo}
              >
                {isVideo ? (
                  <FaVideo className="icon" />
                ) : (
                  <FaVideoSlash className="icon" style={{ color: "#eb534b" }} />
                )}

                {isVideo ? <span>Stop Video</span> : <span>Start Video</span>}
              </div>
            </div>
            <div className="main__controls__block mid-block">
              <div className="main__controls__button" onClick={handleInvite}>
                <FaUserPlus className="icon" />
                <span>Invite</span>
              </div>
              <div
                className="main__controls__button users-btn"
                // onclick="handleScreen(this)"
                onClick={() => setParticipants(!participants)}
              >
                <FaUserFriends className="icon" />
                <span>Participants</span>
              </div>
              <div
                className="main__controls__button chat-btn"
                id="chats"
                // onclick="handleScreen(this)"
                onClick={() => {
                  setChats(!chats);
                }}
              >
                <FaCommentAlt className="icon" />
                <span>Chat</span>
              </div>
            </div>
            <div className="main__controls__block">
              <div
                className="main__controls__button leave-btn"
                onClick={() => {
                  myStream.getTracks().forEach(function (track) {
                    if (track.readyState == "live") {
                      track.stop();
                    }
                  });
                  Router.replace("/");
                }}
              >
                <span>Leave Meeting</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            chats || participants ? "main__right " : "main__right screen-hide"
          }
        >
          <div
            className={
              chats ? "main__right__render" : "main__right__render screen-hide"
            }
            id="chat-screen"
          >
            <div className="main__header">
              <h4>Chat Box</h4>
            </div>
            <div className="main__chat__box">
              <ul id="messages"></ul>
            </div>
            <form className="main__message__container">
              <textarea
                id="chat-message"
                cols="20"
                rows="1"
                placeholder="Type a message here"
              ></textarea>
              <button
                className="main__message__send"
                type="submit"
                id="send-btn"
              >
                <FaPaperPlane className="icon" />
              </button>
            </form>
          </div>
          <div
            className={
              participants
                ? "main__right__render"
                : "main__right__render screen-hide"
            }
            id="users-screen"
          >
            <div className="main__header">
              <h4>Participants</h4>
            </div>
            <div className="main__users__box">
              <ul id="users"></ul>
            </div>
          </div>
        </div>
      </main>
    </>
  ) : null;
};

export default Room;

const Video = ({ stream }) => {
  const localVideo = useRef();

  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return (
    <div className="video-container">
      <video className="video" ref={localVideo} autoPlay />
    </div>
  );
};
