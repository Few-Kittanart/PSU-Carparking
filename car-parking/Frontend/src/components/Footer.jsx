import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 text-center text-sm py-4 mt-auto">
      <p>
        Copyright © 2025 ศูนย์วิจัยระบบอัตโนมัติอัจฉริยะ คณะวิศวกรรมศาสตร์,
        ศูนย์ส่งเสริมอุตสาหกรรมภาคที่ 11 and Powered By IARC PSU Ver
        0.4.4.12
      </p>
      <div className="mt-1 space-x-4">
        <a
          href="https://iarc.psu.ac.th/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          IARC PSU
        </a>
        <a
          href="https://iarc.psu.ac.th/about/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          About Us
        </a>
      </div>
    </footer>
  );
}
