import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Main from "./pages/Main";
import ServicePage from "./pages/ServicePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/service" element={<ServicePage />} />
      </Routes>
    </Router>
  );
}

export default App;
