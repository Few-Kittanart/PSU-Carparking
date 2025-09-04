import React, { useState } from "react";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { CreateInput } from "thai-address-autocomplete-react";

const InputThaiAddress = CreateInput(); // สร้าง component ของ ThaiAddress

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
    subdistrict: "",
    amphoe: "",
    province: "",
    zipcode: "",
  });

  // Step 2: Vehicle & Services
  const [vehicle, setVehicle] = useState({
    plate: "",
    province: "",
    brand: null,
    model: null,
    color: null,
  });
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const currentTime = dayjs().format("MMMM D, YYYY h:mm A");

  const handleProceed = () => setCurrentStep(2);
  const handleBack = () => setCurrentStep(1);

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

  const handleChange = (scope) => (value) => {
    setAddress((old) => ({ ...old, [scope]: value }));
  };
  const handleSelect = (addr) => {
    setAddress((old) => ({ ...old, ...addr }));
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

              <TextField
                fullWidth
                label="ชื่อนามสกุล"
                variant="outlined"
                value={customerName}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^[ก-ฮะ-์a-zA-Z\s]*$/.test(v)) setCustomerName(v);
                }}
                sx={{ mb: 2 }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  variant="outlined"
                  value={phone}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v)) setPhone(v);
                  }}
                />
                <TextField
                  fullWidth
                  label="รหัสลูกค้า"
                  variant="outlined"
                  value={customerId}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^[A-Za-z0-9]*$/.test(v)) setCustomerId(v);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <TextField
                  fullWidth
                  label="บ้านเลขที่"
                  variant="outlined"
                  value={address.houseNo}
                  onChange={(e) =>
                    setAddress((old) => ({ ...old, houseNo: e.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  label="หมู่บ้าน"
                  variant="outlined"
                  value={address.village}
                  onChange={(e) =>
                    setAddress((old) => ({ ...old, village: e.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  label="ถนน"
                  variant="outlined"
                  value={address.street}
                  onChange={(e) =>
                    setAddress((old) => ({ ...old, street: e.target.value }))
                  }
                />
              </div>

              {/* Thai Address Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    จังหวัด
                  </label>
                  <InputThaiAddress.Province
                    value={address.province}
                    onChange={(v) =>
                      setAddress((old) => ({ ...old, province: v }))
                    }
                    onSelect={(addr) =>
                      setAddress((old) => ({ ...old, ...addr }))
                    } // จะ update amphoe, district, zipcode อัตโนมัติ
                    placeholder="เลือกจังหวัด"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    อำเภอ/เขต
                  </label>
                  <InputThaiAddress.Amphoe
                    province={address.province}
                    value={address.amphoe}
                    onChange={(v) =>
                      setAddress((old) => ({ ...old, amphoe: v }))
                    }
                    onSelect={(addr) =>
                      setAddress((old) => ({ ...old, ...addr }))
                    }
                    placeholder="เลือกอำเภอ/เขต"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ตำบล/แขวง
                  </label>
                  <InputThaiAddress.District
                    province={address.province}
                    amphoe={address.amphoe}
                    value={address.subdistrict}
                    onChange={(v) =>
                      setAddress((old) => ({ ...old, subdistrict: v }))
                    }
                    onSelect={(addr) =>
                      setAddress((old) => ({ ...old, ...addr }))
                    }
                    placeholder="เลือกตำบล/แขวง"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    รหัสไปรษณีย์
                  </label>
                  <InputThaiAddress.Zipcode
                    value={address.zipcode}
                    onChange={handleChange("zipcode")}
                    onSelect={handleSelect}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ea7f33] focus:ring focus:ring-[#ea7f33]/50"
                    placeholder="รหัสไปรษณีย์"
                  />
                </div>
              </div>

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

              {/* Vehicle Info */}
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
                      setVehicle((old) => ({ ...old, plate: e.target.value }))
                    }
                  />
                  <TextField
                    label="จังหวัด (ป้ายทะเบียน)"
                    variant="outlined"
                    value={vehicle.province}
                    onChange={(e) =>
                      setVehicle((old) => ({
                        ...old,
                        province: e.target.value,
                      }))
                    }
                  />
                  <Autocomplete
                    disablePortal
                    options={Object.keys(carBrands)}
                    value={vehicle.brand}
                    onChange={(e, newV) =>
                      setVehicle((old) => ({
                        ...old,
                        brand: newV,
                        model: null,
                      }))
                    }
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
                    onChange={(e, newV) =>
                      setVehicle((old) => ({ ...old, model: newV }))
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
                    onChange={(e, newV) =>
                      setVehicle((old) => ({ ...old, color: newV }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="สี" variant="outlined" />
                    )}
                  />
                </div>
              </div>

              {/* Services Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowParkingForm((v) => !v)}
                  className={`flex-1 py-3 rounded-lg border-2 text-gray-800 font-semibold transition ${
                    showParkingForm
                      ? "border-[#ea7f33] bg-gray-50 shadow"
                      : "border-gray-300 hover:border-[#ea7f33]"
                  }`}
                >
                  🚗 เช่าที่จอด
                </button>
                <button
                  onClick={() => setShowAdditionalForm((v) => !v)}
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
                      InputLabelProps={{ shrink: true }}
                    />
                  </div>
                </div>
              )}

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
