import React, { useState } from "react";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// ข้อมูลตัวอย่างสำหรับ AutoComplete
const locationData = {
  Thailand: {
    กรุงเทพมหานคร: ["เขตพระนคร", "เขตดุสิต"],
    เชียงใหม่: ["เมืองเชียงใหม่", "สารภี"],
  },
  Japan: {
    Tokyo: ["Shinjuku", "Shibuya"],
    Osaka: ["Kita", "Naniwa"],
  },
};

const carBrands = {
  Toyota: ["Corolla", "Camry", "Hilux"],
  Honda: ["Civic", "Accord", "CR-V"],
  Ford: ["Focus", "Ranger", "Mustang"],
};

const carColors = ["ดำ", "ขาว", "เงิน", "แดง", "น้ำเงิน"];

const additionalServices = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
];

export default function ServicePage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Customer Info
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [address, setAddress] = useState({
    houseNo: "",
    village: "",
    street: "",
    country: null,
    province: null,
    district: null,
  });

  // Step 2: Vehicle & Services
  const [vehicle, setVehicle] = useState({
    plate: "",
    province: null,
    brand: null,
    model: null,
    color: null,
  });
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const currentTime = dayjs().format("MMMM D, YYYY h:mm A");

  // Step navigation
  const handleProceed = () => setCurrentStep(2);
  const handleBack = () => setCurrentStep(1);

  // Handle service checkbox
  const handleCheckboxChange = (id) => {
    const isSelected = selectedServices.includes(id);
    const updated = isSelected
      ? selectedServices.filter((sid) => sid !== id)
      : [...selectedServices, id];
    setSelectedServices(updated);
    const sum = updated.reduce((acc, sid) => {
      const s = additionalServices.find((srv) => srv.id === sid);
      return acc + (s ? s.price : 0);
    }, 0);
    setTotalPrice(sum);
  };

  const handleSave = () => {
    alert("บันทึกข้อมูลสำเร็จ!");
    console.log({
      customerName,
      phone,
      customerId,
      address,
      vehicle,
      selectedServices,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 sm:p-10">
          {/* Step 1: Customer Info */}
          {currentStep === 1 && (
            <div className="max-w-6xl mx-auto bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#ea7f33]">
                ข้อมูลลูกค้า
              </h2>

              {/* ชื่อนามสกุล (ตัวอักษรเท่านั้น) */}
              <TextField
                fullWidth
                label="ชื่อนามสกุล"
                variant="outlined"
                value={customerName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[ก-ฮะ-์a-zA-Z\s]*$/.test(value)) {
                    // ✅ ไทย/อังกฤษ เท่านั้น
                    setCustomerName(value);
                  }
                }}
                sx={{ mb: 2 }}
              />

              {/* เบอร์โทรศัพท์ (ตัวเลขเท่านั้น) / รหัสลูกค้า (อังกฤษ+ตัวเลข) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  variant="outlined"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      // ✅ ตัวเลขเท่านั้น
                      setPhone(value);
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="รหัสลูกค้า"
                  variant="outlined"
                  value={customerId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z0-9]*$/.test(value)) {
                      // ✅ อังกฤษ + ตัวเลข เท่านั้น
                      setCustomerId(value);
                    }
                  }}
                />
              </div>

              {/* บ้านเลขที่ / หมู่บ้าน / ถนน */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <TextField
                  fullWidth
                  label="บ้านเลขที่"
                  variant="outlined"
                  value={address.houseNo}
                  onChange={(e) =>
                    setAddress({ ...address, houseNo: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="หมู่บ้าน"
                  variant="outlined"
                  value={address.village}
                  onChange={(e) =>
                    setAddress({ ...address, village: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="ถนน"
                  variant="outlined"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                />
              </div>

              {/* ประเทศ / จังหวัด / อำเภอ/ตำบล */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Autocomplete
                  disablePortal
                  options={Object.keys(locationData)}
                  value={address.country}
                  onChange={(e, newValue) =>
                    setAddress({
                      ...address,
                      country: newValue,
                      province: null,
                      district: null,
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="ประเทศ" variant="outlined" />
                  )}
                />
                <Autocomplete
                  disablePortal
                  options={
                    address.country
                      ? Object.keys(locationData[address.country])
                      : []
                  }
                  value={address.province}
                  onChange={(e, newValue) =>
                    setAddress({
                      ...address,
                      province: newValue,
                      district: null,
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="จังหวัด" variant="outlined" />
                  )}
                  disabled={!address.country}
                />
                <Autocomplete
                  disablePortal
                  options={
                    address.country && address.province
                      ? locationData[address.country][address.province]
                      : []
                  }
                  value={address.district}
                  onChange={(e, newValue) =>
                    setAddress({ ...address, district: newValue })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="อำเภอ/ตำบล"
                      variant="outlined"
                    />
                  )}
                  disabled={!address.province}
                />
              </div>

              {/* ปุ่มดำเนินการต่อ */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleProceed}
                  className="bg-[#ea7f33] hover:bg-[#e06d1f] text-white font-semibold px-10 py-3 rounded-lg transition"
                >
                  ดำเนินการต่อ
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#ea7f33]">
                  เลือกบริการ
                </h2>
                <button
                  onClick={handleBack}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  ← ย้อนกลับ
                </button>
              </div>

              {/* ข้อมูลรถ */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-[#ea7f33]">
                  ข้อมูลรถคันนี้
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField
                    label="ทะเบียนรถ"
                    variant="outlined"
                    value={vehicle.plate}
                    onChange={(e) =>
                      setVehicle({ ...vehicle, plate: e.target.value })
                    }
                  />

                  <Autocomplete
                    disablePortal
                    options={Object.keys(locationData)}
                    value={vehicle.province}
                    onChange={(e, newValue) =>
                      setVehicle({ ...vehicle, province: newValue })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="จังหวัด"
                        variant="outlined"
                      />
                    )}
                  />

                  <Autocomplete
                    disablePortal
                    options={Object.keys(carBrands)}
                    value={vehicle.brand}
                    onChange={(e, newValue) => {
                      setVehicle({ ...vehicle, brand: newValue, model: null });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ยี่ห้อ"
                        variant="outlined"
                      />
                    )}
                  />

                  <Autocomplete
                    disablePortal
                    options={vehicle.brand ? carBrands[vehicle.brand] : []}
                    value={vehicle.model}
                    onChange={(e, newValue) =>
                      setVehicle({ ...vehicle, model: newValue })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="รุ่น/ประเภท"
                        variant="outlined"
                      />
                    )}
                    disabled={!vehicle.brand}
                  />

                  <Autocomplete
                    disablePortal
                    options={carColors}
                    value={vehicle.color}
                    onChange={(e, newValue) =>
                      setVehicle({ ...vehicle, color: newValue })
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="สี" variant="outlined" />
                    )}
                  />
                </div>
              </div>

              {/* ปุ่มเลือกบริการ */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowParkingForm(!showParkingForm)}
                  className={`flex-1 py-3 rounded-lg border-2 text-gray-800 font-semibold transition ${
                    showParkingForm
                      ? "border-[#ea7f33] bg-gray-50 shadow"
                      : "border-gray-300 hover:border-[#ea7f33]"
                  }`}
                >
                  🚗 เช่าที่จอด
                </button>
                <button
                  onClick={() => setShowAdditionalForm(!showAdditionalForm)}
                  className={`flex-1 py-3 rounded-lg border-2 text-gray-800 font-semibold transition ${
                    showAdditionalForm
                      ? "border-[#ea7f33] bg-gray-50 shadow"
                      : "border-gray-300 hover:border-[#ea7f33]"
                  }`}
                >
                  ✨ บริการเพิ่มเติม
                </button>
              </div>

              {showParkingForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm mt-4 space-y-4">
                  <h3 className="text-xl font-bold text-[#ea7f33]">
                    เช่าที่จอด
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      label="วันที่/เวลาเข้า"
                      value={currentTime}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField
                      label="วันที่/เวลาออก (optional)"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }} // ทำให้ label ไม่ทับกับค่า
                    />
                  </div>
                </div>
              )}

              {/* ฟอร์มบริการเพิ่มเติม */}
              {showAdditionalForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm mt-4 space-y-4">
                  <h3 className="text-xl font-bold text-[#ea7f33]">
                    บริการเพิ่มเติม
                  </h3>
                  {additionalServices.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 text-base p-2 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.id)}
                        onChange={() => handleCheckboxChange(s.id)}
                        className="w-5 h-5"
                      />
                      <span>
                        {s.name} ({s.price} บาท)
                      </span>
                    </label>
                  ))}
                  <p className="text-right font-semibold">
                    รวมราคา: {totalPrice} บาท
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  className="bg-[#ea7f33] hover:bg-[#e06d1f] text-white font-semibold px-10 py-3 rounded-lg transition"
                >
                  บันทึก
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
