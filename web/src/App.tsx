import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import ShortTerm from "./pages/ShortTerm";
import LongTerm from "./pages/LongTerm";
import Setting from "./pages/Setting";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/shortTerm",
        element: <ShortTerm />,
      },
      {
        path: "/longTerm",
        element: <LongTerm />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
