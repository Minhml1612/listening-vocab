/**
 * MAIN APP CONTROLLER & ROUTER
 * Điều phối toàn bộ giao diện, định tuyến các chế độ học, tìm kiếm và quản lý từ vựng
 */

// TỪ ĐIỂN NGOẠI TUYẾN TÍCH HỢP SẴN — PHẢN HỒI 0MS TỨC THÌ
window.OFFLINE_DICT = {
  'mechanic': { phonetic: '/məˈkænɪk/', partOfSpeech: 'noun', primary: 'thợ cơ khí', meaning: 'thợ cơ khí; thợ máy; thợ sửa xe; thợ sửa máy móc', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['thợ cơ khí', 'thợ máy', 'thợ sửa xe', 'thợ sửa máy móc'] }] },
  'committee': { phonetic: '/kəˈmɪti/', partOfSpeech: 'noun', primary: 'ủy ban', meaning: 'ủy ban; hội đồng; ban chấp hành; ban đại diện', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['ủy ban', 'hội đồng', 'ban chấp hành', 'ban đại diện'] }] },
  'warning': { phonetic: '/ˈwɔːnɪŋ/', partOfSpeech: 'noun', primary: 'lời cảnh báo', meaning: 'lời cảnh báo; sự báo trước; sự răn đe; điềm báo', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['lời cảnh báo', 'sự báo trước', 'sự răn đe', 'điềm báo'] }] },
  'cancer': { phonetic: '/ˈkænsə(r)/', partOfSpeech: 'noun', primary: 'bệnh ung thư', meaning: 'bệnh ung thư; tệ nạn; mầm mống độc hại', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['bệnh ung thư', 'khối u ác tính', 'tệ nạn xã hội'] }] },
  'smoking': { phonetic: '/ˈsməʊkɪŋ/', partOfSpeech: 'noun', primary: 'hút thuốc', meaning: 'sự hút thuốc lá; việc hun khói', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['sự hút thuốc lá', 'khói thuốc', 'việc hun khói'] }] },
  'severe': { phonetic: '/sɪˈvɪə(r)/', partOfSpeech: 'adjective', primary: 'nghiêm trọng', meaning: 'nghiêm trọng; gay gắt; khốc liệt; khắt khe', senses: [{ pos: 'adjective', posVi: 'Tính từ', meanings: ['nghiêm trọng', 'gay gắt', 'khốc liệt', 'khắt khe'] }] },
  'highlight': { phonetic: '/ˈhaɪlaɪt/', partOfSpeech: 'verb', primary: 'làm nổi bật', meaning: 'làm nổi bật; nhấn mạnh; điểm nổi bật; nét đặc sắc', senses: [{ pos: 'verb', posVi: 'Động từ', meanings: ['làm nổi bật', 'nhấn mạnh', 'tô sáng'] }, { pos: 'noun', posVi: 'Danh từ', meanings: ['điểm nổi bật', 'nét đặc sắc', 'tiêu điểm'] }] },
  'decision': { phonetic: '/dɪˈsɪʒn/', partOfSpeech: 'noun', primary: 'quyết định', meaning: 'quyết định; sự phán quyết; sự giải quyết', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['quyết định', 'sự phán quyết', 'độ dứt khoát'] }] },
  'advice': { phonetic: '/ədˈvaɪs/', partOfSpeech: 'noun', primary: 'lời khuyên', meaning: 'lời khuyên; sự tư vấn; thông báo chỉ dẫn', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['lời khuyên', 'sự tư vấn', 'ý kiến chỉ dẫn'] }] },
  'attorney': { phonetic: '/əˈtɜːni/', partOfSpeech: 'noun', primary: 'luật sư', meaning: 'luật sư; người đại diện theo pháp luật; người được ủy quyền', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['luật sư', 'người đại diện pháp lý', 'người thụ ủy'] }] },
  'department': { phonetic: '/dɪˈpɑːtmənt/', partOfSpeech: 'noun', primary: 'phòng ban', meaning: 'phòng ban; bộ phận; khoa (bệnh viện / trường học)', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['phòng ban', 'bộ phận', 'khoa viện'] }] },
  'engine': { phonetic: '/ˈendʒɪn/', partOfSpeech: 'noun', primary: 'động cơ', meaning: 'động cơ; máy móc; cơ giới; phương tiện', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['động cơ', 'máy móc', 'đầu máy xe lửa'] }] },
  'public': { phonetic: '/ˈpʌblɪk/', partOfSpeech: 'adjective', primary: 'công cộng', meaning: 'công cộng; công chúng; công khai', senses: [{ pos: 'adjective', posVi: 'Tính từ', meanings: ['công cộng', 'công khai', 'chung'] }, { pos: 'noun', posVi: 'Danh từ', meanings: ['công chúng', 'quần chúng'] }] },
  'health': { phonetic: '/helθ/', partOfSpeech: 'noun', primary: 'sức khỏe', meaning: 'sức khỏe; thể trạng; ngành y tế', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['sức khỏe', 'thể chất', 'ngành y tế'] }] },
  'merger': { phonetic: '/ˈmɜːdʒə(r)/', partOfSpeech: 'noun', primary: 'sáp nhập', meaning: 'sự sáp nhập doanh nghiệp; sự hòa nhập', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['sự sáp nhập', 'sự hợp nhất doanh nghiệp'] }] },
  'agreement': { phonetic: '/əˈɡriːmənt/', partOfSpeech: 'noun', primary: 'thỏa thuận', meaning: 'thỏa thuận; hợp đồng; sự đồng ý; hiệp ước', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['thỏa thuận', 'hợp đồng', 'sự nhất trí', 'hiệp ước'] }] },
  'corporate': { phonetic: '/ˈkɔːpərət/', partOfSpeech: 'adjective', primary: 'doanh nghiệp', meaning: 'thuộc công ty, doanh nghiệp; đoàn thể; tập đoàn', senses: [{ pos: 'adjective', posVi: 'Tính từ', meanings: ['thuộc doanh nghiệp', 'tập đoàn', 'công ty'] }] },
  'legal': { phonetic: '/ˈliːɡl/', partOfSpeech: 'adjective', primary: 'hợp pháp', meaning: 'hợp pháp; theo pháp luật; mang tính pháp lý', senses: [{ pos: 'adjective', posVi: 'Tính từ', meanings: ['hợp pháp', 'pháp lý', 'theo luật định'] }] },
  'budget': { phonetic: '/ˈbʌdʒɪt/', partOfSpeech: 'noun', primary: 'ngân sách', meaning: 'ngân sách; kinh phí; quỹ chi tiêu', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['ngân sách', 'kinh phí dự trù', 'quỹ tiền'] }] },
  'peculiar': { phonetic: '/pɪˈkjuːliə(r)/', partOfSpeech: 'adjective', primary: 'kỳ lạ, đặc biệt', meaning: 'kỳ lạ; khác thường; riêng biệt; đặc trưng', senses: [{ pos: 'adjective', posVi: 'Tính từ', meanings: ['kỳ lạ', 'khác thường', 'đặc thù', 'riêng biệt'] }] },
  'young': { phonetic: '/jʌŋ/', partOfSpeech: 'adjective', primary: 'trẻ tuổi', meaning: 'trẻ tuổi; trẻ trung; non nớt; thời thanh xuân', senses: [{ pos: 'adjective', posVi: 'Tính từ', meanings: ['trẻ tuổi', 'trẻ trung', 'thiếu niên'] }] },
  'passenger': { phonetic: '/ˈpæsɪndʒə(r)/', partOfSpeech: 'noun', primary: 'hành khách', meaning: 'hành khách; người đi tàu xe / máy bay', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['hành khách', 'khách đi tàu xe'] }] },
  'airport': { phonetic: '/ˈeəpɔːt/', partOfSpeech: 'noun', primary: 'sân bay', meaning: 'sân bay; phi trường', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['sân bay', 'phi trường'] }] },
  'flight': { phonetic: '/flaɪt/', partOfSpeech: 'noun', primary: 'chuyến bay', meaning: 'chuyến bay; sự bay lượn', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['chuyến bay', 'hành trình bay'] }] },
  'delay': { phonetic: '/dɪˈleɪ/', partOfSpeech: 'verb', primary: 'trì hoãn', meaning: 'trì hoãn; làm chậm trễ; sự hoãn lại', senses: [{ pos: 'verb', posVi: 'Động từ', meanings: ['trì hoãn', 'hoãn lại', 'kéo dài thời gian'] }, { pos: 'noun', posVi: 'Danh từ', meanings: ['sự chậm trễ', 'khoảng thời gian hoãn'] }] },
  'customer': { phonetic: '/ˈkʌstəmə(r)/', partOfSpeech: 'noun', primary: 'khách hàng', meaning: 'khách hàng; người mua hàng; thân chủ', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['khách hàng', 'người mua sắm', 'thân chủ'] }] },
  'service': { phonetic: '/ˈsɜːvɪs/', partOfSpeech: 'noun', primary: 'dịch vụ', meaning: 'dịch vụ; sự phục vụ; sự bảo dưỡng', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['dịch vụ', 'sự phục vụ', 'chế độ bảo dưỡng'] }] },
  'manager': { phonetic: '/ˈmænɪdʒə(r)/', partOfSpeech: 'noun', primary: 'người quản lý', meaning: 'người quản lý; trưởng phòng; giám đốc điều hành', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['người quản lý', 'trưởng bộ phận', 'giám đốc'] }] },
  'director': { phonetic: '/dəˈrektə(r)/', partOfSpeech: 'noun', primary: 'giám đốc', meaning: 'giám đốc; đạo diễn; người điều hành', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['giám đốc', 'thành viên hội đồng quản trị', 'đạo diễn'] }] },
  'schedule': { phonetic: '/ˈʃedjuːl/', partOfSpeech: 'noun', primary: 'lịch trình', meaning: 'lịch trình; thời gian biểu; lên kế hoạch', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['lịch trình', 'thời gian biểu', 'tiến độ'] }, { pos: 'verb', posVi: 'Động từ', meanings: ['lên lịch', 'sắp xếp thời gian'] }] },
  'meeting': { phonetic: '/ˈmiːtɪŋ/', partOfSpeech: 'noun', primary: 'cuộc họp', meaning: 'cuộc họp; buổi gặp mặt; hội nghị', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['cuộc họp', 'buổi thảo luận', 'cuộc gặp gỡ'] }] },
  'report': { phonetic: '/rɪˈpɔːt/', partOfSpeech: 'noun', primary: 'báo cáo', meaning: 'báo cáo; bản tin; trình bày thông tin', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['báo cáo', 'bản tin', 'biên bản'] }, { pos: 'verb', posVi: 'Động từ', meanings: ['báo cáo', 'tường thuật'] }] },
  'discount': { phonetic: '/ˈdɪskaʊnt/', partOfSpeech: 'noun', primary: 'giảm giá', meaning: 'giảm giá; chiết khấu; khấu trừ', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['giảm giá', 'mức chiết khấu'] }, { pos: 'verb', posVi: 'Động từ', meanings: ['chiết khấu', 'hạ giá'] }] },
  'refund': { phonetic: '/ˈriːfʌnd/', partOfSpeech: 'noun', primary: 'tiền hoàn lại', meaning: 'hoàn tiền; trả lại tiền; khoản tiền hoàn lại', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['tiền hoàn lại', 'khoản hoàn trả'] }, { pos: 'verb', posVi: 'Động từ', meanings: ['hoàn tiền', 'trả lại chi phí'] }] },
  'purchase': { phonetic: '/ˈpɜːtʃəs/', partOfSpeech: 'verb', primary: 'mua sắm', meaning: 'mua sắm; đơn mua hàng; tậu được', senses: [{ pos: 'verb', posVi: 'Động từ', meanings: ['mua', 'mua sắm', 'tậu'] }, { pos: 'noun', posVi: 'Danh từ', meanings: ['đơn hàng đã mua', 'việc mua sắm'] }] },
  'delivery': { phonetic: '/dɪˈlɪvəri/', partOfSpeech: 'noun', primary: 'giao hàng', meaning: 'giao hàng; sự phân phát; chuyến phát hàng', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['sự giao hàng', 'chuyến phát', 'sự chuyển giao'] }] },
  'order': { phonetic: '/ˈɔːdə(r)/', partOfSpeech: 'noun', primary: 'đơn hàng', meaning: 'đơn đặt hàng; mệnh lệnh; trật tự; gọi món', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['đơn đặt hàng', 'thứ tự', 'mệnh lệnh'] }, { pos: 'verb', posVi: 'Động từ', meanings: ['đặt hàng', 'gọi món', 'yêu cầu'] }] },
  'safety': { phonetic: '/ˈseɪfti/', partOfSpeech: 'noun', primary: 'sự an toàn', meaning: 'sự an toàn; nơi an toàn; thiết bị bảo hộ', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['sự an toàn', 'tính an toàn', 'biện pháp bảo hộ'] }] },
  'emergency': { phonetic: '/iˈmɜːdʒənsi/', partOfSpeech: 'noun', primary: 'khẩn cấp', meaning: 'tình trạng khẩn cấp; sự cố bất ngờ; ca cấp cứu', senses: [{ pos: 'noun', posVi: 'Danh từ', meanings: ['tình trạng khẩn cấp', 'sự cố bất ngờ', 'việc cấp bách'] }] }
};

class AppRouter {
  constructor() {
    this.currentRoute = 'home';
    this.searchQuery = '';
    this.activeFilter = 'all'; // all | new | learning | mastered | starred
    this.init();
  }

  init() {
    this.applyTheme(window.appStorage.settings.theme);
    this.setupEventListeners();
    this.navigate('home');

    // Tự động kiểm tra đồng bộ khi vừa khởi chạy app nếu đã cấu hình
    setTimeout(() => {
      const settings = window.appStorage.settings;
      if (settings.autoSync && settings.scriptUrl) {
        window.appSync.sync({ silent: true });
      }
    }, 1500);
  }

  setupEventListeners() {
    // Lắng nghe sự kiện đồng bộ
    window.addEventListener('sync:started', () => {
      this.updateSyncBadge(true);
    });

    window.addEventListener('sync:success', (e) => {
      this.updateSyncBadge(false);
      const detail = e.detail;
      if (detail.addedCount > 0) {
        this.showToast(`🎉 Đã cập nhật ${detail.addedCount} từ mới từ Google Docs!`, 'success');
      } else if (!detail.silent) {
        this.showToast(`✅ Đã đồng bộ tài liệu (${detail.total} từ)`, 'info');
      }
      if (this.currentRoute === 'home') {
        this.renderWordList();
      }
    });

    window.addEventListener('sync:error', (e) => {
      this.updateSyncBadge(false);
      if (!e.detail?.silent) {
        this.showToast(e.detail?.message || 'Lỗi khi đồng bộ Google Docs', 'error');
      }
    });

    window.addEventListener('vocab:updated', () => {
      if (this.currentRoute === 'home') {
        this.renderWordList();
      }
      this.updateStatsBar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeOxfordModal();
        this.closeAddWordModal();
        this.closeWordLookupModal();
      }
    });

    const oxfordModal = document.getElementById('modal-oxford-dict');
    if (oxfordModal) {
      oxfordModal.addEventListener('click', (e) => {
        if (e.target === oxfordModal) {
          this.closeOxfordModal();
        }
      });
    }

    const lookupModal = document.getElementById('modal-word-lookup');
    if (lookupModal) {
      lookupModal.addEventListener('click', (e) => {
        if (e.target === lookupModal) {
          this.closeWordLookupModal();
        }
      });
    }
  }

  navigate(route) {
    this.currentRoute = route;

    // Cập nhật trạng thái active trên thanh bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.route === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Ẩn/hiện container
    const homeView = document.getElementById('view-home');
    const modeView = document.getElementById('view-mode');
    const settingsView = document.getElementById('view-settings');
    const modeTitle = document.getElementById('mode-header-title');

    homeView.classList.add('hidden');
    modeView.classList.add('hidden');
    settingsView.classList.add('hidden');

    const words = window.appStorage.words;

    switch (route) {
      case 'home':
        homeView.classList.remove('hidden');
        this.renderWordList();
        this.updateStatsBar();
        break;

      case 'flashcard':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Thẻ ghi nhớ (Flashcard)';
        window.flashcardCtrl.init(this.getFilteredStudyWords());
        break;

      case 'quiz':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Trắc nghiệm & Ngữ cảnh';
        window.quizCtrl.init(this.getFilteredStudyWords(), 10);
        break;

      case 'match':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Ghép thẻ siêu tốc';
        window.matchCtrl.init(this.getFilteredStudyWords());
        break;

      case 'listening':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Luyện nghe & Chính tả';
        window.listeningCtrl.init(this.getFilteredStudyWords());
        break;

      case 'settings':
        settingsView.classList.remove('hidden');
        this.renderSettings();
        break;
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getFilteredStudyWords() {
    let pool = [...window.appStorage.words];
    if (this.activeFilter === 'new') {
      pool = pool.filter(w => w.isNew);
    } else if (this.activeFilter === 'starred') {
      pool = pool.filter(w => w.isStarred);
    } else if (this.activeFilter === 'learning') {
      pool = pool.filter(w => !w.isMastered);
    }
    // Nếu bộ lọc làm rỗng, fallback về toàn bộ danh sách
    return pool.length > 0 ? pool : window.appStorage.words;
  }

  updateStatsBar() {
    const words = window.appStorage.words;
    const total = words.length;
    const mastered = words.filter(w => w.isMastered).length;
    const learning = total - mastered;
    const newCount = words.filter(w => w.isNew).length;

    const elTotal = document.getElementById('stat-total-words');
    const elMastered = document.getElementById('stat-mastered-words');
    const elLearning = document.getElementById('stat-learning-words');
    const elNew = document.getElementById('stat-new-words');

    if (elTotal) elTotal.innerText = total;
    if (elMastered) elMastered.innerText = mastered;
    if (elLearning) elLearning.innerText = learning;
    if (elNew) {
      elNew.innerText = newCount;
      elNew.parentElement.classList.toggle('hidden', newCount === 0);
    }
  }

  setFilter(filter) {
    this.activeFilter = filter;
    const filterButtons = document.querySelectorAll('.filter-chip');
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('bg-[#4255FF]', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'dark:bg-[#1A1D36]', 'text-[#586380]', 'dark:text-[#939BB4]');
      } else {
        btn.classList.remove('bg-[#4255FF]', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'dark:bg-[#1A1D36]', 'text-[#586380]', 'dark:text-[#939BB4]');
      }
    });
    this.renderWordList();
  }

  handleSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderWordList();
  }

  renderWordList() {
    const listContainer = document.getElementById('word-list-items');
    if (!listContainer) return;

    // Chỉ lấy các từ hợp lệ (không rỗng)
    let words = window.appStorage.words.filter(w => w && w.word && w.word.trim().length >= 2);

    // Áp dụng bộ lọc
    if (this.activeFilter === 'new') {
      words = words.filter(w => w.isNew);
    } else if (this.activeFilter === 'learning') {
      words = words.filter(w => !w.isMastered);
    } else if (this.activeFilter === 'mastered') {
      words = words.filter(w => w.isMastered);
    } else if (this.activeFilter === 'starred') {
      words = words.filter(w => w.isStarred);
    }

    // Áp dụng tìm kiếm
    if (this.searchQuery) {
      words = words.filter(w => 
        w.word.toLowerCase().includes(this.searchQuery) ||
        (w.meaning && w.meaning.toLowerCase().includes(this.searchQuery)) ||
        (w.definition && w.definition.toLowerCase().includes(this.searchQuery))
      );
    }

    const countBadge = document.getElementById('word-count-badge');
    if (countBadge) countBadge.innerText = `${words.length} từ`;

    if (words.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 px-4 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E]">
          <p class="text-sm font-medium text-[#586380] dark:text-[#939BB4]">Không tìm thấy từ vựng nào phù hợp.</p>
          <button onclick="window.appRouter.setFilter('all'); document.getElementById('search-input').value = ''; window.appRouter.handleSearch('')" class="mt-2 text-xs font-bold text-[#4255FF] hover:underline">
            Xoá bộ lọc tìm kiếm
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = words.map((w, idx) => `
      <div onclick="window.appRouter.openOxfordModal('${w.id}')" class="p-3.5 sm:p-4 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#4255FF] dark:hover:border-[#4255FF] shadow-sm hover:shadow transition-all cursor-pointer group flex flex-col justify-between">
        <div>
          <!-- Header hàng 1: Số thứ tự, Từ tiếng Anh, Phát âm, Loại từ & Nút tiện ích -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#222646]">#${w.docId ? w.docId : String(idx + 1).padStart(3, '0')}</span>
              <span class="text-base sm:text-lg font-extrabold text-[#2E3856] dark:text-white tracking-tight group-hover:text-[#4255FF] transition-colors truncate">${w.word}</span>
              ${w.phonetic ? `<span class="text-xs font-mono text-[#4255FF] dark:text-[#7383FF] font-semibold">${w.phonetic}</span>` : ''}
              ${w.partOfSpeech ? `<span class="text-[11px] text-[#586380] dark:text-[#939BB4] font-medium">(${w.partOfSpeech})</span>` : ''}
              ${w.isNew ? `<span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">MỚI</span>` : ''}
            </div>

            <!-- Nút tiện ích bên phải -->
            <div class="flex items-center gap-0.5 flex-shrink-0" onclick="event.stopPropagation()">
              <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { audioUrl: '${w.audioUrl || ''}' })" class="p-1.5 text-slate-400 hover:text-[#4255FF] hover:bg-slate-100 dark:hover:bg-[#252945] rounded-lg transition-colors" title="Phát âm">
                <i data-lucide="volume-2" class="w-4 h-4"></i>
              </button>
              <button onclick="window.appStorage.toggleStar('${w.id}')" class="p-1.5 ${w.isStarred ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'} rounded-lg transition-colors" title="Đánh dấu sao">
                <i data-lucide="star" class="w-4 h-4 ${w.isStarred ? 'fill-amber-500' : ''}"></i>
              </button>
              <button onclick="window.appRouter.showWordOptions('${w.id}')" class="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors" title="Tùy chọn">
                <i data-lucide="more-vertical" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Nghĩa tiếng Việt & Ghi chú -->
          <p class="text-sm sm:text-base font-bold text-[#2E3856] dark:text-[#F6F7FB] mt-1.5">${w.meaning}</p>
          ${w.notes ? `<div class="mt-1 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/70 dark:border-amber-900/40 inline-flex items-center gap-1.5 font-medium"><i data-lucide="info" class="w-3 h-3 flex-shrink-0 text-amber-600 dark:text-amber-400"></i><span>${this.escapeHtml(w.notes)}</span></div>` : ''}
          ${w.definition ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2 leading-relaxed">${w.definition}</p>` : ''}
        </div>

        <!-- Khung ví dụ ngữ cảnh Oxford thanh lịch -->
        ${w.example ? `
          <div class="mt-2.5 p-2.5 sm:p-3 bg-slate-50/90 dark:bg-[#202540] rounded-xl border border-slate-200/70 dark:border-slate-700/60">
            <div class="flex items-center justify-between text-[11px] font-bold text-[#4255FF] dark:text-[#7383FF] mb-1">
              <span class="inline-flex items-center gap-1">
                <i data-lucide="book-open" class="w-3 h-3"></i>
                <span>Ngữ cảnh Oxford</span>
              </span>
              <button type="button" onclick="event.stopPropagation(); window.appAudio.speak('${this.escapeHtml(w.example)}')" class="hover:text-[#3644D9] p-0.5 text-slate-400 hover:text-[#4255FF] transition-colors" title="Nghe câu ví dụ">
                <i data-lucide="volume-1" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
              "${this.highlightTargetWord(w.example, w.word)}"
            </p>
            ${w.exampleVi ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${w.exampleVi}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  resetAllData() {
    if (confirm('Khôi phục danh sách từ vựng sạch chuẩn từ Google Docs?')) {
      const count = window.appStorage.resetToCleanDefault();
      this.showToast(`✅ Đã làm sạch và khôi phục ${count} từ vựng chuẩn!`, 'success');
      this.renderWordList();
      this.updateStatsBar();
    }
  }

  clearAllNew() {
    window.appStorage.clearAllNewBadges();
    this.showToast('✅ Đã đánh dấu tất cả từ vựng là từ cũ đã xem!', 'info');
    this.renderWordList();
    this.updateStatsBar();
  }

  showWordOptions(wordId) {
    const word = window.appStorage.words.find(w => w.id === wordId);
    if (!word) return;

    if (confirm(`Bạn có muốn xóa từ "${word.word}" khỏi danh sách học không?`)) {
      window.appStorage.deleteWord(wordId);
      this.showToast(`Đã xóa từ "${word.word}"`, 'info');
      this.renderWordList();
    }
  }

  renderSettings() {
    const s = window.appStorage.settings;
    const inputScript = document.getElementById('setting-script-url');
    const inputDocId = document.getElementById('setting-doc-id');
    const inputInterval = document.getElementById('setting-sync-interval');
    const toggleAutoSync = document.getElementById('setting-auto-sync');
    const inputApiKey = document.getElementById('setting-gemini-key');
    const selectAccent = document.getElementById('setting-accent');
    const selectTheme = document.getElementById('setting-theme');

    if (inputScript) inputScript.value = s.scriptUrl || '';
    if (inputDocId) inputDocId.value = s.docId || '';
    if (inputInterval) inputInterval.value = s.autoSyncInterval || 10;
    if (toggleAutoSync) toggleAutoSync.checked = s.autoSync !== false;
    if (inputApiKey) inputApiKey.value = s.geminiApiKey || '';
    if (selectAccent) selectAccent.value = s.speechAccent || 'en-US';
    if (selectTheme) selectTheme.value = s.theme || 'light';
  }

  saveSettingsFromForm() {
    const inputScript = document.getElementById('setting-script-url');
    const inputDocId = document.getElementById('setting-doc-id');
    const inputInterval = document.getElementById('setting-sync-interval');
    const toggleAutoSync = document.getElementById('setting-auto-sync');
    const inputApiKey = document.getElementById('setting-gemini-key');
    const selectAccent = document.getElementById('setting-accent');
    const selectTheme = document.getElementById('setting-theme');

    const newSettings = {
      scriptUrl: inputScript ? inputScript.value.trim() : '',
      docId: inputDocId ? inputDocId.value.trim() : '',
      autoSyncInterval: inputInterval ? parseInt(inputInterval.value) || 10 : 10,
      autoSync: toggleAutoSync ? toggleAutoSync.checked : true,
      geminiApiKey: inputApiKey ? inputApiKey.value.trim() : '',
      speechAccent: selectAccent ? selectAccent.value : 'en-US',
      theme: selectTheme ? selectTheme.value : 'light'
    };

    window.appStorage.saveSettings(newSettings);
    this.applyTheme(newSettings.theme);
    window.appSync.startPeriodicSync();
    this.showToast('✅ Đã lưu cài đặt thành công!', 'success');
  }

  applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    window.appStorage.saveSettings({ theme: newTheme });
    this.applyTheme(newTheme);
    this.showToast(newTheme === 'dark' ? '🌙 Chế độ Tối (Dark mode)' : '☀️ Chế độ Sáng (Light mode)', 'info');
  }

  updateSyncBadge(isSyncing) {
    const syncBtn = document.getElementById('btn-header-sync');
    const syncIcon = document.getElementById('sync-icon');
    if (syncIcon) {
      if (isSyncing) {
        syncIcon.classList.add('animate-spin');
      } else {
        syncIcon.classList.remove('animate-spin');
      }
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colorClasses = type === 'success' 
      ? 'bg-[#23B26D] text-white shadow-emerald-500/20' 
      : type === 'error' 
      ? 'bg-[#FF725B] text-white shadow-rose-500/20' 
      : 'bg-[#2E3856] dark:bg-[#1A1D36] text-white border border-slate-700/60 shadow-xl';

    toast.className = `p-3 px-4 rounded-2xl shadow-xl text-xs md:text-sm font-semibold flex items-center gap-2.5 transform transition-all duration-300 translate-y-2 opacity-0 ${colorClasses}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info'}" class="w-4 h-4 flex-shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  openAddWordModal() {
    const modal = document.getElementById('modal-add-word');
    if (modal) modal.classList.remove('hidden');
  }

  closeAddWordModal() {
    const modal = document.getElementById('modal-add-word');
    if (modal) modal.classList.add('hidden');
  }

  async handleAddWordForm(e) {
    e.preventDefault();
    const wordInput = document.getElementById('add-word-input');
    const meaningInput = document.getElementById('add-meaning-input');
    const exampleInput = document.getElementById('add-example-input');

    const word = wordInput ? wordInput.value.trim() : '';
    if (!word) return;

    const meaning = meaningInput ? meaningInput.value.trim() : '';
    const example = exampleInput ? exampleInput.value.trim() : '';

    this.closeAddWordModal();
    this.showToast(`Đang thêm và tra cứu tự động cho "${word}"...`, 'info');

    // Thêm vào storage
    window.appStorage.addOrUpdateWords([{
      word,
      meaning: meaning || 'Đang cập nhật...',
      example: example || ''
    }]);

    // Làm giàu tự động qua AI / từ điển
    const enriched = await window.appEnricher.enrich({ word, meaning, example }, window.appStorage.settings.geminiApiKey);
    const updated = window.appStorage.words.map(w => w.word.toLowerCase() === word.toLowerCase() ? { ...w, ...enriched } : w);
    window.appStorage.saveWords(updated);

    this.showToast(`✨ Đã thêm thành công từ "${word}"!`, 'success');

    if (wordInput) wordInput.value = '';
    if (meaningInput) meaningInput.value = '';
    if (exampleInput) exampleInput.value = '';
  }

  openOxfordModal(wordIdOrWord) {
    if (!wordIdOrWord) return;
    let wordItem = null;
    if (typeof wordIdOrWord === 'object') {
      wordItem = wordIdOrWord;
    } else {
      wordItem = window.appStorage.words.find(w => w.id === wordIdOrWord || w.word.toLowerCase() === String(wordIdOrWord).toLowerCase().trim());
    }

    if (!wordItem) {
      wordItem = {
        id: 'ox-' + Date.now(),
        word: String(wordIdOrWord).trim(),
        meaning: 'Đang tra cứu từ điển...',
        definition: '',
        phonetic: '',
        partOfSpeech: '',
        example: '',
        exampleVi: '',
        oxfordExamples: [],
        collocations: []
      };
    }

    const modal = document.getElementById('modal-oxford-dict');
    if (modal) {
      modal.classList.remove('hidden');
      const searchInput = document.getElementById('oxford-modal-search');
      if (searchInput) searchInput.value = wordItem.word || '';
      this.renderOxfordModalContent(wordItem);

      // Tra cứu trực tiếp nếu từ này chưa có phát âm hoặc định nghĩa
      if (!wordItem.definition || !wordItem.phonetic) {
        this.fetchLiveOxfordData(wordItem.word);
      }
    }
  }

  closeOxfordModal() {
    const modal = document.getElementById('modal-oxford-dict');
    if (modal) modal.classList.add('hidden');
  }

  async searchInOxfordModal(query) {
    const q = (query || '').trim();
    if (!q) return;
    const found = window.appStorage.words.find(w => w.word.toLowerCase() === q.toLowerCase());
    if (found) {
      this.renderOxfordModalContent(found);
    } else {
      this.openOxfordModal(q);
    }
  }

  async fetchLiveOxfordData(word) {
    try {
      const live = await window.appEnricher.fetchFreeDictionary(word);
      if (live) {
        let currentItem = window.appStorage.words.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (currentItem) {
          if (!currentItem.phonetic && live.phonetic) currentItem.phonetic = live.phonetic;
          if (!currentItem.definition && live.definition) currentItem.definition = live.definition;
          if (!currentItem.partOfSpeech && live.partOfSpeech) currentItem.partOfSpeech = live.partOfSpeech;
          if (live.example && (!currentItem.oxfordExamples || currentItem.oxfordExamples.length === 0)) {
            currentItem.oxfordExamples = [{ en: live.example, vi: '' }];
          }
          window.appStorage.saveWords(window.appStorage.words);
          this.renderOxfordModalContent(currentItem);
        } else {
          const tempItem = {
            id: 'temp-' + Date.now(),
            word: word,
            meaning: live.definition ? 'Tra cứu từ điển' : 'Đang cập nhật...',
            definition: live.definition || '',
            phonetic: live.phonetic || '',
            partOfSpeech: live.partOfSpeech || '',
            example: live.example || '',
            exampleVi: '',
            oxfordExamples: live.example ? [{ en: live.example, vi: '' }] : [],
            collocations: []
          };
          this.renderOxfordModalContent(tempItem);
        }
      }
    } catch (e) {}
  }

  renderOxfordModalContent(w) {
    const body = document.getElementById('oxford-modal-body');
    if (!body) return;

    const examples = [];
    if (Array.isArray(w.oxfordExamples) && w.oxfordExamples.length > 0) {
      examples.push(...w.oxfordExamples);
    } else if (w.example) {
      examples.push({ en: w.example, vi: w.exampleVi || '' });
    }

    body.innerHTML = `
      <!-- Hero: Word & Pronunciation -->
      <div class="p-4 bg-slate-50 dark:bg-[#252945] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E]">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <h2 class="text-2xl md:text-3xl font-black text-[#2E3856] dark:text-white tracking-tight">${w.word}</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 dark:bg-blue-950 text-[#4255FF] border border-blue-200 dark:border-blue-900/60">
                ${w.partOfSpeech || 'từ vựng'}
              </span>
            </div>
            <p class="text-xs text-[#586380] dark:text-[#939BB4] font-medium">Nguồn: ${w.dictSource || "Oxford Advanced Learner's Dictionary"}</p>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="window.appRouter.toggleStarInModal('${w.id}')" class="p-2 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] ${w.isStarred ? 'text-[#FFCD1F]' : 'text-slate-400'}" title="Đánh dấu sao">
              <i data-lucide="star" class="w-4 h-4 ${w.isStarred ? 'fill-[#FFCD1F]' : ''}"></i>
            </button>
            <button onclick="window.appRouter.toggleMasteredInModal('${w.id}')" class="p-2 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] ${w.isMastered ? 'text-[#23B26D]' : 'text-slate-400'}" title="Đã thuộc">
              <i data-lucide="check-circle" class="w-4 h-4 ${w.isMastered ? 'fill-[#23B26D] text-white' : ''}"></i>
            </button>
          </div>
        </div>

        <!-- Phát âm UK & US chuẩn Oxford -->
        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { accent: 'en-GB', audioUrl: '${w.audioUrl || ''}' })" class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#4255FF] text-xs font-bold text-[#2E3856] dark:text-white inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
            <i data-lucide="volume-2" class="w-3.5 h-3.5 text-[#4255FF]"></i>
            <span class="text-[#4255FF]">UK</span>
            <span class="font-mono text-slate-500 dark:text-slate-400">${w.phonetic || ''}</span>
          </button>

          <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { accent: 'en-US' })" class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#23B26D] text-xs font-bold text-[#2E3856] dark:text-white inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
            <i data-lucide="volume-2" class="w-3.5 h-3.5 text-[#23B26D]"></i>
            <span class="text-[#23B26D]">US</span>
            <span class="font-mono text-slate-500 dark:text-slate-400">${w.phonetic || ''}</span>
          </button>
        </div>
      </div>

      <!-- Nghĩa Tiếng Việt -->
      <div class="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
        <div class="text-[11px] font-bold uppercase tracking-wider text-[#4255FF] mb-1">Nghĩa tiếng Việt</div>
        <p class="text-base font-bold text-[#2E3856] dark:text-white">${w.meaning}</p>
      </div>

      <!-- Ghi chú sử dụng (Note / Usage từ Google Docs) -->
      ${w.notes ? `
        <div class="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl">
          <div class="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
            <i data-lucide="info" class="w-3.5 h-3.5"></i>
            <span>Ghi chú sử dụng (Note / Usage)</span>
          </div>
          <p class="text-xs md:text-sm font-semibold text-amber-900 dark:text-amber-100">${this.escapeHtml(w.notes)}</p>
        </div>
      ` : ''}

      <!-- Định nghĩa Anh - Anh chuẩn Oxford -->
      ${w.definition ? `
        <div class="p-4 bg-slate-50 dark:bg-[#252945] border border-[#E5E8EF] dark:border-[#282E4E] rounded-2xl">
          <div class="text-[11px] font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-1">Định nghĩa Oxford (English)</div>
          <p class="text-xs md:text-sm font-medium text-[#2E3856] dark:text-slate-200 leading-relaxed font-sans">${w.definition}</p>
        </div>
      ` : ''}

      <!-- Ví dụ ngữ cảnh Oxford (Context Examples) -->
      ${examples.length > 0 ? `
        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] px-1">
            Ví dụ ngữ cảnh thực tế (${examples.length} câu)
          </div>
          <div class="space-y-2">
            ${examples.map(ex => `
              <div class="p-3.5 bg-slate-50 dark:bg-[#252945] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] space-y-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-xs md:text-sm font-semibold text-[#2E3856] dark:text-white leading-relaxed">
                    "${this.highlightTargetWord(ex.en, w.word)}"
                  </p>
                  <button type="button" onclick="window.appAudio.speak('${this.escapeHtml(ex.en)}')" class="p-1.5 rounded-lg hover:bg-[#4255FF]/10 text-[#4255FF] flex-shrink-0 transition-colors" title="Nghe câu này">
                    <i data-lucide="volume-2" class="w-4 h-4"></i>
                  </button>
                </div>
                ${ex.vi ? `<p class="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 italic">${ex.vi}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Cụm từ & Cấu trúc đi kèm (Collocations) -->
      ${Array.isArray(w.collocations) && w.collocations.length > 0 ? `
        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] px-1">
            Cụm từ & Cấu trúc đi kèm (Oxford Collocations)
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${w.collocations.map(c => `
              <span class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#252945] text-xs font-semibold text-[#2E3856] dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                ${c}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Nút thao tác nhanh -->
      <div class="pt-2 grid grid-cols-2 gap-2">
        <button onclick="window.appRouter.closeOxfordModal(); window.appRouter.startFlashcardWithWord('${w.id}')" class="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] text-xs font-bold text-[#2E3856] dark:text-white flex items-center justify-center gap-1.5 transition-colors">
          <i data-lucide="layers" class="w-4 h-4 text-[#4255FF]"></i>
          <span>Học Thẻ nhớ</span>
        </button>
        <button onclick="window.appRouter.closeOxfordModal(); window.appRouter.navigate('quiz')" class="py-2.5 px-3 rounded-xl bg-[#4255FF] hover:bg-[#3644D9] text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md transition-colors">
          <i data-lucide="help-circle" class="w-4 h-4"></i>
          <span>Làm Trắc nghiệm</span>
        </button>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  highlightTargetWord(sentence, target) {
    if (!sentence || !target) return sentence || '';
    const clean = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${clean})\\b`, 'gi');
    return sentence.replace(regex, `<span class="text-[#4255FF] font-bold underline underline-offset-2">$1</span>`);
  }

  translatePos(pos) {
    if (!pos) return 'Từ vựng';
    const p = String(pos).toLowerCase();
    if (p.includes('noun')) return 'Danh từ';
    if (p.includes('verb')) return 'Động từ';
    if (p.includes('adjective') || p === 'adj') return 'Tính từ';
    if (p.includes('adverb') || p === 'adv') return 'Phó từ';
    if (p.includes('preposition') || p === 'prep') return 'Giới từ';
    if (p.includes('conjunction') || p === 'conj') return 'Liên từ';
    if (p.includes('pronoun') || p === 'pron') return 'Đại từ';
    if (p.includes('phrase')) return 'Cụm từ';
    return pos;
  }

  /**
   * Tra cứu từ trong ngữ cảnh SIÊU TỐC (<10ms) & Hiển thị ĐẦY ĐỦ TẤT CẢ CÁC NGHĨA
   */
  async lookupContextWord(rawWord, contextSentence) {
    if (!rawWord) return;
    const cleanWord = String(rawWord).trim().replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
    if (cleanWord.length < 2) return;

    const modal = document.getElementById('modal-word-lookup');
    const wordTitle = document.getElementById('lookup-modal-word');
    const bodyEl = document.getElementById('lookup-modal-body');
    const footerEl = document.getElementById('lookup-modal-footer');
    const speakBtn = document.getElementById('lookup-modal-speak-btn');

    if (!modal || !wordTitle || !bodyEl || !footerEl) return;

    wordTitle.innerText = cleanWord;
    if (speakBtn) speakBtn.onclick = () => window.appAudio.speak(cleanWord);
    modal.classList.remove('hidden');

    const cleanLower = cleanWord.toLowerCase();

    // 1. Kiểm tra kho từ vựng hiện tại (0ms)
    const existing = (window.appStorage.words || []).find(w => w && w.word && w.word.toLowerCase() === cleanLower);
    if (existing) {
      this.currentLookup = {
        word: cleanWord,
        phonetic: existing.phonetic || '',
        partOfSpeech: existing.partOfSpeech || '',
        primary: existing.meaning || '',
        meaning: existing.meaning || '',
        senses: existing.collocations ? [{ pos: existing.partOfSpeech || 'noun', posVi: this.translatePos(existing.partOfSpeech), meanings: [existing.meaning] }] : [],
        definition: existing.definition || '',
        example: contextSentence || existing.example || '',
        contextSentence: contextSentence,
        docId: existing.docId || '',
        isExisting: true
      };
      this.renderLookupModalContent(this.currentLookup, true);
      return;
    }

    // 2. Kiểm tra từ điển ngoại tuyến tích hợp sẵn (0ms siêu tốc, đầy đủ tất cả nghĩa)
    if (window.OFFLINE_DICT && window.OFFLINE_DICT[cleanLower]) {
      const off = window.OFFLINE_DICT[cleanLower];
      this.currentLookup = {
        word: cleanWord,
        phonetic: off.phonetic || '',
        partOfSpeech: off.partOfSpeech || 'noun',
        primary: off.primary || off.meaning,
        meaning: off.meaning || off.primary,
        senses: off.senses || [],
        definition: off.definition || '',
        example: contextSentence,
        contextSentence: contextSentence,
        isExisting: false
      };
      this.renderLookupModalContent(this.currentLookup, false);
      return;
    }

    // 3. Kiểm tra bộ nhớ cache cục bộ (localStorage cache) (0ms)
    let cachedData = null;
    try {
      const cachedStr = localStorage.getItem('docvocab_dict_' + cleanLower);
      if (cachedStr) {
        cachedData = JSON.parse(cachedStr);
      }
    } catch (e) {}

    if (cachedData) {
      this.currentLookup = {
        word: cleanWord,
        phonetic: cachedData.phonetic || '',
        partOfSpeech: cachedData.partOfSpeech || 'noun',
        primary: cachedData.primary || cachedData.meaning,
        meaning: cachedData.meaning || cachedData.primary,
        senses: cachedData.senses || [],
        definition: cachedData.definition || '',
        example: contextSentence,
        contextSentence: contextSentence,
        isExisting: false
      };
      this.renderLookupModalContent(this.currentLookup, false);
      return;
    }

    // 4. Render ngay lập tức trong <5ms trạng thái đang nạp nghĩa chuẩn
    this.currentLookup = {
      word: cleanWord,
      phonetic: '',
      partOfSpeech: 'từ vựng',
      primary: '',
      meaning: '',
      senses: [],
      definition: '',
      example: contextSentence,
      contextSentence: contextSentence,
      isExisting: false,
      isLoadingMeaning: true
    };
    this.renderLookupModalContent(this.currentLookup, false);

    // 5. Truy vấn toàn bộ các nghĩa qua Google Translate Dictionary API siêu tốc (<150ms)
    this.fetchWordDefinitionFast(cleanWord).then(enriched => {
      if (!enriched) return;

      if (this.currentLookup && this.currentLookup.word.toLowerCase() === cleanLower) {
        this.currentLookup.phonetic = enriched.phonetic || this.currentLookup.phonetic;
        this.currentLookup.partOfSpeech = enriched.partOfSpeech || this.currentLookup.partOfSpeech;
        this.currentLookup.primary = enriched.primary || this.currentLookup.primary;
        this.currentLookup.meaning = enriched.meaning || this.currentLookup.meaning;
        this.currentLookup.senses = enriched.senses || [];
        this.currentLookup.definition = enriched.definition || this.currentLookup.definition;
        this.currentLookup.isLoadingMeaning = false;

        this.renderLookupModalContent(this.currentLookup, false);
      }
    }).catch(() => {});
  }

  /**
   * Truy vấn Google Dictionary API siêu tốc: Lấy toàn bộ các nghĩa theo từng loại từ
   */
  async fetchWordDefinitionFast(word) {
    const clean = word.toLowerCase().trim();
    if (!clean) return null;

    let primary = '';
    let senses = [];
    let phonetic = '';
    let definition = '';

    if (window.OFFLINE_DICT && window.OFFLINE_DICT[clean]) {
      phonetic = window.OFFLINE_DICT[clean].phonetic || '';
      definition = window.OFFLINE_DICT[clean].definition || '';
    }

    // Gọi Google Translate Dictionary API (hỗ trợ dt=bd trả về toàn bộ các nét nghĩa)
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(clean)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data && data[0] && data[0][0]) {
          primary = data[0][0][0] || '';
        }
        if (Array.isArray(data[1])) {
          senses = data[1].map(item => ({
            pos: item[0] || 'noun',
            posVi: this.translatePos(item[0]),
            meanings: Array.isArray(item[1]) ? item[1] : []
          }));
        }
      }
    } catch (e) {}

    // Lấy thêm phát âm & định nghĩa nếu cần
    if (!phonetic || !definition) {
      try {
        const dController = new AbortController();
        const dTimeout = setTimeout(() => dController.abort(), 1200);
        const dResp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`, { signal: dController.signal });
        clearTimeout(dTimeout);
        if (dResp.ok) {
          const dictData = await dResp.json();
          if (Array.isArray(dictData) && dictData.length > 0) {
            const entry = dictData[0];
            if (!phonetic) {
              phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || '';
            }
            if (!definition && entry.meanings && entry.meanings[0]?.definitions[0]?.definition) {
              definition = entry.meanings[0].definitions[0].definition;
            }
          }
        }
      } catch (de) {}
    }

    // Tổng hợp tất cả các nghĩa thành danh sách rõ ràng
    let combinedMeanings = [];
    if (primary) combinedMeanings.push(primary);
    senses.forEach(s => {
      (s.meanings || []).forEach(m => {
        if (!combinedMeanings.includes(m)) combinedMeanings.push(m);
      });
    });

    const fullMeaningText = combinedMeanings.slice(0, 5).join('; ') || primary || clean;

    const result = {
      word: word,
      primary: primary || fullMeaningText,
      meaning: fullMeaningText,
      senses: senses,
      phonetic: phonetic,
      definition: definition,
      partOfSpeech: senses.length > 0 ? senses[0].pos : 'noun'
    };

    try {
      localStorage.setItem('docvocab_dict_' + clean, JSON.stringify(result));
    } catch (e) {}

    return result;
  }

  renderLookupModalContent(data, isExisting) {
    const bodyEl = document.getElementById('lookup-modal-body');
    const footerEl = document.getElementById('lookup-modal-footer');
    if (!bodyEl || !footerEl) return;

    const safeWord = this.escapeHtml(data.word);
    const safePhonetic = this.escapeHtml(data.phonetic);
    const safePos = this.escapeHtml(data.partOfSpeech);
    const safePrimary = this.escapeHtml(data.primary || data.meaning);
    const safeDef = this.escapeHtml(data.definition);
    const senses = Array.isArray(data.senses) ? data.senses : [];

    bodyEl.innerHTML = `
      <div class="space-y-3.5">
        <!-- Header từ: Từ, Phiên âm, Loại từ -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xl font-black text-[#2E3856] dark:text-white tracking-tight">${safeWord}</span>
          <span id="lookup-phonetic-badge" class="text-xs font-mono text-[#4255FF] dark:text-[#7383FF] font-semibold">${safePhonetic}</span>
          <span id="lookup-pos-badge" class="text-xs px-2 py-0.5 bg-slate-100 dark:bg-[#252945] text-[#586380] dark:text-[#939BB4] rounded-md font-bold">${safePos ? `(${this.translatePos(safePos)})` : ''}</span>
        </div>

        <!-- Khung nghĩa tiếng Việt chính và đầy đủ tất cả các nét nghĩa -->
        <div class="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/70 dark:border-blue-900/50">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#4255FF] dark:text-[#7383FF]">Nghĩa tiếng Việt</span>
            <span class="text-[10px] text-slate-400 font-medium">Toàn bộ các nét nghĩa</span>
          </div>

          ${data.isLoadingMeaning ? `
            <p id="lookup-meaning-text" class="text-xs text-[#4255FF] dark:text-[#7383FF] font-semibold flex items-center gap-1.5 py-1">
              <span class="w-3.5 h-3.5 border-2 border-[#4255FF] border-t-transparent rounded-full animate-spin"></span>
              <span>Đang tra cứu toàn bộ các nghĩa...</span>
            </p>
          ` : `
            <p id="lookup-meaning-text" class="text-base font-extrabold text-[#2E3856] dark:text-white leading-snug">${safePrimary}</p>
          `}

          <!-- Danh sách toàn bộ các nghĩa theo từng loại từ -->
          <div id="lookup-senses-container" class="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/60 space-y-2 ${senses.length > 0 ? '' : 'hidden'}">
            ${senses.map(s => `
              <div class="text-xs flex items-start gap-2">
                <span class="font-bold text-[#4255FF] dark:text-[#7383FF] uppercase text-[10px] tracking-wide px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 flex-shrink-0 mt-0.5">
                  ${this.escapeHtml(s.posVi || this.translatePos(s.pos))}
                </span>
                <span class="text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                  ${(s.meanings || []).map(m => this.escapeHtml(m)).join(' • ')}
                </span>
              </div>
            `).join('')}
          </div>

          <p id="lookup-def-text" class="text-xs text-slate-500 dark:text-slate-400 mt-2 italic border-t border-blue-100 dark:border-blue-900/40 pt-1.5 ${safeDef ? '' : 'hidden'}">${safeDef}</p>
        </div>

        <!-- Khung ngữ cảnh câu xuất hiện -->
        ${data.contextSentence ? `
          <div class="p-3 bg-slate-50 dark:bg-[#202540] rounded-xl border border-slate-200/70 dark:border-slate-700/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Ngữ cảnh xuất hiện</span>
            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
              "${this.highlightTargetWord(data.contextSentence, data.word)}"
            </p>
          </div>
        ` : ''}
      </div>
    `;

    if (isExisting) {
      footerEl.innerHTML = `
        <div class="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 text-[#23B26D] font-bold rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span>Đã có trong danh sách từ vựng (#${this.escapeHtml(data.docId || '')})</span>
        </div>
      `;
    } else {
      footerEl.innerHTML = `
        <button id="btn-add-lookup-word" onclick="window.appRouter.addWordFromLookup()" class="w-full py-3 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Thêm vào danh sách từ vựng & Google Docs</span>
        </button>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  async addWordFromLookup() {
    if (!this.currentLookup || !this.currentLookup.word) return;
    const btn = document.getElementById('btn-add-lookup-word');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Đang lưu...</span>`;
    }

    let maxId = 0;
    (window.appStorage.words || []).forEach(w => {
      const num = parseInt(w.docId || (w.id ? String(w.id).replace(/\D/g, '') : '0'), 10);
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextDocId = String(maxId + 1).padStart(3, '0');

    // Lấy toàn bộ các nghĩa đã được tra cứu
    const finalMeaning = this.currentLookup.meaning || this.currentLookup.primary || 'từ vựng bài tập';

    const newWord = {
      id: 'w-new-' + Date.now(),
      docId: nextDocId,
      word: this.currentLookup.word,
      phonetic: this.currentLookup.phonetic || '',
      partOfSpeech: this.currentLookup.partOfSpeech || 'noun',
      meaning: finalMeaning,
      notes: 'Thêm từ ngữ cảnh bài tập',
      definition: this.currentLookup.definition || '',
      example: this.currentLookup.contextSentence || this.currentLookup.example || '',
      exampleVi: '',
      dictSource: "Oxford Advanced Learner's Dictionary",
      audioUrl: '',
      isNew: true,
      isStarred: true,
      isMastered: false,
      dateAdded: Date.now(),
      tags: ['listening', 'new-from-quiz']
    };

    // 1. Lưu ngay vào local storage
    window.appStorage.addOrUpdateWords([newWord]);

    // 2. Tự động đồng bộ lên Google Docs
    window.appSync.addWordToGoogleDocs(newWord);

    // 3. Pháo hoa ăn mừng & Âm thanh
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    }
    window.appAudio.playCorrect();
    this.showToast(`🎉 Đã thêm từ "${newWord.word}" vào danh sách học & Google Docs!`, 'success');

    // 4. Cập nhật giao diện modal & danh sách
    if (btn) {
      btn.className = "w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 text-[#23B26D] font-bold rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2";
      btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> <span>Đã thêm thành công!</span>`;
      if (window.lucide) window.lucide.createIcons();
    }

    this.updateStatsBar();
    if (this.currentRoute === 'home') {
      this.renderWordList();
    }
  }

  toggleStarInModal(wordId) {
    window.appStorage.toggleStar(wordId);
    const item = window.appStorage.words.find(w => w.id === wordId);
    if (item) this.renderOxfordModalContent(item);
  }

  toggleMasteredInModal(wordId) {
    window.appStorage.toggleMastered(wordId);
    const item = window.appStorage.words.find(w => w.id === wordId);
    if (item) this.renderOxfordModalContent(item);
  }

  closeWordLookupModal() {
    const modal = document.getElementById('modal-word-lookup');
    if (modal) modal.classList.add('hidden');
  }

  startFlashcardWithWord(wordId) {
    const word = window.appStorage.words.find(w => w.id === wordId);
    if (!word) return;
    this.navigate('flashcard');
    if (window.flashcardCtrl && window.flashcardCtrl.deck) {
      const idx = window.flashcardCtrl.deck.findIndex(w => w.id === wordId);
      if (idx !== -1) {
        window.flashcardCtrl.currentIndex = idx;
        window.flashcardCtrl.render();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
});
