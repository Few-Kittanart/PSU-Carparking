import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import axios from "axios"; // 🚀 Import axios
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import provincesData from "../mockupdataadress/provinces.json";
import districtsData from "../mockupdataadress/districts.json";
import subDistrictsData from "../mockupdataadress/sub_districts.json";
import { CircularProgress } from "@mui/material";

// 🚀 กำหนด API URL ส่วนกลาง
const API_URL = "http://localhost:5000/api";

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
    _id: null,
  });
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [parkingPrice, setParkingPrice] = useState(0);
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [dayPark, setDayPark] = useState("");
  const [exitTime, setExitTime] = useState("");

  // --- 🅿️ State สำหรับโซนและช่องจอด (ใหม่) ---
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null); // จะเก็บ _id ของ slot
  const [loading, setLoading] = useState(false);

  const [provinceList, setProvinceList] = useState([]);
  const [amphoeList, setAmphoeList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [allAdditionalServices, setAllAdditionalServices] = useState([]);
  const [parkingRates, setParkingRates] = useState({ hourly: 0, daily: 0 });
  const [parkingEntryTime, setParkingEntryTime] = useState(null);

  const [carSettings, setCarSettings] = useState({
    brands: [],
    models: [],
    types: [],
    colors: [],
  });
  const [filteredModels, setFilteredModels] = useState([]);

  // ------------------ Fetch Data ------------------
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // ดึงข้อมูล Master Data ของรถยนต์, ราคา, ลูกค้า
      const [carSettingsRes, pricesRes, customersRes, zonesRes] =
        await Promise.all([
          axios.get(`${API_URL}/car-settings`, { headers }),
          axios.get(`${API_URL}/prices`, { headers }),
          axios.get(`${API_URL}/customers`, { headers }),
          axios.get(`${API_URL}/zones`, { headers }), // 🅿️ ดึงโซน
        ]);

      setCarSettings(carSettingsRes.data);
      setParkingRates({
        daily: pricesRes.data.dailyRate || 0,
        hourly: pricesRes.data.hourlyRate || 0,
      });
      setAllAdditionalServices(pricesRes.data.additionalServices || []);
      setCustomerList(customersRes.data);
      setZones(zonesRes.data); // 🅿️ ตั้งค่า State ของโซน

      // 🅿️ ถ้ามีโซน ให้เลือกโซนแรกเป็น default
      if (zonesRes.data.length > 0) {
        setSelectedZoneId(zonesRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลเริ่มต้นได้");
    } finally {
      setLoading(false);
    }
  };

  // 🅿️ Effect สำหรับดึงช่องจอดเมื่อมีการเลือกโซน (ใหม่)
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedZoneId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/parkingslots?zoneId=${selectedZoneId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSlots(res.data);
      } catch (err) {
        console.error("Error fetching parking slots:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedZoneId]);

  // ------------------ Address Setup ------------------
  useEffect(() => {
    const provincesWithAmphoe = provincesData.map((p) => ({
      ...p,
      amphure: districtsData
        .filter((d) => d.province_id === p.id)
        .map((d) => ({
          ...d,
          tambon: subDistrictsData.filter((s) => s.district_id === d.id),
        })),
    }));
    setProvinceList(provincesWithAmphoe);
    fetchInitialData();
  }, []);

  // ... (ส่วนที่เหลือของ useEffects เหมือนเดิม) ...
  useEffect(() => {
    if (vehicle.brand && carSettings.models.length > 0) {
      const brandId = vehicle.brand._id;
      setFilteredModels(
        carSettings.models.filter((m) => m.brandId === brandId)
      );
    } else {
      setFilteredModels([]);
    }
  }, [vehicle.brand, carSettings.models]);

  useEffect(() => {
    if (address.province) setAmphoeList(address.province.amphure);
  }, [address.province]);

  useEffect(() => {
    if (address.amphoe) setDistrictList(address.amphoe.tambon);
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

  useEffect(() => {
    const addPrice = selectedServices.reduce((sum, id) => {
      const service = allAdditionalServices.find((s) => s.id === id);
      return sum + (service ? service.price : 0);
    }, 0);
    setAdditionalPrice(addPrice);
  }, [selectedServices, allAdditionalServices]);

  const roundingMinuteThreshold = 15;

  const calculateDurationAndPrice = (entryTime, exitTime, rates) => {
    if (!entryTime) return { price: 0, duration: "0 วัน 0 ชั่วโมง 0 นาที" };

    const entry = dayjs(entryTime);
    const exit = exitTime ? dayjs(exitTime) : dayjs();
    let durationInMinutes = exit.diff(entry, "minute", true);

    if (durationInMinutes <= 0)
      return { price: 0, duration: "0 วัน 0 ชั่วโมง 0 นาที" };

    const dailyRate = parseFloat(rates.daily) || 0;
    const hourlyRate = parseFloat(rates.hourly) || 0;

    let totalDays = Math.floor(durationInMinutes / (24 * 60));
    let remainingMinutes = durationInMinutes % (24 * 60);
    let totalHours = Math.floor(remainingMinutes / 60);
    let totalMinutes = Math.round(remainingMinutes % 60);

    if (totalMinutes > roundingMinuteThreshold) {
      totalHours += 1;
      totalMinutes = 0;
    }

    if (totalHours >= 24) {
      const extraDays = Math.floor(totalHours / 24);
      totalHours = totalHours % 24;
      totalDays += extraDays;
    }

    const parkingCost = totalDays * dailyRate + totalHours * hourlyRate;
    const durationString = `${totalDays} วัน ${totalHours} ชั่วโมง ${totalMinutes} นาที`;

    return { price: parkingCost, duration: durationString };
  };

  useEffect(() => {
    if (showParkingForm && parkingEntryTime) {
      const result = calculateDurationAndPrice(
        parkingEntryTime,
        exitTime || null,
        parkingRates
      );
      setParkingPrice(result.price);
      setDayPark(result.duration);
    }
  }, [showParkingForm, parkingEntryTime, parkingRates, exitTime]);

  const handleSelectCustomer = (cust) => {
    if (!cust) return;

    setCustomerId(cust._id);
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
        brand:
          carSettings.brands.find((b) => b.name === lastCar.brand_car) || null,
        model:
          carSettings.models.find((m) => m.name === lastCar.model_car) || null,
        type:
          carSettings.types.find((t) => t.name === lastCar.type_car) || null,
        color: carSettings.colors.find((c) => c.name === lastCar.color) || null,
        _id: lastCar._id || null,
      });
    } else {
      setVehicle({
        plate: "",
        province: "",
        brand: null,
        model: null,
        type: null,
        color: null,
        _id: null,
      });
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
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
    if (zones.length > 0) setSelectedZoneId(zones[0]._id);
  };

  const handleProceed = () => setCurrentStep(2);
  const handleBack = () => setCurrentStep(1);

  // ------------------ Save ------------------
  const handleSave = async () => {
    if (!customerName || !phone || !vehicle.plate || !vehicle.province) {
      alert("กรุณากรอกข้อมูลลูกค้าและข้อมูลรถให้ครบถ้วน");
      return;
    }
    if (showParkingForm && !selectedParkingSlot) {
      alert("โปรดเลือกช่องจอดรถ");
      return;
    }

    const parkingData = showParkingForm
      ? calculateDurationAndPrice(
          parkingEntryTime,
          exitTime || null,
          parkingRates
        )
      : { price: 0, duration: "" };

    const additionalServicesPrice = allAdditionalServices
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);

    const finalTotalPrice = parkingData.price + additionalServicesPrice;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ✅ 1. สร้าง Service History
      const serviceHistoryPayload = {
        services: selectedServices,
        entry_time: parkingEntryTime
          ? dayjs(parkingEntryTime).toISOString()
          : null,
        exit_time: exitTime ? dayjs(exitTime).toISOString() : null,
        // ✅ ส่ง _id ของ slot ที่เลือก
        parking_slot: showParkingForm ? selectedParkingSlot : null,
        parking_price: parkingData.price,
        day_park: parkingData.duration,
        additional_price: additionalServicesPrice,
        total_price: finalTotalPrice,
      };

      const serviceHistoryRes = await axios.post(
        `${API_URL}/serviceHistories`,
        serviceHistoryPayload,
        { headers }
      );
      const newServiceHistory = serviceHistoryRes.data;

      // ... (ส่วนการจัดการลูกค้าและรถยนต์เหมือนเดิม) ...
      const { data: allCustomers } = await axios.get(`${API_URL}/customers`, {
        headers,
      });
      let customerToUse = allCustomers.find((c) => c.phone_number === phone);
      let carToUse;

      if (customerToUse) {
        if (vehicle._id) {
          const { data: carData } = await axios.get(
            `${API_URL}/cars/${vehicle._id}`,
            { headers }
          );
          const updatedServiceHistory = [
            ...(carData.service_history || []),
            newServiceHistory._id,
          ];
          await axios.put(
            `${API_URL}/cars/${vehicle._id}`,
            { service_history: updatedServiceHistory },
            { headers }
          );
          carToUse = { ...carData, service_history: updatedServiceHistory };
        } else {
          const carPayload = {
            car_registration: vehicle.plate,
            car_registration_province: vehicle.province,
            brand_car: vehicle.brand ? vehicle.brand.name : null,
            model_car: vehicle.model ? vehicle.model.name : null,
            type_car: vehicle.type ? vehicle.type.name : null,
            color: vehicle.color ? vehicle.color.name : null,
            service_history: [newServiceHistory._id],
          };
          const { data } = await axios.post(`${API_URL}/cars`, carPayload, {
            headers,
          });
          carToUse = data;
          await axios.put(
            `${API_URL}/customers/${customerToUse._id}`,
            { cars: [...(customerToUse.cars || []), carToUse._id] },
            { headers }
          );
        }
      } else {
        const carPayload = {
          car_registration: vehicle.plate,
          car_registration_province: vehicle.province,
          brand_car: vehicle.brand ? vehicle.brand.name : null,
          model_car: vehicle.model ? vehicle.model.name : null,
          type_car: vehicle.type ? vehicle.type.name : null,
          color: vehicle.color ? vehicle.color.name : null,
          service_history: [newServiceHistory._id],
        };
        const { data: newCar } = await axios.post(`${API_URL}/cars`, carPayload, {
          headers,
        });
        carToUse = newCar;

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
          cars: [carToUse._id],
        };
        const { data: newCustomer } = await axios.post(
          `${API_URL}/customers`,
          customerPayload,
          { headers }
        );
        customerToUse = newCustomer;
      }
      
      // ✅ 2. อัปเดตสถานะช่องจอดให้เป็น 'ไม่ว่าง'
      if (showParkingForm && selectedParkingSlot) {
        await axios.put(
          `${API_URL}/parkingSlots/${selectedParkingSlot}`,
          { isOccupied: true },
          { headers }
        );
      }

      // ✅ 3. สร้าง Transaction
      const transactionPayload = {
        customer: customerToUse._id,
        car: carToUse._id,
        serviceHistory: newServiceHistory._id,
        total_price: finalTotalPrice,
      };
      await axios.post(`${API_URL}/transactions`, transactionPayload, {
        headers,
      });

      alert("บันทึกข้อมูลสำเร็จ!");
      clearAll();
      fetchInitialData();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 sm:p-10">
          {/* ... (ส่วน Step 1 เหมือนเดิม) ... */}
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
              {/* ... (ส่วนข้อมูลรถเหมือนเดิม) ... */}
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
                        _id: null, // reset id เพราะนี่คือรถใหม่
                      }))
                    }
                    placeholder="เช่น 1 กข 1234"
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
                        _id: null,
                      }))
                    }
                    placeholder="เช่น กรุงเทพมหานคร"
                  />
                </div>

                {/* ใช้ Autocomplete สำหรับข้อมูล Master Data */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Autocomplete
                    options={carSettings.brands}
                    getOptionLabel={(option) => option.name || ""}
                    value={vehicle.brand}
                    onChange={(e, newValue) =>
                      setVehicle((old) => ({
                        ...old,
                        brand: newValue,
                        model: null, // reset รุ่นเมื่อเปลี่ยนยี่ห้อ
                        _id: null,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ยี่ห้อ"
                        variant="outlined"
                        placeholder="เลือกยี่ห้อรถ"
                      />
                    )}
                  />

                  <Autocomplete
                    options={filteredModels}
                    getOptionLabel={(option) => option.name || ""}
                    value={vehicle.model}
                    onChange={(e, newValue) =>
                      setVehicle((old) => ({
                        ...old,
                        model: newValue,
                        _id: null,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="รุ่น"
                        variant="outlined"
                        placeholder="เลือกรุ่นรถ"
                      />
                    )}
                    disabled={!vehicle.brand} // ปิดจนกว่าจะเลือกยี่ห้อ
                  />

                  <Autocomplete
                    options={carSettings.types}
                    getOptionLabel={(option) => option.name || ""}
                    value={vehicle.type}
                    onChange={(e, newValue) =>
                      setVehicle((old) => ({
                        ...old,
                        type: newValue,
                        _id: null,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ประเภท"
                        variant="outlined"
                        placeholder="เลือกประเภทรถ"
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <Autocomplete
                    options={carSettings.colors}
                    getOptionLabel={(option) => option.name || ""}
                    value={vehicle.color}
                    onChange={(e, newValue) =>
                      setVehicle((old) => ({
                        ...old,
                        color: newValue,
                        _id: null,
                      }))
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
                  {/* ... (ส่วนเวลาเข้า-ออก เหมือนเดิม) ... */}
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
                  {/* --- 🅿️ UI เลือกโซนและช่องจอด (ใหม่) --- */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">
                      เลือกช่องจอดรถ:
                    </h4>
                    {/* ปุ่มเลือกโซน */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {zones
                        .filter((z) => z.isActive) // แสดงเฉพาะโซนที่เปิดใช้งาน
                        .map((zone) => (
                          <button
                            key={zone._id}
                            className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                              selectedZoneId === zone._id
                                ? "bg-[#ea7f33] text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            onClick={() => setSelectedZoneId(zone._id)}
                          >
                            {zone.name}
                          </button>
                        ))}
                    </div>

                    {/* ตารางแสดงช่องจอด */}
                    <div className="border border-gray-300 rounded-lg p-4">
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2">
                          {slots.map((slot) => {
                            const isSelected = selectedParkingSlot === slot._id;
                            return (
                              <button
                                key={slot._id}
                                disabled={slot.isOccupied}
                                onClick={() =>
                                  !slot.isOccupied &&
                                  setSelectedParkingSlot(slot._id)
                                }
                                className={`p-2 rounded-md text-white font-bold transition 
                                  ${
                                    slot.isOccupied
                                      ? "bg-red-500 cursor-not-allowed"
                                      : "bg-green-500 hover:bg-green-600 cursor-pointer"
                                  }
                                  ${
                                    isSelected
                                      ? "ring-2 ring-offset-2 ring-[#ea7f33]"
                                      : ""
                                  }
                                `}
                              >
                                {slot.number}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedParkingSlot && (
                    <div className="mt-4 text-center text-lg font-semibold text-gray-800">
                      คุณได้เลือกช่องจอด:{" "}
                      <span className="text-[#ea7f33]">
                        {
                          slots.find((s) => s._id === selectedParkingSlot)
                            ?.number
                        }
                      </span>
                      {" "}ในโซน{" "}
                      <span className="text-[#ea7f33]">
                        {zones.find((z) => z._id === selectedZoneId)?.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ... (ส่วนบริการเสริมและสรุปราคา เหมือนเดิม) ... */}
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