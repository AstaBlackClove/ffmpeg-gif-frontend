"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold">FFmpeg Tool</h1>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/upload">Upload</Link>
        <Link href="/about">About</Link>
      </div>
    </nav>
  );
}
