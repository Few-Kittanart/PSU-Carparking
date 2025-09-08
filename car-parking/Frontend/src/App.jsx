import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Main from "./pages/Main";
import ServicePage from "./pages/ServicePage";
import ManagePage from "./pages/ManagePage"; // แก้ไขจาก ManageParking
import DetailPage from "./pages/DetailPage"; // แก้ไขจาก ParkingDetail
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Layout สำหรับหน้าที่มี Sidebar + Header + Footer
function AppLayoutWithSidebar({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

// Layout สำหรับหน้าที่ไม่มี Sidebar แต่มี Header + Footer
function AppLayoutNoSidebar({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Login */}
        <Route path="/" element={<Login />} />

        {/* หน้า Main ไม่มี Sidebar */}
        <Route
          path="/main"
          element={
            <AppLayoutNoSidebar>
              <Main />
            </AppLayoutNoSidebar>
          }
        />

        {/* หน้าที่มี Sidebar + Header + Footer */}
        <Route
          path="/*"
          element={
            <AppLayoutWithSidebar>
              <Routes>
                <Route path="service" element={<ServicePage />} />

                {/* หน้าจัดการรวมทุกบริการ */}
                <Route path="manage" element={<ManagePage />} />
                {/* หน้าแสดงรายละเอียดลูกค้า (ใช้ ID ใน URL) */}
                <Route path="manage/details/:id" element={<DetailPage />} />
              </Routes>
            </AppLayoutWithSidebar>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
