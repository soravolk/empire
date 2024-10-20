import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import ShortTerm from "./pages/ShortTerm";
import LongTerm from "./pages/LongTerm";
import Setting from "./pages/Setting";
import { CycleListProvider } from "./context/cycle";

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
        element: (
          <CycleListProvider>
            <ShortTerm />
          </CycleListProvider>
        ),
      },
      {
        path: "/longTerm",
        element: (
          <CycleListProvider>
            <LongTerm />
          </CycleListProvider>
        ),
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
