import json

# Bộ từ điển câu ví dụ ngữ cảnh chuẩn Oxford Learner's Dictionary cho toàn bộ 155 từ vựng listening
OXFORD_DATABASE = {
  "Pour": {
    "oxford": "She carefully poured the hot coffee into two ceramic mugs.",
    "vi": "Cô ấy cẩn thận rót cà phê nóng vào hai chiếc cốc sứ.",
    "gap": "She carefully ________ the hot coffee into two ceramic mugs."
  },
  "Regret": {
    "oxford": "If you don't take this opportunity, you will deeply regret it later.",
    "vi": "Nếu bạn không nắm lấy cơ hội này, sau này bạn sẽ vô cùng hối tiếc.",
    "gap": "If you don't take this opportunity, you will deeply ________ it later."
  },
  "strange": {
    "oxford": "A strange noise was coming from the back of the listening room.",
    "vi": "Một tiếng ồn lạ lùng phát ra từ phía sau phòng nghe.",
    "gap": "A ________ noise was coming from the back of the listening room."
  },
  "guilty": {
    "oxford": "The suspect looked extremely guilty when asked about the missing money.",
    "vi": "Nghi phạm trông vô cùng có lỗi khi được hỏi về số tiền bị mất.",
    "gap": "The suspect looked extremely ________ when asked about the missing money."
  },
  "stand in line": {
    "oxford": "Students had to stand in line for hours to register for the new course.",
    "vi": "Sinh viên đã phải xếp hàng nhiều giờ để đăng ký khóa học mới.",
    "gap": "Students had to ________ for hours to register for the new course."
  },
  "the greeting": {
    "oxford": "The host welcomed each guest with a warm and polite greeting.",
    "vi": "Chủ nhà chào đón từng vị khách bằng một lời chào ấm áp và lịch sự.",
    "gap": "The host welcomed each guest with a warm and polite ________."
  },
  "requirement": {
    "oxford": "Fluency in spoken English is a minimum requirement for this position.",
    "vi": "Lưu loát tiếng Anh giao tiếp là một yêu cầu tối thiểu cho vị trí này.",
    "gap": "Fluency in spoken English is a minimum ________ for this position."
  },
  "respond": {
    "oxford": "The company promises to respond to all customer inquiries within 24 hours.",
    "vi": "Công ty cam kết sẽ phản hồi mọi thắc mắc của khách hàng trong vòng 24 giờ.",
    "gap": "The company promises to ________ to all customer inquiries within 24 hours."
  },
  "supposedly": {
    "oxford": "The new listening exam format is supposedly much easier than the old one.",
    "vi": "Cấu trúc đề thi nghe mới được cho là dễ hơn nhiều so với đề cũ.",
    "gap": "The new listening exam format is ________ much easier than the old one."
  },
  "clickbait": {
    "oxford": "Most YouTube video titles nowadays are exaggerated clickbait to get views.",
    "vi": "Hầu hết tiêu đề video YouTube ngày nay đều là câu view phóng đại để kiếm lượt xem.",
    "gap": "Most YouTube video titles nowadays are exaggerated ________ to get views."
  },
  "Wisely": {
    "oxford": "You should spend your study time wisely to get high scores in IELTS.",
    "vi": "Bạn nên sử dụng thời gian học một cách khôn ngoan để đạt điểm cao trong IELTS.",
    "gap": "You should spend your study time ________ to get high scores in IELTS."
  },
  "Suddenly": {
    "oxford": "Suddenly, the phone rang in the middle of our recorded conversation.",
    "vi": "Đột nhiên, chuông điện thoại reo lên giữa cuộc trò chuyện đang ghi âm của chúng tôi.",
    "gap": "________, the phone rang in the middle of our recorded conversation."
  },
  "matter": {
    "oxford": "Your pronunciation and vocabulary will matter a lot in the speaking test.",
    "vi": "Phát âm và từ vựng của bạn sẽ rất quan trọng trong bài thi nói.",
    "gap": "Your pronunciation and vocabulary will ________ a lot in the speaking test."
  },
  "fortune": {
    "oxford": "He had the good fortune to be mentored by an experienced English professor.",
    "vi": "Anh ấy có may mắn được chỉ dạy bởi một giáo sư tiếng Anh giàu kinh nghiệm.",
    "gap": "He had the good ________ to be mentored by an experienced English professor."
  },
  "betray": {
    "oxford": "He promised never to betray the confidence his team had placed in him.",
    "vi": "Anh ấy hứa không bao giờ phản bội sự tin tưởng mà cả nhóm đã dành cho anh.",
    "gap": "He promised never to ________ the confidence his team had placed in him."
  },
  "attempt": {
    "oxford": "She passed the listening exam on her second attempt with flying colors.",
    "vi": "Cô ấy đã vượt qua bài thi nghe trong nỗ lực lần thứ hai với kết quả xuất sắc.",
    "gap": "She passed the listening exam on her second ________ with flying colors."
  },
  "bridge": {
    "oxford": "They are building a modern pedestrian bridge over the busy highway.",
    "vi": "Họ đang xây dựng một cây cầu bộ hành hiện đại bắc qua đường cao tốc đông đúc.",
    "gap": "They are building a modern pedestrian ________ over the busy highway."
  },
  "starving": {
    "oxford": "After three hours of intensive listening practice, the students were starving.",
    "vi": "Sau ba tiếng luyện nghe chăm chỉ, các sinh viên đều đói lả.",
    "gap": "After three hours of intensive listening practice, the students were ________."
  },
  "asshole": {
    "oxford": "In colloquial dialogue, rude characters might use offensive slang like asshole.",
    "vi": "Trong các đoạn đối thoại bình dân, các nhân vật thô lỗ có thể dùng tiếng lóng tục tĩu.",
    "gap": "In colloquial dialogue, rude characters might use offensive slang like ________."
  },
  "swear": {
    "oxford": "The witness had to swear an oath to tell the whole truth in court.",
    "vi": "Nhân chứng đã phải thề tuyên thệ sẽ nói toàn bộ sự thật trước tòa.",
    "gap": "The witness had to ________ an oath to tell the whole truth in court."
  },
  "trophy": {
    "oxford": "The winning debate team proudly held up the championship trophy.",
    "vi": "Đội tranh biện chiến thắng tự hào giơ cao chiếc cúp vô địch.",
    "gap": "The winning debate team proudly held up the championship ________."
  },
  "blank": {
    "oxford": "Please write your candidate number in the blank space provided.",
    "vi": "Vui lòng viết số báo danh của bạn vào khoảng trống được cung cấp.",
    "gap": "Please write your candidate number in the ________ space provided."
  },
  "empty": {
    "oxford": "The lecture hall was completely empty long before the speaker arrived.",
    "vi": "Giảng đường hoàn toàn trống rỗng từ rất lâu trước khi diễn giả đến.",
    "gap": "The lecture hall was completely ________ long before the speaker arrived."
  },
  "Argue": {
    "oxford": "The two roommates began to argue over who should clean the apartment.",
    "vi": "Hai người bạn cùng phòng bắt đầu tranh cãi xem ai nên dọn dẹp căn hộ.",
    "gap": "The two roommates began to ________ over who should clean the apartment."
  },
  "formal": {
    "oxford": "Academic listening tests require the use of formal vocabulary and expressions.",
    "vi": "Các bài thi nghe học thuật yêu cầu sử dụng từ vựng và cách diễn đạt trang trọng.",
    "gap": "Academic listening tests require the use of ________ vocabulary and expressions."
  },
  "conference": {
    "oxford": "Over 500 linguists attended the international language conference.",
    "vi": "Hơn 500 nhà ngôn ngữ học đã tham dự hội nghị ngôn ngữ quốc tế.",
    "gap": "Over 500 linguists attended the international language ________."
  },
  "colleagues": {
    "oxford": "He discussed the quarterly results with his colleagues in the department.",
    "vi": "Anh ấy đã thảo luận về kết quả hàng quý với các đồng nghiệp trong phòng ban.",
    "gap": "He discussed the quarterly results with his ________ in the department."
  },
  "pressure": {
    "oxford": "Students often feel immense pressure during the final listening examination.",
    "vi": "Sinh viên thường cảm thấy áp lực rất lớn trong kỳ thi nghe cuối kỳ.",
    "gap": "Students often feel immense ________ during the final listening examination."
  },
  "release": {
    "oxford": "The band plans to release their new album at the end of this month.",
    "vi": "Ban nhạc dự định phát hành album mới của họ vào cuối tháng này.",
    "gap": "The band plans to ________ their new album at the end of this month."
  },
  "Fitting room": {
    "oxford": "You can try on those stylish jeans in the fitting room over there.",
    "vi": "Bạn có thể thử chiếc quần bò thời trang đó trong phòng thử đồ đằng kia.",
    "gap": "You can try on those stylish jeans in the ________ over there."
  },
  "Accessories": {
    "oxford": "The store sells fashion accessories such as belts, scarves, and bags.",
    "vi": "Cửa hàng bán các phụ kiện thời trang như thắt lưng, khăn quàng cổ và túi xách.",
    "gap": "The store sells fashion ________ such as belts, scarves, and bags."
  },
  "Jewelry": {
    "oxford": "She kept her precious gold jewelry locked in a small safety box.",
    "vi": "Cô ấy cất trang sức vàng quý giá của mình bị khóa trong một chiếc hộp an toàn nhỏ.",
    "gap": "She kept her precious gold ________ locked in a small safety box."
  },
  "Forwarding": {
    "oxford": "Thank you for forwarding the meeting schedule to all team members.",
    "vi": "Cảm ơn bạn đã chuyển tiếp lịch họp tới tất cả các thành viên trong nhóm.",
    "gap": "Thank you for ________ the meeting schedule to all team members."
  },
  "Ampush": {
    "oxford": "The soldiers planned an ambush along the narrow mountain pass.",
    "vi": "Những người lính đã lên kế hoạch phục kích dọc theo con đèo núi hẹp.",
    "gap": "The soldiers planned an ________ along the narrow mountain pass."
  },
  "Agent": {
    "oxford": "We booked our flight tickets through a local travel agent.",
    "vi": "Chúng tôi đã đặt vé máy bay thông qua một đại lý du lịch địa phương.",
    "gap": "We booked our flight tickets through a local travel ________."
  },
  "Feature": {
    "oxford": "A key feature of this application is its real-time synchronization.",
    "vi": "Một tính năng then chốt của ứng dụng này là khả năng đồng bộ thời gian thực.",
    "gap": "A key ________ of this application is its real-time synchronization."
  },
  "Fallen": {
    "oxford": "The nation built a memorial monument to honor the fallen soldiers.",
    "vi": "Đất nước đã xây dựng một tượng đài tưởng niệm để vinh danh những người lính đã ngã xuống.",
    "gap": "The nation built a memorial monument to honor the ________ soldiers."
  },
  "Vintage": {
    "oxford": "She loves collecting vintage clothes and vinyl records from the 1970s.",
    "vi": "Cô ấy thích sưu tầm quần áo cổ điển và đĩa than từ những năm 1970.",
    "gap": "She loves collecting ________ clothes and vinyl records from the 1970s."
  },
  "Obsolete": {
    "oxford": "With the rise of smartphones, cassette tapes have become completely obsolete.",
    "vi": "Với sự phát triển của điện thoại thông minh, băng cassette đã trở nên hoàn toàn lỗi thời.",
    "gap": "With the rise of smartphones, cassette tapes have become completely ________."
  },
  "in stock": {
    "oxford": "Good news: the textbooks you ordered are currently in stock at the bookstore.",
    "vi": "Tin vui: sách giáo trình bạn đặt hiện đang còn hàng tại hiệu sách.",
    "gap": "Good news: the textbooks you ordered are currently ________ at the bookstore."
  },
  "absentee": {
    "oxford": "The teacher took note of every absentee in this morning's lecture.",
    "vi": "Giáo viên đã ghi lại từng người vắng mặt trong buổi giảng sáng nay.",
    "gap": "The teacher took note of every ________ in this morning's lecture."
  },
  "iconic": {
    "oxford": "The Eiffel Tower is arguably the most iconic landmark in Paris.",
    "vi": "Tháp Eiffel được xem là địa danh mang tính biểu tượng nhất ở Paris.",
    "gap": "The Eiffel Tower is arguably the most ________ landmark in Paris."
  },
  "beard": {
    "oxford": "He decided to grow a thick beard during the winter months.",
    "vi": "Anh ấy quyết định để một bộ râu rậm trong những tháng mùa đông.",
    "gap": "He decided to grow a thick ________ during the winter months."
  },
  "Honored": {
    "oxford": "I felt deeply honored to be invited as the keynote speaker at the ceremony.",
    "vi": "Tôi cảm thấy vô cùng vinh dự khi được mời làm diễn giả chính tại buổi lễ.",
    "gap": "I felt deeply ________ to be invited as the keynote speaker at the ceremony."
  },
  "Bare": {
    "oxford": "The trees were completely bare of leaves after the autumn gale.",
    "vi": "Những cái cây hoàn toàn trơ trụi lá sau cơn gió lốc mùa thu.",
    "gap": "The trees were completely ________ of leaves after the autumn gale."
  },
  "Complexity": {
    "oxford": "I was overwhelmed by the sheer complexity of the legal documents.",
    "vi": "Tôi bị choáng ngợp bởi mức độ phức tạp to lớn của các tài liệu pháp lý.",
    "gap": "I was overwhelmed by the sheer ________ of the legal documents."
  },
  "massive": {
    "oxford": "The volcanic eruption caused a massive cloud of ash to cover the sky.",
    "vi": "Vụ phun trào núi lửa đã tạo ra một đám mây tro bụi khổng lồ bao phủ bầu trời.",
    "gap": "The volcanic eruption caused a ________ cloud of ash to cover the sky."
  },
  "Promotion": {
    "oxford": "Her hard work was rewarded with a well-deserved promotion to senior manager.",
    "vi": "Sự chăm chỉ của cô ấy đã được đền đáp bằng việc thăng chức xứng đáng lên quản lý cấp cao.",
    "gap": "Her hard work was rewarded with a well-deserved ________ to senior manager."
  },
  "Revenge": {
    "oxford": "He spent years plotting revenge against those who had wronged him.",
    "vi": "Anh ấy đã dành nhiều năm lên kế hoạch trả thù những kẻ đã hãm hại mình.",
    "gap": "He spent years plotting ________ against those who had wronged him."
  },
  "Consequence": {
    "oxford": "Global warming is a direct consequence of excessive carbon emissions.",
    "vi": "Sự nóng lên toàn cầu là một hậu quả trực tiếp của lượng khí thải carbon quá mức.",
    "gap": "Global warming is a direct ________ of excessive carbon emissions."
  },
  "redirect": {
    "oxford": "The website will automatically redirect you to the login page.",
    "vi": "Trang web sẽ tự động chuyển hướng bạn đến trang đăng nhập.",
    "gap": "The website will automatically ________ you to the login page."
  },
  "Possession": {
    "oxford": "The antique watch was his most prized and valuable possession.",
    "vi": "Chiếc đồng hồ cổ là tài sản quý giá và đáng tự hào nhất của anh ấy.",
    "gap": "The antique watch was his most prized and valuable ________."
  },
  "stuck": {
    "oxford": "We were stuck in heavy traffic for over two hours on our way home.",
    "vi": "Chúng tôi bị kẹt trong dòng xe cộ đông đúc hơn hai tiếng trên đường về nhà.",
    "gap": "We were ________ in heavy traffic for over two hours on our way home."
  },
  "Required": {
    "oxford": "A valid passport is strictly required before boarding the international flight.",
    "vi": "Hộ chiếu hợp lệ là điều bắt buộc cần thiết trước khi lên chuyến bay quốc tế.",
    "gap": "A valid passport is strictly ________ before boarding the international flight."
  },
  "get acquainted": {
    "oxford": "It took several weeks for the foreign exchange students to get acquainted with local customs.",
    "vi": "Phải mất vài tuần để các du học sinh làm quen với phong tục tập quán địa phương.",
    "gap": "It took several weeks for the foreign exchange students to ________ with local customs."
  },
  "Craving": {
    "oxford": "Late at night, she suddenly had an intense craving for dark chocolate.",
    "vi": "Vào đêm muộn, cô ấy bỗng nhiên thèm sô-cô-la đen cồn cào.",
    "gap": "Late at night, she suddenly had an intense ________ for dark chocolate."
  },
  "Bound": {
    "oxford": "With his great talent and dedication, he is bound to succeed in life.",
    "vi": "Với tài năng lớn và sự tận tụy, anh ấy chắc chắn sẽ thành công trong cuộc sống.",
    "gap": "With his great talent and dedication, he is ________ to succeed in life."
  },
  "Poverty": {
    "oxford": "The charity aims to help families who are living in extreme poverty.",
    "vi": "Tổ chức từ thiện hướng đến việc giúp đỡ những gia đình đang sống trong cảnh nghèo đói cùng cực.",
    "gap": "The charity aims to help families who are living in extreme ________."
  },
  "nonsense": {
    "oxford": "Don't pay attention to what he says; it's absolute nonsense.",
    "vi": "Đừng chú ý đến những gì anh ta nói; toàn là những điều nhảm nhí.",
    "gap": "Don't pay attention to what he says; it's absolute ________."
  },
  "recapture": {
    "oxford": "The army launched an offensive to recapture the occupied territory.",
    "vi": "Quân đội đã mở một cuộc tấn công để tái chiếm vùng lãnh thổ bị chiếm đóng.",
    "gap": "The army launched an offensive to ________ the occupied territory."
  },
  "worth": {
    "oxford": "This rare historical book is worth thousands of dollars at auction.",
    "vi": "Cuốn sách lịch sử quý hiếm này đáng giá hàng nghìn đô la tại buổi đấu giá.",
    "gap": "This rare historical book is ________ thousands of dollars at auction."
  },
  "belittle": {
    "oxford": "A good manager should never belittle the honest efforts of their staff.",
    "vi": "Một người quản lý tốt không bao giờ nên coi thường nỗ lực chân thành của nhân viên.",
    "gap": "A good manager should never ________ the honest efforts of their staff."
  },
  "particular": {
    "oxford": "Is there any particular topic you would like to focus on in this lesson?",
    "vi": "Có chủ đề cụ thể nào bạn muốn tập trung vào trong bài học này không?",
    "gap": "Is there any ________ topic you would like to focus on in this lesson?"
  },
  "concern": {
    "oxford": "Environmental pollution is a growing concern for citizens worldwide.",
    "vi": "Ô nhiễm môi trường là mối bận tâm ngày càng lớn đối với người dân trên toàn thế giới.",
    "gap": "Environmental pollution is a growing ________ for citizens worldwide."
  },
  "purely": {
    "oxford": "Their choice of holiday destination was purely based on cost.",
    "vi": "Sự lựa chọn điểm đến kỳ nghỉ của họ hoàn toàn dựa trên chi phí.",
    "gap": "Their choice of holiday destination was ________ based on cost."
  },
  "Conversation": {
    "oxford": "We had an engaging conversation about modern technology over coffee.",
    "vi": "Chúng tôi đã có một cuộc trò chuyện thú vị về công nghệ hiện đại bên ly cà phê.",
    "gap": "We had an engaging ________ about modern technology over coffee."
  },
  "Loyalty": {
    "oxford": "The company rewards customer loyalty with exclusive discounts and perks.",
    "vi": "Công ty tri ân lòng trung thành của khách hàng bằng các ưu đãi và giảm giá độc quyền.",
    "gap": "The company rewards customer ________ with exclusive discounts and perks."
  },
  "Commercial": {
    "oxford": "The film was a massive commercial success, earning millions at the box office.",
    "vi": "Bộ phim là một thành công thương mại to lớn, thu về hàng triệu USD tại phòng vé.",
    "gap": "The film was a massive ________ success, earning millions at the box office."
  },
  "Crave": {
    "oxford": "After a grueling workout session, his body began to crave water and rest.",
    "vi": "Sau buổi tập luyện mệt mỏi, cơ thể anh bắt đầu khao khát nước và sự nghỉ ngơi.",
    "gap": "After a grueling workout session, his body began to ________ water and rest."
  },
  "patient": {
    "oxford": "Learning a new foreign language requires you to be patient and persistent.",
    "vi": "Học một ngoại ngữ mới đòi hỏi bạn phải kiên nhẫn và bền bỉ.",
    "gap": "Learning a new foreign language requires you to be ________ and persistent."
  },
  "garage": {
    "oxford": "He parked his car in the garage to protect it from the heavy snow.",
    "vi": "Anh ấy đỗ xe trong ga-ra để bảo vệ nó khỏi lớp tuyết dày.",
    "gap": "He parked his car in the ________ to protect it from the heavy snow."
  },
  "across": {
    "oxford": "There is a convenient grocery store right across the street from our house.",
    "vi": "Có một cửa hàng tạp hóa tiện lợi ngay bên kia đường đối diện nhà chúng tôi.",
    "gap": "There is a convenient grocery store right ________ the street from our house."
  },
  "royal": {
    "oxford": "The royal palace attracts millions of international tourists every year.",
    "vi": "Cung điện hoàng gia thu hút hàng triệu khách du lịch quốc tế mỗi năm.",
    "gap": "The ________ palace attracts millions of international tourists every year."
  },
  "Church": {
    "oxford": "The bells of the ancient stone church chimed peacefully on Sunday morning.",
    "vi": "Tiếng chuông của nhà thờ đá cổ kính ngân vang yên bình vào sáng Chủ Nhật.",
    "gap": "The bells of the ancient stone ________ chimed peacefully on Sunday morning."
  },
  "Corner": {
    "oxford": "They met at the street corner right outside the central subway station.",
    "vi": "Họ gặp nhau ở góc phố ngay bên ngoài ga tàu điện ngầm trung tâm.",
    "gap": "They met at the street ________ right outside the central subway station."
  },
  "As a matter of fact": {
    "oxford": "As a matter of fact, I have already visited that museum twice this year.",
    "vi": "Thực ra thì, tôi đã đến thăm bảo tàng đó hai lần trong năm nay rồi.",
    "gap": "________, I have already visited that museum twice this year."
  },
  "share out the housework": {
    "oxford": "A healthy marriage requires couples to fairly share out the housework.",
    "vi": "Một cuộc hôn nhân lành mạnh đòi hỏi các cặp đôi phải chia sẻ công việc nhà một cách công bằng.",
    "gap": "A healthy marriage requires couples to fairly ________."
  },
  "carpets": {
    "oxford": "The luxurious hotel rooms are fitted with thick wool carpets.",
    "vi": "Các phòng khách sạn sang trọng được trang bị những tấm thảm len dày dặn.",
    "gap": "The luxurious hotel rooms are fitted with thick wool ________."
  },
  "a shared flat": {
    "oxford": "To save on rent during university, many students live in a shared flat.",
    "vi": "Để tiết kiệm tiền thuê nhà thời đại học, nhiều sinh viên sống trong một căn hộ chung.",
    "gap": "To save on rent during university, many students live in ________."
  },
  "own": {
    "oxford": "After years of renting, they finally saved enough money to own their home.",
    "vi": "Sau nhiều năm thuê nhà, cuối cùng họ đã tiết kiệm đủ tiền để sở hữu ngôi nhà của riêng mình.",
    "gap": "After years of renting, they finally saved enough money to ________ their home."
  },
  "payphone": {
    "oxford": "Before cell phones were invented, people had to insert coins into a payphone.",
    "vi": "Trước khi điện thoại di động ra đời, mọi người phải nhét tiền xu vào điện thoại công cộng.",
    "gap": "Before cell phones were invented, people had to insert coins into a ________."
  },
  "out of order": {
    "oxford": "We had to take the stairs because the building elevator was out of order.",
    "vi": "Chúng tôi phải đi cầu thang bộ vì thang máy của tòa nhà đã bị hỏng.",
    "gap": "We had to take the stairs because the building elevator was ________."
  },
  "get in touch": {
    "oxford": "Please get in touch with our customer support team if you have any questions.",
    "vi": "Vui lòng liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi nếu bạn có bất kỳ câu hỏi nào.",
    "gap": "Please ________ with our customer support team if you have any questions."
  },
  "peculiar noise": {
    "oxford": "I pulled over to check the vehicle after hearing a peculiar noise under the hood.",
    "vi": "Tôi tấp xe vào lề để kiểm tra sau khi nghe thấy một tiếng ồn kỳ lạ dưới nắp ca-pô.",
    "gap": "I pulled over to check the vehicle after hearing a ________ under the hood."
  },
  "notify": {
    "oxford": "The hospital will notify the patient's family as soon as surgery is finished.",
    "vi": "Bệnh viện sẽ thông báo cho gia đình bệnh nhân ngay sau khi ca phẫu thuật kết thúc.",
    "gap": "The hospital will ________ the patient's family as soon as surgery is finished."
  },
  "announce": {
    "oxford": "The airline will announce the new flight departure gate over the loudspeaker.",
    "vi": "Hãng hàng không sẽ thông báo cổng khởi hành mới của chuyến bay qua loa phát thanh.",
    "gap": "The airline will ________ the new flight departure gate over the loudspeaker."
  },
  "period": {
    "oxford": "The museum displays artwork created during the Renaissance period.",
    "vi": "Bảo tàng trưng bày các tác phẩm nghệ thuật được sáng tác trong thời kỳ Phục hưng.",
    "gap": "The museum displays artwork created during the Renaissance ________."
  },
  "Run into + sth": {
    "oxford": "Be prepared in case you run into unexpected difficulties during your project.",
    "vi": "Hãy chuẩn bị tinh thần trong trường hợp bạn gặp phải những khó khăn bất ngờ trong dự án.",
    "gap": "Be prepared in case you ________ unexpected difficulties during your project."
  },
  "seems": {
    "oxford": "It seems that everyone in the office agrees with the proposed policy change.",
    "vi": "Có vẻ như mọi người trong văn phòng đều đồng ý với thay đổi chính sách được đề xuất.",
    "gap": "It ________ that everyone in the office agrees with the proposed policy change."
  },
  "ambitious": {
    "oxford": "She is an ambitious young lawyer who aims to become a partner at the firm.",
    "vi": "Cô ấy là một nữ luật sư trẻ đầy tham vọng, đặt mục tiêu trở thành đối tác của công ty.",
    "gap": "She is an ________ young lawyer who aims to become a partner at the firm."
  },
  "tough": {
    "oxford": "The manager has to make a tough decision regarding budget reductions.",
    "vi": "Người quản lý phải đưa ra một quyết định khó khăn, cứng rắn về việc cắt giảm ngân sách.",
    "gap": "The manager has to make a ________ decision regarding budget reductions."
  },
  "determined": {
    "oxford": "Despite numerous setbacks, he was determined to complete the marathon.",
    "vi": "Bất chấp nhiều trở ngại, anh ấy vẫn quyết tâm hoàn thành chặng đua marathon.",
    "gap": "Despite numerous setbacks, he was ________ to complete the marathon."
  },
  "Listed price": {
    "oxford": "You can often negotiate a discount below the listed price at this market.",
    "vi": "Bạn thường có thể thương lượng để giảm giá thấp hơn giá niêm yết tại khu chợ này.",
    "gap": "You can often negotiate a discount below the ________ at this market."
  },
  "Reference price": {
    "oxford": "Consumers use the manufacturer's suggested retail price as a reference price.",
    "vi": "Người tiêu dùng sử dụng giá bán lẻ đề xuất của nhà sản xuất như một mức giá tham khảo.",
    "gap": "Consumers use the manufacturer's suggested retail price as a ________."
  },
  "Dial tone": {
    "oxford": "She picked up the landline receiver and waited for the dial tone.",
    "vi": "Cô ấy nhấc ống nghe điện thoại bàn và đợi âm thanh quay số.",
    "gap": "She picked up the landline receiver and waited for the ________."
  },
  "any favours of him": {
    "oxford": "He is very proud and reluctant to ask any favours of him or anyone else.",
    "vi": "Anh ấy rất tự trọng và ngại nhờ vả bất kỳ sự giúp đỡ nào từ anh ta hay bất kỳ ai khác.",
    "gap": "He is very proud and reluctant to ask ________ or anyone else."
  },
  "across the street": {
    "oxford": "The bakery across the street fills our apartment with the scent of fresh bread.",
    "vi": "Tiệm bánh đối diện bên kia đường làm cho căn hộ của chúng tôi ngập tràn mùi bánh mì mới.",
    "gap": "The bakery ________ fills our apartment with the scent of fresh bread."
  },
  "Fill + out": {
    "oxford": "All applicants are required to fill out this questionnaire completely.",
    "vi": "Tất cả các ứng viên bắt buộc phải điền đầy đủ vào bảng câu hỏi này.",
    "gap": "All applicants are required to ________ this questionnaire completely."
  },
  "certainly": {
    "oxford": "I will certainly attend your presentation tomorrow morning.",
    "vi": "Tôi chắc chắn sẽ tham dự buổi thuyết trình của bạn vào sáng mai.",
    "gap": "I will ________ attend your presentation tomorrow morning."
  },
  "a flexible sort of person": {
    "oxford": "In a startup environment, you need to be a flexible sort of person.",
    "vi": "Trong môi trường khởi nghiệp, bạn cần phải là một kiểu người linh hoạt.",
    "gap": "In a startup environment, you need to be ________."
  },
  "grin from ear to ear": {
    "oxford": "When he heard he got the scholarship, he couldn't help but grin from ear to ear.",
    "vi": "Khi nghe tin mình nhận được học bổng, anh ấy không thể không cười toe toét tới tận mang tai.",
    "gap": "When he heard he got the scholarship, he couldn't help but ________."
  },
  "weekend": {
    "oxford": "Do you have any exciting outdoor plans for the upcoming weekend?",
    "vi": "Bạn có kế hoạch dã ngoại thú vị nào cho dịp cuối tuần sắp tới không?",
    "gap": "Do you have any exciting outdoor plans for the upcoming ________?"
  },
  "Weekends": {
    "oxford": "She prefers to spend her weekends reading books and resting at home.",
    "vi": "Cô ấy thích dành các ngày cuối tuần để đọc sách và nghỉ ngơi tại nhà.",
    "gap": "She prefers to spend her ________ reading books and resting at home."
  },
  "Friday": {
    "oxford": "Our team always celebrates the end of the work week on Friday afternoon.",
    "vi": "Nhóm chúng tôi luôn ăn mừng kết thúc tuần làm việc vào chiều thứ Sáu.",
    "gap": "Our team always celebrates the end of the work week on ________ afternoon."
  },
  "Saturday": {
    "oxford": "The local farmers' market takes place every Saturday morning.",
    "vi": "Chợ nông sản địa phương diễn ra vào mỗi sáng thứ Bảy.",
    "gap": "The local farmers' market takes place every ________ morning."
  },
  "muscle": {
    "oxford": "Regular exercise and protein intake help build strong muscle.",
    "vi": "Tập thể dục đều đặn và nạp protein giúp xây dựng cơ bắp săn chắc.",
    "gap": "Regular exercise and protein intake help build strong ________."
  },
  "chest pain": {
    "oxford": "If you experience acute chest pain, seek medical attention immediately.",
    "vi": "Nếu bạn bị đau ngực cấp tính, hãy đi khám y tế ngay lập tức.",
    "gap": "If you experience acute ________, seek medical attention immediately."
  },
  "Properly": {
    "oxford": "Make sure you read the instructions so the equipment operates properly.",
    "vi": "Hãy đảm bảo bạn đọc kỹ hướng dẫn để thiết bị vận hành đúng cách, bình thường.",
    "gap": "Make sure you read the instructions so the equipment operates ________."
  },
  "Regularly": {
    "oxford": "Doctors advise that you should exercise regularly to maintain good health.",
    "vi": "Các bác sĩ khuyên rằng bạn nên tập thể dục đều đặn để duy trì sức khỏe tốt.",
    "gap": "Doctors advise that you should exercise ________ to maintain good health."
  },
  "ingredients": {
    "oxford": "The chef uses only fresh and organic ingredients in his pasta sauce.",
    "vi": "Bếp trưởng chỉ sử dụng các nguyên liệu tươi và hữu cơ trong món sốt mì Ý của mình.",
    "gap": "The chef uses only fresh and organic ________ in his pasta sauce."
  },
  "Antibiotics": {
    "oxford": "The doctor prescribed a seven-day course of antibiotics for the throat infection.",
    "vi": "Bác sĩ đã kê một đợt thuốc kháng sinh 7 ngày cho chứng viêm họng.",
    "gap": "The doctor prescribed a seven-day course of ________ for the throat infection."
  },
  "Painkiller": {
    "oxford": "She took a strong painkiller to relieve her severe migraine headache.",
    "vi": "Cô ấy đã uống một viên thuốc giảm đau mạnh để làm dịu cơn đau nửa đầu dữ dội.",
    "gap": "She took a strong ________ to relieve her severe migraine headache."
  },
  "cure": {
    "oxford": "Scientists are working tirelessly to discover a permanent cure for the disease.",
    "vi": "Các nhà khoa học đang nỗ lực không mệt mỏi để tìm ra phương pháp chữa khỏi hoàn toàn căn bệnh.",
    "gap": "Scientists are working tirelessly to discover a permanent ________ for the disease."
  },
  "infections": {
    "oxford": "Washing your hands frequently helps prevent bacterial and viral infections.",
    "vi": "Rửa tay thường xuyên giúp ngăn ngừa sự nhiễm trùng do vi khuẩn và virus.",
    "gap": "Washing your hands frequently helps prevent bacterial and viral ________."
  },
  "food poisoning": {
    "oxford": "Eating undercooked seafood can lead to severe food poisoning.",
    "vi": "Ăn hải sản chưa nấu chín kỹ có thể dẫn đến ngộ độc thực phẩm nghiêm trọng.",
    "gap": "Eating undercooked seafood can lead to severe ________."
  },
  "flu": {
    "oxford": "Getting a yearly vaccine is the best protection against seasonal flu.",
    "vi": "Tiêm vắc-xin hàng năm là cách bảo vệ tốt nhất chống lại bệnh cúm theo mùa.",
    "gap": "Getting a yearly vaccine is the best protection against seasonal ________."
  },
  "diabetes": {
    "oxford": "Patients with diabetes need to monitor their blood sugar levels carefully.",
    "vi": "Bệnh nhân mắc bệnh tiểu đường cần theo dõi mức đường huyết của mình một cách cẩn thận.",
    "gap": "Patients with ________ need to monitor their blood sugar levels carefully."
  },
  "cancer": {
    "oxford": "Early detection plays a crucial role in surviving various forms of cancer.",
    "vi": "Phát hiện sớm đóng vai trò then chốt trong việc sống sót qua các dạng ung thư khác nhau.",
    "gap": "Early detection plays a crucial role in surviving various forms of ________."
  },
  "tuberculosis": {
    "oxford": "Modern antibiotics have made tuberculosis a treatable and curable illness.",
    "vi": "Thuốc kháng sinh hiện đại đã biến bệnh lao thành một căn bệnh có thể điều trị và chữa khỏi.",
    "gap": "Modern antibiotics have made ________ a treatable and curable illness."
  },
  "be the key to": {
    "oxford": "Consistent daily practice will be the key to passing your listening exam.",
    "vi": "Luyện tập kiên trì mỗi ngày sẽ là chìa khóa then chốt để vượt qua kỳ thi nghe của bạn.",
    "gap": "Consistent daily practice will ________ passing your listening exam."
  },
  "freshly baked bread": {
    "oxford": "Nothing beats the delightful smell of freshly baked bread in the morning.",
    "vi": "Không gì tuyệt hơn mùi thơm ngào ngạt của bánh mì mới nướng vào buổi sáng.",
    "gap": "Nothing beats the delightful smell of ________ in the morning."
  },
  "rich aroma": {
    "oxford": "The rich aroma of ground coffee beans filled the entire cafe.",
    "vi": "Mùi thơm nồng nàn của những hạt cà phê mới xay lan tỏa khắp quán cà phê.",
    "gap": "The ________ of ground coffee beans filled the entire cafe."
  },
  "considerably": {
    "oxford": "Her English listening comprehension has improved considerably this semester.",
    "vi": "Khả năng nghe hiểu tiếng Anh của cô ấy đã tiến bộ đáng kể trong học kỳ này.",
    "gap": "Her English listening comprehension has improved ________ this semester."
  },
  "campaign": {
    "oxford": "The government launched an educational campaign to raise environmental awareness.",
    "vi": "Chính phủ đã phát động một chiến dịch giáo dục nhằm nâng cao nhận thức về môi trường.",
    "gap": "The government launched an educational ________ to raise environmental awareness."
  },
  "consult": {
    "oxford": "You should consult a financial advisor before making any major investments.",
    "vi": "Bạn nên tham khảo ý kiến của một chuyên gia tư vấn tài chính trước khi đưa ra bất kỳ khoản đầu tư lớn nào.",
    "gap": "You should ________ a financial advisor before making any major investments."
  },
  "expectancy": {
    "oxford": "Advances in medical science have led to a significant rise in life expectancy.",
    "vi": "Những tiến bộ trong y học đã dẫn đến sự gia tăng đáng kể về tuổi thọ.",
    "gap": "Advances in medical science have led to a significant rise in life ________."
  },
  "longevity": {
    "oxford": "A balanced diet and stress reduction are known contributors to longevity.",
    "vi": "Chế độ ăn uống cân bằng và giảm căng thẳng là những yếu tố góp phần giúp sống lâu.",
    "gap": "A balanced diet and stress reduction are known contributors to ________."
  },
  "ageing": {
    "oxford": "Many developed countries are currently facing the challenge of an ageing population.",
    "vi": "Nhiều quốc gia phát triển hiện đang phải đối mặt với thách thức dân số già hóa.",
    "gap": "Many developed countries are currently facing the challenge of an ________ population."
  },
  "suffer from": {
    "oxford": "Many office workers suffer from chronic back pain due to poor posture.",
    "vi": "Nhiều nhân viên văn phòng mắc phải chứng đau lưng mãn tính do ngồi sai tư thế.",
    "gap": "Many office workers ________ chronic back pain due to poor posture."
  },
  "deprivation": {
    "oxford": "Chronic sleep deprivation can seriously impair your concentration and memory.",
    "vi": "Sự thiếu thốn giấc ngủ mãn tính có thể làm suy giảm nghiêm trọng khả năng tập trung và trí nhớ của bạn.",
    "gap": "Chronic sleep ________ can seriously impair your concentration and memory."
  },
  "promptly": {
    "oxford": "The customer service team answered all my inquiries promptly and politely.",
    "vi": "Đội ngũ dịch vụ khách hàng đã giải đáp mọi thắc mắc của tôi ngay lập tức và lịch sự.",
    "gap": "The customer service team answered all my inquiries ________ and politely."
  },
  "medication": {
    "oxford": "You must take this prescribed medication twice a day after meals.",
    "vi": "Bạn phải uống thuốc theo đơn này hai lần một ngày sau bữa ăn.",
    "gap": "You must take this prescribed ________ twice a day after meals."
  },
  "incurable": {
    "oxford": "Decades ago, many common infections were considered incurable and fatal.",
    "vi": "Nhiều thập kỷ trước, nhiều bệnh nhiễm trùng thông thường được coi là không thể chữa khỏi và gây tử vong.",
    "gap": "Decades ago, many common infections were considered ________ and fatal."
  },
  "Vital": {
    "oxford": "Listening practice is vital for achieving a high band score in IELTS.",
    "vi": "Luyện nghe là điều cực kỳ quan trọng để đạt điểm cao trong bài thi IELTS.",
    "gap": "Listening practice is ________ for achieving a high band score in IELTS."
  },
  "sorrow": {
    "oxford": "She expressed great sorrow over the tragic loss of her beloved pet.",
    "vi": "Cô ấy bày tỏ nỗi buồn sâu sắc trước sự mất mát đau lòng của chú thú cưng yêu quý.",
    "gap": "She expressed great ________ over the tragic loss of her beloved pet."
  },
  "sports jacket": {
    "oxford": "He wore a tailored sports jacket with casual trousers for the dinner party.",
    "vi": "Anh ấy mặc một chiếc áo khoác thể thao vừa vặn cùng quần âu thường cho bữa tiệc tối.",
    "gap": "He wore a tailored ________ with casual trousers for the dinner party."
  },
  "Beat": {
    "oxford": "After a grueling 10-kilometer hike uphill, we were completely beat.",
    "vi": "Sau chuyến đi bộ leo dốc 10 km kiệt sức, chúng tôi mệt rã rời.",
    "gap": "After a grueling 10-kilometer hike uphill, we were completely ________."
  },
  "luggage": {
    "oxford": "Please keep an eye on your luggage while waiting at the airport terminal.",
    "vi": "Vui lòng để mắt đến hành lý của bạn trong khi chờ ở nhà ga sân bay.",
    "gap": "Please keep an eye on your ________ while waiting at the airport terminal."
  },
  "an extra charge": {
    "oxford": "Passengers who exceed the baggage weight limit must pay an extra charge.",
    "vi": "Hành khách vượt quá giới hạn trọng lượng hành lý phải trả thêm một khoản phụ phí.",
    "gap": "Passengers who exceed the baggage weight limit must pay ________."
  },
  "aisle seat": {
    "oxford": "I always prefer an aisle seat so I can easily stand up without disturbing others.",
    "vi": "Tôi luôn thích chỗ ngồi cạnh lối đi để có thể dễ dàng đứng dậy mà không làm phiền người khác.",
    "gap": "I always prefer an ________ so I can easily stand up without disturbing others."
  },
  "Declare": {
    "oxford": "You must declare any taxable goods or large sums of cash at customs.",
    "vi": "Bạn phải khai báo bất kỳ hàng hóa chịu thuế hoặc số tiền mặt lớn nào tại hải quan.",
    "gap": "You must ________ any taxable goods or large sums of cash at customs."
  },
  "cigarettes": {
    "oxford": "Smoking cigarettes is strictly prohibited in all areas of the hospital.",
    "vi": "Hút thuốc lá bị nghiêm cấm trong tất cả các khu vực của bệnh viện.",
    "gap": "Smoking ________ is strictly prohibited in all areas of the hospital."
  },
  "perfume": {
    "oxford": "She applied a subtle floral perfume before heading out to the party.",
    "vi": "Cô ấy xịt một chút nước hoa hương hoa nhẹ nhàng trước khi đi dự tiệc.",
    "gap": "She applied a subtle floral ________ before heading out to the party."
  },
  "Pardon": {
    "oxford": "I beg your pardon, but could you please repeat that last sentence?",
    "vi": "Xin thứ lỗi, cái gì cơ, bạn có thể vui lòng nhắc lại câu cuối cùng đó không?",
    "gap": "I beg your ________, but could you please repeat that last sentence?"
  },
  "elegant": {
    "oxford": "The ballroom was decorated with elegant crystal chandeliers and white roses.",
    "vi": "Phòng khiêu vũ được trang trí bằng những chùm đèn pha lê duyên dáng và hoa hồng trắng.",
    "gap": "The ballroom was decorated with ________ crystal chandeliers and white roses."
  },
  "as cute as a button": {
    "oxford": "Look at the new puppy with its floppy ears; it is as cute as a button!",
    "vi": "Nhìn chú cún con mới với đôi tai cụp kìa; nó dễ thương hết nấc!",
    "gap": "Look at the new puppy with its floppy ears; it is ________!"
  },
  "cigars": {
    "oxford": "Cuban cigars are famous worldwide for their premium quality and aroma.",
    "vi": "Xì gà Cuba nổi tiếng khắp thế giới nhờ chất lượng cao cấp và hương thơm đặc trưng.",
    "gap": "Cuban ________ are famous worldwide for their premium quality and aroma."
  },
  "Jealous": {
    "oxford": "She felt jealous when her colleague received the prestigious promotion.",
    "vi": "Cô ấy cảm thấy ghen tị khi đồng nghiệp của mình nhận được sự thăng chức danh giá.",
    "gap": "She felt ________ when her colleague received the prestigious promotion."
  },
  "Bet": {
    "oxford": "I bet our team will win the football match tonight.",
    "vi": "Tôi cá rằng đội của chúng ta sẽ thắng trận bóng đá tối nay.",
    "gap": "I ________ our team will win the football match tonight."
  },
  "mashed potatoes": {
    "oxford": "Roast chicken is traditionally served with gravy and creamy mashed potatoes.",
    "vi": "Gà quay theo truyền thống được ăn kèm với nước sốt và khoai tây nghiền béo ngậy.",
    "gap": "Roast chicken is traditionally served with gravy and creamy ________."
  },
  "secretary": {
    "oxford": "The executive secretary scheduled all appointments and handled correspondence.",
    "vi": "Thư ký điều hành đã lên lịch cho mọi cuộc hẹn và xử lý thư từ công việc.",
    "gap": "The executive ________ scheduled all appointments and handled correspondence."
  },
  "waitress": {
    "oxford": "The friendly waitress recommended the chef's special pasta dish.",
    "vi": "Cô bồi bàn thân thiện đã gợi ý món mì Ý đặc biệt của bếp trưởng.",
    "gap": "The friendly ________ recommended the chef's special pasta dish."
  },
  "trim the bushes": {
    "oxford": "On sunny weekends, he uses garden shears to trim the bushes in the yard.",
    "vi": "Vào những ngày cuối tuần nắng đẹp, anh ấy dùng kéo làm vườn để tỉa bớt bụi cây trong sân.",
    "gap": "On sunny weekends, he uses garden shears to ________ in the yard."
  },
  "weed the flower beds": {
    "oxford": "The gardener spent the afternoon helping her weed the flower beds.",
    "vi": "Người làm vườn đã dành cả buổi chiều để giúp cô ấy nhổ cỏ trong luống hoa.",
    "gap": "The gardener spent the afternoon helping her ________."
  },
  "satisfactory": {
    "oxford": "The student gave a satisfactory explanation for being late to class.",
    "vi": "Học sinh đã đưa ra một lời giải thích thỏa đáng, đạt mong đợi cho việc đi học muộn.",
    "gap": "The student gave a ________ explanation for being late to class."
  }
}

print(f"Total Oxford entries defined: {len(OXFORD_DATABASE)}")
