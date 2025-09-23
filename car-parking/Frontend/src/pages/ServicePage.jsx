import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const carColors = ["ดำ", "ขาว", "เงิน", "แดง", "น้ำเงิน"];
const PARKING_SERVICE_ID = 4;
const parkingSections = ["A", "B", "C", "D"];
const parkingNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

export default function ServicePage() {
  const [currentStep, setCurrentStep] = useState(1);
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

  const [parkingPrice, setParkingPrice] = useState(0);
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [dayPark, setDayPark] = useState("");

  const [exitTime, setExitTime] = useState("");
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = new useState(new Set());
  const [selectedSection, setSelectedSection] = useState("A");
  const [provinceList, setProvinceList] = useState([]);
  const [amphoeList, setAmphoeList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [allAdditionalServices, setAllAdditionalServices] = useState([]);
  const [parkingRates, setParkingRates] = useState({ hourly: 0, daily: 0 });
  const [parkingEntryTime, setParkingEntryTime] = useState(null);

  const fetchCustomersAndServices = async () => {
    try {
      const token = localStorage.getItem("token");

      const pricesRes = await fetch("http://localhost:5000/api/prices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pricesData = await pricesRes.json();
      setAllAdditionalServices(pricesData.additionalServices || []);
      setParkingRates({
        hourly: pricesData.hourlyRate || 0,
        daily: pricesData.dailyRate || 0,
      });

      const customersRes = await fetch("http://localhost:5000/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customersData = await customersRes.json();
      setCustomerList(customersData);

      const occupied = new Set();
      customersData.forEach((customer) => {
        customer.cars?.forEach((car) => {
          car.service_history?.forEach((service) => {
            if (service.parking_slot && !service.is_paid) {
              occupied.add(service.parking_slot);
            }
          });
        });
      });
      setOccupiedSlots(occupied);
    } catch (err) {
      console.error(err);
    }
  };

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
        alert(
          "ไม่สามารถดึงข้อมูลจังหวัด อำเภอ ตำบลได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
        );
      }
    };
    fetchAddressData();
    fetchCustomersAndServices();
  }, []);

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

  // คำนวณราคาบริการเสริมแบบเรียลไทม์
  useEffect(() => {
    const addPrice = selectedServices.reduce((sum, id) => {
      const service = allAdditionalServices.find((s) => s.id === id);
      return sum + (service ? service.price : 0);
    }, 0);
    setAdditionalPrice(addPrice);
  }, [selectedServices, allAdditionalServices]);

  const calculateDurationAndPrice = (entryTime, exitTime, rates) => {
    const entry = dayjs(entryTime);
    const exit = exitTime ? dayjs(exitTime) : dayjs();

    // Total duration in minutes (including fractions)
    const durationInMinutes = exit.diff(entry, "minute", true);

    const dailyRate = parseFloat(rates.daily) || 0;
    const hourlyRate = parseFloat(rates.hourly) || 0;

    let parkingCost = 0;
    let durationString = "";

    const totalMinutes = Math.round(durationInMinutes);
    const totalDays = Math.floor(totalMinutes / (24 * 60));
    const remainingMinutesAfterDays = totalMinutes % (24 * 60);
    const totalHours = Math.floor(remainingMinutesAfterDays / 60);
    const remainingMinutesAfterHours = remainingMinutesAfterDays % 60;

    durationString = `${totalDays} วัน ${totalHours} ชั่วโมง ${remainingMinutesAfterHours} นาที`;

    // New Pricing Logic based on user's rules
    const totalDurationInHours = durationInMinutes / 60;
    const remainingHoursAfterDays = (durationInMinutes % (24 * 60)) / 60;

    if (remainingHoursAfterDays >= 10) {
      // If remaining hours are 10 or more, round up to the next full day
      const totalChargedDays = totalDays + 1;
      parkingCost = totalChargedDays * dailyRate;
    } else {
      // Normal calculation: full days + remaining hours
      let chargedHours = Math.floor(remainingHoursAfterDays);
      const remainingMinsForRounding = remainingMinutesAfterDays % 60;

      if (remainingMinsForRounding > 10) {
        chargedHours++;
      }

      parkingCost = totalDays * dailyRate + chargedHours * hourlyRate;
    }

    // A check to ensure some cost is applied for very short parking
    if (parkingCost === 0 && durationInMinutes > 0) {
      parkingCost = hourlyRate;
    }

    return {
      price: parkingCost,
      duration: durationString,
    };
  };

  // คำนวณราคาค่าจอดรถแบบเรียลไทม์ (เพื่อแสดงผลบนหน้าจอ)
  useEffect(() => {
    if (showParkingForm && parkingEntryTime && parkingRates.hourly > 0) {
      const result = calculateDurationAndPrice(
        parkingEntryTime,
        exitTime,
        parkingRates
      );
      setParkingPrice(result.price);
      setDayPark(result.duration);
    }
  }, [showParkingForm, parkingEntryTime, parkingRates, exitTime]);

  const handleProceed = () => setCurrentStep(2);
  const handleBack = () => setCurrentStep(1);

  const handleCheckboxChange = (id) => {
    const isSelected = selectedServices.includes(id);
    const updated = isSelected
      ? selectedServices.filter((sid) => sid !== id)
      : [...selectedServices, id];
    setSelectedServices(updated);
  };

  const handleSelectCustomer = (cust) => {
    if (!cust) return;
    setCustomerId(cust.customer_id);
    setCustomerName(cust.customer_name);
    setPhone(cust.phone_number);

    const foundProvince =
      provinceList.find((p) => p.name_th === cust.province) || null;
    let foundAmphoe = null;
    let foundDistrict = null;

    if (foundProvince) {
      foundAmphoe =
        foundProvince.amphure.find(
          (a) =>
            a.name_th.toLowerCase().trim() ===
            cust.district.toLowerCase().trim()
        ) || null;
      if (foundAmphoe) {
        foundDistrict =
          foundAmphoe.tambon.find(
            (t) =>
              t.name_th.toLowerCase().trim() ===
              cust.canton.toLowerCase().trim()
          ) || null;
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

    if (cust.cars && cust.cars.length > 0) {
      const lastCar = cust.cars[cust.cars.length - 1];
      setVehicle({
        plate: lastCar.car_registration || "",
        province: lastCar.car_registration_province || "",
        brand: lastCar.brand_car || null,
        model: lastCar.model_car || null,
        type: lastCar.type_car || null,
        color: lastCar.color || null,
      });
    } else {
      setVehicle({
        plate: "",
        province: "",
        brand: null,
        model: null,
        type: null,
        color: null,
      });
    }
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
    setParkingPrice(0);
    setAdditionalPrice(0);
    setDayPark("");
    setShowParkingForm(false);
    setShowAdditionalForm(false);
    setExitTime("");
    setSelectedParkingSlot(null);
    setParkingEntryTime(null);
  };

  const handleSave = async () => {
    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!customerName || !phone || !vehicle.plate || !vehicle.province) {
        alert("กรุณากรอกข้อมูลลูกค้าและข้อมูลรถให้ครบถ้วน");
        return;
    }
    if (showParkingForm && !selectedParkingSlot) {
        alert("โปรดเลือกช่องจอดรถ");
        return;
    }
    
    // คำนวณราคา
    const parkingData = showParkingForm ? 
        calculateDurationAndPrice(parkingEntryTime, exitTime, parkingRates) :
        { price: 0, duration: "" };

    const additionalServicesPrice = allAdditionalServices
        .filter((s) => selectedServices.includes(s.id))
        .reduce((sum, service) => sum + service.price, 0);
    
    const finalTotalPrice = parkingData.price + additionalServicesPrice;

    try {
        const token = localStorage.getItem("token");
        
        // 2. สร้าง Service History และบันทึกลงฐานข้อมูลก่อน
        const serviceHistoryPayload = {
            services: selectedServices,
            entry_time: parkingEntryTime ? dayjs(parkingEntryTime).toISOString() : null,
            exit_time: exitTime ? dayjs(exitTime).toISOString() : null,
            parking_slot: showParkingForm ? selectedParkingSlot : null,
            parking_price: parkingData.price,
            day_park: parkingData.duration,
            additional_price: additionalServicesPrice,
            total_price: finalTotalPrice,
        };
        const serviceHistoryRes = await fetch("http://localhost:5000/api/serviceHistories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(serviceHistoryPayload),
        });
        if (!serviceHistoryRes.ok) throw new Error("Failed to save service history.");
        const newServiceHistory = await serviceHistoryRes.json();
        
        // 3. สร้าง Car โดยใช้ _id ของ Service History ที่บันทึกไปเมื่อครู่
        const carPayload = {
            car_registration: vehicle.plate,
            car_registration_province: vehicle.province,
            brand_car: vehicle.brand,
            model_car: vehicle.model,
            type_car: vehicle.type,
            color: vehicle.color,
            service_history: [newServiceHistory._id],
        };
        const carRes = await fetch("http://localhost:5000/api/cars", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(carPayload),
        });
        if (!carRes.ok) throw new Error("Failed to save car.");
        const newCar = await carRes.json();
        
        // 4. สร้าง Customer โดยใช้ _id ของ Car ที่บันทึกไป
        const customerPayload = {
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
            cars: [newCar._id],
        };
        const customerRes = await fetch("http://localhost:5000/api/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(customerPayload),
        });
        if (!customerRes.ok) throw new Error("Failed to save customer.");
        const newCustomer = await customerRes.json();
        
        // 5. สร้าง Transaction โดยใช้ _id ของเอกสารทั้งหมดที่บันทึก
        const transactionPayload = {
            customer: newCustomer._id,
            car: newCar._id,
            serviceHistory: newServiceHistory._id,
            total_price: finalTotalPrice,
            transaction_id: Date.now(),
            date: new Date().toISOString(),
            
        };
        const transactionRes = await fetch("http://localhost:5000/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(transactionPayload),
        });
        if (!transactionRes.ok) throw new Error("Failed to save transaction.");
        const newTransaction = await transactionRes.json();
        
        // 6. จัดการเมื่อสำเร็จทั้งหมด
        alert("บันทึกข้อมูลสำเร็จ!");
        console.log("Saved Customer:", newCustomer);
        console.log("Saved Car:", newCar);
        console.log("Saved Service History:", newServiceHistory);
        console.log("Saved Transaction:", newTransaction);
        clearAll();
        fetchCustomersAndServices();
    } catch (err) {
        console.error("Error during save process:", err);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + err.message);
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
                <Autocomplete
                  options={customerList.map((c) => c.customer_name)}
                  value={customerName || null}
                  onChange={(e, newValue) => {
                    const foundCustomer = customerList.find(
                      (c) => c.customer_name === newValue
                    );
                    handleSelectCustomer(foundCustomer);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ชื่อนามสกุล"
                      variant="outlined"
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  )}
                />

                <Autocomplete
                  options={customerList.map((c) => c.phone_number)}
                  value={phone || null}
                  onChange={(e, newValue) => {
                    const foundCustomer = customerList.find(
                      (c) => c.phone_number === newValue
                    );
                    handleSelectCustomer(foundCustomer);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เบอร์โทรศัพท์"
                      variant="outlined"
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  )}
                />
              </div>

              <TextField
                fullWidth
                label="รหัสลูกค้า"
                variant="outlined"
                value={customerId}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />

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
                      amphoe: null,
                      district: null,
                      zipcode: "",
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
                      district: null,
                      zipcode: "",
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
                      setVehicle((old) => ({
                        ...old,
                        plate: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="เช่น 1กข 1234"
                  />
                  <TextField
                    fullWidth
                    label="จังหวัด (ป้ายทะเบียน)"
                    variant="outlined"
                    value={vehicle.province}
                    onChange={(e) =>
                      setVehicle((old) => ({
                        ...old,
                        province: e.target.value,
                      }))
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
                  onClick={() => {
                    const nextShowParkingForm = !showParkingForm;
                    setShowParkingForm(nextShowParkingForm);
                    setParkingEntryTime(
                      nextShowParkingForm ? dayjs().toISOString() : null
                    );
                  }}
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
                      value={
                        parkingEntryTime
                          ? dayjs(parkingEntryTime).format(
                              "YYYY-MM-DD HH:mm:ss"
                            )
                          : ""
                      }
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

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">
                      เลือกช่องจอดรถ:
                    </h4>
                    <div className="flex gap-2 mb-4">
                      {parkingSections.map((section) => (
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

                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2">
                        {parkingNumbers.map((number) => {
                          const slotId = `${selectedSection}-${number}`;
                          const isOccupied = occupiedSlots.has(slotId);
                          const isSelected = selectedParkingSlot === slotId;
                          const slotColor = isOccupied
                            ? "bg-red-500"
                            : "bg-green-500";
                          const hoverColor = isOccupied
                            ? ""
                            : "hover:bg-green-600";
                          const selectedStyle = isSelected
                            ? "ring-2 ring-offset-2 ring-[#ea7f33]"
                            : "";

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
                      คุณได้เลือกช่องจอด:{" "}
                      <span className="text-[#ea7f33]">
                        {selectedParkingSlot}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {showAdditionalForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm mt-4 space-y-4">
                  <h3 className="text-xl font-bold text-[#ea7f33]">
                    บริการเพิ่มเติม
                  </h3>
                  {allAdditionalServices.map((s) => (
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
                </div>
              )}
              <div className="mt-4 text-right text-lg font-bold">
                รวมราคาค่าจอด: {parkingPrice.toFixed(2)} บาท
              </div>
              <div className="mt-2 text-right text-lg font-bold">
                รวมราคาบริการเสริม: {additionalPrice.toFixed(2)} บาท
              </div>
              <div className="mt-2 text-right text-xl font-bold text-[#ea7f33]">
                ยอดรวมทั้งหมด: {(parkingPrice + additionalPrice).toFixed(2)} บาท
              </div>
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
