import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-nepal-red mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-nepali-serif">
        पेज भेटिएन
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        माफ गर्नुहोस्, तपाईंले खोज्नुभएको पेज भेटिएन। कृपया होमपेजमा फर्कनुहोस्।
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-nepal-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
      >
        होमपेजमा फर्कनुहोस्
      </Link>
    </div>
  );
}
