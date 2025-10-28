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
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCodeIcon from "@mui/icons-material/QrCode";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
        } else {
          throw new Error("Failed to fetch settings");
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

  const handleFileChange = (e, type, bankNumber = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => {
          let newSettings = { ...prev };
          if (type === "logo") {
            newSettings.logo[bankNumber] = reader.result; // bankNumber here is 'main' or 'sub'
          } else if (type === "qr" && bankNumber) {
            newSettings[`bank${bankNumber}`].qrCodeImage = reader.result;
          }
          return newSettings;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(null);
    setError(null);
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
      setSuccess("บันทึกการตั้งค่าสำเร็จ!");
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: "bold", color: "#ea7f33", mb: 4 }}
      >
        การตั้งค่าระบบ
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#424242" }}
        >
          ข้อมูลทั่วไปของระบบ
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ชื่อระบบ"
              value={settings.systemName}
              onChange={(e) => handleTextChange(e, "systemName")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="คำอธิบาย"
              value={settings.description}
              onChange={(e) => handleTextChange(e, "description")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ชื่อบริษัท/หน่วยงาน"
              value={settings.companyName}
              onChange={(e) => handleTextChange(e, "companyName")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="เว็บไซต์"
              value={settings.website}
              onChange={(e) => handleTextChange(e, "website")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              value={settings.phoneNumber}
              onChange={(e) => handleTextChange(e, "phoneNumber")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="แฟกซ์"
              value={settings.fax}
              onChange={(e) => handleTextChange(e, "fax")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="อีเมล"
              value={settings.email}
              onChange={(e) => handleTextChange(e, "email")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL ของระบบ"
              value={settings.systemUrl}
              onChange={(e) => handleTextChange(e, "systemUrl")}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#424242" }}
        >
          ข้อมูลที่อยู่และภาษี
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="เลขที่ผู้เสียภาษี"
              value={settings.taxId}
              onChange={(e) => handleTextChange(e, "taxId")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="เลขที่"
              value={settings.address.number}
              onChange={(e) => handleTextChange(e, "address", "number")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="หมู่ที่"
              value={settings.address.moo}
              onChange={(e) => handleTextChange(e, "address", "moo")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ถนน"
              value={settings.address.street}
              onChange={(e) => handleTextChange(e, "address", "street")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ตำบล"
              value={settings.address.tambon}
              onChange={(e) => handleTextChange(e, "address", "tambon")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="อำเภอ"
              value={settings.address.amphoe}
              onChange={(e) => handleTextChange(e, "address", "amphoe")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="จังหวัด"
              value={settings.address.province}
              onChange={(e) => handleTextChange(e, "address", "province")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="รหัสไปรษณีย์"
              value={settings.address.zipcode}
              onChange={(e) => handleTextChange(e, "address", "zipcode")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ประเทศ"
              value={settings.address.country}
              onChange={(e) => handleTextChange(e, "address", "country")}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#424242" }}
        >
          บัญชีธนาคารและการชำระเงิน
        </Typography>

        {/* --- Bank 1 --- */}
        <Accordion
          expanded={settings.bank1.show}
          onChange={() =>
            handleSwitchChange(
              { target: { checked: !settings.bank1.show } },
              "bank1",
              "show"
            )
          }
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: settings.bank1.show ? "#e8f5e9" : "transparent" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <AccountBalanceIcon sx={{ color: "#2e7d32", mr: 2 }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                บัญชีธนาคาร 1
              </Typography>
              <Switch
                checked={settings.bank1.show}
                onChange={(e) => handleSwitchChange(e, "bank1", "show")}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* (TextFields เดิม ... accountName, bankName, accountNumber) */}
              <Grid item xs={12} md={6}>
                {" "}
                <TextField
                  fullWidth
                  label="ชื่อบัญชี 1"
                  value={settings.bank1.accountName}
                  onChange={(e) => handleTextChange(e, "bank1", "accountName")}
                />{" "}
              </Grid>
              <Grid item xs={12} md={6}>
                {" "}
                <TextField
                  fullWidth
                  label="ชื่อธนาคาร 1"
                  value={settings.bank1.bankName}
                  onChange={(e) => handleTextChange(e, "bank1", "bankName")}
                />{" "}
              </Grid>
              <Grid item xs={12} md={6}>
                {" "}
                <TextField
                  fullWidth
                  label="เลขที่บัญชี 1"
                  value={settings.bank1.accountNumber}
                  onChange={(e) =>
                    handleTextChange(e, "bank1", "accountNumber")
                  }
                />{" "}
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.bank1.showQrCode}
                      onChange={(e) =>
                        handleSwitchChange(e, "bank1", "showQrCode")
                      }
                    />
                  }
                  label="แสดงรูป QR Code (ในหน้าชำระเงิน)"
                />
              </Grid>

              {/* ✅ เพิ่มส่วนอัปโหลด QR Code สำหรับ Bank 1 */}
              <Grid item xs={12}>
                <InputLabel sx={{ mb: 1, color: "text.secondary" }}>
                  รูป QR Code ธนาคาร 1
                </InputLabel>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                  >
                    อัปโหลด QR Code
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) => handleFileChange(e, "qr", 1)}
                      accept="image/*"
                    />
                  </Button>
                  {settings.bank1.qrCodeImage && (
                    <img
                      src={settings.bank1.qrCodeImage}
                      alt="QR Code Bank 1"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                </Box>
              </Grid>
              {/* (สิ้นสุดส่วนที่เพิ่ม) */}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* --- Bank 2 --- */}
        <Accordion
          expanded={settings.bank2.show}
          onChange={() =>
            handleSwitchChange(
              { target: { checked: !settings.bank2.show } },
              "bank2",
              "show"
            )
          }
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: settings.bank2.show ? "#e8f5e9" : "transparent" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <AccountBalanceIcon sx={{ color: "#1565c0", mr: 2 }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                บัญชีธนาคาร 2
              </Typography>
              <Switch
                checked={settings.bank2.show}
                onChange={(e) => handleSwitchChange(e, "bank2", "show")}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* (TextFields เดิม ... accountName, bankName, accountNumber) */}
              <Grid item xs={12} md={6}>
                {" "}
                <TextField
                  fullWidth
                  label="ชื่อบัญชี 2"
                  value={settings.bank2.accountName}
                  onChange={(e) => handleTextChange(e, "bank2", "accountName")}
                />{" "}
              </Grid>
              <Grid item xs={12} md={6}>
                {" "}
                <TextField
                  fullWidth
                  label="ชื่อธนาคาร 2"
                  value={settings.bank2.bankName}
                  onChange={(e) => handleTextChange(e, "bank2", "bankName")}
                />{" "}
              </Grid>
              <Grid item xs={12} md={6}>
                {" "}
                <TextField
                  fullWidth
                  label="เลขที่บัญชี 2"
                  value={settings.bank2.accountNumber}
                  onChange={(e) =>
                    handleTextChange(e, "bank2", "accountNumber")
                  }
                />{" "}
              </Grid>

              {/* ✅ เพิ่มส่วนอัปโหลด QR Code สำหรับ Bank 2 */}
              <Grid item xs={12}>
                <InputLabel sx={{ mb: 1, color: "text.secondary" }}>
                  รูป QR Code ธนาคาร 2
                </InputLabel>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                  >
                    อัปโหลด QR Code
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) => handleFileChange(e, "qr", 2)}
                      accept="image/*"
                    />
                  </Button>
                  {settings.bank2.qrCodeImage && (
                    <img
                      src={settings.bank2.qrCodeImage}
                      alt="QR Code Bank 2"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* PromptPay */}
        <Accordion
          expanded={settings.promptPay.show}
          onChange={() =>
            handleSwitchChange(
              { target: { checked: !settings.promptPay.show } },
              "promptPay",
              "show"
            )
          }
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: settings.promptPay.show ? "#fffde7" : "transparent",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <CreditCardIcon sx={{ color: "#ffc107", mr: 2 }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                พร้อมเพย์
              </Typography>
              <Switch
                checked={settings.promptPay.show}
                onChange={(e) => handleSwitchChange(e, "promptPay", "show")}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ชื่อบัญชีพร้อมเพย์"
                  value={settings.promptPay.accountName}
                  onChange={(e) =>
                    handleTextChange(e, "promptPay", "accountName")
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="เลขพร้อมเพย์"
                  value={settings.promptPay.promptPayNumber}
                  onChange={(e) =>
                    handleTextChange(e, "promptPay", "promptPayNumber")
                  }
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Credit Card */}
        <Accordion
          expanded={settings.creditCard.show}
          onChange={() =>
            handleSwitchChange(
              { target: { checked: !settings.creditCard.show } },
              "creditCard",
              "show"
            )
          }
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: settings.creditCard.show ? "#e3f2fd" : "transparent",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <CreditCardIcon sx={{ color: "#039be5", mr: 2 }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                บัตรเครดิต
              </Typography>
              <Switch
                checked={settings.creditCard.show}
                onChange={(e) => handleSwitchChange(e, "creditCard", "show")}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="หมายเลขใบแจ้งหนี้"
                  value={settings.creditCard.invoiceNumber}
                  onChange={(e) =>
                    handleTextChange(e, "creditCard", "invoiceNumber")
                  }
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#424242" }}
        >
          ข้อมูลผู้สนับสนุน
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ชื่อผู้สนับสนุน"
              value={settings.sponsor.name}
              onChange={(e) => handleTextChange(e, "sponsor", "name")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="เว็บไซต์ผู้สนับสนุน"
              value={settings.sponsor.website}
              onChange={(e) => handleTextChange(e, "sponsor", "website")}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#424242" }}
        >
          ข้อมูล API
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.api.useDeveloperToken}
                  onChange={(e) =>
                    handleSwitchChange(e, "api", "useDeveloperToken")
                  }
                />
              }
              label="ใช้ Developer Token แทน"
            />
          </Grid>
          {settings.api.useDeveloperToken ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Line Notify Development Token"
                value={settings.api.lineNotifyToken}
                onChange={(e) => handleTextChange(e, "api", "lineNotifyToken")}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Client ID"
                  value={settings.api.clientId}
                  onChange={(e) => handleTextChange(e, "api", "clientId")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Redirect URI"
                  value={settings.api.redirectUri}
                  onChange={(e) => handleTextChange(e, "api", "redirectUri")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Client Secret"
                  value={settings.api.clientSecret}
                  onChange={(e) => handleTextChange(e, "api", "clientSecret")}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#424242" }}
        >
          รูปภาพโลโก้
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <InputLabel sx={{ mb: 1, color: "text.secondary" }}>
              โลโก้หลัก
            </InputLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                อัปโหลดไฟล์
                <VisuallyHiddenInput
                  type="file"
                  onChange={(e) => handleFileChange(e, "main")}
                  accept="image/*"
                />
              </Button>
              {settings.logo.main && (
                <img
                  src={settings.logo.main}
                  alt="Main Logo"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <InputLabel sx={{ mb: 1, color: "text.secondary" }}>
              โลโก้รอง
            </InputLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                อัปโหลดไฟล์
                <VisuallyHiddenInput
                  type="file"
                  onChange={(e) => handleFileChange(e, "sub")}
                  accept="image/*"
                />
              </Button>
              {settings.logo.sub && (
                <img
                  src={settings.logo.sub}
                  alt="Sub Logo"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          disabled={isSaving}
        >
          {isSaving ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "บันทึก"
          )}
        </Button>
      </Box>
    </Box>
  );
}
