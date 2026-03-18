import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { CoursePage } from "./pages/CoursePage";
import { DocumentViewer } from "./pages/DocumentViewer";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/course/:courseCode",
    Component: CoursePage,
  },
  {
    path: "/course/:courseCode/file/:fileId",
    Component: DocumentViewer,
  },
]);
