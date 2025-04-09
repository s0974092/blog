export default function Dashboard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4">儀表板</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="font-bold text-lg">文章總數</h2>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="font-bold text-lg">類型總數</h2>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="font-bold text-lg">今日訪問</h2>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
    </div>
  )
} 