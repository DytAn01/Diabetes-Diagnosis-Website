import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await axiosClient.get('/articles/')
      setArticles(response.data.articles)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Health Articles</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {selectedArticle ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Articles
          </button>
          <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
          <p className="text-sm text-gray-500 mb-6">
            Category: {selectedArticle.category} | 
            Published: {new Date(selectedArticle.published_date).toLocaleDateString()}
          </p>
          <p className="text-gray-700 leading-relaxed">{selectedArticle.content}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map(article => (
            <div 
              key={article.id} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <h3 className="text-xl font-bold mb-2">{article.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {article.category} • {new Date(article.published_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-4">
                {article.content.substring(0, 100)}...
              </p>
              <button className="text-blue-600 hover:underline font-semibold">
                Read More →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
