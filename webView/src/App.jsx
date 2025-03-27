import { useEffect, useState } from "react";
import routes from "./router/index";
import useToken from "@/data/useToken";
import { useNavigate, useRoutes } from "react-router-dom";
import vscode from "@/message/index";
import { TokenContext } from "./context";
import { useStore } from "@/store";

export default function App() {
  const { clearHooks, clearUtils } = useStore();
  const { token, setToken } = useToken();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // 获取消息
      switch (message.command) {
        case "sendToken":
          console.log(message.token, "token"); // 显示消息
          if (message.token) {
            console.log(message.token, "message.token");
            setToken(message.token);
            navigate("/content");
          }
          setShow(true);
          break;
        case "logout":
          console.log("logout", token); // 显示消息
          clearHooks();
          clearUtils();
          setToken("");
          break;
      }
    });

    vscode.postMessage({
      command: "getToken",
    });
  }, []);
  const routing = useRoutes(routes);

  return (
    <TokenContext value={{ token, setToken }}>
      {show && <div>{routing}</div>}
    </TokenContext>
  );
}
