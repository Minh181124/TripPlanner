'use client';

import React, { useState, useEffect } from 'react';
import { Place, CreatePlaceDto, PlaceActivity, PlaceImage } from '../model/places.types';
import { placesApi } from '../api/places.api';
import { mapApi, AutocompletePrediction } from '../../map/api/map.api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Loader, Save, MapPin, Search } from 'lucide-react';

interface PlaceCrudModalProps {
  place: Place | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlaceCrudModal({ place, onClose, onSuccess }: PlaceCrudModalProps) {
  const isEditing = !!place;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'detail' | 'images' | 'activities'>('general');

  // Form State
  const [formData, setFormData] = useState<Partial<CreatePlaceDto>>({
    ten: '',
    diachi: '',
    quan_huyen: '',
    loai: '',
    giatien: 0,
    lat: undefined,
    lng: undefined,
    tu_khoa: '', // Added so they can edit
    chitiet: {
      mota_google: '',
      mota_tonghop: '',
      sodienthoai: '',
      website: '',
    },
    images: [],
    hoatdong: [],
  });

  // Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingGoong, setIsFetchingGoong] = useState(false);
  
  // Debounce logic for Autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await mapApi.autocomplete(searchQuery);
        setSuggestions(results);
        if (results.length > 0) {
           setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Lỗi fetch autocomplete", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = async (suggestion: AutocompletePrediction) => {
    setShowSuggestions(false);
    setSearchQuery(''); // Xóa nội dung tìm kiếm sau khi chọn
    setIsFetchingGoong(true);
    setFormData(prev => ({ ...prev, ten: suggestion.description }));

    try {
      const detail = await mapApi.getAutocompletePlaceDetail(suggestion.place_id);
      
      console.log("Goong Detail:", detail);
      
      if (detail) {
        // Goong API sometimes nests the payload inside `result` depending on Interceptor
        const placeData = (detail as any).result ? (detail as any).result : detail;

        // Bỏ logic Hình ảnh theo yêu cầu vì API Goong Detail không hỗ trợ array photos

        // Parse Quận/Huyện từ address_components
        let foundQuanHuyen = '';
        
        if (placeData.address_components && placeData.address_components.length > 0) {
          const districtComp = placeData.address_components.find((c: any) => 
            c.types.includes('administrative_area_level_2') || 
            c.types.includes('sublocality_level_1')
          );
          if (districtComp) {
            foundQuanHuyen = districtComp.long_name;
          }
        }
        
        // Fallback Regex processing
        if (!foundQuanHuyen && placeData.formatted_address) {
          const parts = placeData.formatted_address.split(',').map((p: string) => p.trim());
          // Thường Quận/Huyện ở vị trí kế cuối hoặc chứa chữ Quận/Huyện/Thị xã
          const districtPart = parts.find((p: string) => /Quận|Huyện|Thị xã|TP|Thành phố/i.test(p) && !/Hồ Chí Minh|Hà Nội|Đà Nẵng|Hải Phòng/i.test(p));
          if (districtPart) {
             foundQuanHuyen = districtPart;
          } else if (parts.length >= 3) {
             foundQuanHuyen = parts[parts.length - 2]; // guess 2nd to last part
          }
        }

        // Auto form fill
        setFormData(prev => ({
          ...prev,
          ten: placeData.name || placeData.ten || suggestion.description || prev.ten,
          diachi: placeData.formatted_address || placeData.diachi || prev.diachi,
          quan_huyen: suggestion.district || foundQuanHuyen || prev.quan_huyen,
          lat: placeData.geometry?.location?.lat || placeData.lat || prev.lat,
          lng: placeData.geometry?.location?.lng || placeData.lng || prev.lng,
          google_place_id: placeData.place_id || suggestion.place_id,
          // Preserve existing details, just overwrite specific fields
          chitiet: {
            ...prev.chitiet,
            sodienthoai: placeData.formatted_phone_number || prev.chitiet?.sodienthoai || '',
            website: placeData.website || prev.chitiet?.website || '',
          }
        }));
        
        toast.success("Đã tự động điền dữ liệu từ Goong Maps!");
      }
    } catch (err) {
      toast.error("Không thể lấy chi tiết địa điểm");
      console.error(err);
    } finally {
      setIsFetchingGoong(false);
    }
  };

  useEffect(() => {
    if (isEditing && place) {
      setFormData({
        ten: place.ten || '',
        diachi: place.diachi || '',
        quan_huyen: place.quan_huyen || '',
        loai: place.loai || '',
        giatien: place.giatien || 0,
        lat: place.lat || undefined,
        lng: place.lng || undefined,
        tu_khoa: place.tu_khoa || '',
        chitiet: {
          mota_google: place.chitiet_diadiem?.[0]?.mota_google || '',
          mota_tonghop: place.chitiet_diadiem?.[0]?.mota_tonghop || '',
          sodienthoai: place.chitiet_diadiem?.[0]?.sodienthoai || '',
          website: place.chitiet_diadiem?.[0]?.website || '',
        },
        images: place.hinhanh_diadiem || [],
        hoatdong: place.hoatdong_diadiem || [],
      });
    }
  }, [isEditing, place]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      chitiet: { ...prev.chitiet, [name]: value }
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), { url: '' }]
    }));
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index].url = url;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      hoatdong: [...(prev.hoatdong || []), { ten_hoatdong: '', loai_hoatdong: '', gia_thamkhao: 0, thoidiem_lytuong: '', noidung_chitiet: '' }]
    }));
  };

  const updateActivity = (index: number, field: keyof PlaceActivity, value: any) => {
    const newActivities = [...(formData.hoatdong || [])];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setFormData(prev => ({ ...prev, hoatdong: newActivities }));
  };

  const removeActivity = (index: number) => {
    const newActivities = [...(formData.hoatdong || [])];
    newActivities.splice(index, 1);
    setFormData(prev => ({ ...prev, hoatdong: newActivities }));
  };

  const handleSubmit = async () => {
    if (!formData.ten || !formData.diachi) {
      toast.error('Vui lòng nhập Tên và Địa chỉ!');
      return;
    }

    if (formData.images && formData.images.length > 0) {
      if (formData.images.some(img => !img.url || img.url.trim() === '')) {
        toast.error('Vui lòng nhập đầy đủ URL cho các Hình ảnh đã thêm (hoặc xóa nếu không dùng)!');
        return;
      }
    }

    if (formData.hoatdong && formData.hoatdong.length > 0) {
      if (formData.hoatdong.some(hd => !hd.ten_hoatdong || hd.ten_hoatdong.trim() === '')) {
        toast.error('Vui lòng nhập ít nhất Tên hoạt động cho các Hoạt động đã thêm (hoặc xóa nếu không dùng)!');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Chuyển kiểu number cho giatien, lat, lng
      const submitData: CreatePlaceDto = {
        ten: formData.ten,
        diachi: formData.diachi,
        quan_huyen: formData.quan_huyen,
        loai: formData.loai,
        tu_khoa: formData.tu_khoa,
        google_place_id: formData.google_place_id,
        giatien: formData.giatien ? Number(formData.giatien) : undefined,
        lat: formData.lat ? Number(formData.lat) : undefined,
        lng: formData.lng ? Number(formData.lng) : undefined,
        chitiet: formData.chitiet,
        images: formData.images,
        hoatdong: formData.hoatdong?.map(hd => ({
          ...hd,
          gia_thamkhao: hd.gia_thamkhao ? Number(hd.gia_thamkhao) : undefined
        })),
      };

      if (isEditing && place) {
        await placesApi.updatePlaceFully(place.diadiem_id, submitData);
        toast.success('Cập nhật địa điểm thành công!');
      } else {
        await placesApi.createPlace(submitData);
        toast.success('Thêm địa điểm thành công!');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu địa điểm');
    } finally {
      setLoading(false);
    }
  };

  const tabClasses = (tab: string) => 
    `flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors duration-200 
    ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditing ? 'Chỉnh sửa Địa Điểm' : 'Thêm Địa Điểm Mới'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Cập nhật toàn diện thông tin địa điểm vào hệ thống (4 bảng)</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="stroke-2" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200">
          <button onClick={() => setActiveTab('general')} className={tabClasses('general')}>Thông tin chung</button>
          <button onClick={() => setActiveTab('detail')} className={tabClasses('detail')}>Chi tiết mở rộng</button>
          <button onClick={() => setActiveTab('images')} className={tabClasses('images')}>Hình ảnh</button>
          <button onClick={() => setActiveTab('activities')} className={tabClasses('activities')}>Hoạt động</button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2 relative bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <Search className="w-4 h-4" />
                  Tìm kiếm địa điểm (Auto-fill bằng Goong Maps)
                  {isFetchingGoong && <Loader className="w-4 h-4 text-indigo-500 animate-spin" />}
                </label>
                <div className="relative">
                  <input 
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                    className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-indigo-300"
                    placeholder="Gõ tên để tự động điền các thông tin bên dưới..."
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((s, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                          onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
                        >
                          <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 text-sm">{s.main_text}</span>
                            <span className="text-xs text-slate-500">{s.secondary_text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tên địa điểm <span className="text-red-500">*</span></label>
                <input 
                  type="text" name="ten" value={formData.ten} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="VD: Chợ Bến Thành"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Địa chỉ <span className="text-red-500">*</span></label>
                <input 
                  type="text" name="diachi" value={formData.diachi} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Đường, Kp, Phường..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Quận / Huyện</label>
                <input 
                  type="text" name="quan_huyen" value={formData.quan_huyen} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: Quận 1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Từ khóa (Keywords)</label>
                <input 
                  type="text" name="tu_khoa" value={formData.tu_khoa} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: Mua sắm, Du lịch, Lịch sử"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Vĩ độ (Latitude)</label>
                <input 
                  type="number" name="lat" value={formData.lat || ''} onChange={handleChange} step="any"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: 10.7725"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kinh độ (Longitude)</label>
                <input 
                  type="number" name="lng" value={formData.lng || ''} onChange={handleChange} step="any"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: 106.6980"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Giá tiền tham khảo</label>
                <input 
                  type="number" name="giatien" value={formData.giatien || ''} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VNĐ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Loại địa điểm</label>
                <select 
                  name="loai" value={formData.loai} onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- Chọn loại --</option>
                  <option value="tourist_attraction">Điểm du lịch</option>
                  <option value="restaurant">Nhà hàng/Ăn uống</option>
                  <option value="lodging">Chỗ ở/Khách sạn</option>
                  <option value="store">Mua sắm</option>
                  <option value="cafe">Quán cafe</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: DETAIL */}
          {activeTab === 'detail' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mô tả (Google)</label>
                <textarea 
                  name="mota_google" rows={3} value={formData.chitiet?.mota_google} onChange={handleDetailChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Đoạn mô tả tự động hoặc gốc..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mô tả tổng hợp (Custom)</label>
                <textarea 
                  name="mota_tonghop" rows={4} value={formData.chitiet?.mota_tonghop} onChange={handleDetailChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Mô tả do admin bổ sung chi tiết..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                  <input 
                    type="text" name="sodienthoai" value={formData.chitiet?.sodienthoai} onChange={handleDetailChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Website URL</label>
                  <input 
                    type="url" name="website" value={formData.chitiet?.website} onChange={handleDetailChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Danh sách hình ảnh ({formData.images?.length || 0})</h3>
                <button 
                  onClick={addImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100"
                >
                  <Plus size={16} /> Thêm ảnh
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.images?.map((img, index) => (
                  <div key={index} className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    {img.url && (
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-200">
                        <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">URL Hình ảnh</label>
                      <input 
                        type="text" value={img.url} onChange={(e) => updateImage(index, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}
                {(!formData.images || formData.images.length === 0) && (
                  <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                    Chưa có hình ảnh nào. Ấn "Thêm ảnh" để bổ sung.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Hoạt động tại địa điểm ({formData.hoatdong?.length || 0})</h3>
                <button 
                  onClick={addActivity}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100"
                >
                  <Plus size={16} /> Thêm HĐ
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.hoatdong?.map((hd, index) => (
                  <div key={index} className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative group">
                    <button 
                      onClick={() => removeActivity(index)}
                      className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-10">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Tên hoạt động <span className="text-red-500">*</span></label>
                        <input 
                          type="text" value={hd.ten_hoatdong} onChange={(e) => updateActivity(index, 'ten_hoatdong', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="VD: Chụp hình áo dài"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Loại HĐ</label>
                        <input 
                          type="text" value={hd.loai_hoatdong || ''} onChange={(e) => updateActivity(index, 'loai_hoatdong', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="VD: Check-in, Ẩm thực..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Đơn giá (VNĐ)</label>
                        <input 
                          type="number" value={hd.gia_thamkhao ?? ''} onChange={(e) => updateActivity(index, 'gia_thamkhao', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="VD: 50000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Thời điểm ý tưởng</label>
                        <input 
                          type="text" value={hd.thoidiem_lytuong || ''} onChange={(e) => updateActivity(index, 'thoidiem_lytuong', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="VD: Buổi chiều từ 4-6h"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Mô tả thêm</label>
                        <textarea 
                          rows={2} value={hd.noidung_chitiet || ''} onChange={(e) => updateActivity(index, 'noidung_chitiet', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Kinh nghiệm hoặc mô tả chi tiết HĐ này..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!formData.hoatdong || formData.hoatdong.length === 0) && (
                  <div className="py-8 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                    Chưa có hoạt động nào. Khuyến cáo thêm hoạt động để tour thêm phong phú.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-700 font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Lưu địa điểm
          </button>
        </div>

      </div>
    </div>
  );
}
