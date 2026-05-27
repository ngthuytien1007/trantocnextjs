"use client";
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import * as go from "gojs";

// ============================================
// DATA & LAYOUT
// ============================================
const familyData = {
  nodeDataArray: [
    // --- ĐỜI 1 ---
    { id: 1, name: "Trần Thế Anh", gender: "M", status: "king", title: "Thủy Tổ - Đời 1", dob: "1630 - 1702", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Thế Anh", dobSolar: "15/05/1630", dobLunar: "18/04/Canh Ngọ", dodSolar: "12/10/1702", dodLunar: "27/08/Nhâm Thìn", burialPlace: "Nghĩa trang Thượng Tổ, Đại Lộc, Quảng Nam", bio: "Thủy tổ khai sáng dòng họ Trần, đặt nền móng xây dựng tộc ước.", isExpanded: true },
    { id: 2, name: "Lê Thị Sâm", gender: "F", status: "queen", title: "Vợ Cả - Đời 1", dob: "1635 - 1705", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "20/10/1635", dobLunar: "21/09/Ất Hợi", dodSolar: "05/06/1705", dodLunar: "19/04/Ất Mùi", burialPlace: "Nghĩa trang Thượng Tổ, Đại Lộc, Quảng Nam", bio: "Hiền thê cả, đức độ bao dung, quán xuyến việc tộc." },
    { id: 3, name: "Nguyễn Thị Mai", gender: "F", status: "queen", title: "Vợ Thứ - Đời 1", dob: "1640 - 1710", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "08/03/1640", dobLunar: "15/02/Canh Thìn", dodSolar: "22/11/1710", dodLunar: "16/10/Canh Dần", burialPlace: "Nghĩa trang Thượng Tổ, Đại Lộc, Quảng Nam", bio: "Vợ thứ hai của cụ Tổ, mẫu mực hiền hậu." },
    { id: 4, name: "Phạm Thị Lan", gender: "F", status: "queen", title: "Vợ Út - Đời 1", dob: "1642 - 1715", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "12/12/1642", dobLunar: "14/11/Nhâm Ngọ", dodSolar: "18/07/1715", dodLunar: "22/06/Ất Mùi", burialPlace: "Nghĩa trang Thượng Tổ, Đại Lộc, Quảng Nam", bio: "Vợ thứ ba của cụ Tổ, đồng cam cộng khổ thời kỳ khai hoang." },

    // --- ĐỜI 2 ---
    { id: 5, name: "Trần Hữu Đức", gender: "M", status: "prince", title: "Trưởng Họ - Đời 2", dob: "1660 - 1732", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Đức Hùng", dobSolar: "10/04/1660", dobLunar: "18/03/Canh Tý", dodSolar: "15/05/1732", dodLunar: "20/04/Nhâm Tý", burialPlace: "Từ đường dòng họ Trần", bio: "Trưởng nam đời 2, gánh vác việc thờ tự và xây dựng nhà thờ tộc.", isExpanded: true },
    { id: 6, name: "Nguyễn Thu Hà", gender: "F", status: "princess", title: "Con Dâu Cả - Đời 2", dob: "1665 - 1740", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "22/11/1665", dobLunar: "12/10/Ất Tỵ", dodSolar: "", dodLunar: "", burialPlace: "Nghĩa trang Tộc Trần", bio: "Hiền thê cụ Hữu Đức." },
    { id: 7, name: "Trần Hữu Minh", gender: "M", status: "civilian", title: "Đời 2 (Nhánh 2)", dob: "1663 - 1735", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Minh Trí", dobSolar: "05/06/1663", dobLunar: "29/04/Quý Mão", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Con trai thứ hai của cụ cả Lê Thị Sâm.", isExpanded: true },
    { id: 8, name: "Lê Thị Hoa", gender: "F", status: "civilian", title: "Con Dâu - Đời 2", dob: "1668 - 1742", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "12/01/1668", dobLunar: "28/11/Đinh Mùi", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Vợ cụ Hữu Minh." },
    { id: 9, name: "Trần Thị Thảo", gender: "F", status: "civilian", title: "Đời 2", dob: "1666 - 1730", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "15/08/1666", dobLunar: "16/07/Bính Ngọ", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Con gái cụ cả Lê Thị Sâm." },
    { id: 10, name: "Trần Hữu Phước", gender: "M", status: "prince", title: "Đời 2 (Nhánh 3)", dob: "1670 - 1745", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Hữu Phước", dobSolar: "15/09/1670", dobLunar: "17/08/Canh Tuất", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Con cụ hai Nguyễn Thị Mai. Người mở mang bờ cõi đất canh tác.", isExpanded: true },
    { id: 11, name: "Vũ Thị Tuyết", gender: "F", status: "princess", title: "Con Dâu - Đời 2", dob: "1675 - 1750", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "01/01/1675", dobLunar: "29/11/Giáp Dần", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Hiền thê cụ Hữu Phước." },
    { id: 12, name: "Trần Hữu Nghĩa", gender: "M", status: "civilian", title: "Đời 2 (Nhánh 4)", dob: "1675 - 1748", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Nghĩa Nhân", dobSolar: "18/08/1675", dobLunar: "17/07/Ất Mão", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Con cụ ba Phạm Thị Lan. Thầy đồ dạy chữ Nho đầu tiên của làng.", isExpanded: true },
    { id: 13, name: "Hoàng Thị Dung", gender: "F", status: "civilian", title: "Con Dâu - Đời 2", dob: "1680 - 1755", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "19/03/1680", dobLunar: "19/02/Canh Thân", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Hiền thê cụ Hữu Nghĩa." },
    // --- ĐỜI 3 ---
    { id: 14, name: "Trần Bảo Nam", gender: "M", status: "civilian", title: "Đời 3 (Trưởng Nhánh)", dob: "1690 - 1765", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Bảo Nam", dobSolar: "20/02/1690", dobLunar: "01/01/Canh Ngọ", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc, Quảng Nam", bio: "Cháu đích tôn Thủy Tổ, tiếp tục phát triển kinh tế gia tộc.", isExpanded: true },
    { id: 15, name: "Phan Thị Diệu", gender: "F", status: "civilian", title: "Con Dâu - Đời 3", dob: "1695 - 1770", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "05/02/1695", dobLunar: "01/01/Ất Hợi", dodSolar: "", dodLunar: "", burialPlace: "Đại Lộc", bio: "Chính thất cụ Bảo Nam." },
    { id: 16, name: "Trần Bảo Quốc", gender: "M", status: "civilian", title: "Đời 3", dob: "1692 - 1760", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "12/05/1692", dobLunar: "27/03/Nhâm Thân", bio: "Lập nghiệp phương xa, giữ mối liên hệ dòng tộc." },
    { id: 17, name: "Trần Khánh Vy", gender: "F", status: "civilian", title: "Đời 3", dob: "1695 - 1750", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "15/07/1695", dobLunar: "02/06/Ất Hợi", bio: "Con gái cụ Hữu Đức." },
    { id: 18, name: "Trần Minh Triết", gender: "M", status: "civilian", title: "Đời 3", dob: "1695 - 1772", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "05/12/1695", dobLunar: "12/11/Ất Hợi", bio: "Đội trưởng nghĩa binh bảo vệ xóm làng." },
    { id: 19, name: "Trần Minh Tâm", gender: "M", status: "civilian", title: "Đời 3", dob: "1698 - 1766", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "19/04/1698", dobLunar: "09/03/Mậu Dần", bio: "Chuyên tâm nông nghiệp, tích trữ lương thực cho tộc." },
    { id: 20, name: "Trần Thu Thủy", gender: "F", status: "civilian", title: "Đời 3", dob: "1700 - 1760", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "22/10/1700", dobLunar: "11/09/Canh Thin", bio: "Con gái cụ Hữu Minh." },
    { id: 21, name: "Trần Quang Hải", gender: "M", status: "civilian", title: "Đời 3", dob: "1702 - 1775", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "14/03/1702", dobLunar: "16/02/Nhâm Ngọ", bio: "Phụ trách ban khánh tiết và lễ nghi dòng họ." },
    { id: 22, name: "Trần Ngọc Anh", gender: "F", status: "civilian", title: "Đời 3", dob: "1705 - 1765", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "20/07/1705", dobLunar: "29/05/Ất Dậu", bio: "Con gái cụ Hữu Phước." },
    { id: 23, name: "Trần Tiến Đạt", gender: "M", status: "civilian", title: "Đời 3", dob: "1708 - 1780", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "01/09/1708", dobLunar: "16/07/Mậu Tý", bio: "Đỗ tú tài, tiếp nối sự nghiệp dạy học của cha." },
    { id: 24, name: "Trần Thục Quyên", gender: "F", status: "civilian", title: "Đời 3", dob: "1710 - 1772", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "11/11/1710", dobLunar: "20/09/Canh Dần", bio: "Con gái cụ Hữu Nghĩa." },
    // --- ĐỜI 4 ---
    { id: 25, name: "Trần Hữu Khang", gender: "M", status: "civilian", title: "Đời 4", dob: "1720 - 1795", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "12/03/1720", dobLunar: "04/02/Canh Tý", burialPlace: "Đại Lộc, Quảng Nam", bio: "Xây dựng hệ thống thủy lợi ruộng tộc.", isExpanded: true },
    { id: 26, name: "Võ Thị Hoàng", gender: "F", status: "civilian", title: "Con Dâu - Đời 4", dob: "1725 - 1800", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "19/08/1725", dobLunar: "11/07/Ất Tỵ", burialPlace: "Đại Lộc, Quảng Nam" },
    // --- ĐỜI 5 ---
    { id: 27, name: "Trần Hữu Trí", gender: "M", status: "civilian", title: "Đời 5", dob: "1750 - 1825", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Trí Tuệ", dobSolar: "01/01/1750", dobLunar: "24/11/Kỷ Tỵ", burialPlace: "Đại Lộc, Quảng Nam", bio: "Thầy thuốc nho y nổi tiếng, cứu giúp nhiều người nghèo.", isExpanded: true },
    { id: 28, name: "Đặng Thị Quy", gender: "F", status: "civilian", title: "Vợ Cả - Đời 5", dob: "1753 - 1810", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "14/05/1753", dobLunar: "12/04/Quý Dậu", burialPlace: "Nghĩa trang Tộc Trần" },
    { id: 29, name: "Bùi Thị Nguyệt", gender: "F", status: "civilian", title: "Vợ Thứ - Đời 5", dob: "1758 - 1830", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "23/09/1758", dobLunar: "22/08/Mậu Dần", burialPlace: "Nghĩa trang Tộc Trần" },
    // --- ĐỜI 6 ---
    { id: 30, name: "Trần Hữu Tâm", gender: "M", status: "civilian", title: "Đời 6", dob: "1780 - 1855", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "15/07/1780", dobLunar: "14/06/Canh Tý", burialPlace: "Đại Lộc, Quảng Nam", bio: "Kế thừa tiệm thuốc, lập quỹ cứu tế dòng họ.", isExpanded: true },
    { id: 31, name: "Hồ Thị Xuân", gender: "F", status: "civilian", title: "Con Dâu - Đời 6", dob: "1785 - 1860", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "09/02/1785", dobLunar: "01/01/Ất Tỵ", burialPlace: "Đại Lộc, Quảng Nam" },
    // --- ĐỜI 7 ---
    { id: 32, name: "Trần Hữu Long", gender: "M", status: "civilian", title: "Đời 7", dob: "1810 - 1885", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "11/11/1810", dobLunar: "15/10/Canh Ngọ", burialPlace: "Đại Lộc, Quảng Nam", bio: "Hương sư đức độ, trùng tu văn bia từ đường.", isExpanded: true },
    { id: 33, name: "Trịnh Thị Thu", gender: "F", status: "civilian", title: "Con Dâu - Đời 7", dob: "1815 - 1890", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "05/04/1815", dobLunar: "26/02/Ất Hợi", burialPlace: "Đại Lộc, Quảng Nam" },
    // --- ĐỜI 8 ---
    { id: 34, name: "Trần Hữu Đạt", gender: "M", status: "civilian", title: "Đời 8", dob: "1840 - 1915", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Đạt Tiến", dobSolar: "20/08/1840", dobLunar: "23/07/Canh Tý", burialPlace: "Huyện Đại Lộc, Quảng Nam", bio: "Đạt học vị Tú tài, có công mở lớp dạy chữ cho con em trong tộc.", isExpanded: true },
    { id: 35, name: "Mai Thị Liên", gender: "F", status: "civilian", title: "Con Dâu - Đời 8", dob: "1845 - 1920", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "12/01/1845", dobLunar: "05/12/Giáp Thìn", burialPlace: "Huyện Đại Lộc, Quảng Nam" },
    // --- ĐỜI 9 ---
    { id: 36, name: "Trần Hữu Vĩnh", gender: "M", status: "civilian", title: "Đời 9", dob: "1870 - 1945", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Vĩnh An", dobSolar: "03/06/1870", dobLunar: "05/05/Canh Ngọ", burialPlace: "Đại Lộc, Quảng Nam", bio: "Vận động phong trào duy tân, hiến đất xây nghĩa trang tộc.", isExpanded: true },
    { id: 37, name: "Đỗ Thị Phúc", gender: "F", status: "civilian", title: "Con Dâu - Đời 9", dob: "1875 - 1950", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "27/12/1875", dobLunar: "30/11/Ất Hợi", burialPlace: "Đại Lộc, Quảng Nam" },
    // --- ĐỜI 10 ---
    { id: 38, name: "Trần Hữu Tiến", gender: "M", status: "civilian", title: "Đời 10", dob: "1900 - 1975", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Tiến Bộ", dobSolar: "14/02/1900", dobLunar: "15/01/Canh Tý", burialPlace: "Huyện Đại Lộc, Quảng Nam", bio: "Chiến sĩ cách mạng trung kiên, giữ vững liên lạc thời kỳ khó khăn.", isExpanded: true },
    { id: 39, name: "Lý Thị Lành", gender: "F", status: "civilian", title: "Vợ Cả - Đời 10", dob: "1903 - 1960", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "09/08/1903", dobLunar: "17/06/Quý Mão", burialPlace: "Đại Lộc, Quảng Nam" },
    { id: 40, name: "Phan Thị Ngọt", gender: "F", status: "civilian", title: "Vợ Thứ - Đời 10", dob: "1908 - 1985", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "11/04/1908", dobLunar: "11/03/Mậu Thân", burialPlace: "Đại Lộc, Quảng Nam" },
    // --- ĐỜI 11 ---
    { id: 41, name: "Trần Hữu Hải", gender: "M", status: "civilian", title: "Đời 11", dob: "1930 - 2005", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "Hải Đường", dobSolar: "05/05/1930", dobLunar: "08/04/Canh Ngọ", burialPlace: "Nghĩa trang Hòa Khương, Đà Nẵng", bio: "Kỹ sư cơ khí, đóng góp khôi phục sản xuất sau chiến tranh.", isExpanded: true },
    { id: 42, name: "Ngô Thị Thanh", gender: "F", status: "civilian", title: "Con Dâu - Đời 11", dob: "1935 - 2018", isAlive: false, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "12/09/1935", dobLunar: "15/08/Ất Hợi", burialPlace: "Nghĩa trang Hòa Khương, Đà Nẵng" },
    // --- ĐỜI 12 ---
    { id: 43, name: "Trần Hữu Sơn", gender: "M", status: "civilian", title: "Đời 12", dob: "1960 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "Sơn Hà", dobSolar: "21/03/1960", dobLunar: "24/02/Canh Tý", burialPlace: "", bio: "Cán bộ hưu trí ngành giáo dục, tích cực hoạt động khuyến học tại Liên Chiểu, Đà Nẵng.", isExpanded: true },
    { id: 44, name: "Trần Thị Minh", gender: "F", status: "civilian", title: "Con Dâu - Đời 12", dob: "1965 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "18/07/1965", dobLunar: "20/06/Ất Tỵ", burialPlace: "" },
    // --- ĐỜI 13 ---
    { id: 45, name: "Trần Hữu Huy", gender: "M", status: "civilian", title: "Đời 13", dob: "1988 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "Quang Huy", dobSolar: "14/07/1988", dobLunar: "01/06/Mậu Thìn", burialPlace: "", bio: "Kỹ sư kiến trúc hệ thống cao cấp tại Đà Nẵng.", isExpanded: true },
    { id: 46, name: "Phạm Ngọc Huyền", gender: "F", status: "civilian", title: "Con Dâu - Đời 13", dob: "1992 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "05/12/1992", dobLunar: "12/11/Nhâm Thân", burialPlace: "" },
    // --- ĐỜI 14 ---
    { id: 47, name: "Trần Bảo Lâm", gender: "M", status: "civilian", title: "Đời 14", dob: "2012 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "Bảo Lâm", dobSolar: "10/10/2012", dobLunar: "25/08/Nhâm Thìn", burialPlace: "", bio: "Học sinh xuất sắc, đạt nhiều giải thưởng học thuật tại Đà Nẵng.", isExpanded: true },
    { id: 48, name: "Lê Thu Thảo", gender: "F", status: "civilian", title: "Con Dâu Tương Lai - Đời 14", dob: "2014 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "", dobSolar: "01/01/2014", dobLunar: "01/12/Quý Tỵ", burialPlace: "" },
    // --- ĐỜI 15 ---
    { id: 49, name: "Trần Minh Khôi", gender: "M", status: "civilian", title: "Hậu Duệ - Đời 15", dob: "2034 - nay", isAlive: true, photo: "/assets/img/avata.jpg", courtesyName: "Minh Khôi", dobSolar: "01/06/2034", dobLunar: "15/04/Giáp Dần", burialPlace: "", bio: "Thành viên hậu duệ đời thứ 15 trực hệ dòng họ Trần tại Liên Chiểu." },

    // MARRIAGE LABEL NODES
    { id: "M1_2", category: "LinkLabel" }, { id: "M1_3", category: "LinkLabel" }, { id: "M1_4", category: "LinkLabel" },
    { id: "M5_6", category: "LinkLabel" }, { id: "M7_8", category: "LinkLabel" }, { id: "M10_11", category: "LinkLabel" },
    { id: "M12_13", category: "LinkLabel" }, { id: "M14_15", category: "LinkLabel" }, { id: "M25_26", category: "LinkLabel" },
    { id: "M27_28", category: "LinkLabel" }, { id: "M27_29", category: "LinkLabel" }, { id: "M30_31", category: "LinkLabel" },
    { id: "M32_33", category: "LinkLabel" }, { id: "M34_35", category: "LinkLabel" }, { id: "M36_37", category: "LinkLabel" },
    { id: "M38_39", category: "LinkLabel" }, { id: "M38_40", category: "LinkLabel" }, { id: "M41_42", category: "LinkLabel" },
    { id: "M43_44", category: "LinkLabel" }, { id: "M45_46", category: "LinkLabel" }, { id: "M47_48", category: "LinkLabel" }
  ],
  linkDataArray: [
    { from: 1, to: 2, labelKeys: ["M1_2"], category: "Marriage" },
    { from: 1, to: 3, labelKeys: ["M1_3"], category: "Marriage" },
    { from: 1, to: 4, labelKeys: ["M1_4"], category: "Marriage" },
    { from: 5, to: 6, labelKeys: ["M5_6"], category: "Marriage" },
    { from: 7, to: 8, labelKeys: ["M7_8"], category: "Marriage" },
    { from: 10, to: 11, labelKeys: ["M10_11"], category: "Marriage" },
    { from: 12, to: 13, labelKeys: ["M12_13"], category: "Marriage" },
    { from: 14, to: 15, labelKeys: ["M14_15"], category: "Marriage" },
    { from: 25, to: 26, labelKeys: ["M25_26"], category: "Marriage" },
    { from: 27, to: 28, labelKeys: ["M27_28"], category: "Marriage" },
    { from: 27, to: 29, labelKeys: ["M27_29"], category: "Marriage" },
    { from: 30, to: 31, labelKeys: ["M30_31"], category: "Marriage" },
    { from: 32, to: 33, labelKeys: ["M32_33"], category: "Marriage" },
    { from: 34, to: 35, labelKeys: ["M34_35"], category: "Marriage" },
    { from: 36, to: 37, labelKeys: ["M36_37"], category: "Marriage" },
    { from: 38, to: 39, labelKeys: ["M38_39"], category: "Marriage" },
    { from: 38, to: 40, labelKeys: ["M38_40"], category: "Marriage" },
    { from: 41, to: 42, labelKeys: ["M41_42"], category: "Marriage" },
    { from: 43, to: 44, labelKeys: ["M43_44"], category: "Marriage" },
    { from: 45, to: 46, labelKeys: ["M45_46"], category: "Marriage" },
    { from: 47, to: 48, labelKeys: ["M47_48"], category: "Marriage" },

    { from: "M1_2", to: 5, category: "Descent" },
    { from: "M1_2", to: 7, category: "Descent" },
    { from: "M1_2", to: 9, category: "Descent" },
    { from: "M1_3", to: 10, category: "Descent" },
    { from: "M1_4", to: 12, category: "Descent" },
    { from: "M5_6", to: 14, category: "Descent" },
    { from: "M5_6", to: 16, category: "Descent" },
    { from: "M5_6", to: 17, category: "Descent" },
    { from: "M7_8", to: 18, category: "Descent" },
    { from: "M7_8", to: 19, category: "Descent" },
    { from: "M7_8", to: 20, category: "Descent" },
    { from: "M10_11", to: 21, category: "Descent" },
    { from: "M10_11", to: 22, category: "Descent" },
    { from: "M12_13", to: 23, category: "Descent" },
    { from: "M12_13", to: 24, category: "Descent" },
    { from: "M14_15", to: 25, category: "Descent" },
    { from: "M25_26", to: 27, category: "Descent" },
    { from: "M27_28", to: 30, category: "Descent" },
    { from: "M30_31", to: 32, category: "Descent" },
    { from: "M32_33", to: 34, category: "Descent" },
    { from: "M34_35", to: 36, category: "Descent" },
    { from: "M36_37", to: 38, category: "Descent" },
    { from: "M38_39", to: 41, category: "Descent" },
    { from: "M41_42", to: 43, category: "Descent" },
    { from: "M43_44", to: 45, category: "Descent" },
    { from: "M45_46", to: 47, category: "Descent" },
    { from: "M47_48", to: 49, category: "Descent" },
  ]
};

// Export familyData for search in page.js
export { familyData, calculateRelation };

// GenogramLayout implementation
class GenogramLayout extends go.LayeredDigraphLayout {
  constructor() {
    super();
    this.initializeOption = go.LayeredDigraphInit.DepthFirstIn;
    this.spouseSpacing = 30;
    this.isRouting = false;
  }
  makeNetwork(coll) {
    const net = this.createNetwork();
    if (coll instanceof go.Diagram) {
      this.add(net, coll.nodes, true);
      this.add(net, coll.links, true);
    } else if (coll instanceof go.Group) {
      this.add(net, coll.memberParts, false);
    } else if (coll.iterator) {
      this.add(net, coll.iterator, false);
    }
    return net;
  }
  add(net, coll, nonmemberonly) {
    const horiz = this.direction === 0.0 || this.direction === 180.0;
    const multiSpousePeople = new go.Set();
    const it = coll.iterator;
    while (it.next()) {
      const node = it.value;
      if (!(node instanceof go.Node) || !node.data) continue;
      if (!node.isLayoutPositioned || !node.isVisible()) continue;
      if (nonmemberonly && node.containingGroup !== null) continue;
      if (node.isLinkLabel) {
        const link = node.labeledLink;
        if (link.category === "Marriage") {
          const spouseA = link.fromNode;
          const spouseB = link.toNode;
          const vertex = net.addNode(node);
          if (horiz) {
            vertex.height = spouseA.actualBounds.height + this.spouseSpacing + spouseB.actualBounds.height;
            vertex.width = Math.max(spouseA.actualBounds.width, spouseB.actualBounds.width);
            vertex.focus = new go.Point(vertex.width / 2, spouseA.actualBounds.height + this.spouseSpacing / 2);
          } else {
            vertex.width = spouseA.actualBounds.width + this.spouseSpacing + spouseB.actualBounds.width;
            vertex.height = Math.max(spouseA.actualBounds.height, spouseB.actualBounds.height);
            vertex.focus = new go.Point(spouseA.actualBounds.width + this.spouseSpacing / 2, vertex.height / 2);
          }
        }
      } else {
        let marriages = 0;
        node.linksConnected.each(l => {
          if (l.category === "Marriage") marriages++;
        });
        if (marriages === 0) {
          net.addNode(node);
        } else if (marriages > 1) {
          multiSpousePeople.add(node);
        }
      }
    }
    it.reset();
    while (it.next()) {
      const link = it.value;
      if (!(link instanceof go.Link)) continue;
      if (!link.isLayoutPositioned || !link.isVisible()) continue;
      if (nonmemberonly && link.containingGroup !== null) continue;
      if (link.category === "Descent" && link.data) {
        const parent = net.findVertex(link.fromNode);
        const child = net.findVertex(link.toNode);
        if (child !== null) {
          net.linkVertexes(parent, child, link);
        } else {
          link.toNode.linksConnected.each(l => {
            if (l.category !== "Marriage" || !l.data) return;
            const mlab = l.labelNodes.first();
            const mlabvert = net.findVertex(mlab);
            if (mlabvert !== null) {
              net.linkVertexes(parent, mlabvert, link);
            }
          });
        }
      }
    }
    while (multiSpousePeople.count > 0) {
      const node = multiSpousePeople.first();
      const cohort = new go.Set();
      this.extendCohort(cohort, node);
      const dummyvert = net.createVertex();
      net.addVertex(dummyvert);
      const marriages = new go.Set();
      cohort.each(n => {
        n.linksConnected.each(l => { marriages.add(l); })
      });
      marriages.each(link => {
        if (link.category !== "Marriage") return;
        const mlab = link.labelNodes.first();
        if (mlab === null) return;
        const v = net.findVertex(mlab);
        if (v !== null) {
          net.linkVertexes(dummyvert, v, null);
        }
      });
      multiSpousePeople.removeAll(cohort);
    }
  }
  extendCohort(coll, node) {
    if (coll.has(node)) return;
    coll.add(node);
    node.linksConnected.each(l => {
      if (l.category === "Marriage") {
        this.extendCohort(coll, l.fromNode);
        this.extendCohort(coll, l.toNode);
      }
    });
  }
  assignLayers() {
    super.assignLayers();
    const horiz = this.direction === 0.0 || this.direction === 180.0;
    const maxsizes = [];
    this.network.vertexes.each(v => {
      const lay = v.layer;
      let max = maxsizes[lay];
      if (max === undefined) max = 0;
      const sz = (horiz ? v.width : v.height);
      if (sz > max) maxsizes[lay] = sz;
    });
    this.network.vertexes.each(v => {
      const lay = v.layer;
      const max = maxsizes[lay];
      if (horiz) {
        v.focus = new go.Point(0, v.height / 2);
        v.width = max;
      } else {
        v.focus = new go.Point(v.width / 2, 0);
        v.height = max;
      }
    });
  }
  initializeIndices() {
    super.initializeIndices();
    const vertical = this.direction === 90 || this.direction === 270;
    this.network.edges.each(e => {
      if (e.fromVertex.node && e.fromVertex.node.isLinkLabel) {
        e.portFromPos = vertical ? e.fromVertex.focusX : e.fromVertex.focusY;
      }
      if (e.toVertex.node && e.toVertex.node.isLinkLabel) {
        e.portToPos = vertical ? e.toVertex.focusX : e.toVertex.focusY;
      }
    });
  }
  commitNodes() {
    super.commitNodes();
    const positioned = new Set();
    this.network.vertexes.each(v => {
      if (v.node === null) return;
      if (!v.node.isLinkLabel) return;
      const labnode = v.node;
      const lablink = labnode.labeledLink;
      lablink.invalidateRoute();
      let spouseA = lablink.fromNode;
      let spouseB = lablink.toNode;
      if (!spouseA || !spouseB) return;
      if (spouseA.data.gender === "F") {
        const temp = spouseA;
        spouseA = spouseB;
        spouseB = temp;
      }
      if (!positioned.has(spouseA)) {
        const wives = [];
        spouseA.linksConnected.each(l => {
          if (l.category === "Marriage") {
            const other = (l.fromNode === spouseA) ? l.toNode : l.fromNode;
            if (other && other !== spouseA && !wives.includes(other)) {
              wives.push(other);
            }
          }
        });
        wives.sort((w1, w2) => w1.data.id - w2.data.id);
        let shiftLeft = 0;
        if (wives.length > 1 && wives[0]) {
          shiftLeft = wives[0].actualBounds.width + this.spouseSpacing;
        }
        spouseA.moveTo(v.x + shiftLeft, v.y);
        positioned.add(spouseA);
        if (wives.length === 1) {
          const w = wives[0];
          if (!positioned.has(w)) {
            w.moveTo(spouseA.position.x + spouseA.actualBounds.width + this.spouseSpacing, spouseA.position.y);
            positioned.add(w);
          }
        } else if (wives.length >= 2) {
          const w1 = wives[0];
          if (!positioned.has(w1)) {
            w1.moveTo(spouseA.position.x - w1.actualBounds.width - this.spouseSpacing, spouseA.position.y);
            positioned.add(w1);
          }
          const w2 = wives[1];
          if (!positioned.has(w2)) {
            w2.moveTo(spouseA.position.x + spouseA.actualBounds.width + this.spouseSpacing, spouseA.position.y);
            positioned.add(w2);
          }
          let currentX = spouseA.position.x + spouseA.actualBounds.width + this.spouseSpacing + w2.actualBounds.width + this.spouseSpacing;
          for (let i = 2; i < wives.length; i++) {
            const w = wives[i];
            if (!positioned.has(w)) {
              w.moveTo(currentX, spouseA.position.y);
              positioned.add(w);
              currentX += w.actualBounds.width + this.spouseSpacing;
            }
          }
        }
      }
      lablink.ensureBounds();
    });
    this.network.vertexes.each(v => {
      if (v.node !== null && !v.node.isLinkLabel && !positioned.has(v.node)) {
        v.node.position = new go.Point(v.x, v.y);
      }
    });
  }
}

// ============================================
// VISIBILITY & ANCESTOR HELPERS (match legacy exactly)
// ============================================
function setPersonVisibility(node, visible) {
  const model = node.diagram.model;
  model.setDataProperty(node.data, "visible", visible);

  node.linksConnected.each(l => {
    if (l.category === "Marriage") {
      const spouse = (l.fromNode === node) ? l.toNode : l.fromNode;
      const labelNode = l.labelNodes.first();

      // Toggle marriage link visibility
      model.setDataProperty(l.data, "visible", visible);

      if (labelNode) {
        // Toggle LinkLabel visibility
        model.setDataProperty(labelNode.data, "visible", visible);

        // Recurse to children
        labelNode.findNodesOutOf().each(child => {
          child.findLinksInto().each(pl => {
            if (pl.fromNode === labelNode) {
              model.setDataProperty(pl.data, "visible", visible);
            }
          });

          const childVisible = visible && node.data.isExpanded !== false;
          setPersonVisibility(child, childVisible);
        });
      }

      // Toggle spouse visibility
      if (spouse && spouse !== node) {
        model.setDataProperty(spouse.data, "visible", visible);
      }
    }
  });
}

function expandAncestors(node) {
  const model = node.diagram.model;
  node.findNodesInto().each(parentOrLabel => {
    if (parentOrLabel.isLinkLabel) {
      node.findLinksInto().each(l => {
        if (l.fromNode === parentOrLabel) {
          model.setDataProperty(l.data, "visible", true);
        }
      });
      parentOrLabel.findNodesInto().each(parent => {
        model.setDataProperty(parent.data, "isExpanded", true);
        model.setDataProperty(parent.data, "visible", true);
        parentOrLabel.labeledLink.labelNodes.each(ln => {
          model.setDataProperty(ln.data, "visible", true);
        });
        model.setDataProperty(parentOrLabel.labeledLink.data, "visible", true);
        expandAncestors(parent);
      });
    }
  });
}

// ============================================
// FOCUS VIEW (match legacy exactly)
// ============================================
function findAncestorsAndDescendants(node, ancestors = new Set(), descendants = new Set(), visited = new Set()) {
  if (!node || visited.has(node)) return { ancestors, descendants };
  visited.add(node);
  // Ancestors
  node.findNodesInto().each(parentOrLabel => {
    if (parentOrLabel.isLinkLabel) {
      ancestors.add(parentOrLabel);
      parentOrLabel.findNodesInto().each(p => {
        ancestors.add(p);
        findAncestorsAndDescendants(p, ancestors, descendants, visited);
      });
    }
  });
  // Descendants
  node.linksConnected.each(l => {
    if (l.category === "Marriage") {
      const labelNode = l.labelNodes.first();
      if (labelNode) {
        descendants.add(labelNode);
        labelNode.findNodesOutOf().each(child => {
          descendants.add(child);
          child.linksConnected.each(cl => {
            if (cl.category === "Marriage") {
              const spouse = (cl.fromNode === child) ? cl.toNode : cl.fromNode;
              if (spouse) descendants.add(spouse);
            }
          });
          findAncestorsAndDescendants(child, ancestors, descendants, visited);
        });
      }
    }
  });
  return { ancestors, descendants };
}

function applyFocusView(diagram, selectedNode) {
  if (!diagram) return;
  diagram.startTransaction("focusView");
  if (selectedNode === null) {
    diagram.nodes.each(n => { n.opacity = 1; n.isHighlighted = false; });
    diagram.links.each(l => { l.opacity = 1; l.isHighlighted = false; });
  } else {
    const { ancestors, descendants } = findAncestorsAndDescendants(selectedNode);
    const relatives = new Set([...ancestors, ...descendants, selectedNode]);
    ancestors.forEach(anc => {
      anc.linksConnected.each(l => {
        if (l.category === "Marriage") {
          const spouse = (l.fromNode === anc) ? l.toNode : l.fromNode;
          if (spouse) relatives.add(spouse);
        }
      });
    });
    diagram.nodes.each(n => {
      if (relatives.has(n) || n.isLinkLabel) {
        n.opacity = 1; n.isHighlighted = true;
      } else {
        n.opacity = 0.15; n.isHighlighted = false;
      }
    });
    diagram.links.each(l => {
      const fromRelative = relatives.has(l.fromNode) || (l.fromNode && l.fromNode.isLinkLabel);
      const toRelative = relatives.has(l.toNode) || (l.toNode && l.toNode.isLinkLabel);
      if (fromRelative && toRelative) {
        l.opacity = 1; l.isHighlighted = true;
      } else {
        l.opacity = 0.15; l.isHighlighted = false;
      }
    });
  }
  diagram.commitTransaction("focusView");
}

// ============================================
// RELATION RECOGNITION (match legacy exactly)
// ============================================
function getAncestorsWithPaths(node) {
  const results = {};
  function traverse(curr, path, depth) {
    if (!curr) return;
    results[curr.data.id] = { node: curr, depth, path: [...path, curr] };
    curr.findNodesInto().each(parentOrLabel => {
      if (parentOrLabel.isLinkLabel) {
        parentOrLabel.findNodesInto().each(parent => {
          traverse(parent, [...path, curr], depth + 1);
        });
      }
    });
  }
  traverse(node, [], 0);
  return results;
}

function calculateRelation(nodeA, nodeB) {
  if (nodeA === nodeB) return `${nodeA.data.name} và chính họ là cùng một người.`;
  const ancestorsA = getAncestorsWithPaths(nodeA);
  const ancestorsB = getAncestorsWithPaths(nodeB);
  let lcaNode = null;
  let minDepthSum = Infinity;
  for (let idA in ancestorsA) {
    if (ancestorsB[idA]) {
      const sum = ancestorsA[idA].depth + ancestorsB[idA].depth;
      if (sum < minDepthSum) { minDepthSum = sum; lcaNode = ancestorsA[idA].node; }
    }
  }
  if (!lcaNode) return `${nodeA.data.name} và ${nodeB.data.name} không có quan hệ huyết thống trực hệ gần trong sơ đồ này.`;

  const depthA = ancestorsA[lcaNode.data.id].depth;
  const depthB = ancestorsB[lcaNode.data.id].depth;
  const nameA = nodeA.data.name;
  const nameB = nodeB.data.name;
  const genderA = nodeA.data.gender;
  const genderB = nodeB.data.gender;
  const genDiff = depthB - depthA;

  function getBirthYear(data) {
    if (!data || !data.dob) return 9999;
    const match = data.dob.match(/\d{4}/);
    return match ? parseInt(match[0]) : 9999;
  }

  if (genDiff === 0) {
    if (depthA === 1) {
      const yrA = getBirthYear(nodeA.data);
      const yrB = getBirthYear(nodeB.data);
      if (yrA < yrB) {
        return `${nameA} là Anh/Chị ruột của ${nameB}.\n${nameB} gọi ${nameA} là ${genderA === "M" ? "Anh" : "Chị"}, xưng là Em.`;
      } else {
        return `${nameA} là Em ruột của ${nameB}.\n${nameA} gọi ${nameB} là ${genderB === "M" ? "Anh" : "Chị"}, xưng là Em.`;
      }
    } else {
      const pathA = ancestorsA[lcaNode.data.id].path;
      const pathB = ancestorsB[lcaNode.data.id].path;
      const parentA = pathA[pathA.length - 2];
      const parentB = pathB[pathB.length - 2];
      if (parentA && parentB) {
        const yrParentA = getBirthYear(parentA.data);
        const yrParentB = getBirthYear(parentB.data);
        if (yrParentA < yrParentB) {
          return `${nameA} là Anh/Chị họ của ${nameB}.\n${nameB} gọi ${nameA} là ${genderA === "M" ? "Anh họ" : "Chị họ"}, xưng là Em.`;
        } else {
          return `${nameA} là Em họ của ${nameB}.\n${nameA} gọi ${nameB} là ${genderB === "M" ? "Anh họ" : "Chị họ"}, xưng là Em.`;
        }
      }
    }
    return `${nameA} và ${nameB} là Anh chị em họ hàng cùng thế hệ.`;
  }

  if (genDiff > 0) {
    if (genDiff === 1) {
      if (depthA === 0) {
        return `${nameA} là ${genderA === "M" ? "Cha/Bố" : "Mẹ"} của ${nameB}.\n${nameB} gọi ${nameA} là ${genderA === "M" ? "Cha/Bố" : "Mẹ"}, xưng là Con.`;
      } else {
        const pathB = ancestorsB[lcaNode.data.id].path;
        const parentB = pathB[pathB.length - 2];
        const parentGender = parentB ? parentB.data.gender : "M";
        const yrA = getBirthYear(nodeA.data);
        const yrParent = parentB ? getBirthYear(parentB.data) : 9999;
        if (yrA < yrParent) {
          return `${nameA} là Bác (Anh/Chị của Cha/Mẹ) của ${nameB}.\n${nameB} gọi ${nameA} là Bác, xưng là Cháu.`;
        } else {
          if (parentGender === "M") {
            return `${nameA} là ${genderA === "M" ? "Chú" : "Cô"} của ${nameB}.\n${nameB} gọi ${nameA} là ${genderA === "M" ? "Chú" : "Cô"}, xưng là Cháu.`;
          } else {
            return `${nameA} là ${genderA === "M" ? "Cậu" : "Dì"} của ${nameB}.\n${nameB} gọi ${nameA} là ${genderA === "M" ? "Cậu" : "Dì"}, xưng là Cháu.`;
          }
        }
      }
    } else if (genDiff === 2) {
      return `${nameA} là ${genderA === "M" ? "Ông" : "Bà"} của ${nameB}.\n${nameB} gọi ${nameA} là ${genderA === "M" ? "Ông" : "Bà"}, xưng là Cháu.`;
    } else {
      return `${nameA} là Cụ/Cố của ${nameB}.\n${nameB} gọi ${nameA} là Cụ, xưng là Cháu.`;
    }
  }

  if (genDiff < 0) {
    const absDiff = Math.abs(genDiff);
    if (absDiff === 1) {
      if (depthB === 0) {
        return `${nameA} là Con của ${nameB}.\n${nameA} gọi ${nameB} là ${genderB === "M" ? "Cha/Bố" : "Mẹ"}, xưng là Con.`;
      } else {
        const pathA = ancestorsA[lcaNode.data.id].path;
        const parentA = pathA[pathA.length - 2];
        const parentGender = parentA ? parentA.data.gender : "M";
        const yrB = getBirthYear(nodeB.data);
        const yrParent = parentA ? getBirthYear(parentA.data) : 9999;
        let bRole = "";
        if (yrB < yrParent) { bRole = "Bác"; }
        else {
          if (parentGender === "M") { bRole = genderB === "M" ? "Chú" : "Cô"; }
          else { bRole = genderB === "M" ? "Cậu" : "Dì"; }
        }
        return `${nameA} là Cháu của ${nameB}.\n${nameA} gọi ${nameB} là ${bRole}, xưng là Cháu.`;
      }
    } else if (absDiff === 2) {
      return `${nameA} là Cháu của ${nameB}.\n${nameA} gọi ${nameB} là ${genderB === "M" ? "Ông" : "Bà"}, xưng là Cháu.`;
    } else {
      return `${nameA} là Cháu (hàng Chắt/Chút) của ${nameB}.\n${nameA} gọi ${nameB} là Cụ/Cố, xưng là Cháu.`;
    }
  }
  return `${nameA} và ${nameB} có mối quan hệ dòng tộc.`;
}

// ============================================
// COMPONENT
// ============================================
const FamilyTree = forwardRef(function FamilyTree({ themeName, onNodeClick, relationSelectionMode, onRelationClick, data }, ref) {
  const diagramRef = useRef(null);
  const overviewRef = useRef(null);
  const diagramInstance = useRef(null);
  const relationModeRef = useRef(relationSelectionMode);

  // Keep ref in sync
  useEffect(() => {
    relationModeRef.current = relationSelectionMode;
  }, [relationSelectionMode]);

  // Expose imperative API to parent
  useImperativeHandle(ref, () => ({
    getDiagram: () => diagramInstance.current,
    zoomIn: () => { if (diagramInstance.current) diagramInstance.current.commandHandler.increaseZoom(1.3); },
    zoomOut: () => { if (diagramInstance.current) diagramInstance.current.commandHandler.decreaseZoom(0.7); },
    zoomFit: () => { if (diagramInstance.current) diagramInstance.current.commandHandler.zoomToFit(); },
    centerRoot: () => {
      if (!diagramInstance.current) return;
      diagramInstance.current.scale = 1;
      diagramInstance.current.commandHandler.scrollToPart(diagramInstance.current.findNodeForKey(1));
    },
    goToNode: (id) => {
      const diagram = diagramInstance.current;
      if (!diagram) return;
      const node = diagram.findNodeForKey(id);
      if (node) {
        diagram.startTransaction("expandAncestors");
        expandAncestors(node);
        diagram.model.setDataProperty(node.data, "visible", true);
        diagram.commitTransaction("expandAncestors");
        diagram.select(node);
        diagram.commandHandler.scrollToPart(node);
      }
    },
    expandAll: () => {
      const diagram = diagramInstance.current;
      if (!diagram) return;
      diagram.startTransaction("expandAll");
      diagram.nodes.each(n => {
        if (!n.isLinkLabel) {
          diagram.model.setDataProperty(n.data, "isExpanded", true);
          diagram.model.setDataProperty(n.data, "visible", true);
        } else {
          diagram.model.setDataProperty(n.data, "visible", true);
        }
      });
      diagram.links.each(l => {
        diagram.model.setDataProperty(l.data, "visible", true);
      });
      diagram.commitTransaction("expandAll");
      diagram.commandHandler.zoomToFit();
    },
    clearSelection: () => {
      if (diagramInstance.current) diagramInstance.current.clearSelection();
    },
  }));

  useEffect(() => {
    if (!diagramRef.current) return;

    const $ = go.GraphObject.make;
    const theme = {
      colors: {
        femaleBadgeBackground: "#f9ebea",
        maleBadgeBackground: "#eef2f3",
        femaleBadgeText: "#7b241c",
        maleBadgeText: "#1f618d",
        selectionStroke: "#cca625",
        counterBackground: "#ffffff",
        counterBorder: "#cca625",
        counterText: "#5c0606",
        link: "#8a7b66",
        personNodeBackground: "#FFFFFF",
        personText: "#1a0000",
      },
      fonts: {
        badgeFont: "600 11px Inter",
        birthDeathFont: "12px Inter",
        nameFont: "bold 17px Playfair Display",
        counterFont: "bold 14px Inter",
      },
    };

    const STROKE_WIDTH = 3;
    const CORNER_ROUNDNESS = 12;
    const IMAGE_TOP_MARGIN = 20;

    const getStrokeForNode = (data) => {
      if (data.isAlive === false) return "#94a3b8";
      if (data.status === "king" || data.status === "prince") return "#FEBA00";
      return data.gender === "M" ? "#2b6cb0" : "#b83280";
    };

    const statusStrokeBinding = () => new go.Binding("stroke", "", (data) => getStrokeForNode(data));
    const highlightStrokeBinding = () =>
      new go.Binding("stroke", "isHighlighted", (isHighlighted, obj) =>
        isHighlighted ? theme.colors.selectionStroke : getStrokeForNode(obj.part.data)
      ).ofObject();

    const getBadgeText = (data) => {
      if (data.status === "king") return "Tộc Trưởng";
      if (data.status === "prince") return "Trưởng Nhánh";
      return data.gender === "M" ? "Nam" : "Nữ";
    };
    const getBadgeFill = (data) => {
      if (data.status === "king") return "#800000";
      if (data.status === "prince") return "#cca625";
      return data.gender === "M" ? theme.colors.maleBadgeBackground : theme.colors.femaleBadgeBackground;
    };
    const getBadgeTextColor = (data) => {
      if (data.status === "king" || data.status === "prince") return "#ffffff";
      return data.gender === "M" ? theme.colors.maleBadgeText : theme.colors.femaleBadgeText;
    };

    // Status icon image source (king, prince, civilian)
    const getImageSource = (data) => {
      switch (data.status) {
        case "king": case "queen": return "/images/king.svg";
        case "prince": case "princess": return "/images/prince.svg";
        case "civilian": default:
          return data.gender === "M" ? "/images/male-civilian.svg" : "/images/female-civilian.svg";
      }
    };
    const getImageSize = (status) => {
      switch (status) {
        case "king": case "queen": return new go.Size(30, 20);
        case "prince": case "princess": return new go.Size(28, 20);
        default: return new go.Size(24, 24);
      }
    };

    function countChildren(node) {
      if (!(node instanceof go.Node)) return 0;
      let count = 0;
      node.linksConnected.each(l => {
        if (l.category === "Marriage") {
          const labelNode = l.labelNodes.first();
          if (labelNode) { count += labelNode.findNodesOutOf().count; }
        }
      });
      return count;
    }

    // Mouse hover handlers
    const onMouseEnterPart = (e, part) => {
      if (!relationModeRef.current) part.isHighlighted = true;
    };
    const onMouseLeavePart = (e, part) => {
      const diagram = diagramInstance.current;
      const selected = diagram ? diagram.selection.first() : null;
      if (selected !== part) part.isHighlighted = false;
    };

    const myDiagram = $(go.Diagram, diagramRef.current, {
      layout: $(GenogramLayout, { direction: 90, layerSpacing: 30, columnSpacing: 10 }),
      "toolManager.hoverDelay": 100,
      allowZoom: true,
      "animationManager.isEnabled": true,
      scrollMode: go.ScrollMode.Infinite,
    });

    myDiagram.nodeTemplate = $(go.Node, "Spot", {
      selectionAdorned: false,
      mouseEnter: onMouseEnterPart,
      mouseLeave: onMouseLeavePart,
      shadowVisible: true,
      shadowColor: "rgba(0, 0, 0, 0.15)",
      shadowOffset: new go.Point(2, 4),
      shadowBlur: 8,
      click: (e, node) => {
        if (relationModeRef.current) {
          onRelationClick && onRelationClick(node);
        } else {
          onNodeClick && onNodeClick(node.data);
        }
      }
    },
      new go.Binding("visible", "visible", (v) => v !== false),
      // Main card shape + name + dob
      $(go.Panel, "Spot",
        $(go.Shape, "RoundedRectangle", {
          desiredSize: new go.Size(215, 110),
          fill: theme.colors.personNodeBackground,
          portId: "",
          parameter1: CORNER_ROUNDNESS,
          strokeWidth: STROKE_WIDTH,
        }, statusStrokeBinding(), highlightStrokeBinding(), new go.Binding("strokeWidth", "isHighlighted", (h) => h ? 5 : STROKE_WIDTH).ofObject()),
        $(go.TextBlock, {
          stroke: theme.colors.personText,
          font: theme.fonts.nameFont,
          desiredSize: new go.Size(160, 50),
          overflow: go.TextOverflow.Ellipsis,
          textAlign: "center",
          verticalAlignment: go.Spot.Center,
          alignmentFocus: go.Spot.Top,
          alignment: new go.Spot(0.5, 0, 0, 25),
        }, new go.Binding("text", "name")),
        $(go.TextBlock, {
          stroke: theme.colors.personText,
          font: theme.fonts.birthDeathFont,
          alignmentFocus: go.Spot.Top,
          alignment: new go.Spot(0.5, 1, 0, -35),
        }, new go.Binding("text", "dob"))
      ),
      // Person image with status icon overlay (match legacy personImage)
      $(go.Panel, "Spot", {
        alignmentFocus: go.Spot.Top,
        alignment: new go.Spot(0, 0, STROKE_WIDTH / 2, IMAGE_TOP_MARGIN),
      },
        $(go.Picture, { width: 55, height: 55 }, new go.Binding("source", "photo", (p) => p || "/assets/img/avata.jpg")),
        $(go.Picture, { scale: 0.9 },
          new go.Binding("source", "", getImageSource),
          new go.Binding("desiredSize", "status", getImageSize)
        )
      ),
      // Badge (Tộc Trưởng / Trưởng Nhánh / Nam / Nữ)
      $(go.Panel, "Auto", { alignmentFocus: go.Spot.TopRight, alignment: new go.Spot(1, 0, -15, STROKE_WIDTH - 0.5) },
        $(go.Shape, "RoundedRectangle", { parameter1: CORNER_ROUNDNESS, parameter2: 4 | 8, desiredSize: new go.Size(NaN, 22.5), stroke: null },
          new go.Binding("fill", "", getBadgeFill)
        ),
        $(go.TextBlock, { font: theme.fonts.badgeFont, margin: new go.Margin(0, 8, 0, 8) },
          new go.Binding("stroke", "", getBadgeTextColor),
          new go.Binding("text", "", getBadgeText)
        )
      ),
      // Expand/Collapse button
      $(go.Panel, "Auto", {
        alignmentFocus: go.Spot.Center, alignment: new go.Spot(0.5, 1, 0, 0), cursor: "pointer",
        click: (e, obj) => {
          e.handled = true;
          const node = obj.part;
          const diag = node.diagram;
          if (!diag) return;
          diag.startTransaction("toggleExpand");
          const data = node.data;
          const nextState = data.isExpanded === false;
          diag.model.setDataProperty(data, "isExpanded", nextState);
          setPersonVisibility(node, nextState);
          diag.commitTransaction("toggleExpand");
        }
      },
        new go.Binding("visible", "", (node) => countChildren(node) > 0).ofObject(),
        $(go.Shape, "Circle", { desiredSize: new go.Size(26, 26), fill: theme.colors.counterBackground, stroke: theme.colors.counterBorder, strokeWidth: 1.5 }),
        $(go.TextBlock, { alignment: go.Spot.Center, stroke: theme.colors.counterText, font: theme.fonts.counterFont, textAlign: "center", margin: new go.Margin(1, 0, 0, 0) },
          new go.Binding("text", "isExpanded", (exp) => exp === false ? "+" : "-")
        )
      )
    );

    myDiagram.nodeTemplateMap.add("LinkLabel",
      $(go.Node, { selectable: false, width: 1, height: 1, fromEndSegmentLength: 20 },
        new go.Binding("visible", "visible", (v) => v !== false)
      )
    );

    myDiagram.linkTemplate = $(go.Link, {
      selectionAdorned: false, routing: go.Routing.AvoidsNodes, corner: 10, layerName: "Background",
      mouseEnter: onMouseEnterPart,
      mouseLeave: onMouseLeavePart,
    },
      new go.Binding("visible", "visible", (v) => v !== false),
      $(go.Shape, { stroke: theme.colors.link, strokeWidth: 1.5 },
        new go.Binding("stroke", "isHighlighted", (h) => h ? "#ffc107" : theme.colors.link).ofObject(),
        new go.Binding("strokeWidth", "isHighlighted", (h) => h ? 3 : 1.5).ofObject()
      )
    );

    myDiagram.linkTemplateMap.add("Marriage",
      $(go.Link, {
        routing: go.Routing.Orthogonal, corner: 15, fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides, selectable: false, isTreeLink: false, layerName: "Background"
      },
        new go.Binding("visible", "visible", (v) => v !== false),
        $(go.Shape, { strokeWidth: 2, stroke: theme.colors.selectionStroke, strokeDashArray: [5, 5] })
      )
    );

    const activeData = data || { nodeDataArray: [], linkDataArray: [] };
    myDiagram.model = new go.GraphLinksModel({
      linkLabelKeysProperty: "labelKeys", nodeKeyProperty: "id", copiesArrays: true,
      nodeDataArray: activeData.nodeDataArray, linkDataArray: activeData.linkDataArray
    });

    // Apply initial collapse/expand state
    myDiagram.delayInitialization(() => {
      myDiagram.nodes.each(n => {
        if (!n.isLinkLabel) {
          const isRoot = !n.findNodesInto().any(p => p.isLinkLabel);
          if (isRoot) setPersonVisibility(n, n.data.isExpanded !== false);
        }
      });
      myDiagram.requestUpdate();
      myDiagram.layoutDiagram(true);
    });

    // Focus View: ChangedSelection listener (match legacy)
    myDiagram.addDiagramListener("ChangedSelection", (e) => {
      const selected = myDiagram.selection.first();
      if (selected instanceof go.Node && !selected.isLinkLabel) {
        applyFocusView(myDiagram, selected);
        myDiagram.commandHandler.scrollToPart(selected);
      } else {
        applyFocusView(myDiagram, null);
      }
    });

    // Overview minimap
    let overview = null;
    if (overviewRef.current) {
      overview = new go.Overview(overviewRef.current);
      overview.observed = myDiagram;
    }

    diagramInstance.current = myDiagram;

    // Also expose on window for backward compatibility
    if (typeof window !== 'undefined') {
      window.gpDiagram = myDiagram;
    }

    // GoJS watermark removal
    function removeGoJSWatermark() {
      if (!diagramRef.current) return;
      diagramRef.current.querySelectorAll('a[href*="gojs.net"]').forEach(el => el.remove());
      diagramRef.current.querySelectorAll('div').forEach(el => {
        const style = el.getAttribute('style') || '';
        const text = el.textContent || '';
        if (style.includes('z-index: 20') || text.toLowerCase().includes('evaluation') || text.toLowerCase().includes('gojs')) {
          el.style.display = 'none';
        }
      });
    }
    setTimeout(() => removeGoJSWatermark(), 500);
    const observer = new MutationObserver(() => removeGoJSWatermark());
    observer.observe(diagramRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (overview) {
        overview.observed = null;
        overview.div = null;
      }
      myDiagram.div = null;
    };
  }, []);

  // Sync diagram model when database data is fetched dynamically from Supabase
  useEffect(() => {
    const diagram = diagramInstance.current;
    if (diagram && data) {
      diagram.model = new go.GraphLinksModel({
        linkLabelKeysProperty: "labelKeys", nodeKeyProperty: "id", copiesArrays: true,
        nodeDataArray: data.nodeDataArray, linkDataArray: data.linkDataArray
      });
      diagram.delayInitialization(() => {
        diagram.nodes.each(n => {
          if (!n.isLinkLabel) {
            const isRoot = !n.findNodesInto().any(p => p.isLinkLabel);
            if (isRoot) setPersonVisibility(n, n.data.isExpanded !== false);
          }
        });
        diagram.requestUpdate();
        diagram.layoutDiagram(true);
      });
    }
  }, [data]);

  const hasData = data && data.nodeDataArray && data.nodeDataArray.filter(n => n.category !== "LinkLabel").length > 0;

  return (
    <div className={`gia-pha-wrapper theme-${themeName}`} id="gia-pha-wrapper">
      <div id="myDiagramDiv" ref={diagramRef} style={{ width: '100%', height: '100%', display: hasData ? 'block' : 'none' }}></div>
      {hasData && (
        <div
          id="myOverviewDiv"
          ref={overviewRef}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 180,
            height: 130,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(0,0,0,0.1)',
            borderRadius: 12,
            zIndex: 500,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            pointerEvents: 'auto',
          }}
        ></div>
      )}
      {!hasData && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          background: 'rgba(253, 251, 247, 0.95)',
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
          padding: '40px'
        }} className="empty-state-overlay">
          <div style={{
            background: '#fff',
            padding: '40px 60px',
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(92, 6, 6, 0.08)',
            border: '1.5px dashed rgba(92, 6, 6, 0.15)',
            maxWidth: '500px'
          }}>
            <i className="bi bi-diagram-3" style={{ fontSize: '4rem', color: '#800000', marginBottom: '20px', display: 'block' }}></i>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#5c0606', fontWeight: 'bold', fontSize: '2rem', margin: '0 0 15px 0' }}>
              Hãy thêm Dữ liệu Gia Tộc!
            </h3>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.6', margin: '0' }}>
              Hiện chưa có dữ liệu nào. Vui lòng thêm thành viên để bắt đầu xây dựng gia phả.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default FamilyTree;
