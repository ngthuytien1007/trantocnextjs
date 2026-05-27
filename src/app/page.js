"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet Map to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

import { fetchFamilyData, saveFamilyMember } from "@/lib/supabase";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    courtesyName: "",
    gender: "M",
    is_alive: "true",
    generation: "",
    status: "civilian",
    dob_solar: "",
    dob_lunar: "",
    dod_solar: "",
    dod_lunar: "",
    burialPlaceText: "",
    fatherName: "",
    fatherId: "",
    motherName: "",
    motherId: "",
    spouseName: "",
    spouseId: "",
    bio: "",
    burial_lat: "",
    burial_lng: "",
  });

  const [suggestions, setSuggestions] = useState({ type: null, list: [] });
  const [showModal, setShowModal] = useState(false);
  const [processedPayload, setProcessedPayload] = useState(null);
  const formRef = useRef(null);

  const [dbMembers, setDbMembers] = useState([]);

  // Tải danh sách thành viên từ Supabase hoặc fallback
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await fetchFamilyData();
        if (data && data.nodeDataArray) {
          const realPeople = data.nodeDataArray.filter(n => n.category !== "LinkLabel");
          setDbMembers(realPeople);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách thành viên gợi ý:", err);
      }
    };
    loadMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "generation") {
      const statusVal = formData.status;
      if ((statusVal === "king" || statusVal === "queen") && value !== "1") {
        alert("Thủy Tổ và Vợ Thủy Tổ bắt buộc phải thuộc Đời 1.");
        setFormData((prev) => ({ ...prev, generation: "1" }));
      } else {
        setFormData((prev) => ({
          ...prev,
          fatherName: "",
          fatherId: "",
          motherName: "",
          motherId: "",
        }));
      }
    }
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    if ((value === "king" || value === "queen") && formData.generation !== "1") {
      alert("Thủy Tổ và Vợ Thủy Tổ bắt buộc phải thuộc Đời 1.");
      setFormData((prev) => ({ ...prev, status: value, generation: "1" }));
    } else {
      setFormData((prev) => ({ ...prev, status: value }));
    }
  };

  const fetchLunarDate = async (solarDateString, targetField) => {
    if (!solarDateString) {
      setFormData((prev) => ({ ...prev, [targetField]: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [targetField]: "Đang tải dữ liệu âm lịch..." }));
    try {
      const [year, monthStr, dayStr] = solarDateString.split("-");
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      const apiUrl = `https://lich247.com/api/get-lunar-date?day=${day}&month=${month}&year=${year}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("API Network error");
      const data = await response.json();
      if (data && data.lunarDay && data.lunarMonth) {
        let displayStr = `${data.lunarDay.toString().padStart(2, "0")}/${data.lunarMonth
          .toString()
          .padStart(2, "0")}/${data.lunarYearName}`;
        if (data.isLeapMonth) {
          displayStr += " (Tháng Nhuận)";
        }
        setFormData((prev) => ({ ...prev, [targetField]: displayStr }));
      } else {
        setFormData((prev) => ({ ...prev, [targetField]: "Không có thông tin âm lịch" }));
      }
    } catch (error) {
      console.warn("Bỏ qua âm lịch do lỗi kết nối:", error);
      setFormData((prev) => ({
        ...prev,
        [targetField]: "Không tải được âm lịch, chỉ dùng dương lịch",
      }));
    }
  };

  useEffect(() => {
    if (formData.dob_solar) fetchLunarDate(formData.dob_solar, "dob_lunar");
  }, [formData.dob_solar]);

  useEffect(() => {
    if (formData.dod_solar) fetchLunarDate(formData.dod_solar, "dod_lunar");
  }, [formData.dod_solar]);

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({ ...prev, burial_lat: lat, burial_lng: lng }));
  };

  const handleFocusSuggest = (type) => {
    if (!formData.generation && (type === "father" || type === "mother")) {
      setSuggestions({
        type,
        list: [{ error: true, text: "Vui lòng chọn số Đời ở Phần A trước!" }],
      });
      return;
    }
    filterSuggestions(type, formData[`${type}Name`]);
  };

  const handleInputSuggest = (type, value) => {
    setFormData((prev) => ({ ...prev, [`${type}Name`]: value, [`${type}Id`]: "" }));
    filterSuggestions(type, value);
  };

  const filterSuggestions = (type, value) => {
    const currentGen = parseInt(formData.generation || "0", 10);
    const inputVal = (value || "").toLowerCase();
    let filtered = [];

    if (type === "father")
      filtered = dbMembers.filter((n) => n.gender === "M" && n.generation === currentGen - 1);
    if (type === "mother")
      filtered = dbMembers.filter(
        (n) => n.gender === "F" && (n.generation === currentGen - 1 || n.generation === currentGen)
      );
    if (type === "spouse") {
      const currentGender = formData.gender;
      filtered = dbMembers.filter((n) => n.gender !== currentGender && n.generation === currentGen);
    }

    if (inputVal) {
      filtered = filtered.filter((n) => n.name.toLowerCase().includes(inputVal));
    }

    if (filtered.length === 0) {
      setSuggestions({ type, list: [{ error: true, text: "Không tìm thấy thành viên khớp..." }] });
    } else {
      setSuggestions({ type, list: filtered });
    }
  };

  const selectSuggestion = (type, id, name) => {
    setFormData((prev) => ({ ...prev, [`${type}Name`]: name, [`${type}Id`]: id }));
    setSuggestions({ type: null, list: [] });
  };

  // Ẩn suggestions khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".autocomplete-suggestions") && !e.target.closest("input")) {
        setSuggestions({ type: null, list: [] });
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Vui lòng nhập: Họ và tên khai sinh.");
      return;
    }
    if (!formData.generation) {
      alert("Vui lòng chọn: Số Đời của thành viên.");
      return;
    }

    const generation = parseInt(formData.generation, 10);
    const { fatherName, fatherId, motherName, motherId, spouseName, spouseId } = formData;

    if (generation > 1 && !fatherName && !spouseName) {
      alert("Lỗi: Thành viên từ Đời 2 trở đi bắt buộc phải chọn thông tin của CHA từ danh sách gợi ý.");
      return;
    }
    if (fatherName && !fatherId) {
      alert(`Hệ thống không nhận diện được người cha tên "${fatherName}". Vui lòng gõ lại và lấy ngón tay chạm chọn tên cụ trong danh sách hiện ra bên dưới.`);
      return;
    }
    if (motherName && !motherId) {
      alert(`Hệ thống không nhận diện được người mẹ tên "${motherName}". Vui lòng chạm chọn tên cụ trong danh sách.`);
      return;
    }
    if (spouseName && !spouseId) {
      alert(`Hệ thống không nhận diện được Vợ/Chồng tên "${spouseName}". Vui lòng chạm chọn đúng tên trong danh sách gợi ý.`);
      return;
    }

    // Process Payload
    const rawName = formData.name.trim();
    const processedName = rawName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    let title = "";
    if (formData.status === "king") title = "Thủy Tổ - Đời 1";
    else if (formData.status === "queen") title = "Vợ Cả/Thứ - Đời 1";
    else if (formData.status === "prince" && generation === 2) title = "Trưởng Họ - Đời 2";
    else if (formData.status === "prince") title = "Trưởng Nhánh - Đời " + generation;
    else if (formData.status === "princess") title = "Vợ Trưởng Nhánh - Đời " + generation;
    else title = "Đời " + generation;

    const formatDateVN = (d) => (d ? d.split("-").reverse().join("/") : "");
    const dobSolar = formatDateVN(formData.dob_solar);
    const birthYear = formData.dob_solar ? formData.dob_solar.split("-")[0] : "????";

    let dobSummary = "";
    let dodSolar = "";
    let burialPlace = "";

    const isAlive = formData.is_alive === "true";

    if (isAlive) {
      dobSummary = `${birthYear} - nay`;
    } else {
      dodSolar = formatDateVN(formData.dod_solar);
      const deathYear = formData.dod_solar ? formData.dod_solar.split("-")[0] : "????";
      dobSummary = `${birthYear} - ${deathYear}`;

      const bPlaceText = formData.burialPlaceText.trim();
      const lat = formData.burial_lat;
      const lng = formData.burial_lng;
      burialPlace = bPlaceText ? bPlaceText : lat && lng ? `Tọa độ: ${lat}, ${lng}` : "";
    }

    const payload = {
      name: processedName,
      gender: formData.gender,
      status: formData.status,
      title: title,
      dob: dobSummary,
      isAlive: isAlive,
      photo: "File ảnh đính kèm", // Mock
      courtesyName: formData.courtesyName,
      dobSolar: dobSolar,
      dobLunar: formData.dob_lunar,
      dodSolar: dodSolar,
      dodLunar: formData.dod_lunar,
      burialPlace: burialPlace,
      bio: formData.bio,
      isExpanded: true,
      _fatherId: fatherId,
      _motherId: motherId,
      _spouseId: spouseId,
      fatherName,
      motherName,
      spouseName
    };

    setProcessedPayload(payload);
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    const savedName = processedPayload?.name || '';
    try {
      console.log("Dữ liệu Node chuẩn bị gửi API:", processedPayload);
      const res = await saveFamilyMember(processedPayload);

      if (res && res.fallback) {
        alert(`Đã lưu tạm thông tin thành viên "${savedName}" vào LocalStorage (Do Supabase chưa được cấu hình).`);
      } else {
        // ✅ Tự động fetch lại danh sách cha/mẹ ngay lập tức (không cần reload trang)
        try {
          const data = await fetchFamilyData();
          if (data && data.nodeDataArray) {
            const realPeople = data.nodeDataArray.filter(n => n.category !== "LinkLabel");
            setDbMembers(realPeople);
          }
        } catch (fetchErr) {
          console.warn("Không thể tải lại danh sách sau khi lưu:", fetchErr);
        }
      }
    } catch (err) {
      alert(`Đã xảy ra lỗi khi lưu thông tin: ${err.message || err}`);
    } finally {
      setShowModal(false);
      // Reset Form
      setFormData({
        name: "",
        courtesyName: "",
        gender: "M",
        is_alive: "true",
        generation: "",
        status: "civilian",
        dob_solar: "",
        dob_lunar: "",
        dod_solar: "",
        dod_lunar: "",
        burialPlaceText: "",
        fatherName: "",
        fatherId: "",
        motherName: "",
        motherId: "",
        spouseName: "",
        spouseId: "",
        bio: "",
        burial_lat: "",
        burial_lng: "",
      });
      if (formRef.current) formRef.current.reset();
    }
  };

  return (
    <div className="container">
      <div className="instruction-section">
        <h2>Bảng Hướng Dẫn Từng Bước Cho Các Cụ</h2>
        <p>Nhập sai không sao cả: Nếu lỡ bấm lưu mà thông tin bị sai, các bác cứ bỏ qua và tiến hành tạo lại một người mới chính xác hơn. Hệ thống chỉ cho nhập vào, việc sửa và xóa các Thông tin bị sai sẽ do quản trị viên xử lý sau, các bác không cần bận tâm.</p>
        <ol>
          <li>Điền Thông tin cá nhân: <span>Nhập tên, chọn Giới tính và số Đời của mình.</span></li>
          <li>Chọn Ngày sinh & Ngày mất: <span>Bấm vào ô lịch để chọn đúng ngày tháng năm dương lịch, hệ thống sẽ tự tìm ngày Âm lịch chuẩn xác.</span></li>
          <li>Chọn Tên Cha và Mẹ: <span>Bấm vào ô tìm kiếm, gõ vài chữ cái rồi lấy ngón tay chạm chọn đúng tên từ danh sách hiện ra bên dưới. Tìm đúng tên người thân trong danh sách đổ xuống (Lưu ý: Chỉ chọn người có thông tin đúng, tránh chọn nhầm người trùng tên bị sai trước đó).</span></li>
          <li>Định vị Mộ phần: <span>Nếu thành viên đã mất, các cụ chỉ cần dùng ngón tay <b>chạm trực tiếp vào bản đồ</b> bên dưới để đánh dấu vị trí an táng chính xác.</span></li>
          <li>Bấm Gửi thông tin để hoàn tất.</li>
        </ol>
      </div>

      <h1>Nhập Thông Tin Thành Viên Mới</h1>

      <form id="giaPhaForm" ref={formRef} onSubmit={handleSubmit}>
        <h3>Phần A: Thông tin cơ bản</h3>

        <div className="form-group">
          <label>1. Ảnh chân dung (Nếu có):</label>
          <input type="file" id="photo" accept="image/*" />
          <span style={{ fontSize: "14px", color: "#666" }}>Hỗ trợ số hóa ảnh chân dung hoặc văn bia. Mặc định: ảnh trắng đen.</span>
        </div>

        <div className="form-group">
          <label>2. Họ và tên khai sinh: <span className="required">*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: TRẦN VĂN AN" />
        </div>

        <div className="form-group">
          <label>3. Tên tự / Tên hiệu (Nếu có):</label>
          <input type="text" name="courtesyName" value={formData.courtesyName} onChange={handleChange} placeholder="Ví dụ: Thế Anh, Đức Hùng..." />
        </div>

        <div className="form-group">
          <label>4. Giới tính: <span className="required">*</span></label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="gender" value="M" checked={formData.gender === "M"} onChange={handleChange} /> Nam
            </label>
            <label className="radio-label">
              <input type="radio" name="gender" value="F" checked={formData.gender === "F"} onChange={handleChange} /> Nữ
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>5. Trạng thái hiện tại: <span className="required">*</span></label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="is_alive" value="true" checked={formData.is_alive === "true"} onChange={handleChange} /> Còn sống
            </label>
            <label className="radio-label">
              <input type="radio" name="is_alive" value="false" checked={formData.is_alive === "false"} onChange={handleChange} /> Đã mất
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>6. Thuộc Đời thứ mấy: <span className="required">*</span></label>
          <select name="generation" value={formData.generation} onChange={handleChange} required>
            <option value="">-- Chọn số Đời --</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((i) => (
              <option key={i} value={i}>Đời thứ {i}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>7. Vai vế / Danh hiệu đặc biệt: <span className="required">*</span></label>
          <select name="status" value={formData.status} onChange={handleStatusChange} required>
            <option value="civilian">Thành viên thường (Mặc định)</option>
            <option value="king">Thủy Tổ khai sáng dòng họ (Đời 1)</option>
            <option value="queen">Vợ của Thủy Tổ (Đời 1)</option>
            <option value="prince">Trưởng Tộc / Trưởng Nhánh</option>
            <option value="princess">Vợ của Trưởng Tộc / Con dâu trưởng</option>
          </select>
          <span style={{ fontSize: "14px", color: "#666" }}>Dùng để tô màu khung đồ thị.</span>
        </div>

        <div className="form-group">
          <label>8. Ngày tháng năm sinh (Dương lịch):</label>
          <input type="date" name="dob_solar" value={formData.dob_solar} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>9. Ngày tháng năm sinh (Âm lịch):</label>
          <input
            type="text"
            name="dob_lunar"
            value={formData.dob_lunar}
            readOnly
            placeholder="Hệ thống tự động tra cứu sau khi chọn dương lịch..."
            style={{ backgroundColor: "#f9f9f9", fontWeight: "bold", color: "#8b0000" }}
          />
        </div>

        {formData.is_alive === "false" && (
          <div id="death_fields" style={{ borderLeft: "4px solid #666", paddingLeft: "15px", marginBottom: "20px" }}>
            <div className="form-group">
              <label>10. Ngày mất (Dương lịch):</label>
              <input type="date" name="dod_solar" value={formData.dod_solar} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>11. Ngày giỗ (Âm lịch):</label>
              <input
                type="text"
                name="dod_lunar"
                value={formData.dod_lunar}
                readOnly
                placeholder="Hệ thống tự động tra cứu..."
                style={{ backgroundColor: "#f9f9f9", fontWeight: "bold", color: "#8b0000" }}
              />
            </div>

            <div className="form-group">
              <label>12. Địa chỉ Mộ phần (Bằng chữ):</label>
              <input type="text" name="burialPlaceText" value={formData.burialPlaceText} onChange={handleChange} placeholder="Ví dụ: Nghĩa trang Thượng Tổ, Đại Lộc..." />
            </div>

            <div className="form-group">
              <label>13. Định vị vị trí Mộ phần trên Bản đồ (Chạm để ghim):</label>
              <Map onLocationChange={handleLocationChange} />
              <div className="location-info">
                Vị trí hiện tại: {formData.burial_lat && formData.burial_lng ? `Vĩ độ (Lat): ${formData.burial_lat}, Kinh độ (Lng): ${formData.burial_lng}` : "Chưa chọn (Mặc định tâm dòng họ)"}
              </div>
            </div>
          </div>
        )}

        <h3>Phần B: Xác định mối quan hệ dòng họ</h3>

        {["father", "mother", "spouse"].map((type) => {
          const label = type === "father" ? "14. Họ và tên của CHA:" : type === "mother" ? "15. Họ và tên của MẸ:" : "16. Nếu là Con Dâu/Con Rể, chọn tên Vợ/Chồng thuộc Tộc Trần:";
          const placeholder = type === "father" ? "Gõ để tìm tên Cha..." : type === "mother" ? "Gõ để tìm tên Mẹ..." : "Gõ để tìm tên Vợ hoặc Chồng...";

          return (
            <div className="form-group" key={type}>
              <label>{label}</label>
              <input
                type="text"
                value={formData[`${type}Name`]}
                onChange={(e) => handleInputSuggest(type, e.target.value)}
                onFocus={() => handleFocusSuggest(type)}
                placeholder={placeholder}
                autoComplete="off"
              />
              {suggestions.type === type && (
                <div className="autocomplete-suggestions" style={{ display: "block" }}>
                  {suggestions.list.map((n, idx) => (
                    <div
                      key={idx}
                      className="suggestion-item"
                      onClick={() => !n.error && selectSuggestion(type, n.id, n.name)}
                      style={{ color: n.error ? "red" : "inherit" }}
                    >
                      {n.error ? n.text : (
                        <>
                          <span style={{ fontWeight: 600 }}>{n.name}</span>
                          <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>
                            {n.generation ? `Đời ${n.generation}` : ''}
                            {n.dobSolar ? ` · Sinh ${n.dobSolar.split('/').pop() || n.dobSolar}` : (n.dob ? ` · ${n.dob.split(' ')[0]}` : '')}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <h3>Phần C: Tiểu sử</h3>
        <div className="form-group">
          <label>17. Tiểu sử tóm tắt:</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Ghi nhận công trạng, sự nghiệp, đóng góp cho dòng họ..."></textarea>
        </div>

        <button type="submit" className="btn-submit">GỬI THÔNG TIN VÀO GIA PHẢ</button>
      </form>

      {showModal && processedPayload && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "var(--primary-color)", borderBottom: "2px solid var(--primary-color)", paddingBottom: "5px", marginTop: "0" }}>
              XÁC NHẬN DỮ LIỆU
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "-5px" }}>Hệ thống đã tự động tính toán Đời và chuỗi năm sinh. Vui lòng kiểm tra lại.</p>

            <div style={{ fontSize: "16px", lineHeight: "1.8", marginBottom: "20px", background: "#f9f9f9", padding: "10px", borderRadius: "6px", border: "1px solid #eee" }}>
              <div style={{ background: "#eef", padding: "10px", marginBottom: "10px", borderRadius: "4px" }}>
                <b style={{ color: "var(--primary-color)" }}>Đời (Tự tính):</b> {processedPayload.title} <br />
                <b style={{ color: "var(--primary-color)" }}>Tóm tắt Sinh-Tử:</b> {processedPayload.dob}
              </div>
              <b>Họ và tên:</b> <span style={{ color: "var(--primary-color)" }}>{processedPayload.name}</span> <br />
              <b>Tên tự/hiệu:</b> {processedPayload.courtesyName || "Không có"} <br />
              <b>Giới tính:</b> {processedPayload.gender === 'M' ? "Nam" : "Nữ"} <br />
              <b>Ảnh:</b> {processedPayload.photo} <br />
              <b>Ngày sinh (Dương):</b> {processedPayload.dobSolar || "Chưa nhập"} <br />
              <span style={{ color: "var(--primary-color)", fontSize: "14px" }}>Âm lịch: {processedPayload.dobLunar || "Chưa có"}</span> <br />

              {!processedPayload.isAlive && (
                <>
                  <hr style={{ border: "0", borderTop: "1px dashed #ccc", margin: "10px 0" }} />
                  <b>Ngày mất (Dương):</b> {processedPayload.dodSolar || "Chưa nhập"} <br />
                  <span style={{ color: "var(--primary-color)", fontSize: "14px" }}>Âm lịch giỗ: {processedPayload.dodLunar || "Chưa có"}</span> <br />
                  <b>Mộ phần:</b> {processedPayload.burialPlace || "Chưa ghi nhận"} <br />
                </>
              )}

              <hr style={{ border: "0", borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              <b>Cha:</b> {processedPayload.fatherName ? processedPayload.fatherName : <span style={{ color: "red" }}>Bỏ trống</span>} <br />
              {processedPayload.motherName && <><b>Mẹ:</b> {processedPayload.motherName} <br /></>}
              {processedPayload.spouseName && <><b>Phối ngẫu:</b> {processedPayload.spouseName} <br /></>}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>SỬA LẠI</button>
              <button type="button" className="btn-confirm" onClick={confirmSubmit}>LƯU GIA PHẢ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
