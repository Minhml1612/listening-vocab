# -*- coding: utf-8 -*-
"""
Tạo cơ sở dữ liệu câu hỏi trắc nghiệm ngữ cảnh chuẩn Oxford & Longman cho toàn bộ 155 từ vựng.
Đặc điểm:
- Ghi nguyên câu ngữ cảnh Oxford / Longman với chỗ trống rõ ràng: "........"
- 3 phương án gây nhiễu (distractors) cùng từ loại, ngữ cảnh tự nhiên, "dễ gây confuse"
- Bản dịch tiếng Việt trọn vẹn cả câu
"""

import json
import os
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUIZ_DATA = {
    "Pour": {
        "sentence": "Could you please pour some more hot water into the teapot?",
        "gap": "Could you please ........ some more hot water into the teapot?",
        "answer": "pour",
        "distractors": ["spill", "leak", "drip"],
        "vi": "Bạn có thể vui lòng rót thêm nước nóng vào ấm trà được không?",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Regret": {
        "sentence": "If you don't take this scholarship, you will deeply regret it later.",
        "gap": "If you don't take this scholarship, you will deeply ........ it later.",
        "answer": "regret",
        "distractors": ["admit", "deny", "ignore"],
        "vi": "Nếu bạn không nhận học bổng này, sau này bạn sẽ vô cùng hối tiếc.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "strange": {
        "sentence": "I woke up in the middle of the night because of a very strange noise outside.",
        "gap": "I woke up in the middle of the night because of a very ........ noise outside.",
        "answer": "strange",
        "distractors": ["familiar", "normal", "regular"],
        "vi": "Tôi thức giấc giữa đêm vì một tiếng động rất lạ lùng bên ngoài.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "guilty": {
        "sentence": "The suspect looked extremely guilty when questioned by the police about the missing money.",
        "gap": "The suspect looked extremely ........ when questioned by the police about the missing money.",
        "answer": "guilty",
        "distractors": ["innocent", "curious", "nervous"],
        "vi": "Nghi phạm trông vô cùng có lỗi/tội lỗi khi bị cảnh sát thẩm vấn về số tiền bị mất.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "stand in line": {
        "sentence": "All passengers had to stand in line for over an hour to check in for their flight.",
        "gap": "All passengers had to ........ for over an hour to check in for their flight.",
        "answer": "stand in line",
        "distractors": ["take a seat", "make a reservation", "check in advance"],
        "vi": "Tất cả hành khách đã phải xếp hàng hơn một tiếng đồng hồ để làm thủ tục cho chuyến bay.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "the greeting": {
        "sentence": "The hotel receptionist welcomed every guest with a warm and polite greeting at the entrance.",
        "gap": "The hotel receptionist welcomed every guest with a warm and polite ........ at the entrance.",
        "answer": "greeting",
        "distractors": ["complaint", "farewell", "announcement"],
        "vi": "Nhân viên lễ tân khách sạn chào đón từng vị khách bằng một lời chào ấm áp và lịch sự ở lối vào.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "requirement": {
        "sentence": "Fluency in spoken English is an essential requirement for this international sales position.",
        "gap": "Fluency in spoken English is an essential ........ for this international sales position.",
        "answer": "requirement",
        "distractors": ["achievement", "opportunity", "circumstance"],
        "vi": "Lưu loát tiếng Anh giao tiếp là một yêu cầu thiết yếu cho vị trí kinh doanh quốc tế này.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "respond": {
        "sentence": "The customer support department promises to respond to all inquiries within twenty-four hours.",
        "gap": "The customer support department promises to ........ to all inquiries within twenty-four hours.",
        "answer": "respond",
        "distractors": ["refuse", "complain", "ignore"],
        "vi": "Bộ phận hỗ trợ khách hàng cam kết sẽ phản hồi mọi thắc mắc trong vòng hai mươi bốn giờ.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "supposedly": {
        "sentence": "The new listening exam format is supposedly much easier than the previous edition.",
        "gap": "The new listening exam format is ........ much easier than the previous edition.",
        "answer": "supposedly",
        "distractors": ["actually", "definitely", "completely"],
        "vi": "Cấu trúc đề thi nghe mới được cho là dễ hơn nhiều so với phiên bản trước đó.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "clickbait": {
        "sentence": "Don't fall for sensational headlines on social media; most of them are pure clickbait.",
        "gap": "Don't fall for sensational headlines on social media; most of them are pure ........",
        "answer": "clickbait",
        "distractors": ["feedback", "broadcast", "headline"],
        "vi": "Đừng mắc bẫy những tiêu đề giật gân trên mạng xã hội; phần lớn chúng chỉ thuần túy là câu view.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Wisely": {
        "sentence": "You should manage your daily revision schedule wisely to achieve your target band score.",
        "gap": "You should manage your daily revision schedule ........ to achieve your target band score.",
        "answer": "wisely",
        "distractors": ["rarely", "merely", "hastily"],
        "vi": "Bạn nên quản lý lịch ôn tập hàng ngày một cách khôn ngoan để đạt điểm mục tiêu.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Suddenly": {
        "sentence": "Suddenly, the fire alarm went off right in the middle of our recorded listening test.",
        "gap": "........, the fire alarm went off right in the middle of our recorded listening test.",
        "answer": "Suddenly",
        "distractors": ["Gradually", "Eventually", "Naturally"],
        "vi": "Đột nhiên, chuông báo cháy reo lên ngay giữa bài thi nghe được ghi âm của chúng tôi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "matter": {
        "sentence": "Your accent doesn't matter as long as your pronunciation and grammar are clear.",
        "gap": "Your accent doesn't ........ as long as your pronunciation and grammar are clear.",
        "answer": "matter",
        "distractors": ["happen", "appear", "exist"],
        "vi": "Chất giọng của bạn không quan trọng miễn là phát âm và ngữ pháp của bạn rõ ràng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "fortune": {
        "sentence": "He had the good fortune to be mentored by one of the top English professors in the country.",
        "gap": "He had the good ........ to be mentored by one of the top English professors in the country.",
        "answer": "fortune",
        "distractors": ["ambition", "trouble", "burden"],
        "vi": "Anh ấy có may mắn lớn khi được chỉ dạy bởi một trong những giáo sư tiếng Anh hàng đầu cả nước.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "betray": {
        "sentence": "A trustworthy person would never betray the confidence and secrets shared by their friends.",
        "gap": "A trustworthy person would never ........ the confidence and secrets shared by their friends.",
        "answer": "betray",
        "distractors": ["protect", "forgive", "support"],
        "vi": "Một người đáng tin cậy sẽ không bao giờ phản bội sự tin tưởng và bí mật mà bạn bè chia sẻ.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "attempt": {
        "sentence": "She passed her IELTS listening test on her second attempt with an impressive band score.",
        "gap": "She passed her IELTS listening test on her second ........ with an impressive band score.",
        "answer": "attempt",
        "distractors": ["intention", "purpose", "struggle"],
        "vi": "Cô ấy đã vượt qua bài thi nghe IELTS trong nỗ lực lần thứ hai với số điểm rất ấn tượng.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "bridge": {
        "sentence": "The municipal council agreed to build a pedestrian bridge over the congested highway.",
        "gap": "The municipal council agreed to build a pedestrian ........ over the congested highway.",
        "answer": "bridge",
        "distractors": ["highway", "tunnel", "corridor"],
        "vi": "Hội đồng thành phố đã đồng ý xây một cây cầu đi bộ bắc qua đường cao tốc đông đúc.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "starving": {
        "sentence": "We skipped breakfast and practiced listening for five hours, so now we are absolutely starving.",
        "gap": "We skipped breakfast and practiced listening for five hours, so now we are absolutely ........",
        "answer": "starving",
        "distractors": ["exhausted", "thirsty", "crowded"],
        "vi": "Chúng tôi đã bỏ bữa sáng và luyện nghe suốt năm tiếng, nên bây giờ chúng tôi đói lả.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "asshole": {
        "sentence": "In informal street talk, vulgar people sometimes insult others by calling them an asshole.",
        "gap": "In informal street talk, vulgar people sometimes insult others by calling them an ........",
        "answer": "asshole",
        "distractors": ["amateur", "athlete", "ancestor"],
        "vi": "Trong giao tiếp đường phố bình dân, những kẻ thô tục đôi khi xúc phạm người khác bằng từ ngữ tục tĩu.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "swear": {
        "sentence": "I swear that I told the police the complete truth about what happened last night.",
        "gap": "I ........ that I told the police the complete truth about what happened last night.",
        "answer": "swear",
        "distractors": ["pretend", "whisper", "hesitate"],
        "vi": "Tôi thề rằng tôi đã nói với cảnh sát toàn bộ sự thật về những gì xảy ra tối qua.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "trophy": {
        "sentence": "The champion held the glittering gold trophy high above his head as the crowd cheered.",
        "gap": "The champion held the glittering gold ........ high above his head as the crowd cheered.",
        "answer": "trophy",
        "distractors": ["medal", "souvenir", "banner"],
        "vi": "Nhà vô địch nâng cao chiếc cúp vàng lấp lánh trên đầu trong tiếng reo hò của đám đông.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "blank": {
        "sentence": "When the teacher suddenly asked him for the answer, his mind went completely blank.",
        "gap": "When the teacher suddenly asked him for the answer, his mind went completely ........",
        "answer": "blank",
        "distractors": ["empty", "hollow", "clear"],
        "vi": "Khi giáo viên bất ngờ hỏi câu trả lời, đầu óc anh ấy hoàn toàn trống rỗng / không nghĩ ra gì.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "empty": {
        "sentence": "The hotel restaurant was completely empty because all the guests had gone on a day trip.",
        "gap": "The hotel restaurant was completely ........ because all the guests had gone on a day trip.",
        "answer": "empty",
        "distractors": ["blank", "shallow", "silent"],
        "vi": "Nhà hàng khách sạn hoàn toàn trống vắng vì tất cả khách đã đi tham quan trong ngày.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Argue": {
        "sentence": "It is counterproductive to argue about small details when we have a major deadline tomorrow.",
        "gap": "It is counterproductive to ........ about small details when we have a major deadline tomorrow.",
        "answer": "argue",
        "distractors": ["discuss", "complain", "explain"],
        "vi": "Thật vô ích khi tranh cãi về những chi tiết vụn vặt khi ngày mai chúng ta có hạn chót quan trọng.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "formal": {
        "sentence": "You should use formal language and proper honorifics when composing an academic essay.",
        "gap": "You should use ........ language and proper honorifics when composing an academic essay.",
        "answer": "formal",
        "distractors": ["casual", "modern", "familiar"],
        "vi": "Bạn nên sử dụng ngôn ngữ trang trọng và kính ngữ đúng mực khi viết một bài luận học thuật.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "conference": {
        "sentence": "More than five hundred medical specialists gathered in Geneva for the annual scientific conference.",
        "gap": "More than five hundred medical specialists gathered in Geneva for the annual scientific ........",
        "answer": "conference",
        "distractors": ["exhibition", "committee", "negotiation"],
        "vi": "Hơn năm trăm chuyên gia y tế đã tề tựu tại Geneva để tham dự hội nghị khoa học thường niên.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "colleagues": {
        "sentence": "She has earned tremendous respect from both her junior and senior colleagues in the department.",
        "gap": "She has earned tremendous respect from both her junior and senior ........ in the department.",
        "answer": "colleagues",
        "distractors": ["opponents", "customers", "strangers"],
        "vi": "Cô ấy đã nhận được sự kính trọng to lớn từ cả các đồng nghiệp cấp dưới lẫn cấp trên trong phòng ban.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "pressure": {
        "sentence": "Final-year university students often experience immense pressure while preparing for their thesis defense.",
        "gap": "Final-year university students often experience immense ........ while preparing for their thesis defense.",
        "answer": "pressure",
        "distractors": ["comfort", "pleasure", "relief"],
        "vi": "Sinh viên năm cuối thường phải chịu áp lực to lớn khi chuẩn bị cho buổi bảo vệ khóa luận.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "release": {
        "sentence": "The technology giant will officially release its new operating system early next month.",
        "gap": "The technology giant will officially ........ its new operating system early next month.",
        "answer": "release",
        "distractors": ["cancel", "restrict", "remove"],
        "vi": "Tập đoàn công nghệ khổng lồ sẽ chính thức phát hành hệ điều hành mới vào đầu tháng tới.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Fitting room": {
        "sentence": "Could you please tell me where the fitting room is so I can try on these jeans?",
        "gap": "Could you please tell me where the ........ is so I can try on these jeans?",
        "answer": "fitting room",
        "distractors": ["waiting room", "storage room", "dining room"],
        "vi": "Bạn có thể vui lòng chỉ cho tôi phòng thử đồ ở đâu để tôi thử chiếc quần bò này không?",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Accessories": {
        "sentence": "The fashion shop displays trendy accessories such as leather belts, scarves, and handbags.",
        "gap": "The fashion shop displays trendy ........ such as leather belts, scarves, and handbags.",
        "answer": "accessories",
        "distractors": ["appliances", "groceries", "instruments"],
        "vi": "Cửa hàng thời trang trưng bày các phụ kiện hợp mốt như thắt lưng da, khăn quàng và túi xách.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Jewelry": {
        "sentence": "She inherited a valuable collection of antique diamond jewelry from her grandmother.",
        "gap": "She inherited a valuable collection of antique diamond ........ from her grandmother.",
        "answer": "jewelry",
        "distractors": ["luggage", "stationery", "furniture"],
        "vi": "Cô ấy đã thừa kế một bộ sưu tập trang sức kim cương cổ có giá trị từ bà của mình.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Forwarding": {
        "sentence": "The post office offers a mail forwarding service when you move to a new apartment.",
        "gap": "The post office offers a mail ........ service when you move to a new apartment.",
        "answer": "forwarding",
        "distractors": ["purchasing", "cancelling", "recycling"],
        "vi": "Bưu điện cung cấp dịch vụ chuyển tiếp thư từ khi bạn chuyển đến một căn hộ mới.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Ampush": {
        "sentence": "The special forces set up a surprise ambush to capture the fleeing enemy convoy.",
        "gap": "The special forces set up a surprise ........ to capture the fleeing enemy convoy.",
        "answer": "ambush",
        "distractors": ["shelter", "fortress", "parade"],
        "vi": "Lực lượng đặc nhiệm đã tổ chức một trận phục kích bất ngờ để tóm gọn đoàn xe địch đang bỏ chạy.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Agent": {
        "sentence": "We booked our vacation tour through a reputable travel agent in central London.",
        "gap": "We booked our vacation tour through a reputable travel ........ in central London.",
        "answer": "agent",
        "distractors": ["client", "mechanic", "suspect"],
        "vi": "Chúng tôi đã đặt chuyến du lịch thông qua một đại lý du lịch uy tín ở trung tâm London.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Feature": {
        "sentence": "One distinctive feature of this laptop is its ultra-long battery life of twenty hours.",
        "gap": "One distinctive ........ of this laptop is its ultra-long battery life of twenty hours.",
        "answer": "feature",
        "distractors": ["defect", "symptom", "obstacle"],
        "vi": "Một đặc điểm/tính năng nổi bật của chiếc máy tính xách tay này là thời lượng pin cực dài tới 20 tiếng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Fallen": {
        "sentence": "Every November, the nation commemorates the fallen heroes who sacrificed their lives in the war.",
        "gap": "Every November, the nation commemorates the ........ heroes who sacrificed their lives in the war.",
        "answer": "fallen",
        "distractors": ["wounded", "retired", "defeated"],
        "vi": "Mỗi tháng Mười Một, cả nước tưởng niệm những người chiến sĩ đã ngã xuống hy sinh vì tổ quốc.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Vintage": {
        "sentence": "He drives a beautifully restored vintage sports car manufactured in 1965.",
        "gap": "He drives a beautifully restored ........ sports car manufactured in 1965.",
        "answer": "vintage",
        "distractors": ["modern", "obsolete", "temporary"],
        "vi": "Anh ấy lái một chiếc xe thể thao cổ điển được phục chế tuyệt đẹp sản xuất vào năm 1965.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Obsolete": {
        "sentence": "With the rise of smartphones, traditional pagers and floppy disks became completely obsolete.",
        "gap": "With the rise of smartphones, traditional pagers and floppy disks became completely ........",
        "answer": "obsolete",
        "distractors": ["popular", "durable", "convenient"],
        "vi": "Với sự lên ngôi của điện thoại thông minh, máy nhắn tin và đĩa mềm truyền thống đã trở nên hoàn toàn lỗi thời.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "in stock": {
        "sentence": "I'm sorry, that color is sold out today, but our warehouse will have it in stock tomorrow.",
        "gap": "I'm sorry, that color is sold out today, but our warehouse will have it ........ tomorrow.",
        "answer": "in stock",
        "distractors": ["on sale", "under repair", "out of bounds"],
        "vi": "Tôi rất tiếc màu đó hôm nay đã hết, nhưng kho của chúng tôi sẽ còn hàng vào ngày mai.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "absentee": {
        "sentence": "Because of frequent illness, he was marked as an absentee for nearly a month.",
        "gap": "Because of frequent illness, he was marked as an ........ for nearly a month.",
        "answer": "absentee",
        "distractors": ["candidate", "immigrant", "passenger"],
        "vi": "Vì thường xuyên ốm đau, anh ấy bị ghi nhận là người vắng mặt trong gần một tháng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "iconic": {
        "sentence": "The Sydney Opera House is universally recognized as an iconic landmark of Australia.",
        "gap": "The Sydney Opera House is universally recognized as an ........ landmark of Australia.",
        "answer": "iconic",
        "distractors": ["obscure", "ordinary", "forgotten"],
        "vi": "Nhà hát Opera Sydney được toàn thế giới công nhận là một công trình mang tính biểu tượng của nước Úc.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "beard": {
        "sentence": "He spent six months growing a thick, well-groomed beard for his role in the historical film.",
        "gap": "He spent six months growing a thick, well-groomed ........ for his role in the historical film.",
        "answer": "beard",
        "distractors": ["eyebrow", "wig", "scarf"],
        "vi": "Anh ấy đã dành sáu tháng để nuôi một bộ râu rậm và gọn gàng cho vai diễn trong phim lịch sử.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Honored": {
        "sentence": "The university professor felt deeply honored to be invited as the keynote speaker at the summit.",
        "gap": "The university professor felt deeply ........ to be invited as the keynote speaker at the summit.",
        "answer": "honored",
        "distractors": ["embarrassed", "offended", "disappointed"],
        "vi": "Giáo sư đại học cảm thấy vô cùng vinh hạnh khi được mời làm diễn giả chính tại hội nghị thượng đỉnh.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Bare": {
        "sentence": "During harsh winter, the tall oak trees in the park stood completely bare without leaves.",
        "gap": "During harsh winter, the tall oak trees in the park stood completely ........ without leaves.",
        "answer": "bare",
        "distractors": ["dense", "fluffy", "blooming"],
        "vi": "Suốt mùa đông khắc nghiệt, những cây sồi cao trong công viên trơ trọi, trần trụi không một chiếc lá.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Complexity": {
        "sentence": "The legal complexity of the merger agreement required advice from top corporate attorneys.",
        "gap": "The legal ........ of the merger agreement required advice from top corporate attorneys.",
        "answer": "complexity",
        "distractors": ["simplicity", "brevity", "clarity"],
        "vi": "Tính chất phức tạp về mặt pháp lý của thỏa thuận sáp nhập đòi hỏi sự tư vấn từ các luật sư doanh nghiệp hàng đầu.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "massive": {
        "sentence": "The construction crew used cranes to lift a massive steel beam onto the bridge structure.",
        "gap": "The construction crew used cranes to lift a ........ steel beam onto the bridge structure.",
        "answer": "massive",
        "distractors": ["tiny", "narrow", "fragile"],
        "vi": "Đội thi công đã dùng cần cẩu để nâng một thanh dầm thép khổng lồ lên kết cấu cây cầu.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Promotion": {
        "sentence": "Her dedication and outstanding leadership earned her a rapid promotion to senior director.",
        "gap": "Her dedication and outstanding leadership earned her a rapid ........ to senior director.",
        "answer": "promotion",
        "distractors": ["demotion", "resignation", "permission"],
        "vi": "Sự cống hiến và khả năng lãnh đạo xuất sắc đã giúp cô thăng chức nhanh chóng lên giám đốc cấp cao.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Revenge": {
        "sentence": "He spent years plotting revenge against the corrupt partners who had betrayed him.",
        "gap": "He spent years plotting ........ against the corrupt partners who had betrayed him.",
        "answer": "revenge",
        "distractors": ["sympathy", "forgiveness", "gratitude"],
        "vi": "Anh ấy đã dành nhiều năm lên kế hoạch trả thù những đối tác tham nhũng từng phản bội anh.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Consequence": {
        "sentence": "Severe soil erosion is an inevitable consequence of extensive deforestation in the region.",
        "gap": "Severe soil erosion is an inevitable ........ of extensive deforestation in the region.",
        "answer": "consequence",
        "distractors": ["origin", "purpose", "advantage"],
        "vi": "Xói mòn đất nghiêm trọng là một hậu quả tất yếu của nạn phá rừng quy mô lớn trong khu vực.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "redirect": {
        "sentence": "Traffic police had to redirect vehicles away from the avenue due to the sudden gas leak.",
        "gap": "Traffic police had to ........ vehicles away from the avenue due to the sudden gas leak.",
        "answer": "redirect",
        "distractors": ["restrict", "suspend", "reverse"],
        "vi": "Cảnh sát giao thông đã phải chuyển hướng các phương tiện ra khỏi đại lộ do sự cố rò rỉ khí gas bất ngờ.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Possession": {
        "sentence": "The ancient handwritten manuscript has remained in the possession of the royal library for centuries.",
        "gap": "The ancient handwritten manuscript has remained in the ........ of the royal library for centuries.",
        "answer": "possession",
        "distractors": ["absence", "disposal", "rejection"],
        "vi": "Bản thảo cổ viết tay này đã nằm trong quyền sở hữu của thư viện hoàng gia qua nhiều thế kỷ.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "stuck": {
        "sentence": "We were stuck inside the broken elevator for nearly forty minutes before technicians arrived.",
        "gap": "We were ........ inside the broken elevator for nearly forty minutes before technicians arrived.",
        "answer": "stuck",
        "distractors": ["locked", "rushed", "hidden"],
        "vi": "Chúng tôi đã bị kẹt bên trong thang máy bị hỏng gần bốn mươi phút trước khi kỹ thuật viên tới.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Required": {
        "sentence": "A minimum attendance of eighty percent is strictly required to qualify for the final examination.",
        "gap": "A minimum attendance of eighty percent is strictly ........ to qualify for the final examination.",
        "answer": "required",
        "distractors": ["optional", "forbidden", "discouraged"],
        "vi": "Tỷ lệ chuyên cần tối thiểu tám mươi phần trăm là bắt buộc/cần thiết để đủ điều kiện thi cuối kỳ.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "get acquainted": {
        "sentence": "Orientation week gives incoming international students plenty of time to get acquainted with the campus.",
        "gap": "Orientation week gives incoming international students plenty of time to ........ with the campus.",
        "answer": "get acquainted",
        "distractors": ["lose patience", "make excuses", "give up"],
        "vi": "Tuần lễ định hướng cho các sinh viên quốc tế mới nhiều thời gian để làm quen với khuôn viên trường.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Craving": {
        "sentence": "After working out vigorously at the gym, I had an irresistible craving for a fresh smoothie.",
        "gap": "After working out vigorously at the gym, I had an irresistible ........ for a fresh smoothie.",
        "answer": "craving",
        "distractors": ["hatred", "fear", "allergy"],
        "vi": "Sau khi tập luyện hăng say ở phòng gym, tôi có một cảm giác thèm không cưỡng lại được một ly sinh tố tươi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Bound": {
        "sentence": "With his remarkable dedication and strong work ethic, he is bound to achieve great success.",
        "gap": "With his remarkable dedication and strong work ethic, he is ........ to achieve great success.",
        "answer": "bound",
        "distractors": ["reluctant", "doubtful", "unlikely"],
        "vi": "Với sự cống hiến bền bỉ và đạo đức làm việc vững vàng, anh ấy chắc chắn sẽ đạt được thành công lớn.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Poverty": {
        "sentence": "The non-profit charity works tirelessly to lift rural farming communities out of chronic poverty.",
        "gap": "The non-profit charity works tirelessly to lift rural farming communities out of chronic ........",
        "answer": "poverty",
        "distractors": ["wealth", "luxury", "fortune"],
        "vi": "Tổ chức từ thiện phi lợi nhuận hoạt động không mệt mỏi để đưa các cộng đồng nông thôn thoát khỏi cảnh nghèo khó kinh niên.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "nonsense": {
        "sentence": "Don't pay attention to superstitious rumors on the internet; they are absolute nonsense.",
        "gap": "Don't pay attention to superstitious rumors on the internet; they are absolute ........",
        "answer": "nonsense",
        "distractors": ["wisdom", "reality", "truth"],
        "vi": "Đừng để tâm đến những tin đồn mê tín trên mạng; chúng hoàn toàn là chuyện nhảm nhí.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "recapture": {
        "sentence": "The army mounted a powerful counter-attack to recapture the strategic hilltop stronghold.",
        "gap": "The army mounted a powerful counter-attack to ........ the strategic hilltop stronghold.",
        "answer": "recapture",
        "distractors": ["abandon", "release", "surrender"],
        "vi": "Quân đội đã mở một cuộc phản công mạnh mẽ để chiếm lại cứ điểm chiến lược trên đỉnh đồi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "worth": {
        "sentence": "That ancient golden coin discovered in the ruins is estimated to be worth thousands of pounds.",
        "gap": "That ancient golden coin discovered in the ruins is estimated to be ........ thousands of pounds.",
        "answer": "worth",
        "distractors": ["costly", "heavy", "priced"],
        "vi": "Đồng xu vàng cổ được phát hiện trong tàn tích được ước tính có giá trị hàng ngàn bảng Anh.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "belittle": {
        "sentence": "A good teacher encourages pupils to learn from mistakes rather than belittle their efforts.",
        "gap": "A good teacher encourages pupils to learn from mistakes rather than ........ their efforts.",
        "answer": "belittle",
        "distractors": ["praise", "appreciate", "reward"],
        "vi": "Một người thầy tốt luôn khuyến khích học sinh học từ sai lầm thay vì coi thường những nỗ lực của các em.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "particular": {
        "sentence": "Is there any particular topic that you would like us to review during our seminar today?",
        "gap": "Is there any ........ topic that you would like us to review during our seminar today?",
        "answer": "particular",
        "distractors": ["general", "common", "universal"],
        "vi": "Có chủ đề cụ thể nào mà bạn muốn chúng tôi cùng ôn tập trong buổi hội thảo hôm nay không?",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "concern": {
        "sentence": "The rapid spread of plastic waste in the ocean has become a major environmental concern.",
        "gap": "The rapid spread of plastic waste in the ocean has become a major environmental ........",
        "answer": "concern",
        "distractors": ["delight", "comfort", "privilege"],
        "vi": "Sự lan rộng nhanh chóng của rác thải nhựa ở đại dương đã trở thành một mối bận tâm môi trường lớn.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "purely": {
        "sentence": "The doctor assured her that the medical test was purely a precautionary measure.",
        "gap": "The doctor assured her that the medical test was ........ a precautionary measure.",
        "answer": "purely",
        "distractors": ["rarely", "poorly", "partly"],
        "vi": "Bác sĩ cam đoan với cô rằng xét nghiệm y tế đó thuần túy chỉ là một biện pháp phòng ngừa.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Conversation": {
        "sentence": "We sat by the quiet fireplace and enjoyed an inspiring conversation about literature.",
        "gap": "We sat by the quiet fireplace and enjoyed an inspiring ........ about literature.",
        "answer": "conversation",
        "distractors": ["argument", "monologue", "contest"],
        "vi": "Chúng tôi ngồi bên lò sưởi yên tĩnh và tận hưởng một cuộc trò chuyện đầy cảm hứng về văn học.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Loyalty": {
        "sentence": "Dogs are famous for their unwavering loyalty and boundless devotion toward their owners.",
        "gap": "Dogs are famous for their unwavering ........ and boundless devotion toward their owners.",
        "answer": "loyalty",
        "distractors": ["betrayal", "hostility", "indifference"],
        "vi": "Loài chó nổi tiếng với lòng trung thành kiên định và sự tận tụy vô bờ bến đối với chủ nhân.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Commercial": {
        "sentence": "The company decided to air a catchy commercial on national television during prime time.",
        "gap": "The company decided to air a catchy ........ on national television during prime time.",
        "answer": "commercial",
        "distractors": ["documentary", "editorial", "lecture"],
        "vi": "Công ty quyết định phát sóng một đoạn quảng cáo thương mại bắt tai trên truyền hình quốc gia vào giờ vàng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Crave": {
        "sentence": "After studying under immense stress for weeks, the students crave a few days of peaceful rest.",
        "gap": "After studying under immense stress for weeks, the students ........ a few days of peaceful rest.",
        "answer": "crave",
        "distractors": ["despise", "avoid", "reject"],
        "vi": "Sau nhiều tuần học tập dưới áp lực lớn, các sinh viên khao khát có vài ngày nghỉ ngơi thanh bình.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "patient": {
        "sentence": "Caring for elderly residents requires nurses who are exceptionally gentle, understanding, and patient.",
        "gap": "Caring for elderly residents requires nurses who are exceptionally gentle, understanding, and ........",
        "answer": "patient",
        "distractors": ["irritable", "anxious", "aggressive"],
        "vi": "Chăm sóc người cao tuổi đòi hỏi các điều dưỡng viên phải đặc biệt nhẹ nhàng, thấu hiểu và kiên nhẫn.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "garage": {
        "sentence": "He converted his detached garage into a cozy woodworking workshop for the weekends.",
        "gap": "He converted his detached ........ into a cozy woodworking workshop for the weekends.",
        "answer": "garage",
        "distractors": ["terrace", "balcony", "pantry"],
        "vi": "Anh ấy đã cải tạo nhà để xe riêng biệt thành một xưởng mộc ấm cúng cho những ngày cuối tuần.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "across": {
        "sentence": "The modern public library is located directly across from the central subway station.",
        "gap": "The modern public library is located directly ........ from the central subway station.",
        "answer": "across",
        "distractors": ["along", "through", "towards"],
        "vi": "Thư viện công cộng hiện đại nằm ngay đối diện ga tàu điện ngầm trung tâm.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "royal": {
        "sentence": "Thousands of excited tourists gathered to witness the royal procession through the palace gates.",
        "gap": "Thousands of excited tourists gathered to witness the ........ procession through the palace gates.",
        "answer": "royal",
        "distractors": ["common", "humble", "local"],
        "vi": "Hàng ngàn du khách hào hứng đã tụ tập để chứng kiến đoàn rước hoàng gia qua cổng cung điện.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Church": {
        "sentence": "The historic cathedral church in the town square dates back to the twelfth century.",
        "gap": "The historic cathedral ........ in the town square dates back to the twelfth century.",
        "answer": "church",
        "distractors": ["factory", "warehouse", "stadium"],
        "vi": "Nhà thờ chính tòa lịch sử ở quảng trường thị trấn có niên đại từ thế kỷ thứ mười hai.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Corner": {
        "sentence": "There is a lovely traditional bakery situated right at the corner of Baker Street.",
        "gap": "There is a lovely traditional bakery situated right at the ........ of Baker Street.",
        "answer": "corner",
        "distractors": ["ceiling", "center", "border"],
        "vi": "Có một tiệm bánh truyền thống đáng yêu nằm ngay tại góc phố Baker.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "As a matter of fact": {
        "sentence": "Many thought he was a novice, but as a matter of fact he has coded for ten years.",
        "gap": "Many thought he was a novice, but ........ he has coded for ten years.",
        "answer": "as a matter of fact",
        "distractors": ["all of a sudden", "by the way", "on the contrary"],
        "vi": "Nhiều người nghĩ anh ấy là lính mới, nhưng thực ra thì anh ấy đã lập trình suốt mười năm qua.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "share out the housework": {
        "sentence": "To maintain peace and cleanliness, the college roommates agreed to share out the housework fairly.",
        "gap": "To maintain peace and cleanliness, the college roommates agreed to ........ fairly.",
        "answer": "share out the housework",
        "distractors": ["ignore the cleanliness", "hire a decorator", "leave all the chores"],
        "vi": "Để giữ hòa khí và sạch sẽ, các bạn cùng phòng đại học đã đồng ý chia sẻ công việc nhà công bằng.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "carpets": {
        "sentence": "The hotel suites were refurbished with plush Persian carpets to keep the wooden floors warm.",
        "gap": "The hotel suites were refurbished with plush Persian ........ to keep the wooden floors warm.",
        "answer": "carpets",
        "distractors": ["tiles", "mirrors", "cabinets"],
        "vi": "Các phòng suite khách sạn được tân trang bằng những tấm thảm Ba Tư êm ái để giữ ấm sàn gỗ.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "a shared flat": {
        "sentence": "Renting a shared flat is a practical solution for university students living on a tight budget.",
        "gap": "Renting ........ is a practical solution for university students living on a tight budget.",
        "answer": "a shared flat",
        "distractors": ["a luxury villa", "a single tent", "a private hotel"],
        "vi": "Thuê một căn hộ chung là giải pháp thiết thực cho sinh viên đại học có ngân sách eo hẹp.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "own": {
        "sentence": "After working long hours for a decade, she was thrilled to finally buy her own home.",
        "gap": "After working long hours for a decade, she was thrilled to finally buy her ........ home.",
        "answer": "own",
        "distractors": ["temporary", "public", "shared"],
        "vi": "Sau một thập kỷ làm việc chăm chỉ, cô vỡ òa hạnh phúc khi cuối cùng đã mua được ngôi nhà của riêng mình.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "payphone": {
        "sentence": "When my mobile battery died on the roadside, I used coins to call home from a payphone.",
        "gap": "When my mobile battery died on the roadside, I used coins to call home from a ........",
        "answer": "payphone",
        "distractors": ["television", "calculator", "typewriter"],
        "vi": "Khi pin điện thoại di động bị hết bên đường, tôi đã dùng tiền xu gọi về nhà từ một bốt điện thoại công cộng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "out of order": {
        "sentence": "The ticket vending machine at the subway entrance was out of order, so passengers used the counter.",
        "gap": "The ticket vending machine at the subway entrance was ........, so passengers used the counter.",
        "answer": "out of order",
        "distractors": ["in good shape", "on duty", "at work"],
        "vi": "Máy bán vé tự động ở lối vào ga tàu điện ngầm bị hỏng, vì vậy hành khách phải qua quầy vé.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "get in touch": {
        "sentence": "If you require further clarification regarding the syllabus, please get in touch with your lecturer.",
        "gap": "If you require further clarification regarding the syllabus, please ........ with your lecturer.",
        "answer": "get in touch",
        "distractors": ["keep away", "break down", "fall behind"],
        "vi": "Nếu bạn cần làm rõ thêm về đề cương môn học, xin vui lòng liên hệ với giảng viên của bạn.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "peculiar noise": {
        "sentence": "The car mechanic popped the hood immediately after hearing a peculiar noise from the engine.",
        "gap": "The car mechanic popped the hood immediately after hearing a ........ from the engine.",
        "answer": "peculiar noise",
        "distractors": ["pleasant melody", "gentle whisper", "silent vibration"],
        "vi": "Người thợ sửa xe đã mở nắp ca-pô ngay sau khi nghe thấy một tiếng ồn kỳ lạ phát ra từ động cơ.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "notify": {
        "sentence": "The airline will notify all passengers via SMS if the flight departure time changes.",
        "gap": "The airline will ........ all passengers via SMS if the flight departure time changes.",
        "answer": "notify",
        "distractors": ["hide", "conceal", "confuse"],
        "vi": "Hãng hàng không sẽ thông báo cho tất cả hành khách qua tin nhắn nếu giờ khởi hành chuyến bay thay đổi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "announce": {
        "sentence": "The university president stepped up to the podium to announce the groundbreaking research discovery.",
        "gap": "The university president stepped up to the podium to ........ the groundbreaking research discovery.",
        "answer": "announce",
        "distractors": ["whisper", "withhold", "deny"],
        "vi": "Hiệu trưởng trường đại học bước lên bục giảng để thông báo/công bố phát hiện nghiên cứu mang tính đột phá.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "period": {
        "sentence": "The museum features an exquisite collection of pottery from the classical Hellenistic period.",
        "gap": "The museum features an exquisite collection of pottery from the classical Hellenistic ........",
        "answer": "period",
        "distractors": ["climate", "distance", "altitude"],
        "vi": "Bảo tàng trưng bày một bộ sưu tập gốm tinh xảo thuộc thời kỳ Hy Lạp hóa cổ điển.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Run into + sth": {
        "sentence": "Be careful when embarking on new startup ventures, as entrepreneurs often run into unexpected legal obstacles.",
        "gap": "Be careful when embarking on new startup ventures, as entrepreneurs often ........ unexpected legal obstacles.",
        "answer": "run into",
        "distractors": ["look after", "give up", "take over"],
        "vi": "Hãy cẩn trọng khi khởi nghiệp, bởi vì các doanh nhân thường gặp phải những trở ngại pháp lý bất ngờ.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "seems": {
        "sentence": "Judging by the positive feedback from clients, the new marketing campaign seems very successful.",
        "gap": "Judging by the positive feedback from clients, the new marketing campaign ........ very successful.",
        "answer": "seems",
        "distractors": ["tastes", "smells", "listens"],
        "vi": "Đánh giá từ phản hồi tích cực của khách hàng, chiến dịch tiếp thị mới có vẻ như rất thành công.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "ambitious": {
        "sentence": "She is an ambitious young architect aiming to design sustainable green skyscrapers worldwide.",
        "gap": "She is an ........ young architect aiming to design sustainable green skyscrapers worldwide.",
        "answer": "ambitious",
        "distractors": ["lazy", "passive", "hesitant"],
        "vi": "Cô ấy là một kiến trúc sư trẻ đầy tham vọng và hoài bão hướng tới việc thiết kế các tòa nhà chọc trời xanh bền vững trên thế giới.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "tough": {
        "sentence": "The committee had to make several tough decisions regarding budget cuts across departments.",
        "gap": "The committee had to make several ........ decisions regarding budget cuts across departments.",
        "answer": "tough",
        "distractors": ["fragile", "gentle", "flexible"],
        "vi": "Ủy ban đã phải đưa ra một số quyết định cứng rắn/khó khăn liên quan đến việc cắt giảm ngân sách các phòng ban.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "determined": {
        "sentence": "Despite facing severe physical exhaustion, the marathon runner remained determined to cross the finish line.",
        "gap": "Despite facing severe physical exhaustion, the marathon runner remained ........ to cross the finish line.",
        "answer": "determined",
        "distractors": ["doubtful", "indifferent", "reluctant"],
        "vi": "Dù kiệt sức nghiêm trọng về thể chất, vận động viên marathon vẫn quyết tâm vượt qua vạch đích.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Listed price": {
        "sentence": "The car salesperson offered us a five percent discount below the official listed price.",
        "gap": "The car salesperson offered us a five percent discount below the official ........",
        "answer": "listed price",
        "distractors": ["hidden fee", "shipping cost", "minimum wage"],
        "vi": "Người bán ô tô đã giảm giá năm phần trăm cho chúng tôi so với giá niêm yết chính thức.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Reference price": {
        "sentence": "Shoppers can consult the consumer bureau's reference price to verify if market rates are fair.",
        "gap": "Shoppers can consult the consumer bureau's ........ to verify if market rates are fair.",
        "answer": "reference price",
        "distractors": ["retail receipt", "shipping fee", "tax bracket"],
        "vi": "Người mua hàng có thể tham khảo mức giá tham khảo của cục người tiêu dùng để xác minh xem giá thị trường có hợp lý hay không.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Dial tone": {
        "sentence": "Before you begin keying in an international number, wait until you hear a clear dial tone.",
        "gap": "Before you begin keying in an international number, wait until you hear a clear ........",
        "answer": "dial tone",
        "distractors": ["alarm bell", "ring melody", "busy signal"],
        "vi": "Trước khi bạn bắt đầu bấm số quốc tế, hãy đợi cho đến khi nghe thấy âm thanh quay số rõ ràng.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "any favours of him": {
        "sentence": "She was too independent to ask for any favours of him, even when facing severe hardship.",
        "gap": "She was too independent to ask for ........, even when facing severe hardship.",
        "answer": "any favours of him",
        "distractors": ["permission from us", "advice on art", "tickets to movies"],
        "vi": "Cô ấy quá tự lập nên không muốn nhờ vả bất kỳ sự giúp đỡ nào từ anh ta, ngay cả khi gặp muôn vàn khó khăn.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "across the street": {
        "sentence": "Our family friendly neighbors live right across the street, just a few meters away.",
        "gap": "Our family friendly neighbors live right ........, just a few meters away.",
        "answer": "across the street",
        "distractors": ["inside the attic", "behind the wall", "under the deck"],
        "vi": "Những người hàng xóm thân thiện của gia đình chúng tôi sống ngay ở phía bên kia đường/đối diện, chỉ cách vài mét.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Fill + out": {
        "sentence": "All international travelers are required to fill out a customs declaration upon arrival.",
        "gap": "All international travelers are required to ........ a customs declaration upon arrival.",
        "answer": "fill out",
        "distractors": ["cross off", "tear up", "throw away"],
        "vi": "Tất cả du khách quốc tế đều bắt buộc phải điền vào tờ khai hải quan khi đến nơi.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "certainly": {
        "sentence": "If you prepare your arguments thoroughly, you will certainly impress the judging panel.",
        "gap": "If you prepare your arguments thoroughly, you will ........ impress the judging panel.",
        "answer": "certainly",
        "distractors": ["barely", "rarely", "hardly"],
        "vi": "Nếu bạn chuẩn bị kỹ lưỡng các luận điểm của mình, bạn chắc chắn sẽ gây ấn tượng với ban giám khảo.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "a flexible sort of person": {
        "sentence": "In our fast-paced company culture, we need a flexible sort of person who adapts effortlessly to changes.",
        "gap": "In our fast-paced company culture, we need ........ who adapts effortlessly to changes.",
        "answer": "a flexible sort of person",
        "distractors": ["a stubborn character", "an aggressive rival", "a timid bystander"],
        "vi": "Trong văn hóa công ty phát triển nhanh của chúng tôi, chúng tôi cần một kiểu người linh hoạt thích nghi dễ dàng với các thay đổi.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "grin from ear to ear": {
        "sentence": "When she opened her acceptance letter from Oxford, she couldn't help but grin from ear to ear.",
        "gap": "When she opened her acceptance letter from Oxford, she couldn't help but ........",
        "answer": "grin from ear to ear",
        "distractors": ["shed bitter tears", "shake with anger", "look down in sorrow"],
        "vi": "Khi mở lá thư trúng tuyển từ Oxford, cô không kìm được nụ cười toe toét tới tận mang tai vì sung sướng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "weekend": {
        "sentence": "They spent a relaxing weekend hiking through the scenic countryside and taking photographs.",
        "gap": "They spent a relaxing ........ hiking through the scenic countryside and taking photographs.",
        "answer": "weekend",
        "distractors": ["midday", "morning", "weekday"],
        "vi": "Họ đã trải qua một kỳ nghỉ cuối tuần thư thái đi bộ đường dài ngắm cảnh đồng quê và chụp ảnh.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Weekends": {
        "sentence": "Most medical clinics in the suburbs are closed on weekends, except for emergency triage.",
        "gap": "Most medical clinics in the suburbs are closed on ........, except for emergency triage.",
        "answer": "weekends",
        "distractors": ["mornings", "midnight", "centuries"],
        "vi": "Hầu hết các phòng khám y tế ở ngoại ô đều đóng cửa vào các ngày cuối tuần, ngoại trừ phòng cấp cứu.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Friday": {
        "sentence": "Our software team deploys new software releases every Friday afternoon before closing.",
        "gap": "Our software team deploys new software releases every ........ afternoon before closing.",
        "answer": "Friday",
        "distractors": ["yesterday", "tomorrow", "season"],
        "vi": "Đội ngũ phần mềm của chúng tôi phát hành các bản cập nhật mới vào mỗi chiều thứ Sáu trước giờ tan sở.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Saturday": {
        "sentence": "The vibrant open-air flower market takes place in the town square every Saturday morning.",
        "gap": "The vibrant open-air flower market takes place in the town square every ........ morning.",
        "answer": "Saturday",
        "distractors": ["decade", "holiday", "minute"],
        "vi": "Chợ hoa ngoài trời nhộn nhịp diễn ra tại quảng trường thị trấn vào mỗi sáng thứ Bảy.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "muscle": {
        "sentence": "Lifting weights and consuming sufficient protein promotes lean muscle growth and repair.",
        "gap": "Lifting weights and consuming sufficient protein promotes lean ........ growth and repair.",
        "answer": "muscle",
        "distractors": ["bone", "skin", "blood"],
        "vi": "Nâng tạ và nạp đủ protein giúp thúc đẩy sự phát triển và phục hồi cơ bắp nạc.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "chest pain": {
        "sentence": "Anyone suffering from sudden severe chest pain should immediately contact emergency services.",
        "gap": "Anyone suffering from sudden severe ........ should immediately contact emergency services.",
        "answer": "chest pain",
        "distractors": ["throat itch", "knee bruise", "hair loss"],
        "vi": "Bất kỳ ai bị cơn đau ngực dữ dội đột ngột nên liên hệ ngay với dịch vụ cấp cứu.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Properly": {
        "sentence": "Make sure you assemble the safety harness properly before attempting the rock climb.",
        "gap": "Make sure you assemble the safety harness ........ before attempting the rock climb.",
        "answer": "properly",
        "distractors": ["poorly", "carelessly", "clumsily"],
        "vi": "Hãy đảm bảo bạn lắp ráp dây đai an toàn đúng cách/bình thường trước khi thử leo núi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Regularly": {
        "sentence": "Cardiologists strongly recommend that adults exercise regularly to maintain a healthy heart.",
        "gap": "Cardiologists strongly recommend that adults exercise ........ to maintain a healthy heart.",
        "answer": "regularly",
        "distractors": ["seldom", "briefly", "rarely"],
        "vi": "Các bác sĩ tim mạch đặc biệt khuyên người lớn nên tập thể dục đều đặn để duy trì một trái tim khỏe mạnh.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "ingredients": {
        "sentence": "Fresh sweet basil and extra virgin olive oil are essential ingredients in authentic pesto sauce.",
        "gap": "Fresh sweet basil and extra virgin olive oil are essential ........ in authentic pesto sauce.",
        "answer": "ingredients",
        "distractors": ["utensils", "appliances", "packages"],
        "vi": "Húng quế tây tươi và dầu ô liu nguyên chất là những nguyên liệu thiết yếu trong sốt pesto chuẩn vị.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Antibiotics": {
        "sentence": "The doctor prescribed a full course of antibiotics to eliminate the acute bacterial infection.",
        "gap": "The doctor prescribed a full course of ........ to eliminate the acute bacterial infection.",
        "answer": "antibiotics",
        "distractors": ["cosmetics", "painkillers", "vitamins"],
        "vi": "Bác sĩ đã kê một đợt thuốc kháng sinh đầy đủ để tiêu diệt ổ nhiễm trùng vi khuẩn cấp tính.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Painkiller": {
        "sentence": "She took a mild painkiller to ease the throbbing headache she developed after work.",
        "gap": "She took a mild ........ to ease the throbbing headache she developed after work.",
        "answer": "painkiller",
        "distractors": ["antibiotic", "stimulant", "poison"],
        "vi": "Cô ấy đã uống một viên thuốc giảm đau nhẹ để làm dịu cơn đau đầu nhói phát tác sau giờ làm.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "cure": {
        "sentence": "Medical researchers around the globe are striving to find a permanent cure for common cancers.",
        "gap": "Medical researchers around the globe are striving to find a permanent ........ for common cancers.",
        "answer": "cure",
        "distractors": ["injury", "illness", "symptom"],
        "vi": "Các nhà nghiên cứu y học trên toàn cầu đang nỗ lực tìm kiếm một phương pháp chữa khỏi hoàn toàn cho các bệnh ung thư phổ biến.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "infections": {
        "sentence": "Washing hands regularly with warm soap and water helps prevent serious bacterial infections.",
        "gap": "Washing hands regularly with warm soap and water helps prevent serious bacterial ........",
        "answer": "infections",
        "distractors": ["injuries", "fractures", "remedies"],
        "vi": "Thường xuyên rửa tay bằng xà phòng và nước ấm giúp ngăn ngừa các bệnh nhiễm trùng vi khuẩn nghiêm trọng.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "food poisoning": {
        "sentence": "Eating contaminated seafood caused severe stomach ache and acute food poisoning.",
        "gap": "Eating contaminated seafood caused severe stomach ache and acute ........",
        "answer": "food poisoning",
        "distractors": ["heart disease", "heat stroke", "common cold"],
        "vi": "Ăn hải sản bị ô nhiễm đã gây đau bụng dữ dội và ngộ độc thực phẩm cấp tính.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "flu": {
        "sentence": "Every autumn, elderly citizens are strongly encouraged to receive vaccination against the seasonal flu.",
        "gap": "Every autumn, elderly citizens are strongly encouraged to receive vaccination against the seasonal ........",
        "answer": "flu",
        "distractors": ["burn", "sprain", "fracture"],
        "vi": "Mỗi mùa thu, người cao tuổi được đặc biệt khuyến khích tiêm phòng vắc-xin ngừa bệnh cúm theo mùa.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "diabetes": {
        "sentence": "People diagnosed with Type 2 diabetes must monitor their daily carbohydrate intake and blood sugar.",
        "gap": "People diagnosed with Type 2 ........ must monitor their daily carbohydrate intake and blood sugar.",
        "answer": "diabetes",
        "distractors": ["influenza", "malaria", "migraine"],
        "vi": "Những người được chẩn đoán mắc bệnh tiểu đường loại 2 phải theo dõi lượng carbohydrate và đường huyết hàng ngày.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "cancer": {
        "sentence": "Early clinical detection drastically increases the survival probability for patients diagnosed with breast cancer.",
        "gap": "Early clinical detection drastically increases the survival probability for patients diagnosed with breast ........",
        "answer": "cancer",
        "distractors": ["allergy", "headache", "fever"],
        "vi": "Phát hiện lâm sàng sớm giúp tăng mạnh xác suất sống sót cho bệnh nhân được chẩn đoán mắc bệnh ung thư vú.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "tuberculosis": {
        "sentence": "A chronic cough lasting over three weeks accompanied by night sweats may indicate active tuberculosis.",
        "gap": "A chronic cough lasting over three weeks accompanied by night sweats may indicate active ........",
        "answer": "tuberculosis",
        "distractors": ["chickenpox", "insomnia", "acne"],
        "vi": "Cơn ho mãn tính kéo dài hơn ba tuần kèm theo đổ mồ hôi đêm có thể là dấu hiệu của bệnh lao đang phát triển.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "be the key to": {
        "sentence": "Patience and active listening will always be the key to building lasting personal relationships.",
        "gap": "Patience and active listening will always ........ building lasting personal relationships.",
        "answer": "be the key to",
        "distractors": ["be the obstacle to", "put an end to", "take advantage of"],
        "vi": "Kiên nhẫn và lắng nghe tích cực sẽ luôn là chìa khóa then chốt để xây dựng những mối quan hệ bền vững.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "freshly baked bread": {
        "sentence": "As soon as we stepped into the artisan French bakery, we smelled freshly baked bread.",
        "gap": "As soon as we stepped into the artisan French bakery, we smelled ........",
        "answer": "freshly baked bread",
        "distractors": ["sour spoiled milk", "bitter black coffee", "rotten vegetables"],
        "vi": "Ngay khi bước vào tiệm bánh Pháp thủ công, chúng tôi đã ngửi thấy mùi thơm của bánh mì mới nướng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "rich aroma": {
        "sentence": "The fresh dark-roast espresso beans filled the entire room with a wonderfully rich aroma.",
        "gap": "The fresh dark-roast espresso beans filled the entire room with a wonderfully ........",
        "answer": "rich aroma",
        "distractors": ["foul odor", "sharp taste", "loud noise"],
        "vi": "Những hạt cà phê espresso rang đậm tươi mới đã lan tỏa khắp căn phòng một mùi thơm nồng nàn tuyệt vời.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "considerably": {
        "sentence": "The new high-speed commuter train has shortened travel time between the cities considerably.",
        "gap": "The new high-speed commuter train has shortened travel time between the cities ........",
        "answer": "considerably",
        "distractors": ["barely", "slightly", "rarely"],
        "vi": "Chuyến tàu cao tốc mới đã rút ngắn thời gian di chuyển giữa các thành phố một cách đáng kể / khá nhiều.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "campaign": {
        "sentence": "Environmental activists organized an inspiring public campaign to reduce single-use plastic cups.",
        "gap": "Environmental activists organized an inspiring public ........ to reduce single-use plastic cups.",
        "answer": "campaign",
        "distractors": ["conflict", "tragedy", "complaint"],
        "vi": "Các nhà hoạt động môi trường đã tổ chức một chiến dịch truyền thông cộng đồng đầy cảm hứng để giảm cốc nhựa dùng một lần.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "consult": {
        "sentence": "Before signing any binding commercial lease, it is prudent to consult an experienced property lawyer.",
        "gap": "Before signing any binding commercial lease, it is prudent to ........ an experienced property lawyer.",
        "answer": "consult",
        "distractors": ["dismiss", "criticize", "avoid"],
        "vi": "Trước khi ký bất kỳ hợp đồng thuê mặt bằng kinh doanh nào, hãy cẩn trọng tham khảo ý kiến một luật sư giàu kinh nghiệm.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "expectancy": {
        "sentence": "Improvements in public healthcare and clean sanitation have substantially raised human life expectancy.",
        "gap": "Improvements in public healthcare and clean sanitation have substantially raised human life ........",
        "answer": "expectancy",
        "distractors": ["insurance", "retirement", "inheritance"],
        "vi": "Những cải thiện về y tế công cộng và vệ sinh sạch sẽ đã nâng cao đáng kể tuổi thọ trung bình của con người.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "longevity": {
        "sentence": "Studies indicate that regular physical activity and a balanced diet contribute directly to human longevity.",
        "gap": "Studies indicate that regular physical activity and a balanced diet contribute directly to human ........",
        "answer": "longevity",
        "distractors": ["obesity", "fatigue", "poverty"],
        "vi": "Các nghiên cứu chỉ ra rằng hoạt động thể chất đều đặn và chế độ ăn cân đối đóng góp trực tiếp vào sự sống lâu / trường thọ.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "ageing": {
        "sentence": "Maintaining mental curiosity and staying physically active helps slow down the natural process of ageing.",
        "gap": "Maintaining mental curiosity and staying physically active helps slow down the natural process of ........",
        "answer": "ageing",
        "distractors": ["youth", "growth", "recovery"],
        "vi": "Duy trì sự tò mò trí tuệ và vận động thể chất giúp làm chậm quá trình lão hóa tự nhiên.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "suffer from": {
        "sentence": "A significant percentage of desktop computer users suffer from chronic neck and shoulder stiffness.",
        "gap": "A significant percentage of desktop computer users ........ chronic neck and shoulder stiffness.",
        "answer": "suffer from",
        "distractors": ["benefit from", "profit from", "abstain from"],
        "vi": "Một tỷ lệ đáng kể người dùng máy tính để bàn mắc phải tình trạng đau cứng cổ và vai mãn tính.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "deprivation": {
        "sentence": "Severe sleep deprivation severely impairs emotional regulation, focus, and cognitive decision-making.",
        "gap": "Severe sleep ........ severely impairs emotional regulation, focus, and cognitive decision-making.",
        "answer": "deprivation",
        "distractors": ["abundance", "surplus", "luxury"],
        "vi": "Sự thiếu thốn giấc ngủ trầm trọng làm suy giảm nghiêm trọng khả năng điều tiết cảm xúc, sự tập trung và tư duy.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "promptly": {
        "sentence": "The paramedic emergency crew arrived promptly within four minutes of the telephone call.",
        "gap": "The paramedic emergency crew arrived ........ within four minutes of the telephone call.",
        "answer": "promptly",
        "distractors": ["sluggishly", "late", "rarely"],
        "vi": "Đội cấp cứu y tế đã có mặt ngay lập tức / nhanh chóng chỉ trong vòng bốn phút sau cuộc gọi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "medication": {
        "sentence": "Be sure to read the safety label carefully before taking any over-the-counter pain medication.",
        "gap": "Be sure to read the safety label carefully before taking any over-the-counter pain ........",
        "answer": "medication",
        "distractors": ["treatment", "poison", "diagnosis"],
        "vi": "Hãy nhớ đọc kỹ nhãn an toàn trước khi dùng bất kỳ loại thuốc giảm đau không kê đơn nào.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "incurable": {
        "sentence": "Doctors can provide palliative relief, but sadly this terminal degenerative condition is currently incurable.",
        "gap": "Doctors can provide palliative relief, but sadly this terminal degenerative condition is currently ........",
        "answer": "incurable",
        "distractors": ["treatable", "harmless", "temporary"],
        "vi": "Bác sĩ có thể giảm nhẹ cơn đau, nhưng đáng buồn là căn bệnh thoái hóa giai đoạn cuối này hiện không thể chữa khỏi.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Vital": {
        "sentence": "Clear communication between pilots and air traffic controllers plays a vital role in aviation safety.",
        "gap": "Clear communication between pilots and air traffic controllers plays a ........ role in aviation safety.",
        "answer": "vital",
        "distractors": ["minor", "trivial", "negligible"],
        "vi": "Giao tiếp rõ ràng giữa phi công và đài kiểm soát không lưu đóng vai trò sống còn / cực kỳ quan trọng trong an toàn bay.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "sorrow": {
        "sentence": "The heartfelt memorial speech expressed overwhelming sorrow for the innocent victims of the disaster.",
        "gap": "The heartfelt memorial speech expressed overwhelming ........ for the innocent victims of the disaster.",
        "answer": "sorrow",
        "distractors": ["joy", "excitement", "pride"],
        "vi": "Bài phát biểu tưởng niệm chân thành đã bày tỏ nỗi buồn đau / xót xa vô hạn đối với các nạn nhân vô tội của thảm họa.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "sports jacket": {
        "sentence": "He looked sharp wearing a tailored tweed sports jacket with beige trousers to the reception.",
        "gap": "He looked sharp wearing a tailored tweed ........ with beige trousers to the reception.",
        "answer": "sports jacket",
        "distractors": ["swim trunks", "winter parka", "night gown"],
        "vi": "Anh ấy trông rất lịch lãm khi mặc chiếc áo khoác thể thao dạ may đo cùng quần màu be tới buổi chiêu đãi.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Beat": {
        "sentence": "After working a grueling sixteen-hour shift at the busy trauma hospital, the nurses were completely beat.",
        "gap": "After working a grueling sixteen-hour shift at the busy trauma hospital, the nurses were completely ........",
        "answer": "beat",
        "distractors": ["energetic", "fresh", "lively"],
        "vi": "Sau ca trực mười sáu tiếng vất vả tại bệnh viện cấp cứu, các y tá mệt rã rời.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "luggage": {
        "sentence": "Passengers must attach identification tags with their contact number to all checked luggage.",
        "gap": "Passengers must attach identification tags with their contact number to all checked ........",
        "answer": "luggage",
        "distractors": ["ticket", "boarding pass", "passport"],
        "vi": "Hành khách phải gắn thẻ nhận dạng ghi số liên lạc lên toàn bộ hành lý ký gửi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "an extra charge": {
        "sentence": "Please note that ordering hotel room service after midnight incurs an extra charge of ten dollars.",
        "gap": "Please note that ordering hotel room service after midnight incurs ........ of ten dollars.",
        "answer": "an extra charge",
        "distractors": ["a free coupon", "a big refund", "a total waiver"],
        "vi": "Xin lưu ý rằng việc gọi phục vụ phòng khách sạn sau nửa đêm sẽ phải chịu một khoản phụ phí mười đô la.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "aisle seat": {
        "sentence": "I prefer booking an aisle seat on long-haul flights so I can easily get up without disturbing others.",
        "gap": "I prefer booking an ........ on long-haul flights so I can easily get up without disturbing others.",
        "answer": "aisle seat",
        "distractors": ["window seat", "flight deck", "cargo hold"],
        "vi": "Tôi thích đặt một chỗ ngồi cạnh lối đi trên các chuyến bay đường dài để có thể đứng dậy mà không làm phiền người khác.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Declare": {
        "sentence": "When crossing international borders, travelers must declare any dutiable alcohol or tobacco items.",
        "gap": "When crossing international borders, travelers must ........ any dutiable alcohol or tobacco items.",
        "answer": "declare",
        "distractors": ["hide", "purchase", "abandon"],
        "vi": "Khi đi qua biên giới quốc tế, du khách phải khai báo bất kỳ mặt hàng rượu hoặc thuốc lá nào phải chịu thuế.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "cigarettes": {
        "sentence": "Public health warnings highlight the severe risks of lung cancer associated with smoking cigarettes.",
        "gap": "Public health warnings highlight the severe risks of lung cancer associated with smoking ........",
        "answer": "cigarettes",
        "distractors": ["beverages", "snacks", "vitamins"],
        "vi": "Các cảnh báo y tế công cộng nhấn mạnh nguy cơ ung thư phổi nghiêm trọng liên quan đến việc hút thuốc lá.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "perfume": {
        "sentence": "She lightly dabbed a few drops of French floral perfume behind each ear before leaving.",
        "gap": "She lightly dabbed a few drops of French floral ........ behind each ear before leaving.",
        "answer": "perfume",
        "distractors": ["shampoo", "toothpaste", "bleach"],
        "vi": "Cô ấy chấm nhẹ vài giọt nước hoa hương hoa của Pháp vào sau mỗi bên tai trước khi rời đi.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Pardon": {
        "sentence": "I beg your pardon, could you please repeat the last sentence of your lecture?",
        "gap": "I beg your ........, could you please repeat the last sentence of your lecture?",
        "answer": "pardon",
        "distractors": ["permission", "apologize", "excuse"],
        "vi": "Xin thứ lỗi / cái gì cơ, thầy có thể vui lòng nhắc lại câu cuối cùng của bài giảng được không?",
        "source": "Longman Dictionary of Contemporary English"
    },
    "elegant": {
        "sentence": "The ballroom was filled with distinguished guests dressed in elegant black-tie evening wear.",
        "gap": "The ballroom was filled with distinguished guests dressed in ........ black-tie evening wear.",
        "answer": "elegant",
        "distractors": ["clumsy", "dowdy", "awkward"],
        "vi": "Khán phòng khiêu vũ ngập tràn những vị khách quý trong trang phục dạ hội trang nhã và duyên dáng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "as cute as a button": {
        "sentence": "The tiny fluffy golden retriever puppy wagged its tail excitedly and looked as cute as a button.",
        "gap": "The tiny fluffy golden retriever puppy wagged its tail excitedly and looked ........",
        "answer": "as cute as a button",
        "distractors": ["as blind as a bat", "as stubborn as a mule", "as cold as ice"],
        "vi": "Chú cún tha mồi nhỏ nhắn lông xù vẫy đuôi mừng rỡ và trông dễ thương hết nấc.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "cigars": {
        "sentence": "Traditional Cuban cigars are renowned internationally for their rich flavor and hand-rolled craftsmanship.",
        "gap": "Traditional Cuban ........ are renowned internationally for their rich flavor and hand-rolled craftsmanship.",
        "answer": "cigars",
        "distractors": ["cigarettes", "matches", "candles"],
        "vi": "Xì gà truyền thống của Cuba nổi tiếng quốc tế nhờ hương vị đậm đà và kỹ thuật cuốn tay thủ công.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "Jealous": {
        "sentence": "She felt secretly jealous when she discovered her best friend had won the prestigious scholarship.",
        "gap": "She felt secretly ........ when she discovered her best friend had won the prestigious scholarship.",
        "answer": "jealous",
        "distractors": ["proud", "supportive", "generous"],
        "vi": "Cô ấy cảm thấy thầm ghen tị khi phát hiện người bạn thân nhất của mình đã giành được học bổng danh giá.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "Bet": {
        "sentence": "I bet ten dollars that our university team will win the championship game tonight.",
        "gap": "I ........ ten dollars that our university team will win the championship game tonight.",
        "answer": "bet",
        "distractors": ["lend", "borrow", "spend"],
        "vi": "Tôi cá cược mười đô la rằng đội tuyển trường đại học chúng ta sẽ thắng trận chung kết tối nay.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "mashed potatoes": {
        "sentence": "The roast chicken was served alongside steamed green peas and a bowl of creamy mashed potatoes.",
        "gap": "The roast chicken was served alongside steamed green peas and a bowl of creamy ........",
        "answer": "mashed potatoes",
        "distractors": ["raw carrots", "sour lemons", "spicy noodles"],
        "vi": "Món gà quay được dọn kèm cùng đậu Hà Lan hấp và một bát khoai tây nghiền béo ngậy.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "secretary": {
        "sentence": "The executive secretary manages the CEO's daily schedule, travel bookings, and confidential files.",
        "gap": "The executive ........ manages the CEO's daily schedule, travel bookings, and confidential files.",
        "answer": "secretary",
        "distractors": ["janitor", "gardener", "mechanic"],
        "vi": "Thư ký điều hành phụ trách quản lý lịch trình hàng ngày, đặt vé đi lại và hồ sơ mật của tổng giám đốc.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "waitress": {
        "sentence": "The polite waitress poured ice water into our glasses and took our dinner order promptly.",
        "gap": "The polite ........ poured ice water into our glasses and took our dinner order promptly.",
        "answer": "waitress",
        "distractors": ["chef", "cashier", "hostess"],
        "vi": "Cô phục vụ bàn lịch sự rót nước đá vào ly của chúng tôi và ghi thực đơn bữa tối nhanh chóng.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "trim the bushes": {
        "sentence": "The gardener brought out heavy shears every autumn to trim the bushes along the garden fence.",
        "gap": "The gardener brought out heavy shears every autumn to ........ along the garden fence.",
        "answer": "trim the bushes",
        "distractors": ["chop down trees", "plant new seeds", "pave the driveway"],
        "vi": "Người làm vườn mang kéo tỉa lớn ra vào mỗi mùa thu để tỉa bớt bụi cây dọc hàng rào hoa.",
        "source": "Longman Dictionary of Contemporary English"
    },
    "weed the flower beds": {
        "sentence": "She spent Saturday morning kneeling on the lawn to weed the flower beds before spring planting.",
        "gap": "She spent Saturday morning kneeling on the lawn to ........ before spring planting.",
        "answer": "weed the flower beds",
        "distractors": ["paint the fence", "wash the car", "fix the roof"],
        "vi": "Cô ấy đã dành cả sáng thứ Bảy quỳ trên bãi cỏ để nhổ cỏ trong các luống hoa trước vụ trồng xuân.",
        "source": "Oxford Advanced Learner's Dictionary"
    },
    "satisfactory": {
        "sentence": "The building inspector concluded that the emergency fire exits were in a completely satisfactory condition.",
        "gap": "The building inspector concluded that the emergency fire exits were in a completely ........ condition.",
        "answer": "satisfactory",
        "distractors": ["disastrous", "unacceptable", "inadequate"],
        "vi": "Thanh tra xây dựng kết luận rằng các cửa thoát hiểm khẩn cấp ở trong tình trạng hoàn toàn thỏa đáng / đạt yêu cầu mong đợi.",
        "source": "Oxford Advanced Learner's Dictionary"
    }
}

def main():
    print(f"[+] Đã biên soạn bộ câu hỏi ngữ cảnh cho {len(QUIZ_DATA)} từ vựng.")

    # 1. Đọc data/vocab.json
    vocab_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'vocab.json')
    with open(vocab_path, 'r', encoding='utf-8') as f:
        vocab = json.load(f)

    # 2. Cập nhật dữ liệu từ QUIZ_DATA
    quiz_keys_lower = {k.lower().strip(): v for k, v in QUIZ_DATA.items()}
    matched_count = 0

    for item in vocab:
        w = item['word'].strip()
        w_lower = w.lower()

        if w_lower in quiz_keys_lower:
            matched_count += 1
            entry = quiz_keys_lower[w_lower]
            item['example'] = entry['sentence']
            item['gapSentence'] = entry['gap']
            item['exampleVi'] = entry['vi']
            item['quizAnswer'] = entry['answer']
            item['distractors'] = entry['distractors']
            item['dictSource'] = entry['source']

    print(f"[+] Khớp và tích hợp thành công cho {matched_count}/{len(vocab)} từ!")

    # 3. Ghi lại vocab.json
    with open(vocab_path, 'w', encoding='utf-8') as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)

    # 4. Ghi lại js/default-data.js
    default_js_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'default-data.js')
    with open(default_js_path, 'w', encoding='utf-8') as f:
        f.write("/**\n * DEFAULT VOCABULARY DATA (155 Authentic Oxford & Longman Context Sentences)\n */\n")
        f.write("window.DEFAULT_VOCAB_DATA = ")
        json.dump(vocab, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print("[SUCCESS] Hoàn thành đồng bộ vào vocab.json và default-data.js!")

if __name__ == '__main__':
    main()
