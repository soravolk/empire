import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import ShortTerm from "./pages/ShortTerm";
import LongTerm from "./pages/LongTerm";
import Setting from "./pages/Setting";
import { CycleListProvider } from "./context/cycle";
import { LongTermProvider } from "./context/longTerm";
import { AuthProvider } from "./context/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { ShortTermProvider } from "./context/shortTerm";

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
          <ProtectedRoute>
            <ShortTerm />
          </ProtectedRoute>
        ),
      },
      {
        path: "/longTerm",
        element: (
          <ProtectedRoute>
            <CycleListProvider>
              <LongTerm />
            </CycleListProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: "/setting",
        element: (
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <LongTermProvider>
        <ShortTermProvider>
          <RouterProvider router={router} />
        </ShortTermProvider>
      </LongTermProvider>
    </AuthProvider>
  );
}

export default App;
