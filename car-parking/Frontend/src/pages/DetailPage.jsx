import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaymentIcon from "@mui/icons-material/Payment";
import dayjs from "dayjs";
import {
  IconButton,
  Button,
  Modal,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "dayjs/locale/th";

const serviceDefinitions = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
  { id: 4, name: "เช่าที่จอด", price: 0 },
];

const PARKING_SERVICE_ID = 4;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  const [latestServiceInfo, setLatestServiceInfo] = useState(null);
  const [parkingServiceInfo, setParkingServiceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [exitTime, setExitTime] = useState(dayjs());
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        const data = await res.json();
        setCustomer(data);

        if (data.cars && data.cars.length > 0) {
          const firstCar = data.cars[0];
          setCarInfo(firstCar);
          if (firstCar.service_history && firstCar.service_history.length > 0) {
            const latest = [...firstCar.service_history].sort(
              (a, b) => dayjs(b.entry_time) - dayjs(a.entry_time)
            )[0];
            setLatestServiceInfo(latest);

            // ✅ แก้ไข: ค้นหาข้อมูลบริการที่เกี่ยวข้องกับการเช่าที่จอดรถโดยเฉพาะ
            const parking = firstCar.service_history.find(
              (s) => (s.services || []).includes(PARKING_SERVICE_ID)
            );
            setParkingServiceInfo(parking);
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleEditOpen = () => {
    if (latestServiceInfo) {
      const hasParking = (parkingServiceInfo?.services || []).includes(PARKING_SERVICE_ID);
      setExitTime(parkingServiceInfo?.exit_time ? dayjs(parkingServiceInfo.exit_time) : dayjs());
      setSelectedServices(
        (latestServiceInfo.services || []).filter((id) => id !== PARKING_SERVICE_ID)
      );
      setOpenModal(true);
    }
  };

  const handleEditClose = () => setOpenModal(false);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const hasParking = (parkingServiceInfo?.services || []).includes(PARKING_SERVICE_ID);
      const updatedServices = [
        ...(hasParking ? [PARKING_SERVICE_ID] : []),
        ...selectedServices,
      ];
      const newTotalServices = updatedServices.map(id => serviceDefinitions.find(s => s.id === id)).filter(Boolean);
      const newTotalPrice = newTotalServices.reduce((sum, service) => sum + service.price, 0);

      const updatedServiceHistory = {
        ...latestServiceInfo,
        services: updatedServices,
        exit_time: hasParking ? exitTime.toISOString() : undefined,
        total_price: newTotalPrice
      };
      
      const updatedCars = customer.cars.map(car => {
          if (car.car_registration === carInfo.car_registration) {
              return {
                  ...car,
                  service_history: car.service_history.map(service => {
                      if (dayjs(service.entry_time).isSame(dayjs(latestServiceInfo.entry_time))) {
                          return updatedServiceHistory;
                      }
                      return service;
                  })
              }
          }
          return car;
      });

      const updatedCustomerData = {
          ...customer,
          cars: updatedCars,
      };

      await fetch(`http://localhost:5000/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCustomerData),
      });

      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      handleEditClose();
      
      const updatedCustomerRes = await fetch(
        `http://localhost:5000/api/customers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedCustomerDataRes = await updatedCustomerRes.json();
      setCustomer(updatedCustomerDataRes);
      
      if (updatedCustomerDataRes.cars && updatedCustomerDataRes.cars.length > 0) {
        const firstCar = updatedCustomerDataRes.cars[0];
        setCarInfo(firstCar);
        if (firstCar.service_history && firstCar.service_history.length > 0) {
          const latest = [...firstCar.service_history].sort(
            (a, b) => dayjs(b.entry_time) - dayjs(a.entry_time)
          )[0];
          setLatestServiceInfo(latest);

          const parking = firstCar.service_history.find(
            (s) => (s.services || []).includes(PARKING_SERVICE_ID)
          );
          setParkingServiceInfo(parking);
        }
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(err);
    }
  };

  const handleToPaymentPage = () => {
    navigate(`/manage/payment/${id}`);
  };

  const handleServiceCheckboxChange = (serviceId) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
        <span className="ml-4 text-xl">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  if (!customer || !carInfo) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        ไม่พบข้อมูลลูกค้าหรือรถ
      </div>
    );
  }

  const additionalServices = (latestServiceInfo?.services || [])
    .filter((id) => id !== PARKING_SERVICE_ID)
    .map((id) => serviceDefinitions.find((s) => s.id === id))
    .filter(Boolean);
    
  const totalServicePrice = latestServiceInfo ? latestServiceInfo.total_price : 0;
  const allAdditionalServices = serviceDefinitions.filter(
    (s) => s.id !== PARKING_SERVICE_ID
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-2xl font-bold text-[#ea7f33] ml-4">
          รายละเอียดลูกค้า
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-[#ea7f33]">
            ข้อมูลลูกค้า
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <Typography>
              <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
            </Typography>
            <Typography>
              <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
            </Typography>
            <Typography>
              <strong>รหัสลูกค้า:</strong> {customer.customer_id}
            </Typography>
            <Typography className="md:col-span-2">
              <strong>ที่อยู่:</strong> {customer.house_number} หมู่บ้าน{" "}
              {customer.village}, ถนน {customer.road}, ตำบล {customer.canton},
              อำเภอ {customer.district}, จังหวัด {customer.province},{" "}
              {customer.zip_code}
            </Typography>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-[#ea7f33]">ข้อมูลรถ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <Typography>
              <strong>ทะเบียนรถ:</strong> {carInfo.car_registration}
            </Typography>
            <Typography>
              <strong>จังหวัด (ป้าย):</strong>{" "}
              {carInfo.car_registration_province}
            </Typography>
            <Typography>
              <strong>ยี่ห้อ:</strong> {carInfo.brand_car}
            </Typography>
            <Typography>
              <strong>รุ่น:</strong> {carInfo.type_car}
            </Typography>
            <Typography>
              <strong>สี:</strong> {carInfo.color}
            </Typography>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-[#ea7f33]">
            ข้อมูลบริการ
          </h3>
          <div className="space-y-4">
            {parkingServiceInfo && (
              <div>
                <h4 className="font-bold text-lg text-[#ea7f33]">
                  - เช่าที่จอด:
                </h4>
                <div className="pl-4 mt-2">
                  <Typography>
                    <strong>ช่องจอด:</strong>{" "}
                    <span className="bg-[#ea7f33] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {parkingServiceInfo.parking_slot}
                    </span>
                  </Typography>
                  <Typography className="mt-2">
                    <strong>วันเวลาเข้า:</strong>{" "}
                    {dayjs(parkingServiceInfo.entry_time).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                  <Typography>
                    <strong>วันเวลาออก:</strong>{" "}
                    {parkingServiceInfo.exit_time
                      ? dayjs(parkingServiceInfo.exit_time).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </Typography>
                </div>
              </div>
            )}
            {additionalServices.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-green-600">
                  - บริการเพิ่มเติม:
                </h4>
                <ul className="list-none space-y-2 pl-4 mt-2">
                  {additionalServices.map((s) => (
                    <li
                      key={s.id}
                      className="bg-green-100 p-2 rounded-lg flex justify-between items-center"
                    >
                      <span className="text-gray-800">{s.name}</span>
                      <span className="font-semibold text-green-700">
                        {s.price} บาท
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 flex justify-end items-center space-x-4">
              <Typography className="text-lg font-bold">
                ยอดรวมทั้งหมด:{" "}
                <span className="text-2xl text-gray-800">
                  {totalServicePrice}
                </span>{" "}
                บาท
              </Typography>
              <button
                onClick={handleToPaymentPage}
                className="bg-[#ea7f33] hover:bg-[#e06d1f] text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition"
              >
                <PaymentIcon />
                ไปหน้าชำระเงิน
              </button>
            </div>
            {latestServiceInfo && (
                <div className="mt-4 flex justify-end">
                    <Button variant="outlined" onClick={handleEditOpen}>
                        แก้ไขข้อมูล
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={openModal}
        onClose={handleEditClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-title" variant="h6" component="h2" className="text-xl font-bold mb-4 text-center">
            แก้ไขข้อมูลลูกค้า
          </Typography>
          {parkingServiceInfo && (
            <div className="mb-4">
              <Typography variant="h6" className="font-bold text-lg mb-2">แก้ไขวันเวลาที่ออก</Typography>
              <TextField
                fullWidth
                type="datetime-local"
                label="วันเวลาที่ออก"
                value={exitTime.format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setExitTime(dayjs(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
            </div>
          )}
          {latestServiceInfo && ((latestServiceInfo.services || []).length > 1 || !(latestServiceInfo.services || []).includes(PARKING_SERVICE_ID)) ? (
            <div>
              <Typography variant="h6" className="font-bold text-lg mb-2">แก้ไขบริการเพิ่มเติม</Typography>
              <div className="flex flex-col space-y-2">
                <Typography className="text-gray-600 text-sm mb-2">
                  เลือกบริการที่ลูกค้าต้องการ
                </Typography>
                {allAdditionalServices.map((service) => (
                  <FormControlLabel
                    key={service.id}
                    control={
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceCheckboxChange(service.id)}
                      />
                    }
                    label={`${service.name} (${service.price} บาท)`}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outlined" onClick={handleEditClose}>
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ bgcolor: "#ea7f33", "&:hover": { bgcolor: "#e06d1f" } }}
            >
              บันทึก
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}