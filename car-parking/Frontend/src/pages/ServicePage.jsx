import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const carColors = ["ดำ", "ขาว", "เงิน", "แดง", "น้ำเงิน"];
const additionalServices = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
];
const PARKING_SERVICE_ID = 4;
const parkingSections = ["A", "B", "C", "D"];
const parkingNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

export default function ServicePage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Customer Info
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [address, setAddress] = useState({
    houseNo: "",
    village: "",
    street: "",
    district: null,
    amphoe: null,
    province: null,
    country: "",
    zipcode: "",
  });

  // Step 2: Vehicle & Services
  const [vehicle, setVehicle] = useState({
    plate: "",
    province: "",
    brand: null,
    model: null,
    type: null,
    color: null,
  });
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [exitTime, setExitTime] = useState("");
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState(new Set());
  const [selectedSection, setSelectedSection] = useState("A");

  // Thai Address
  const [provinceList, setProvinceList] = useState([]);
  const [amphoeList, setAmphoeList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  const currentTime = dayjs().format("MMMM D, YYYY h:mm A");

  // Load Thai address JSON from public API and handle errors gracefully
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json"
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProvinceList(data);
      } catch (err) {
        console.error("Error fetching address data:", err);
        alert("ไม่สามารถดึงข้อมูลจังหวัด อำเภอ ตำบลได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
      }
    };
    fetchAddressData();
  }, []);

  // Load customer list and occupied parking slots
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomerList(data);
        const occupied = new Set(
          data
            .filter((c) => c.services?.includes(PARKING_SERVICE_ID) && c.parking_slot)
            .map((c) => c.parking_slot)
        );
        setOccupiedSlots(occupied);
      })
      .catch((err) => console.error(err));
  }, []);

  // Update amphoe/district list based on selection
  useEffect(() => {
    if (address.province) {
      setAmphoeList(address.province.amphure);
    }
  }, [address.province]);

  useEffect(() => {
    if (address.amphoe) {
      setDistrictList(address.amphoe.tambon);
    }
  }, [address.amphoe]);

  useEffect(() => {
    if (address.district) {
      setAddress((old) => ({
        ...old,
        zipcode: address.district.zip_code,
        country: "ประเทศไทย",
      }));
    }
  }, [address.district]);

  const handleProceed = () => setCurrentStep(2);
  const handleBack = () => setCurrentStep(1);

  const handleCheckboxChange = (id) => {
    const isSelected = selectedServices.includes(id);
    const updated = isSelected
      ? selectedServices.filter((sid) => sid !== id)
      : [...selectedServices, id];
    setSelectedServices(updated);
    const sum = updated.reduce((acc, sid) => {
      const s = additionalServices.find((srv) => srv.id === sid); // <-- แก้ไขตรงนี้
      return acc + (s ? s.price : 0);
    }, 0);
    setTotalPrice(sum);
  };

  const handleSelectCustomer = (cust) => {
    if (!cust) return;
    setCustomerId(cust.customer_id);
    setCustomerName(cust.customer_name);
    setPhone(cust.phone_number);

    const foundProvince = provinceList.find(p => p.name_th === cust.province) || null;
    let foundAmphoe = null;
    let foundDistrict = null;

    if (foundProvince) {
      foundAmphoe = foundProvince.amphure.find(a => a.name_th.toLowerCase().trim() === cust.district.toLowerCase().trim()) || null;
      if (foundAmphoe) {
        foundDistrict = foundAmphoe.tambon.find(t => t.name_th.toLowerCase().trim() === cust.canton.toLowerCase().trim()) || null;
      }
    }

    setAmphoeList(foundProvince ? foundProvince.amphure : []);
    setDistrictList(foundAmphoe ? foundAmphoe.tambon : []);

    setAddress({
      houseNo: cust.house_number || "",
      village: cust.village || "",
      street: cust.road || "",
      district: foundDistrict,
      amphoe: foundAmphoe,
      province: foundProvince,
      country: cust.country || "",
      zipcode: cust.zip_code || "",
    });

    setVehicle({
        plate: cust.car_registration || "",
        province: cust.car_registration_province || "",
        brand: cust.brand_car || null,
        model: cust.type_car || null,
        type: null,
        color: cust.color || null,
    });
  };

  const clearAll = () => {
    setCustomerName("");
    setPhone("");
    setCustomerId("");
    setAddress({
      houseNo: "",
      village: "",
      street: "",
      district: null,
      amphoe: null,
      province: null,
      country: "",
      zipcode: "",
    });
    setVehicle({
      plate: "",
      province: "",
      brand: null,
      model: null,
      type: null,
      color: null,
    });
    setSelectedServices([]);
    setTotalPrice(0);
    setShowParkingForm(false);
    setShowAdditionalForm(false);
    setExitTime("");
    setSelectedParkingSlot(null);
  };

  const handleSave = async () => {
    if (!customerName || !phone) {
        alert("โปรดกรอกชื่อ-นามสกุลและเบอร์โทรศัพท์ให้ครบถ้วน");
        return;
    }

    if (showParkingForm && !selectedParkingSlot) {
        alert("โปรดเลือกช่องจอดรถ");
        return;
    }

    const payload = {
        customer_name: customerName,
        phone_number: phone,
        house_number: address.houseNo,
        village: address.village,
        road: address.street,
        canton: address.district ? address.district.name_th : "",
        district: address.amphoe ? address.amphoe.name_th : "",
        province: address.province ? address.province.name_th : "",
        zip_code: address.zipcode,
        country: address.country,
        car_registration: vehicle.plate,
        car_registration_province: vehicle.province,
        brand_car: vehicle.brand,
        type_car: vehicle.model,
        color: vehicle.color,
        services: selectedServices,
        entry_time: currentTime,
        exit_time: exitTime,
        parking_slot: selectedParkingSlot,
    };

    let res;
    let url;
    let method;

    if (customerId) {
        url = `http://localhost:5000/api/customers/${customerId}`;
        method = "PUT";
    } else {
        url = "http://localhost:5000/api/customers";
        method = "POST";
    }

    try {
        const token = localStorage.getItem("token");
        res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
            alert("บันทึกข้อมูลสำเร็จ!");
            console.log("Saved:", data);
            clearAll();
        } else {
            alert("ผิดพลาด: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดที่ frontend");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 sm:p-10">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="max-w-6xl mx-auto bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#ea7f33]">
                ข้อมูลลูกค้า
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Autocomplete by Name */}
                <Autocomplete
                  options={customerList.map((c) => c.customer_name)}
                  value={customerName || null}
                  onChange={(e, newValue) => {
                    const foundCustomer = customerList.find(c => c.customer_name === newValue);
                    handleSelectCustomer(foundCustomer);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ชื่อนามสกุล"
                      variant="outlined"
                      onChange={(e) => setCustomerName(e.target.value)} // <-- แก้ไขตรงนี้
                    />
                  )}
                />

                {/* Autocomplete by Phone */}
                <Autocomplete
                  options={customerList.map((c) => c.phone_number)}
                  value={phone || null}
                  onChange={(e, newValue) => {
                    const foundCustomer = customerList.find(c => c.phone_number === newValue);
                    handleSelectCustomer(foundCustomer);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เบอร์โทรศัพท์"
                      variant="outlined"
                      onChange={(e) => setPhone(e.target.value)} // <-- แก้ไขตรงนี้
                    />
                  )}
                />
              </div>

              {/* Customer ID */}
              <TextField
                fullWidth
                label="รหัสลูกค้า"
                variant="outlined"
                value={customerId}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TextField
                  fullWidth
                  label="ถนน"
                  variant="outlined"
                  value={address.street}
                  onChange={(e) =>
                    setAddress((old) => ({ ...old, street: e.target.value }))
                  }
                />
                <Autocomplete
                  options={provinceList}
                  getOptionLabel={(option) => option.name_th}
                  value={address.province}
                  onChange={(e, newValue) => {
                    setAddress((old) => ({
                      ...old,
                      province: newValue,
                      amphoe: null, // Reset amphoe
                      district: null, // Reset district
                      zipcode: "", // Reset zipcode
                    }));
                    setAmphoeList(newValue ? newValue.amphure : []);
                    setDistrictList([]);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="จังหวัด" variant="outlined" />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Autocomplete
                  options={amphoeList}
                  getOptionLabel={(option) => option.name_th}
                  value={address.amphoe}
                  onChange={(e, newValue) => {
                    setAddress((old) => ({
                      ...old,
                      amphoe: newValue,
                      district: null, // Reset district
                      zipcode: "", // Reset zipcode
                    }));
                    setDistrictList(newValue ? newValue.tambon : []);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="อำเภอ" variant="outlined" />
                  )}
                  disabled={!address.province}
                />
                <Autocomplete
                  options={districtList}
                  getOptionLabel={(option) => option.name_th}
                  value={address.district}
                  onChange={(e, newValue) =>
                    setAddress((old) => ({
                      ...old,
                      district: newValue,
                      zipcode: newValue ? newValue.zip_code : "",
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="ตำบล" variant="outlined" />
                  )}
                  disabled={!address.amphoe}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TextField
                  fullWidth
                  label="ประเทศ"
                  variant="outlined"
                  value={address.country || ""}
                  onChange={(e) =>
                    setAddress((old) => ({ ...old, country: e.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  label="รหัสไปรษณีย์"
                  variant="outlined"
                  value={address.zipcode}
                  InputProps={{ readOnly: true }}
                />
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

          {/* Step 2 */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label="ทะเบียนรถ"
                    variant="outlined"
                    value={vehicle.plate}
                    onChange={(e) =>
                      setVehicle((old) => ({ ...old, plate: e.target.value.toUpperCase() }))
                    }
                    placeholder="เช่น 1กข 1234"
                  />
                  <TextField
                    fullWidth
                    label="จังหวัด (ป้ายทะเบียน)"
                    variant="outlined"
                    value={vehicle.province}
                    onChange={(e) =>
                      setVehicle((old) => ({ ...old, province: e.target.value }))
                    }
                    placeholder="เช่น กรุงเทพมหานคร"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField
                    fullWidth
                    label="ยี่ห้อ"
                    variant="outlined"
                    value={vehicle.brand || ""}
                    onChange={(e) =>
                      setVehicle((old) => ({ ...old, brand: e.target.value }))
                    }
                    placeholder="เช่น Toyota"
                  />
                  <TextField
                    fullWidth
                    label="รุ่น"
                    variant="outlined"
                    value={vehicle.model || ""}
                    onChange={(e) =>
                      setVehicle((old) => ({ ...old, model: e.target.value }))
                    }
                    placeholder="เช่น Vios"
                  />
                  <TextField
                    fullWidth
                    label="ประเภท"
                    variant="outlined"
                    value={vehicle.type || ""}
                    onChange={(e) =>
                      setVehicle((old) => ({ ...old, type: e.target.value }))
                    }
                    placeholder="เช่น Sedan"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <Autocomplete
                    disablePortal
                    options={carColors}
                    value={vehicle.color}
                    onChange={(e, newV) =>
                      setVehicle((old) => ({ ...old, color: newV }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="สี"
                        variant="outlined"
                        placeholder="เลือกสีรถ"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Services */}
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
                  <h3 className="text-xl font-bold text-[#ea7f33]">เช่าที่จอด</h3>
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
                      value={exitTime}
                      onChange={(e) => setExitTime(e.target.value)}
                    />
                  </div>
                  
                  {/* Parking Slot Selection with Tabs */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">เลือกช่องจอดรถ:</h4>
                    <div className="flex gap-2 mb-4">
                        {parkingSections.map(section => (
                            <button
                                key={section}
                                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                                    selectedSection === section
                                        ? "bg-[#ea7f33] text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                                onClick={() => setSelectedSection(section)}
                            >
                                โซน {section}
                            </button>
                        ))}
                    </div>

                    {/* Parking Slots Grid for the selected section */}
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2">
                            {parkingNumbers.map(number => {
                                const slotId = `${selectedSection}-${number}`;
                                const isOccupied = occupiedSlots.has(slotId);
                                const isSelected = selectedParkingSlot === slotId;
                                const slotColor = isOccupied ? 'bg-red-500' : 'bg-green-500';
                                const hoverColor = isOccupied ? 'bg-red-500' : 'hover:bg-green-600';
                                const selectedStyle = isSelected ? 'ring-2 ring-offset-2 ring-[#ea7f33]' : '';
                                
                                return (
                                    <button
                                        key={slotId}
                                        className={`p-2 rounded-md text-white font-bold transition-colors ${slotColor} ${hoverColor} ${selectedStyle}`}
                                        disabled={isOccupied}
                                        onClick={() => setSelectedParkingSlot(slotId)}
                                    >
                                        {slotId}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                  </div>

                  {selectedParkingSlot && (
                    <div className="mt-4 text-center text-lg font-semibold text-gray-800">
                        คุณได้เลือกช่องจอด: <span className="text-[#ea7f33]">{selectedParkingSlot}</span>
                    </div>
                  )}
                </div>
              )}

              {showAdditionalForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm mt-4 space-y-4">
                  <h3 className="text-xl font-bold text-[#ea7f33]">บริการเพิ่มเติม</h3>
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