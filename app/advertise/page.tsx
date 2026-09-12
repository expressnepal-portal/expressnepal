export default function AdvertisePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Advertise With Us</h1>
        <p className="text-gray-600 text-lg mb-6">
          Reach thousands of Nepali readers worldwide. Contact us for advertising opportunities.
        </p>
        <a
          href="mailto:expressnepaloffice@gmail.com"
          className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
