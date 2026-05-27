"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { familyData } from '../../components/FamilyTree';
import { calculateRelation } from '../../components/FamilyTree';
import { fetchFamilyData } from '@/lib/supabase';
import './style.css';

// Dynamically import FamilyTree with SSR disabled because GoJS needs window
const FamilyTree = dynamic(() => import('../../components/FamilyTree'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#800000' }}>Đang tải Gia Phả...</div>
});

export default function GiaPhaPage() {
  const [themeName, setThemeName] = useState('warm-sepia');
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [relationMode, setRelationMode] = useState(false);
  const [relationPersonA, setRelationPersonA] = useState(null);
  const familyTreeRef = useRef(null);
  const searchBarRef = useRef(null);

  const [dbTreeData, setDbTreeData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('giapha_desktop_theme');
    if (saved) setThemeName(saved);
  }, []);

  // Tải dữ liệu gia phả từ Supabase khi mở trang
  useEffect(() => {
    const loadTreeData = async () => {
      try {
        const data = await fetchFamilyData();
        setDbTreeData(data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu gia phả:", err);
      }
    };
    loadTreeData();
  }, []);

  const handleThemeChange = (newTheme) => {
    setThemeName(newTheme);
    localStorage.setItem('giapha_desktop_theme', newTheme);
  };

  const handleZoomIn = () => familyTreeRef.current?.zoomIn();
  const handleZoomOut = () => familyTreeRef.current?.zoomOut();
  const handleZoomFit = () => familyTreeRef.current?.zoomFit();
  const handleCenterRoot = () => familyTreeRef.current?.centerRoot();

  const handleExpandAll = () => {
    const confirmExpand = window.confirm("Mở rộng toàn bộ gia phả có thể ảnh hưởng đến hiệu năng trên thiết bị yếu. Bạn có muốn tiếp tục?");
    if (!confirmExpand) return;
    familyTreeRef.current?.expandAll();
  };

  const handleNodeClick = (data) => {
    setSelectedNode(data);
  };

  const closePopup = () => {
    setSelectedNode(null);
  };

  // ===== SEARCH =====
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length < 1) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }
    const activeNodes = (dbTreeData || familyData).nodeDataArray;
    const matches = activeNodes.filter(d =>
      d.name && d.name.toLowerCase().includes(query.trim().toLowerCase()) && d.category !== "LinkLabel"
    );
    setSearchResults(matches);
    setShowSearchResults(true);
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    const activeNodes = (dbTreeData || familyData).nodeDataArray;
    const match = activeNodes.find(d =>
      d.name && d.name.toLowerCase().includes(query) && d.category !== "LinkLabel"
    );
    if (match) handleGoToNode(match.id);
  };

  const handleGoToNode = (id) => {
    setShowSearchResults(false);
    setIsMobileSearchOpen(false);
    familyTreeRef.current?.goToNode(id);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  // ===== RELATION RECOGNITION =====
  const handleStartRelationCheck = () => {
    setRelationMode(true);
    setRelationPersonA(null);
    familyTreeRef.current?.clearSelection();
    alert("Chế độ xác định quan hệ đã bật: Vui lòng chạm chọn Người thứ nhất trên sơ đồ.");
  };

  const handleRelationClick = useCallback((node) => {
    if (!relationPersonA) {
      setRelationPersonA(node);
      alert(`Đã chọn Người thứ nhất: ${node.data.name}.\nVui lòng chạm chọn Người thứ hai.`);
    } else {
      const relationText = calculateRelation(relationPersonA, node);
      alert(`KẾT QUẢ XƯNG HÔ:\n\n${relationText}`);
      // Reset
      setRelationMode(false);
      setRelationPersonA(null);
    }
  }, [relationPersonA]);

  // ===== MOBILE CONTROLS =====
  const handleToggleMobileMenu = () => {
    setIsMobileMenuExpanded(!isMobileMenuExpanded);
  };

  const handleToggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      setTimeout(() => {
        const input = document.getElementById('gp-search-input');
        if (input) input.focus();
      }, 300);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      // Mobile: close search if clicking outside
      if (window.innerWidth <= 768) {
        if (!e.target.closest('.gp-search-bar') && !e.target.closest('.gp-search-toggle-btn')) {
          setIsMobileSearchOpen(false);
        }
        if (!e.target.closest('#gp-floating-controls')) {
          setIsMobileMenuExpanded(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Bootstrap icons
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Google Fonts (match legacy)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      
      <Link href="/" className="gp-home-btn">
        <i className="bi bi-house-fill"></i> Trang chủ
      </Link>

      {/* Search Bar */}
      <div className={`gp-search-bar ${isMobileSearchOpen ? 'show' : ''}`} id="gp-search-bar" ref={searchBarRef}>
        <input 
          type="text"
          id="gp-search-input"
          placeholder="Tìm kiếm theo tên..." 
          autoComplete="off"
          value={searchQuery}
          onChange={handleSearchInput}
          onKeyDown={handleSearchKeyPress}
        />
        <button onClick={handleSearchSubmit}><i className="bi bi-search"></i> Tìm</button>
        {/* Search Results Dropdown */}
        <div className={`gp-search-results ${showSearchResults ? 'show' : ''}`} id="gp-search-results">
          {searchResults.length === 0 ? (
            <div className="result-item" style={{ color: '#999', cursor: 'default' }}>Không tìm thấy</div>
          ) : (
            searchResults.map(d => (
              <div key={d.id} className="result-item" onClick={() => handleGoToNode(d.id)}>
                <i className="bi bi-person-fill"></i> {d.name}
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#aaa' }}>{d.dob || ''}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tree Title (match legacy) */}
      <div className="gp-tree-title">
        <h2>TRẦN TỘC GIA PHẢ</h2>
        <p>Sơ Đồ Cây Phả Hệ Dòng Họ</p>
      </div>

      <FamilyTree
        ref={familyTreeRef}
        themeName={themeName}
        onNodeClick={handleNodeClick}
        relationSelectionMode={relationMode}
        onRelationClick={handleRelationClick}
        data={dbTreeData}
      />

      {/* Theme Drawer */}
      <div className={`gp-theme-drawer ${isDrawerOpen ? 'open' : ''}`} id="gp-theme-drawer">
        <div className={`gp-theme-opt opt-sepia ${themeName === 'warm-sepia' ? 'active' : ''}`} onClick={() => handleThemeChange('warm-sepia')} title="Hoài Cổ"></div>
        <div className={`gp-theme-opt opt-red ${themeName === 'royal-red' ? 'active' : ''}`} onClick={() => handleThemeChange('royal-red')} title="Đỏ Hoàng Gia"></div>
        <div className={`gp-theme-opt opt-dark ${themeName === 'dark-luxury' ? 'active' : ''}`} onClick={() => handleThemeChange('dark-luxury')} title="Tối Cao Cấp"></div>
      </div>

      {/* Floating Controls (match legacy structure) */}
      <div className={`gp-floating-controls ${isMobileMenuExpanded ? 'expanded' : ''}`} id="gp-floating-controls">
        {/* Master Menu Toggle (Mobile Only) */}
        <button className="gp-float-btn gp-master-btn" onClick={handleToggleMobileMenu} id="gp-master-btn" title="Điều khiển">
          <i className={`bi ${isMobileMenuExpanded ? 'bi-x-lg' : 'bi-sliders'}`}></i>
        </button>
        {/* Group of Control Buttons */}
        <div className="gp-controls-group">
          <button className="gp-float-btn gp-search-toggle-btn" onClick={handleToggleMobileSearch} title="Tìm kiếm">
            <i className="bi bi-search"></i>
          </button>
          <button className="gp-float-btn" onClick={handleZoomIn} title="Phóng to">
            <i className="bi bi-plus-lg"></i>
          </button>
          <button className="gp-float-btn" onClick={handleZoomOut} title="Thu nhỏ">
            <i className="bi bi-dash-lg"></i>
          </button>
          <button className="gp-float-btn" onClick={handleZoomFit} title="Vừa khung hình">
            <i className="bi bi-arrows-fullscreen"></i>
          </button>
          <button className="gp-float-btn" onClick={handleCenterRoot} title="Về gốc">
            <i className="bi bi-house-fill"></i>
          </button>
          <button className="gp-float-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)} title="Đổi hình nền">
            <i className="bi bi-palette-fill"></i>
          </button>
          <button className="gp-float-btn" onClick={handleExpandAll} title="Mở rộng toàn bộ">
            <i className="bi bi-diagram-3-fill"></i>
          </button>
          <button className={`gp-float-btn ${relationMode ? 'active' : ''}`} onClick={handleStartRelationCheck} id="relation-btn" title="Xác định xưng hô">
            <i className="bi bi-people-fill"></i>
          </button>
        </div>
      </div>

      {/* Node Detail Popup (match legacy layout) */}
      <div className={`gp-popup-overlay ${selectedNode ? 'show' : ''}`} id="gp-popup-overlay" onClick={closePopup}>
        {selectedNode && (
          <div className="gp-popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}><i className="bi bi-x-lg"></i></button>

            {/* Header Info */}
            <div style={{ textAlign: 'center', paddingBottom: 15, borderBottom: '1px solid #f0ece4' }}>
              <img src={selectedNode.photo || "/assets/img/avata.jpg"} alt="Avatar" className="popup-avatar" />
              <div className="popup-name">{selectedNode.name}</div>
              <div className="popup-sub-info" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span className={`popup-badge ${selectedNode.gender === 'F' ? 'female' : 'male'}`}>
                  {selectedNode.gender === 'F' ? 'Nữ' : 'Nam'}
                </span>
                <span className="popup-title-badge" style={{ background: '#f0ece4', color: '#5c0606', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedNode.title || 'Thành viên'}
                </span>
              </div>
            </div>

            {/* Body Info */}
            <div className="popup-info" style={{ marginTop: 15 }}>
              {/* Tên tự */}
              {selectedNode.courtesyName && (
                <div className="popup-info-row">
                  <i className="bi bi-bookmark-star-fill"></i>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: '#888', textTransform: 'uppercase' }}>Tên tự</strong>
                    <span>{selectedNode.courtesyName}</span>
                  </div>
                </div>
              )}
              {/* Ngày sinh */}
              <div className="popup-info-row">
                <i className="bi bi-calendar-check"></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.78rem', color: '#888', textTransform: 'uppercase' }}>Ngày sinh</strong>
                  <span style={{ display: 'block' }}>Dương lịch: {selectedNode.dobSolar || '—'}</span>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Âm lịch: {selectedNode.dobLunar || '—'}</span>
                </div>
              </div>
              {/* Ngày mất (chỉ hiện nếu đã mất) */}
              {selectedNode.isAlive === false && (
                <>
                  <div className="popup-info-row">
                    <i className="bi bi-calendar-x-fill" style={{ color: '#94a3b8' }}></i>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.78rem', color: '#888', textTransform: 'uppercase' }}>Ngày mất</strong>
                      <span style={{ display: 'block' }}>Dương lịch: {selectedNode.dodSolar || '—'}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Âm lịch: {selectedNode.dodLunar || '—'}</span>
                    </div>
                  </div>
                  <div className="popup-info-row">
                    <i className="bi bi-geo-alt-fill"></i>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.78rem', color: '#888', textTransform: 'uppercase' }}>Nơi an táng (Mộ phần)</strong>
                      <span>{selectedNode.burialPlace || '—'}</span>
                    </div>
                  </div>
                </>
              )}
              {/* Tiểu sử */}
              {selectedNode.bio && (
                <div className="popup-info-row" style={{ alignItems: 'flex-start', marginTop: 4 }}>
                  <i className="bi bi-file-text-fill" style={{ marginTop: 3 }}></i>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: '#888', textTransform: 'uppercase' }}>Tiểu sử tóm tắt</strong>
                    <span style={{ display: 'block', fontSize: '0.88rem', lineHeight: 1.4, color: '#444', textAlign: 'justify' }}>{selectedNode.bio}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
