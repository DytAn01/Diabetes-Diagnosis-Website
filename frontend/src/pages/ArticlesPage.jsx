import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  ChevronRight, 
  Bookmark, 
  Share2,
  Newspaper,
  Heart,
  Activity,
  User,
  AlertCircle
} from 'lucide-react'
import axiosClient from '../api/axiosClient'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
      try {
      const response = await axiosClient.get('/articles/')
      setArticles(response.data.articles || [])
    } catch (err) {
      setError('Không tải được bài viết')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="h-40 bg-slate-100 rounded-[40px] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-50 rounded-[40px] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100">
                  <BookOpen size={10} /> Thư viện lâm sàng
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Kiến thức sức khỏe</h1>
                <p className="text-lg text-slate-500 font-medium">Tài nguyên được chuyên gia kiểm duyệt về quản lý tiểu đường và sức khỏe chuyển hóa.</p>
              </div>
            </header>

            {error && (
              <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 text-red-600">
                <AlertCircle size={20} />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedArticle(article)}
                  className="group cursor-pointer"
                >
                  <div className="glass-card h-full rounded-[40px] border-white overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                       <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-purple-500/20" />
                       <Newspaper size={48} className="text-white/20 group-hover:scale-110 group-hover:text-teal-400 transition-all duration-700" />
                       <div className="absolute bottom-4 left-4">
                           <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-white">
                                {article.category || 'Lâm sàng'}
                              </span>
                       </div>
                    </div>
                    
                    <div className="p-8 space-y-4 flex-grow flex flex-col">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-teal-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                        {article.content.substring(0, 150)}...
                      </p>
                      
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={12} /> {new Date(article.published_date).toLocaleDateString()}
                         </div>
                         <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
                <button
              onClick={() => setSelectedArticle(null)}
              className="mb-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest italic">Quay lại Thư viện</span>
            </button>

            <article className="space-y-12">
              <header className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-500 text-white rounded-2xl">
                     <Heart size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">{selectedArticle.category || 'Hướng dẫn lâm sàng'}</p>
                    <p className="text-xs text-slate-400 font-bold">Đăng ngày {new Date(selectedArticle.published_date || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  {selectedArticle.title}
                </h1>
                
                <div className="flex items-center gap-6 py-6 border-y border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Hội đồng lâm sàng</p>
                          <p className="text-[10px] text-slate-400 font-bold">Xác thực bởi chuyên gia</p>
                     </div>
                  </div>
                  <div className="h-10 w-px bg-slate-100" />
                  <div className="flex items-center gap-3 text-slate-400">
                     <button className="hover:text-teal-500 transition-colors"><Bookmark size={20} /></button>
                     <button className="hover:text-teal-500 transition-colors"><Share2 size={20} /></button>
                  </div>
                </div>
              </header>

              <div className="prose prose-slate prose-xl max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium">
                {selectedArticle.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <footer className="pt-12 border-t border-slate-100 space-y-8">
                 <div className="p-10 rounded-[40px] bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Activity size={100} />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-xl">
                       <h4 className="text-2xl font-black tracking-tight">Nội dung hữu ích?</h4>
                       <p className="text-slate-400 font-medium">Tham gia mạng lưới của chúng tôi để nhận các chuyên đề sâu về y học chuyển hóa mỗi hai tuần.</p>
                       <button className="bg-teal-500 text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-transform active:scale-95">Đăng ký Thư viện</button>
                    </div>
                 </div>
              </footer>
            </article>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
