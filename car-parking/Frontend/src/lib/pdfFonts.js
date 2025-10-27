// src/lib/pdfFonts.js

// 1. ดึง URL หลักของเว็บที่กำลังรันอยู่ (เช่น "http://localhost:5173")
const BASE_URL = window.location.origin;

const pdfFonts = {
  Sarabun: {
    // 2. แก้ไข Path ให้เป็น URL แบบเต็ม (Absolute URL)
    // โดยการเอา BASE_URL มาต่อหน้า Path เดิม
    normal: `${BASE_URL}/fonts/Sarabun-Regular.ttf`,
    bold: `${BASE_URL}/fonts/Sarabun-Bold.ttf`,
    italics: `${BASE_URL}/fonts/Sarabun-Italic.ttf`,
    bolditalics: `${BASE_URL}/fonts/Sarabun-BoldItalic.ttf`
  }
};

export default pdfFonts;