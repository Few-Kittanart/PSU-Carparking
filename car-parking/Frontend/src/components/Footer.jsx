import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner text-gray-500 text-center text-xs sm:text-sm py-4">
      <p className="mb-1">
        Copyright © 2025 ศูนย์วิจัยระบบอัตโนมัติอัจฉริยะ คณะวิศวกรรมศาสตร์,
        ศูนย์ส่งเสริมอุตสาหกรรมภาคที่ 11 and Powered By IARC PSU Ver
        0.4.4.12
      </p>
      <div className="space-x-4">
        <a
          href="https://iarc.psu.ac.th/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e79316] hover:underline"
        >
          IARC PSU
        </a>
        <a
          href="https://iarc.psu.ac.th/about/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e79316] hover:underline"
        >
          About Us
        </a>
      </div>
    </footer>
  );
}
