import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { SettingProvider } from "./context/SettingContext";
import Login from "./pages/Login";
import Main from "./pages/main";
import ServicePage from "./pages/ServicePage";
import ManagePage from "./pages/ManagePage";
import DetailPage from "./pages/DetailPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomerPage from "./pages/CustomerPage";
import CarPage from "./pages/CarPage";
import DetailCustomer from "./pages/DetailCustomer";
import PaymentPage from "./pages/PaymentPage";
import ReportPage from './pages/ReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import IncomeReportPage from "./pages/IncomeReportPage";
import SettingPage from './pages/SettingPage';
import PriceSettingsPage from "./pages/PriceSettingsPage";
import DetailCar from "./pages/DetailCarPage";
import ManageEmployees from "./pages/ManageEmployees";
import ManageParking from "./pages/ManageParking";
import CarSettingPage from "./pages/CarSettingPage";
import DashboardPage from "./pages/DashBoard";
import ManageDepartments from "./pages/ManageDepartments";


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
    <SettingProvider>
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
                  <Route path="manage" element={<ManagePage />} />
                  <Route path="/manage/detail/:customerId/:carId/:serviceId" element={<DetailPage />} />
                  <Route path="crm/customer" element={<CustomerPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="crm/car" element={<CarPage />} />
                  <Route path="crm/customer/details/:id" element={<DetailCustomer />} />
                  <Route path="/manage/payment/:customerId/:carId/:serviceId" element={<PaymentPage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/report/details/:customerId/:serviceId" element={<ReportDetailPage />} />
                  <Route path="/report/income" element={<IncomeReportPage />} />
                  <Route path="/settings" element={<SettingPage />} />
                  <Route path="/system/prices" element={<PriceSettingsPage />} />
                  <Route path="/system/parking" element={<ManageParking />} />
                  <Route path="/car/details/:id" element={<DetailCar />} />
                  <Route path="/system/employees" element={<ManageEmployees />} />
                  <Route path="/system/cars" element={<CarSettingPage />} />
                  <Route path="/system/departments" element={<ManageDepartments />} />
                </Routes>
              </AppLayoutWithSidebar>
            }
          />
        </Routes>
      </Router>
    </SettingProvider>
  );
}

export default App;
