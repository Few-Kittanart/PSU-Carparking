import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Box,
  Switch,
  FormControlLabel,
  InputLabel,
  Divider,
} from "@mui/material";

export default function SettingPage() {
  const [settings, setSettings] = useState({
    systemName: "",
    description: "",
    companyName: "",
    website: "",
    phoneNumber: "",
    fax: "",
    email: "",
    systemUrl: "",
    taxId: "",
    address: {
      number: "",
      moo: "",
      street: "",
      tambon: "",
      amphoe: "",
      province: "",
      zipcode: "",
      country: "",
    },
    bank1: {
      show: false,
      accountName: "",
      bankName: "",
      accountNumber: "",
      showQrCode: false,
    },
    bank2: {
      show: false,
      accountName: "",
      bankName: "",
      accountNumber: "",
    },
    promptPay: {
      show: false,
      accountName: "",
      promptPayNumber: "",
    },
    creditCard: {
      show: false,
      invoiceNumber: "",
    },
    sponsor: {
      name: "",
      website: "",
    },
    api: {
      clientId: "",
      redirectUri: "",
      clientSecret: "",
      useDeveloperToken: false,
      lineNotifyToken: "",
    },
    logo: {
      main: null,
      sub: null,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("ไม่สามารถดึงข้อมูลการตั้งค่าได้");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleTextChange = (e, field, subField = null, subSubField = null) => {
    const { value } = e.target;
    setSettings((prev) => {
      let newSettings = { ...prev };
      if (subSubField) {
        newSettings[field][subField][subSubField] = value;
      } else if (subField) {
        newSettings[field][subField] = value;
      } else {
        newSettings[field] = value;
      }
      return newSettings;
    });
  };

  const handleSwitchChange = (e, field, subField = null) => {
    const { checked } = e.target;
    setSettings((prev) => {
      let newSettings = { ...prev };
      if (subField) {
        newSettings[field][subField] = checked;
      } else {
        newSettings[field] = checked;
      }
      return newSettings;
    });
  };

  const handleFileChange = (e, logoType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({
          ...prev,
          logo: {
            ...prev.logo,
            [logoType]: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }
      alert("บันทึกการตั้งค่าสำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <Box className="p-6 sm:p-10 space-y-6">
      <Typography variant="h4" component="h1" className="text-3xl font-bold text-[#ea7f33]">
        การตั้งค่าระบบ
      </Typography>

      <Paper elevation={3} className="p-6 space-y-6 rounded-lg">
        {/* 1. ข้อมูลทั่วไป */}
        <Typography variant="h5" className="font-bold text-gray-700">
          ข้อมูลทั่วไปของระบบ
        </Typography>
        <Grid container spacing={3}>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="ชื่อระบบ" value={settings.systemName} onChange={(e) => handleTextChange(e, "systemName")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="คำอธิบาย" value={settings.description} onChange={(e) => handleTextChange(e, "description")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="ชื่อบริษัท/หน่วยงาน" value={settings.companyName} onChange={(e) => handleTextChange(e, "companyName")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="เว็บไซต์" value={settings.website} onChange={(e) => handleTextChange(e, "website")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="เบอร์โทรศัพท์" value={settings.phoneNumber} onChange={(e) => handleTextChange(e, "phoneNumber")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="แฟกซ์" value={settings.fax} onChange={(e) => handleTextChange(e, "fax")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="อีเมล" value={settings.email} onChange={(e) => handleTextChange(e, "email")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="URL ของระบบ" value={settings.systemUrl} onChange={(e) => handleTextChange(e, "systemUrl")} />
          </Grid>
        </Grid>

        <Divider className="my-6" />

        {/* 2. ข้อมูลที่อยู่และภาษี */}
        <Typography variant="h5" className="font-bold text-gray-700">
          ข้อมูลที่อยู่และภาษี
        </Typography>
        <Grid container spacing={3}>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="เลขที่ผู้เสียภาษี" value={settings.taxId} onChange={(e) => handleTextChange(e, "taxId")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="เลขที่" value={settings.address.number} onChange={(e) => handleTextChange(e, "address", "number")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="หมู่ที่" value={settings.address.moo} onChange={(e) => handleTextChange(e, "address", "moo")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="ถนน" value={settings.address.street} onChange={(e) => handleTextChange(e, "address", "street")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="ตำบล" value={settings.address.tambon} onChange={(e) => handleTextChange(e, "address", "tambon")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="อำเภอ" value={settings.address.amphoe} onChange={(e) => handleTextChange(e, "address", "amphoe")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="จังหวัด" value={settings.address.province} onChange={(e) => handleTextChange(e, "address", "province")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="รหัสไปรษณีย์" value={settings.address.zipcode} onChange={(e) => handleTextChange(e, "address", "zipcode")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="ประเทศ" value={settings.address.country} onChange={(e) => handleTextChange(e, "address", "country")} />
          </Grid>
        </Grid>

        <Divider className="my-6" />

        {/* 3. ข้อมูลบัญชีธนาคารและการชำระเงิน */}
        <Typography variant="h5" className="font-bold text-gray-700">
          บัญชีธนาคารและการชำระเงิน
        </Typography>
        <Grid container spacing={3}>
          <Grid grid={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={settings.bank1.show} onChange={(e) => handleSwitchChange(e, "bank1", "show")} />}
              label="แสดงบัญชีธนาคาร 1"
            />
          </Grid>
          {settings.bank1.show && (
            <>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="ชื่อบัญชี 1" value={settings.bank1.accountName} onChange={(e) => handleTextChange(e, "bank1", "accountName")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="ชื่อธนาคาร 1" value={settings.bank1.bankName} onChange={(e) => handleTextChange(e, "bank1", "bankName")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="เลขที่บัญชี 1" value={settings.bank1.accountNumber} onChange={(e) => handleTextChange(e, "bank1", "accountNumber")} />
              </Grid>
              <Grid grid={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch checked={settings.bank1.showQrCode} onChange={(e) => handleSwitchChange(e, "bank1", "showQrCode")} />}
                  label="แสดงรูป QR Code"
                />
              </Grid>
            </>
          )}

          <Grid grid={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={settings.bank2.show} onChange={(e) => handleSwitchChange(e, "bank2", "show")} />}
              label="แสดงบัญชีธนาคาร 2"
            />
          </Grid>
          {settings.bank2.show && (
            <>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="ชื่อบัญชี 2" value={settings.bank2.accountName} onChange={(e) => handleTextChange(e, "bank2", "accountName")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="ชื่อธนาคาร 2" value={settings.bank2.bankName} onChange={(e) => handleTextChange(e, "bank2", "bankName")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="เลขที่บัญชี 2" value={settings.bank2.accountNumber} onChange={(e) => handleTextChange(e, "bank2", "accountNumber")} />
              </Grid>
            </>
          )}

          <Grid grid={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={settings.promptPay.show} onChange={(e) => handleSwitchChange(e, "promptPay", "show")} />}
              label="แสดงพร้อมเพย์"
            />
          </Grid>
          {settings.promptPay.show && (
            <>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="ชื่อบัญชีพร้อมเพย์" value={settings.promptPay.accountName} onChange={(e) => handleTextChange(e, "promptPay", "accountName")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="เลขพร้อมเพย์" value={settings.promptPay.promptPayNumber} onChange={(e) => handleTextChange(e, "promptPay", "promptPayNumber")} />
              </Grid>
            </>
          )}
          
          <Grid grid={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={settings.creditCard.show} onChange={(e) => handleSwitchChange(e, "creditCard", "show")} />}
              label="แสดงบัตรเครดิต"
            />
          </Grid>
          {settings.creditCard.show && (
            <Grid grid={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="หมายเลขใบแจ้งหนี้" value={settings.creditCard.invoiceNumber} onChange={(e) => handleTextChange(e, "creditCard", "invoiceNumber")} />
            </Grid>
          )}
        </Grid>
        
        <Divider className="my-6" />
        
        {/* 4. ข้อมูลผู้สนับสนุน */}
        <Typography variant="h5" className="font-bold text-gray-700">
          ข้อมูลผู้สนับสนุน
        </Typography>
        <Grid container spacing={3}>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="ชื่อผู้สนับสนุน" value={settings.sponsor.name} onChange={(e) => handleTextChange(e, "sponsor", "name")} />
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="เว็บไซต์ผู้สนับสนุน" value={settings.sponsor.website} onChange={(e) => handleTextChange(e, "sponsor", "website")} />
          </Grid>
        </Grid>

        <Divider className="my-6" />

        {/* 5. ข้อมูล API และ Line Notify */}
        <Typography variant="h5" className="font-bold text-gray-700">
          ข้อมูล API
        </Typography>
        <Grid container spacing={3}>
          <Grid grid={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={settings.api.useDeveloperToken} onChange={(e) => handleSwitchChange(e, "api", "useDeveloperToken")} />}
              label="ใช้ Developer Token แทน"
            />
          </Grid>
          {settings.api.useDeveloperToken ? (
            <Grid grid={{ xs: 12 }}>
              <TextField fullWidth label="Line Notify Development Token" value={settings.api.lineNotifyToken} onChange={(e) => handleTextChange(e, "api", "lineNotifyToken")} />
            </Grid>
          ) : (
            <>
              <Grid grid={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Client ID" value={settings.api.clientId} onChange={(e) => handleTextChange(e, "api", "clientId")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Redirect URI" value={settings.api.redirectUri} onChange={(e) => handleTextChange(e, "api", "redirectUri")} />
              </Grid>
              <Grid grid={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Client Secret" value={settings.api.clientSecret} onChange={(e) => handleTextChange(e, "api", "clientSecret")} />
              </Grid>
            </>
          )}
        </Grid>

        <Divider className="my-6" />

        {/* 6. โลโก้ */}
        <Typography variant="h5" className="font-bold text-gray-700">
          รูปภาพโลโก้
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid grid={{ xs: 12, md: 6 }}>
            <InputLabel>โลโก้หลัก</InputLabel>
            <TextField fullWidth type="file" onChange={(e) => handleFileChange(e, "main")} inputProps={{ accept: "image/*" }} />
            {settings.logo.main && (
              <Box mt={2}>
                <img src={settings.logo.main} alt="Main Logo" style={{ maxWidth: '100%', maxHeight: '200px' }} />
              </Box>
            )}
          </Grid>
          <Grid grid={{ xs: 12, md: 6 }}>
            <InputLabel>โลโก้รอง</InputLabel>
            <TextField fullWidth type="file" onChange={(e) => handleFileChange(e, "sub")} inputProps={{ accept: "image/*" }} />
            {settings.logo.sub && (
              <Box mt={2}>
                <img src={settings.logo.sub} alt="Sub Logo" style={{ maxWidth: '100%', maxHeight: '200px' }} />
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Box className="flex justify-end pt-6">
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#45a049" } }}
          >
            บันทึก
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}