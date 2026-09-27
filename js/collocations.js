/**
 * COLLOCATION ENGINE (v1.0 - Nguồn chuẩn Longman Collocations Dictionary & LDOCE)
 * Tự động nhận diện cụm từ đi cùng nhau (Collocation) trong câu ngữ cảnh
 * Bôi nền màu tím đặc trưng, tra cứu nghĩa đa tầng & hỗ trợ lưu vào kho từ vựng / Google Docs
 */

class CollocationEngine {
  constructor() {
    // Kho Collocation Longman phong phú với nghĩa tiếng Việt chuẩn xác
    this.knownDict = {
      // 1. Từ vựng cốt lõi & bài tập ngữ cảnh
      'public health': { meaning: 'y tế công cộng; sức khỏe cộng đồng', type: 'Noun + Noun' },
      'severe warning': { meaning: 'lời cảnh báo nghiêm trọng', type: 'Adj + Noun' },
      'smoking causes cancer': { meaning: 'hút thuốc gây ung thư', type: 'Verb + Noun' },
      'issue a warning': { meaning: 'đưa ra lời cảnh báo', type: 'Verb + Noun' },
      'make a decision': { meaning: 'đưa ra quyết định', type: 'Verb + Noun' },
      'reach a decision': { meaning: 'đi đến quyết định', type: 'Verb + Noun' },
      'take advice': { meaning: 'nghe theo lời khuyên', type: 'Verb + Noun' },
      'seek advice': { meaning: 'tìm kiếm lời khuyên', type: 'Verb + Noun' },
      'legal advice': { meaning: 'lời khuyên pháp lý; tư vấn pháp luật', type: 'Adj + Noun' },
      'legal requirement': { meaning: 'yêu cầu pháp lý bắt buộc', type: 'Adj + Noun' },
      'essential requirement': { meaning: 'yêu cầu thiết yếu, cốt lõi', type: 'Adj + Noun' },
      'minimum requirement': { meaning: 'yêu cầu tối thiểu', type: 'Adj + Noun' },
      'meet requirements': { meaning: 'đáp ứng các yêu cầu', type: 'Verb + Noun' },
      'satisfy requirements': { meaning: 'thỏa mãn các yêu cầu đề ra', type: 'Verb + Noun' },
      'merger agreement': { meaning: 'thỏa thuận sáp nhập doanh nghiệp', type: 'Noun + Noun' },
      'corporate law': { meaning: 'luật doanh nghiệp', type: 'Noun + Noun' },
      'customer service': { meaning: 'dịch vụ chăm sóc khách hàng', type: 'Noun + Noun' },
      'flight delay': { meaning: 'chuyến bay bị trì hoãn', type: 'Noun + Noun' },
      'delay a flight': { meaning: 'hoãn một chuyến bay', type: 'Verb + Noun' },
      'safety regulations': { meaning: 'các quy định an toàn', type: 'Noun + Noun' },
      'safety measures': { meaning: 'các biện pháp an toàn', type: 'Noun + Noun' },
      'emergency fire exits': { meaning: 'các cửa thoát hiểm khẩn cấp khi có hỏa hoạn', type: 'Noun + Noun' },
      'fire exits': { meaning: 'lối thoát hiểm hỏa hoạn', type: 'Noun + Noun' },
      'emergency exit': { meaning: 'cửa thoát hiểm khẩn cấp', type: 'Noun + Noun' },
      'satisfactory condition': { meaning: 'tình trạng thỏa đáng, đạt chuẩn', type: 'Adj + Noun' },
      'heavy shears': { meaning: 'kéo lớn cắt tỉa cành cây', type: 'Adj + Noun' },
      'trim the bushes': { meaning: 'cắt tỉa các bụi cây', type: 'Verb + Noun' },
      'weed the flower beds': { meaning: 'nhổ cỏ dại ở các luống hoa', type: 'Verb + Noun' },
      'flower beds': { meaning: 'các luống hoa, bồn hoa', type: 'Noun + Noun' },
      'garden fence': { meaning: 'hàng rào khu vườn', type: 'Noun + Noun' },
      'young architect': { meaning: 'kiến trúc sư trẻ tuổi', type: 'Adj + Noun' },
      'sustainable green': { meaning: 'xanh và bền vững với môi trường', type: 'Adj + Adj' },
      'green skyscrapers': { meaning: 'những tòa nhà chọc trời xanh, thân thiện môi trường', type: 'Adj + Noun' },
      'aim to design': { meaning: 'hướng tới mục tiêu thiết kế', type: 'Verb + Prep' },
      'deeply regret': { meaning: 'vô cùng hối tiếc', type: 'Adv + Verb' },
      'bitterly regret': { meaning: 'hối hận cay đắng', type: 'Adv + Verb' },
      'have no regrets': { meaning: 'không hề hối hận', type: 'Verb + Noun' },
      'feel guilty': { meaning: 'cảm thấy tội lỗi, áy náy', type: 'Verb + Adj' },
      'feel guilty about': { meaning: 'thấy áy náy, có lỗi về điều gì', type: 'Verb + Prep' },
      'plead guilty': { meaning: 'nhận tội trước tòa', type: 'Verb + Adj' },
      'plead guilty to': { meaning: 'nhận tội về hành vi gì', type: 'Verb + Prep' },
      'guilty conscience': { meaning: 'lương tâm cắn rứt, cảm giác tội lỗi', type: 'Adj + Noun' },
      'pour a drink': { meaning: 'rót một ly đồ uống', type: 'Verb + Noun' },
      'pour water': { meaning: 'rót nước', type: 'Verb + Noun' },
      'pour down with rain': { meaning: 'mưa như trút nước', type: 'Verb + Phrase' },
      'strange noise': { meaning: 'tiếng động lạ lùng', type: 'Adj + Noun' },
      'strange feeling': { meaning: 'cảm giác kỳ lạ, khác thường', type: 'Adj + Noun' },
      'strange coincidence': { meaning: 'sự trùng hợp kỳ lạ', type: 'Adj + Noun' },
      'complete stranger': { meaning: 'người hoàn toàn xa lạ', type: 'Adj + Noun' },
      'wait in line': { meaning: 'xếp hàng chờ đợi', type: 'Verb + Phrase' },
      'stand in line': { meaning: 'đứng xếp hàng', type: 'Verb + Phrase' },
      'cut in line': { meaning: 'chen lấn, chen ngang hàng', type: 'Verb + Phrase' },
      'jump the line': { meaning: 'nhảy cóc qua hàng ngũ', type: 'Verb + Phrase' },
      'exchange greetings': { meaning: 'chào hỏi lẫn nhau', type: 'Verb + Noun' },
      'warm greeting': { meaning: 'lời chào nồng ấm, thân thiện', type: 'Adj + Noun' },
      'polite greeting': { meaning: 'lời chào lịch sự', type: 'Adj + Noun' },
      'greeting card': { meaning: 'thiệp chúc mừng', type: 'Noun + Noun' },
      'respond promptly': { meaning: 'phản hồi nhanh chóng, kịp thời', type: 'Verb + Adv' },
      'fail to respond': { meaning: 'không thể hoặc không chịu phản hồi', type: 'Verb + Prep' },
      'clickbait headline': { meaning: 'tiêu đề giật gân câu khách', type: 'Noun + Noun' },
      'clickbait title': { meaning: 'tựa đề câu view, câu click', type: 'Noun + Noun' },
      'clickbait link': { meaning: 'đường link câu view độc hại', type: 'Noun + Noun' },
      'pure clickbait': { meaning: 'hoàn toàn là nội dung câu view rẻ tiền', type: 'Adj + Noun' },
      'supposedly superior': { meaning: 'cho là vượt trội hơn nhưng chưa chắc', type: 'Adv + Adj' },
      'supposedly harmless': { meaning: 'được cho là vô hại', type: 'Adv + Adj' },
      'supposedly true': { meaning: 'ngỡ là đúng sự thật', type: 'Adv + Adj' },
      'schedule a meeting': { meaning: 'lên lịch một cuộc họp', type: 'Verb + Noun' },
      'attend a meeting': { meaning: 'tham dự một cuộc họp', type: 'Verb + Noun' },
      'hold a meeting': { meaning: 'tổ chức cuộc họp', type: 'Verb + Noun' },
      'file a report': { meaning: 'nộp một bản báo cáo chính thức', type: 'Verb + Noun' },
      'submit a report': { meaning: 'trình nộp báo cáo', type: 'Verb + Noun' },
      'offer a discount': { meaning: 'đưa ra mức chiết khấu giảm giá', type: 'Verb + Noun' },
      'ask for a refund': { meaning: 'yêu cầu hoàn trả tiền', type: 'Verb + Prep' },
      'issue a refund': { meaning: 'thực hiện hoàn tiền lại cho khách', type: 'Verb + Noun' },
      'make a purchase': { meaning: 'thực hiện mua sắm đơn hàng', type: 'Verb + Noun' },
      'gain access': { meaning: 'được quyền truy cập, tiếp cận', type: 'Verb + Noun' },
      'pay attention': { meaning: 'chú ý, để tâm tới', type: 'Verb + Noun' },
      'take advantage of': { meaning: 'tận dụng cơ hội / lợi dụng', type: 'Verb + Phrase' },
      'look forward to': { meaning: 'háo hức mong đợi điều gì', type: 'Verb + Phrase' },
      'in charge of': { meaning: 'chịu trách nhiệm, phụ trách', type: 'Prep + Phrase' },
      'prior to': { meaning: 'trước thời điểm nào', type: 'Prep + Phrase' },
      'as well as': { meaning: 'cũng như là', type: 'Conj + Phrase' },
      // 2. Collocations tự nhiên thường gặp trong bài tập ngữ cảnh Oxford & đề thi
      'hotel receptionist': { meaning: 'nhân viên lễ tân khách sạn', type: 'Noun + Noun' },
      'in the middle of': { meaning: 'ở giữa, đang trong lúc diễn ra', type: 'Prep + Phrase' },
      'social media': { meaning: 'mạng xã hội', type: 'Noun + Noun' },
      'fire alarm': { meaning: 'chuông báo cháy', type: 'Noun + Noun' },
      'listening test': { meaning: 'bài thi nghe tiếng Anh', type: 'Noun + Noun' },
      'listening exam': { meaning: 'kỳ thi nghe hiểu', type: 'Noun + Noun' },
      'exam format': { meaning: 'cấu trúc bài thi, định dạng đề thi', type: 'Noun + Noun' },
      'sales position': { meaning: 'vị trí nhân viên bán hàng / kinh doanh', type: 'Noun + Noun' },
      'spoken English': { meaning: 'tiếng Anh giao tiếp nói', type: 'Adj + Noun' },
      'good fortune': { meaning: 'sự may mắn, cơ duyên tốt lành', type: 'Adj + Noun' },
      'customer support': { meaning: 'bộ phận hỗ trợ khách hàng', type: 'Noun + Noun' },
      'support department': { meaning: 'phòng ban hỗ trợ kỹ thuật / dịch vụ', type: 'Noun + Noun' },
      'band score': { meaning: 'điểm số band điểm (IELTS)', type: 'Noun + Noun' },
      'revision schedule': { meaning: 'lịch trình ôn tập bài học', type: 'Noun + Noun' },
      'final examination': { meaning: 'kỳ thi tốt nghiệp / kỳ thi cuối khóa', type: 'Adj + Noun' },
      'minimum attendance': { meaning: 'tỷ lệ chuyên cần tối thiểu', type: 'Adj + Noun' },
      'memorial speech': { meaning: 'bài diễn văn tưởng niệm', type: 'Adj + Noun' },
      'innocent victims': { meaning: 'những nạn nhân vô tội', type: 'Adj + Noun' },
      'outstanding leadership': { meaning: 'năng lực lãnh đạo xuất sắc', type: 'Adj + Noun' },
      'senior director': { meaning: 'giám đốc cấp cao', type: 'Adj + Noun' },
      'car salesperson': { meaning: 'nhân viên bán xe hơi', type: 'Noun + Noun' },
      'pesto sauce': { meaning: 'sốt pesto kiểu Ý', type: 'Noun + Noun' },
      'oak trees': { meaning: 'cây gỗ sồi', type: 'Noun + Noun' },
      'espresso beans': { meaning: 'hạt cà phê espresso', type: 'Noun + Noun' },
      'harsh winter': { meaning: 'mùa đông khắc nghiệt', type: 'Adj + Noun' },
      'check in': { meaning: 'làm thủ tục nhận phòng / lên máy bay', type: 'Verb + Prep' },
      'hot water': { meaning: 'nước nóng', type: 'Adj + Noun' },
      'middle of the night': { meaning: 'nửa đêm, lúc đêm khuya thanh vắng', type: 'Noun + Phrase' },
      'extra virgin olive oil': { meaning: 'dầu ô liu nguyên chất hảo hạng', type: 'Noun + Phrase' },
      'virgin olive oil': { meaning: 'dầu ô liu nguyên chất', type: 'Noun + Phrase' },
      'olive oil': { meaning: 'dầu ô liu', type: 'Noun + Noun' },
      'sweet basil': { meaning: 'lá húng quế ngọt tây', type: 'Adj + Noun' },
      'sensational headlines': { meaning: 'tiêu đề giật gân, câu khách', type: 'Adj + Noun' },
      'target band score': { meaning: 'điểm số mục tiêu hướng đến', type: 'Noun + Phrase' },
      'daily revision schedule': { meaning: 'thời gian biểu ôn tập mỗi ngày', type: 'Noun + Phrase' },
      'international sales position': { meaning: 'vị trí kinh doanh quốc tế', type: 'Noun + Phrase' },
      'long-haul flights': { meaning: 'các chuyến bay đường dài', type: 'Adj + Noun' },
      'long-haul flight': { meaning: 'chuyến bay chặng dài', type: 'Adj + Noun' },
      'aisle seat': { meaning: 'chỗ ngồi gần lối đi trên máy bay', type: 'Noun + Noun' },
      'window seat': { meaning: 'chỗ ngồi cạnh cửa sổ máy bay', type: 'Noun + Noun' },
      'flight deck': { meaning: 'buồng lái phi hành đoàn', type: 'Noun + Noun' },
      'cargo hold': { meaning: 'khoang chở hàng hóa của máy bay', type: 'Noun + Noun' }
    };

    // Chuẩn hóa toàn bộ key sang chữ thường
    const norm = {};
    for (const [k, v] of Object.entries(this.knownDict)) {
      norm[k.toLowerCase().trim()] = v;
    }
    this.knownDict = norm;

    // Tự động thu thập collocation từ danh sách từ vựng hiện tại
    this.harvestFromAppStorage();
  }

  harvestFromAppStorage() {
    if (!window.appStorage || !Array.isArray(window.appStorage.words)) return;

    window.appStorage.words.forEach(w => {
      if (Array.isArray(w.collocations)) {
        w.collocations.forEach(raw => {
          this.parseAndRegisterCollocation(raw, w.word);
        });
      }
    });
  }

  parseAndRegisterCollocation(str, mainWord) {
    if (!str || typeof str !== 'string') return;
    let clean = str.trim();

    // Tách các cụm có dấu gạch chéo: "deeply / bitterly regret" -> "deeply regret", "bitterly regret"
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 2) {
        const leftWords = parts[0].trim().split(/\s+/);
        const rightWords = parts[1].trim().split(/\s+/);

        if (leftWords.length === 1 && rightWords.length >= 1) {
          const tail = rightWords.slice(1).join(' ');
          const leftPhrase = (leftWords[0] + (tail ? ' ' + tail : '')).toLowerCase();
          const rightPhrase = (rightWords[0] + (tail ? ' ' + tail : '')).toLowerCase();
          this.addCollocation(leftPhrase, mainWord);
          this.addCollocation(rightPhrase, mainWord);
          return;
        }
      }
    }

    // Bỏ các từ thay thế như "sth", "sb", "somebody", "something" ở cuối
    let normalized = clean
      .replace(/\s+(sth|sb|somebody|something)\b/gi, '')
      .replace(/\b(sth|sb|somebody|something)\s+/gi, '')
      .replace(/[()]/g, '')
      .trim()
      .toLowerCase();

    if (normalized.split(/\s+/).length >= 2) {
      this.addCollocation(normalized, mainWord);
    }
  }

  addCollocation(phrase, mainWord) {
    const p = phrase.toLowerCase().trim();
    if (p.length < 4 || p.split(/\s+/).length < 2) return;

    if (!this.knownDict[p]) {
      this.knownDict[p] = {
        meaning: mainWord ? `cụm từ đi cùng "${mainWord}" (Longman)` : 'cụm từ collocation (Longman)',
        type: 'Collocation'
      };
    }
  }

  /**
   * Phát hiện tất cả các Collocation Longman xuất hiện trong câu
   * Ưu tiên cụm từ dài nhất trước (Longest Match First)
   */
  detectCollocations(sentence) {
    if (!sentence) return [];
    this.harvestFromAppStorage();

    const lowerSentence = sentence.toLowerCase();
    const detected = [];
    const occupiedRanges = [];

    // Sắp xếp các cụm từ theo độ dài từ dài đến ngắn
    const phrases = Object.keys(this.knownDict).sort((a, b) => b.length - a.length);

    for (const phrase of phrases) {
      // Tìm vị trí xuất hiện theo ranh giới từ (\b)
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Cho phép linh hoạt các dạng chia thì cơ bản (-s, -ed, -ing)
      const words = escaped.split(/\s+/);
      const flexiblePattern = words.map((w, i) => {
        if (i === 0) {
          // Từ đầu tiên có thể là động từ chia (vd: trim -> trims, trimmed, trimming)
          return `\\b${w}(?:s|ed|d|ing|es)?\\b`;
        }
        return `\\b${w}\\b`;
      }).join('\\s+');

      const regex = new RegExp(flexiblePattern, 'gi');
      let match;

      while ((match = regex.exec(sentence)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const matchedText = match[0];

        // Kiểm tra xem khoảng này đã bị cụm từ dài hơn chiếm chưa
        const isOverlap = occupiedRanges.some(r => (start < r.end && end > r.start));
        if (!isOverlap) {
          occupiedRanges.push({ start, end });
          detected.push({
            phrase: phrase,
            matchedText: matchedText,
            start: start,
            end: end,
            info: this.knownDict[phrase] || { meaning: '', type: 'Collocation' }
          });
        }
      }
    }

    // Sắp xếp lại theo vị trí xuất hiện trong câu
    return detected.sort((a, b) => a.start - b.start);
  }

  /**
   * Lấy nghĩa tiếng Việt của cụm từ collocation
   */
  getCollocationMeaning(phrase) {
    if (!phrase) return null;
    const clean = String(phrase).toLowerCase().trim();
    if (this.knownDict[clean] && this.knownDict[clean].meaning) {
      return this.knownDict[clean].meaning;
    }
    for (const k of Object.keys(this.knownDict)) {
      if (k.toLowerCase().trim() === clean && this.knownDict[k]?.meaning) {
        return this.knownDict[k].meaning;
      }
    }
    return null;
  }
}

window.appCollocations = new CollocationEngine();
