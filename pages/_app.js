import Cookies from "js-cookie";
import { useEffect } from "react";
import "antd/dist/antd.css";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    getAndSet();
  }, []);
  const getAndSet = async () => {
    const token = await Cookies.get("token");

    if (!token && window.location.pathname !== "/login")
      window.location.href = "/login";
    else if (token && window.location.pathname == "/login") {
      window.location.href = "/";
    }
  };

  return <Component {...pageProps} />;
}

export default MyApp;
