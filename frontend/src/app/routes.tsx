import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { DocumentViewer } from "./pages/DocumentViewer";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/document/:courseCode/:documentId",
    Component: DocumentViewer,
  },
]);
