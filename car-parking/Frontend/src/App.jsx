import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Main from "./pages/Main";
import ServicePage from "./pages/ServicePage";
import ManageParking from "./pages/ManageParking";

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า login แบบเต็มจอ ไม่ต้องมี Sidebar */}
        <Route path="/" element={<Login />} />

        {/* หน้าที่มี Sidebar */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen">
              <div className="flex-1 p-6">
                <Routes>
                  <Route path="main" element={<Main />} />
                  <Route path="service" element={<ServicePage />} />
                  <Route path="manage/parking" element={<ManageParking />} />
                  {/* สามารถเพิ่ม route อื่น ๆ เช่น manage/additional */}
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
