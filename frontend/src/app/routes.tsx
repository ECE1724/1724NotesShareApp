import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { DocumentViewer } from "./pages/DocumentViewer";
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
  {
    path: "/course/:courseCode/document/:documentId",
    Component: DocumentViewer,
  },
  {
    path: "/document/:courseCode/:documentId",
    Component: DocumentViewer,
  },
]);
