import { Navigate } from "react-router-dom";

import Login from "../view/login/login";
import Content from "../view/content/content";

const routes = [
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <Login /> },
  { path: "/content", element: <Content /> },
  //   {
  //     path: "/friend",
  //     element: <Friend />,
  //     children: [{ path: "chat/:name", element: <Chat /> }],
  //   },
];

export default routes;
