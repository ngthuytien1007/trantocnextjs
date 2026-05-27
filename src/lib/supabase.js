import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================
// Hướng dẫn cấu hình:
// 1. Tạo một dự án tại https://supabase.com
// 2. Chạy đoạn mã SQL DDL (nằm ở cuối file này) trong phần SQL Editor của Supabase.
// 3. Tạo file `.env.local` ở thư mục gốc dự án Next.js và điền thông tin sau:
//    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Khởi tạo Supabase client (sẽ fallback an toàn nếu chưa điền cấu hình)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Kiểm tra xem cấu hình Supabase đã sẵn sàng chưa
 */
export const isSupabaseConfigured = () => {
  return !!supabase;
};

// ============================================================================
// DATABASE ACTIONS (GET & SAVE)
// ============================================================================

/**
 * Lấy toàn bộ dữ liệu gia phả (Nodes và Links)
 * Nếu chưa có dữ liệu hoặc lỗi kết nối, sẽ tự động trả về dữ liệu mẫu (static)
 */
export const fetchFamilyData = async () => {
  if (!supabase) {
    console.warn("⚠️ Supabase chưa được cấu hình.");
    return null;
  }

  try {
    // 1. Lấy dữ liệu Nodes (thành viên)
    const { data: nodes, error: nodesError } = await supabase
      .from('family_members')
      .select('*')
      .order('generation', { ascending: true });

    if (nodesError) throw nodesError;

    // 2. Lấy dữ liệu Links (quan hệ)
    const { data: links, error: linksError } = await supabase
      .from('family_links')
      .select('*');

    if (linksError) throw linksError;

    // Nếu cơ sở dữ liệu trống, trả về null để hiển thị thông báo
    if (!nodes || nodes.length === 0) {
      console.log("📭 Database trống. Hãy thêm Dữ liệu Gia Tộc!");
      return null;
    }

    // Định dạng dữ liệu tương thích với GoJS (chuyển đổi kiểu dữ liệu cho khớp)
    const nodeDataArray = nodes.map(n => ({
      id: isNaN(Number(n.id)) ? n.id : Number(n.id),
      name: n.name,
      gender: n.gender,
      status: n.status,
      title: n.title,
      dob: n.dob,
      isAlive: n.is_alive,
      photo: n.photo || '/assets/img/avata.jpg',
      courtesyName: n.courtesy_name || '',
      dobSolar: n.dob_solar || '',
      dobLunar: n.dob_lunar || '',
      dodSolar: n.dod_solar || '',
      dodLunar: n.dod_lunar || '',
      burialPlace: n.burial_place || '',
      bio: n.bio || '',
      isExpanded: n.is_expanded !== false,
      category: n.category || undefined,
      generation: n.generation ? Number(n.generation) : undefined
    }));

    const linkDataArray = links.map(l => ({
      from: isNaN(Number(l.from_node)) ? l.from_node : Number(l.from_node),
      to: isNaN(Number(l.to_node)) ? l.to_node : Number(l.to_node),
      labelKeys: Array.isArray(l.label_keys) ? l.label_keys.map(k => isNaN(Number(k)) ? k : Number(k)) : [],
      category: l.category
    }));

    console.log("🎯 Đã tải thành công dữ liệu gia phả từ Supabase!");
    return { nodeDataArray, linkDataArray };
  } catch (error) {
    console.error("❌ Lỗi khi tải dữ liệu từ Supabase:", error);
    console.warn("⚠️ Không thể tải dữ liệu.");
    return null;
  }
};

/**
 * Lưu thành viên mới vào Supabase
 * Tự động tính toán các liên kết Hôn nhân (Marriage) và Huyết thống (Descent) tương thích GoJS Genogram
 */
export const saveFamilyMember = async (payload) => {
  if (!supabase) {
    // Lưu vào LocalStorage làm fallback nếu chưa cấu hình Supabase
    console.warn("⚠️ Supabase chưa cấu hình. Đang lưu tạm vào LocalStorage.");
    const savedList = JSON.parse(localStorage.getItem('temp_members') || '[]');
    savedList.push(payload);
    localStorage.setItem('temp_members', JSON.stringify(savedList));
    return { success: true, fallback: true };
  }

  try {
    // 1. Tạo một ID ngẫu nhiên và duy nhất cho thành viên mới (hoặc dùng số ngẫu nhiên)
    const newMemberId = Date.now(); 
    const generation = parseInt(payload.generation || "1", 10);

    // 2. Thêm thành viên mới vào bảng `family_members`
    const { error: insertError } = await supabase
      .from('family_members')
      .insert([{
        id: String(newMemberId),
        name: payload.name,
        gender: payload.gender,
        status: payload.status,
        title: payload.title,
        dob: payload.dob,
        is_alive: payload.isAlive,
        photo: '/assets/img/avata.jpg',
        courtesy_name: payload.courtesyName,
        dob_solar: payload.dobSolar,
        dob_lunar: payload.dobLunar,
        dod_solar: payload.dodSolar,
        dod_lunar: payload.dodLunar,
        burial_place: payload.burialPlace,
        bio: payload.bio,
        is_expanded: true,
        generation: generation
      }]);

    if (insertError) throw insertError;

    // 3. Xử lý mối quan hệ Vợ / Chồng (Spouse)
    if (payload._spouseId) {
      const spouseId = String(payload._spouseId);
      const marriageLabelId = `M${Math.min(newMemberId, Number(spouseId))}_${Math.max(newMemberId, Number(spouseId))}`;

      // Tạo thẻ Label Node đại diện cho hôn phối
      await supabase
        .from('family_members')
        .insert([{
          id: marriageLabelId,
          category: 'LinkLabel',
          is_expanded: false
        }]);

      // Tạo link Marriage
      await supabase
        .from('family_links')
        .insert([{
          from_node: String(newMemberId),
          to_node: spouseId,
          category: 'Marriage',
          label_keys: [marriageLabelId]
        }]);
    }

    // 4. Xử lý mối quan hệ Cha / Mẹ (Huyết thống - Descent)
    if (payload._fatherId || payload._motherId) {
      const fatherId = payload._fatherId ? String(payload._fatherId) : null;
      const motherId = payload._motherId ? String(payload._motherId) : null;

      let marriageLabelId = null;

      if (fatherId && motherId) {
        // Tìm xem cha và mẹ đã có hôn phối sẵn chưa
        const { data: existingMarriage } = await supabase
          .from('family_links')
          .select('label_keys')
          .or(`and(from_node.eq.${fatherId},to_node.eq.${motherId}),and(from_node.eq.${motherId},to_node.eq.${fatherId})`)
          .eq('category', 'Marriage')
          .single();

        if (existingMarriage && existingMarriage.label_keys && existingMarriage.label_keys.length > 0) {
          marriageLabelId = existingMarriage.label_keys[0];
        } else {
          // Nếu chưa có, tạo cuộc hôn nhân mới cho cha mẹ
          marriageLabelId = `M${fatherId}_${motherId}`;
          await supabase.from('family_members').insert([{ id: marriageLabelId, category: 'LinkLabel' }]);
          await supabase.from('family_links').insert([{
            from_node: fatherId,
            to_node: motherId,
            category: 'Marriage',
            label_keys: [marriageLabelId]
          }]);
        }
      } else {
        // Chỉ chọn Cha hoặc chỉ chọn Mẹ
        const singleParentId = fatherId || motherId;
        // Tìm bất kỳ cuộc hôn nhân nào có liên quan đến cha/mẹ này
        const { data: marriages } = await supabase
          .from('family_links')
          .select('label_keys')
          .or(`from_node.eq.${singleParentId},to_node.eq.${singleParentId}`)
          .eq('category', 'Marriage');

        if (marriages && marriages.length > 0) {
          marriageLabelId = marriages[0].label_keys[0];
        } else {
          // Tạo một Node hôn phối tạm thời cho đơn thân
          marriageLabelId = `M${singleParentId}_single`;
          await supabase.from('family_members').insert([{ id: marriageLabelId, category: 'LinkLabel' }]);
          await supabase.from('family_links').insert([{
            from_node: singleParentId,
            to_node: singleParentId,
            category: 'Marriage',
            label_keys: [marriageLabelId]
          }]);
        }
      }

      // Tạo liên kết huyết thống (Descent) từ node hôn phối tới người con mới
      if (marriageLabelId) {
        await supabase
          .from('family_links')
          .insert([{
            from_node: marriageLabelId,
            to_node: String(newMemberId),
            category: 'Descent'
          }]);
      }
    }

    return { success: true, newMemberId: String(newMemberId) };
  } catch (error) {
    console.error("❌ Lỗi khi lưu thành viên vào Supabase:", error);
    throw error;
  }
};

/**
 * Hàm hỗ trợ nạp dữ liệu ban đầu từ file tĩnh vào Supabase
 */
// const seedDemoData = async () => {
//   try {
//     // Chuẩn bị dữ liệu members
//     const membersToInsert = staticFamilyData.nodeDataArray.map(n => ({
//       id: String(n.id),
//       name: n.name || null,
//       gender: n.gender || null,
//       status: n.status || null,
//       title: n.title || null,
//       dob: n.dob || null,
//       is_alive: n.isAlive !== false,
//       photo: n.photo || null,
//       courtesy_name: n.courtesyName || null,
//       dob_solar: n.dobSolar || null,
//       dob_lunar: n.dobLunar || null,
//       dod_solar: n.dodSolar || null,
//       dod_lunar: n.dodLunar || null,
//       burial_place: n.burialPlace || null,
//       bio: n.bio || null,
//       is_expanded: n.isExpanded !== false,
//       category: n.category || null,
//       generation: n.generation || null
//     }));

//     // Chuẩn bị dữ liệu links
//     const linksToInsert = staticFamilyData.linkDataArray.map(l => ({
//       from_node: String(l.from),
//       to_node: String(l.to),
//       category: l.category,
//       label_keys: Array.isArray(l.labelKeys) ? l.labelKeys.map(String) : null
//     }));

//     // Chia nhỏ mảng nạp để tránh quá tải API
//     const { error: nodeErr } = await supabase.from('family_members').insert(membersToInsert);
//     if (nodeErr) throw nodeErr;

//     const { error: linkErr } = await supabase.from('family_links').insert(linksToInsert);
//     if (linkErr) throw linkErr;

//     console.log("🌱 Đã nạp thành công 49 thành viên và liên kết mẫu!");
//   } catch (e) {
//     console.error("❌ Lỗi tự động Seed dữ liệu:", e);
//   }
// };

// ============================================================================
// SQL DDL SCRIPT (COPY VÀO SUPABASE SQL EDITOR)
// ============================================================================
/*
-- 1. Tạo bảng Thành viên Gia phả (family_members)
CREATE TABLE family_members (
    id TEXT PRIMARY KEY,
    name TEXT,
    gender TEXT,
    status TEXT,
    title TEXT,
    dob TEXT,
    is_alive BOOLEAN DEFAULT true,
    photo TEXT,
    courtesy_name TEXT,
    dob_solar TEXT,
    dob_lunar TEXT,
    dod_solar TEXT,
    dod_lunar TEXT,
    burial_place TEXT,
    bio TEXT,
    is_expanded BOOLEAN DEFAULT true,
    category TEXT,
    generation INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tạo bảng Quan hệ liên kết (family_links)
CREATE TABLE family_links (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    from_node TEXT NOT NULL,
    to_node TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Marriage' hoặc 'Descent'
    label_keys TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tạo Indexes để tăng tốc truy vấn dữ liệu
CREATE INDEX idx_members_generation ON family_members(generation);
CREATE INDEX idx_links_from ON family_links(from_node);
CREATE INDEX idx_links_to ON family_links(to_node);
CREATE INDEX idx_links_category ON family_links(category);

-- 4. Bật quyền RLS (Row Level Security) hoặc tắt tùy thuộc vào cài đặt bảo mật của bạn
-- Dưới đây là chính sách cho phép đọc và ghi tự do (phục vụ mục đích thử nghiệm):
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to family_members" ON family_members FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to family_members" ON family_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read access to family_links" ON family_links FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to family_links" ON family_links FOR INSERT WITH CHECK (true);
*/
