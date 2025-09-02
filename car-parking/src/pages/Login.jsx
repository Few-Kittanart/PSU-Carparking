import React, { useState, useEffect } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username:", username, "Password:", password);
    // TODO: เชื่อม backend เพื่อตรวจสอบ
  };

  // Responsive breakpoints
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  // Dynamic styles based on screen size
  const containerPadding = isMobile ? '1rem' : isTablet ? '2rem' : '3rem 2.5rem';
  const containerMaxWidth = isMobile ? '90%' : isTablet ? '420px' : '450px';
  const titleSize = isMobile ? '1.8rem' : isTablet ? '2rem' : '2.2rem';
  const inputPadding = isMobile ? '0.9rem 1rem' : '1rem 1.2rem';
  const fontSize = isMobile ? '0.95rem' : '1rem';
  const footerSize = isMobile ? '0.7rem' : '0.75rem';

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#ffffffff',
      padding: isMobile ? '1rem' : '2rem',
      boxSizing: 'border-box'
    }}>
      {/* กล่อง login */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: isMobile ? '16px' : '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
        padding: containerPadding,
        width: '100%',
        maxWidth: containerMaxWidth,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* หัวข้อ */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '2.5rem' }}>
          <h1 style={{ 
            fontSize: titleSize, 
            fontWeight: 'bold', 
            color: '#9333ea', 
            marginBottom: '0.8rem',
            letterSpacing: '-0.5px',
            lineHeight: '1.2' 
          }}>Car Parking</h1>
          <p style={{ 
            fontSize: isMobile ? '0.95rem' : '1rem', 
            color: '#6b7280', 
            fontWeight: '400' 
          }}>เข้าสู่ระบบ</p>
        </div>

        <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
          <div style={{ marginBottom: isMobile ? '1.2rem' : '1.5rem' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้"
              style={{
                width: '100%',
                padding: inputPadding,
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: fontSize,
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
                WebkitAppearance: 'none', // Remove iOS styling
                appearance: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              style={{
                width: '100%',
                padding: inputPadding,
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: fontSize,
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: inputPadding,
              borderRadius: '8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: '600',
              fontSize: fontSize,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              minHeight: isMobile ? '48px' : '52px', // Touch-friendly height
              WebkitTapHighlightColor: 'transparent' // Remove tap highlight on mobile
            }}
            onMouseEnter={(e) => {
              if (!isMobile) { // Only hover effects on non-mobile
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }
            }}
            onTouchStart={(e) => { // Touch feedback for mobile
              e.target.style.backgroundColor = '#2563eb';
            }}
            onTouchEnd={(e) => {
              setTimeout(() => {
                e.target.style.backgroundColor = '#3b82f6';
              }, 100);
            }}
          >
            เข้าสู่ระบบ
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: isMobile ? '2rem' : '2.5rem' }}>
          <p style={{ 
            fontSize: isMobile ? '0.8rem' : '0.85rem', 
            color: '#9ca3af', 
            marginBottom: '0.8rem',
            fontWeight: '500' 
          }}>
            พัฒนาระบบโดย
          </p>
          <p style={{ 
            fontSize: footerSize, 
            color: '#6b7280', 
            lineHeight: isMobile ? '1.4' : '1.5',
            marginBottom: isMobile ? '1rem' : '1.2rem' 
          }}>
            ศูนย์วิจัยระบบอัตโนมัติอัจฉริยะ<br />
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยสงขลานครินทร์
          </p>
          <p style={{ 
            fontSize: isMobile ? '0.7rem' : '0.75rem', 
            color: '#9ca3af', 
            fontWeight: '400' 
          }}>
            © 2022 E-Maintenance Version 0.2.2.3 beta
          </p>
        </div>
      </div>
    </div>
  );
}