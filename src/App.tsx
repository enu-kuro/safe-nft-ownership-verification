import { Top } from "./pages/top";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { PageNotFound } from "./pages/pageNotFound";
import { Introduction } from "./pages/introduction";

function App() {
  return (
    <div className="">
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Top />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/404" element={<PageNotFound />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
