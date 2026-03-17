import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { CoursePage } from "./pages/CoursePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/course/:courseCode",
    Component: CoursePage,
  },
]);
