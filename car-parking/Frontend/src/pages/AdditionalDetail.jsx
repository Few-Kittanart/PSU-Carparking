import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdditionalDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    // fetch ข้อมูลบริการเพิ่มเติมจาก backend
    fetch(`http://localhost:3000/api/additional/${id}`)
      .then(res => res.json())
      .then(d => setData(d));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#ea7f33]">
        รายละเอียดบริการเพิ่มเติม - {data.customerName}
      </h2>
      <div>รหัสบริการ: {data.id}</div>
      <div>เบอร์โทรศัพท์: {data.phone}</div>
      <div>
        รายการบริการ:
        {data.services.map((s, i) => (
          <div key={i}>
            {s.name} - {s.price} บาท
          </div>
        ))}
      </div>
      <div>รวมราคา: {data.totalPrice} บาท</div>
      <div>หมายเหตุ: {data.note}</div>
    </div>
  );
}
