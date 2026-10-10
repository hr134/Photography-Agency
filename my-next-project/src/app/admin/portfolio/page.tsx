"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Trash2, Edit2, Loader2, Image, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "stories" | "films";

export default function PortfolioAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>("stories");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "stories" ? "/portfolio/stories" : "/portfolio/films";
      const data = await api.get(endpoint);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setFormData({ ...formData, [e.target.name]: fileInput.files[0] });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRemoveFile = async (type: 'image' | 'thumbnail') => {
    const filePath = formData[type];
    if (!filePath || typeof filePath !== 'string') return;
    
    if (!confirm("Are you sure you want to permanently delete this file?")) return;
    
    try {
      if (filePath.startsWith('/static/uploads/')) {
        await api.delete('/admin/files', { file_path: filePath });
      }
      setFormData({ ...formData, [type]: '' });
      // To persist it in the DB immediately:
      if (editingId) {
        const endpoint = activeTab === "stories" ? "/portfolio/stories" : "/portfolio/films";
        const dataToSubmit = new FormData();
        dataToSubmit.append(`${type}_url`, ''); // Setting to empty url tells backend there's no url (and no new file)
        await api.put(`${endpoint}/${editingId}`, dataToSubmit);
      }
      fetchItems();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "stories" ? "/portfolio/stories" : "/portfolio/films";
      
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          dataToSubmit.append(key, formData[key]);
        }
      });

      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, dataToSubmit);
      } else {
        await api.post(endpoint, dataToSubmit);
      }
      handleCloseModal();
      fetchItems();
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const endpoint = activeTab === "stories" ? "/portfolio/stories" : "/portfolio/films";
      await api.delete(`${endpoint}/${id}`);
      fetchItems();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Portfolio Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#d8c3a5] text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#e8d3b5] transition-colors"
        >
          <Plus size={20} />
          <span>Add New</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("stories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "stories" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Image size={20} />
          <span>Stories</span>
        </button>
        <button
          onClick={() => setActiveTab("films")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "films" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Video size={20} />
          <span>Films</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#d8c3a5]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group"
              >
                <div className="aspect-video relative bg-black">
                  {activeTab === "stories" ? (
                    <img src={item.image && item.image.startsWith('/') ? `http://localhost:5000${item.image}` : (item.image || '')} alt={item.couple} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <img src={item.thumbnail && item.thumbnail.startsWith('/') ? `http://localhost:5000${item.thumbnail}` : (item.thumbnail || '')} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-medium mb-1">
                    {activeTab === "stories" ? item.couple : item.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-4">{item.category} • {item.location}</p>
                  
                  <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-white/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="col-span-full py-12 text-center text-white/60">
              No items found. Create your first {activeTab.slice(0, -1)}.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md relative z-10"
            >
              <h2 className="text-2xl font-serif mb-6">
                {editingId ? "Edit" : "Add"} {activeTab === "stories" ? "Story" : "Film"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "stories" ? (
                  <>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Couple Names</label>
                      <input
                        type="text"
                        name="couple"
                        value={formData.couple || ""}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category || ""}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      >
                        <option value="">Select Category</option>
                        <option value="Weddings">Weddings</option>
                        <option value="Pre-Wedding">Pre-Wedding</option>
                        <option value="Engagement">Engagement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Year</label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year || ""}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Image Upload (File)</label>
                      
                      {editingId && formData.image && typeof formData.image === 'string' && (
                        <div className="flex items-center gap-2 mb-3 bg-white/5 border border-white/10 p-2 rounded-lg">
                          <span className="text-sm truncate flex-1">{formData.image.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('image')}
                            className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40"
                            title="Permanently Delete Image"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="image/*"
                        name="image"
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                      <label className="block text-sm text-white/60 mb-1 mt-3">Or Image URL (Link)</label>
                      <input
                        type="text"
                        name="image_url"
                        value={formData.image_url || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                      {editingId && formData.image && typeof formData.image === 'string' && (
                        <p className="text-xs text-white/40 mt-1">Leave both empty to keep current image</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">External Link (Redirect users here)</label>
                      <input
                        type="text"
                        name="external_link"
                        value={formData.external_link || ""}
                        onChange={handleChange}
                        placeholder="https://facebook.com/... (optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ""}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">YouTube Video ID</label>
                      <input
                        type="text"
                        name="youtubeId"
                        value={formData.youtubeId || ""}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                        placeholder="e.g. vB3wN1vGsz4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category || ""}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Thumbnail Upload (File)</label>
                      
                      {editingId && formData.thumbnail && typeof formData.thumbnail === 'string' && (
                        <div className="flex items-center gap-2 mb-3 bg-white/5 border border-white/10 p-2 rounded-lg">
                          <span className="text-sm truncate flex-1">{formData.thumbnail.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('thumbnail')}
                            className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40"
                            title="Permanently Delete Thumbnail"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="image/*"
                        name="thumbnail"
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                      <label className="block text-sm text-white/60 mb-1 mt-3">Or Thumbnail URL (Link)</label>
                      <input
                        type="text"
                        name="thumbnail_url"
                        value={formData.thumbnail_url || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                      />
                      {editingId && formData.thumbnail && typeof formData.thumbnail === 'string' && (
                        <p className="text-xs text-white/40 mt-1">Leave both empty to keep current thumbnail</p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm text-white/60 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d8c3a5]"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#d8c3a5] text-black px-6 py-2 rounded-lg hover:bg-[#e8d3b5] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
