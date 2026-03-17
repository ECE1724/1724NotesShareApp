import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { CoursePage } from "./pages/CoursePage";
import { DocumentViewer } from "./pages/DocumentViewer";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
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
