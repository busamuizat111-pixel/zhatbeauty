'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F2]">
      <h2 className="text-3xl font-bold text-[#261C1A] mb-3 font-serif">Page Not Found</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>
      <a
        href="/"
        className="px-6 py-2.5 rounded-xl bg-[#4A2E2B] text-white font-medium hover:bg-[#3B2321] transition-colors"
      >
        Return to Home
      </a>
    </div>
  );
}
