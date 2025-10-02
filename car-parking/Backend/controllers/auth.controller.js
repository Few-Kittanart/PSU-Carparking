const User = require('../models/user.model');
const Department = require('../models/department.model'); // <--- 1. เพิ่ม Import Department Model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // หา user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // --- START: ดึง Permissions จากแผนก ---
    let permissions = [];
    
    if (user.department) {
        // ค้นหาแผนกด้วยชื่อแผนกที่บันทึกใน User Model
        const departmentData = await Department.findOne({ department_name: user.department });
        
        // ถ้าพบข้อมูลแผนก ให้ใช้ permissions ของแผนกนั้น
        if (departmentData && departmentData.permissions) {
            permissions = departmentData.permissions;
        }
    }
    
    // 4. สร้าง User Object Payload ใหม่ที่มี Permissions ครบถ้วน
    // (ใช้ user.toObject() เพื่อให้เป็น Plain JS Object ก่อน)
    const userPayload = {
        ...user.toObject(),
        // *** สำคัญ: แนบ permissions ที่ดึงมาจากแผนก ***
        permissions: permissions, 
    };

    // --- END: ดึง Permissions จากแผนก ---

    // สร้าง token (JWT Payload ควรเล็ก แต่ User Object ที่ส่งกลับควรมีข้อมูลครบ)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    
    // ✅ ส่งข้อมูล userPayload ที่มี permissions กลับไปพร้อมกับ token
    // Frontend (Sidebar) จะอ่านค่า permissions จาก Object นี้
    res.json({ token, user: userPayload }); 
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};