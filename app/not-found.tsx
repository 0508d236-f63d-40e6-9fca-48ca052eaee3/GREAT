export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-4">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
        <a href="/" className="text-blue-600 hover:text-blue-800">
          العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}
