"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ!</h2>
        <p className="text-gray-600 mb-4">عذراً، حدث خطأ غير متوقع.</p>
        <button onClick={() => reset()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          المحاولة مرة أخرى
        </button>
      </div>
    </div>
  )
}
