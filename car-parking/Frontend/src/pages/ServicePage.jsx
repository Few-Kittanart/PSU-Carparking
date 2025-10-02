import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import provincesData from "../mockupdataadress/provinces.json";
import districtsData from "../mockupdataadress/districts.json";
import subDistrictsData from "../mockupdataadress/sub_districts.json";

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
    _id: null,
  });
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [parkingPrice, setParkingPrice] = useState(0);
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [dayPark, setDayPark] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState(new Set());
  const [selectedSection, setSelectedSection] = useState("A");
  const [provinceList, setProvinceList] = useState([]);
  const [amphoeList, setAmphoeList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [allAdditionalServices, setAllAdditionalServices] = useState([]);
  const [parkingRates, setParkingRates] = useState({ hourly: 0, daily: 0 });
  const [parkingEntryTime, setParkingEntryTime] = useState(null);
  const [serviceHistories, setServiceHistories] = useState([]);

  const [carSettings, setCarSettings] = useState({
    brands: [],
    models: [],
    types: [],
    colors: [],
  });
  // 🆕 State สำหรับรุ่นรถที่ถูกกรองตามยี่ห้อ
  const [filteredModels, setFilteredModels] = useState([]);
  // ------------------ Fetch Data ------------------
  const fetchCustomersAndServices = async () => {
    try {
      const token = localStorage.getItem("token");

      // 🆕 ดึงข้อมูล Master Data ของรถยนต์
      const carSettingsRes = await fetch(
        "http://localhost:5000/api/car-settings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const carSettingsData = await carSettingsRes.json();
      setCarSettings(carSettingsData);

      // ราคาบริการ
      const pricesRes = await fetch("http://localhost:5000/api/prices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pricesData = await pricesRes.json();
      setParkingRates({
        daily: pricesData.dailyRate || 0,
        hourly: pricesData.hourlyRate || 0,
      });
      setAllAdditionalServices(pricesData.additionalServices || []);

      // ลูกค้า
      const customersRes = await fetch("http://localhost:5000/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customersData = await customersRes.json();
      setCustomerList(customersData);

      // service histories
      const serviceRes = await fetch(
        "http://localhost:5000/api/serviceHistories",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const serviceData = await serviceRes.json();
      setServiceHistories(serviceData);

      // occupied slots
      const occupied = new Set();
      serviceData.forEach((service) => {
        // เฉพาะรายการที่ยังไม่ได้จ่าย
        if (service.parking_slot && !service.is_paid) {
          occupied.add(service.parking_slot);
        }
      });
      setOccupiedSlots(occupied);
    } catch (err) {
      console.error(err);
    }
  };

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
    fetchCustomersAndServices();
  }, []);

  useEffect(() => {
    // ถ้ามีการเลือกยี่ห้อรถแล้ว
    if (vehicle.brand && carSettings.models.length > 0) {
      const brandId = vehicle.brand._id;
      // กรองรุ่นรถตาม brandId ที่เลือก
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

  // ------------------ Calculate Additional Services ------------------
  useEffect(() => {
    const addPrice = selectedServices.reduce((sum, id) => {
      const service = allAdditionalServices.find((s) => s.id === id);
      return sum + (service ? service.price : 0);
    }, 0);
    setAdditionalPrice(addPrice);
  }, [selectedServices, allAdditionalServices]);

  // ------------------ Calculate Parking ------------------
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

  // ------------------ Customer Selection ------------------
  const handleSelectCustomer = (cust) => {
    if (!cust) return;

    setCustomerId(cust._id);
    setCustomerName(cust.customer_name);
    setPhone(cust.phone_number);

    // ตั้งค่าที่อยู่
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

    // 🆕 ดึงรถคันล่าสุดที่ลูกค้าเคยใช้
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
        _id: lastCar._id || null, // 🆕 เก็บ _id ของรถเดิม
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

  // ------------------ Checkbox ------------------
  const handleCheckboxChange = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ------------------ Clear All ------------------
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

  // ------------------ Navigation ------------------
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

      // สร้าง service history ใหม่
      const serviceHistoryPayload = {
        services: selectedServices,
        entry_time: parkingEntryTime
          ? dayjs(parkingEntryTime).toISOString()
          : null,
        exit_time: exitTime ? dayjs(exitTime).toISOString() : null,
        parking_slot: showParkingForm ? selectedParkingSlot : null,
        parking_price: parkingData.price,
        day_park: parkingData.duration,
        additional_price: additionalServicesPrice,
        total_price: finalTotalPrice,
      };

      const serviceHistoryRes = await fetch(
        "http://localhost:5000/api/serviceHistories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(serviceHistoryPayload),
        }
      );
      if (!serviceHistoryRes.ok)
        throw new Error("Failed to save service history.");
      const newServiceHistory = await serviceHistoryRes.json();

      // ดึงลูกค้าทั้งหมดและหาเบอร์ตรงกัน
      const existingCustomerRes = await fetch(
        "http://localhost:5000/api/customers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const allCustomers = await existingCustomerRes.json();
      let customerToUse = allCustomers.find((c) => c.phone_number === phone);
      let carToUse;

      if (customerToUse) {
        // ลูกค้าเดิม
        if (vehicle._id) {
          // รถเดิม → append service_history
          const carRes = await fetch(
            `http://localhost:5000/api/cars/${vehicle._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const carData = await carRes.json();
          const updatedServiceHistory = [
            ...(carData.service_history || []),
            newServiceHistory._id,
          ];

          await fetch(`http://localhost:5000/api/cars/${vehicle._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ service_history: updatedServiceHistory }),
          });

          carToUse = { ...carData, service_history: updatedServiceHistory };
        } else {
          // รถใหม่ → สร้าง car ใหม่
          const carPayload = {
            car_registration: vehicle.plate,
            car_registration_province: vehicle.province,
            // ส่งเฉพาะชื่อ (String) ไปยัง Backend ตาม Car Model
            brand_car: vehicle.brand ? vehicle.brand.name : null,
            model_car: vehicle.model ? vehicle.model.name : null,
            type_car: vehicle.type ? vehicle.type.name : null,
            color: vehicle.color ? vehicle.color.name : null,
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
          carToUse = await carRes.json();

          // เพิ่มรถใหม่เข้า customer
          await fetch(
            `http://localhost:5000/api/customers/${customerToUse._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                cars: [...(customerToUse.cars || []), carToUse._id],
              }),
            }
          );
        }
      } else {
        // ลูกค้าใหม่ → สร้าง car + customer
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
        carToUse = await carRes.json();

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
        const customerRes = await fetch("http://localhost:5000/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(customerPayload),
        });
        customerToUse = await customerRes.json();
      }

      // สร้าง transaction
      const transactionPayload = {
        customer: customerToUse._id,
        car: carToUse._id,
        serviceHistory: newServiceHistory._id,
        total_price: finalTotalPrice,
        transaction_id: Date.now(),
        date: new Date().toISOString(),
      };
      const transactionRes = await fetch(
        "http://localhost:5000/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(transactionPayload),
        }
      );
      if (!transactionRes.ok) throw new Error("Failed to save transaction.");
      await transactionRes.json();

      alert("บันทึกข้อมูลสำเร็จ!");
      clearAll();
      fetchCustomersAndServices();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };
  useEffect(() => {
    fetchCustomersAndServices().then(() => {
      console.log("✅ carSettings ที่โหลดมา:", carSettings);
    });
  }, []);

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Autocomplete
                  options={customerList.map((c) => c.customer_name)}
                  value={customerName || null}
                  onChange={(e, newValue) => {
                    const foundCustomer = customerList.find(
                      (c) => c.customer_name === newValue
                    );
                    handleSelectCustomer(foundCustomer);
                    console.log("🚗 รถของลูกค้าที่เลือก:", cust.cars);
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

                          return (
                            <button
                              key={slotId}
                              disabled={isOccupied} // ❌ ห้ามเลือกถ้ามีคนจองแล้ว
                              onClick={() =>
                                !isOccupied && setSelectedParkingSlot(slotId)
                              } // ✅ เลือกได้เฉพาะที่ว่าง
                              className={`p-2 rounded-md text-white font-bold transition 
            ${
              isOccupied
                ? "bg-red-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 cursor-pointer"
            }
            ${isSelected ? "ring-2 ring-offset-2 ring-[#ea7f33]" : ""}
          `}
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
