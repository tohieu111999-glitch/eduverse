import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CardSeed = {
  front: string;
  back: string;
  pinyin: string;   // pronunciation / romaji / IPA
  hanViet: string;  // secondary note (hanViet / hiragana / hanja / etc.)
  example: { zh: string; pinyin: string; vi: string }; // zh=source sentence, pinyin=reading, vi=Vietnamese
};

// ─── TIẾNG TRUNG (zh-CN) ────────────────────────────────────────────────────

const HSK1: CardSeed[] = [
  { front: "你好", back: "Xin chào", pinyin: "nǐ hǎo", hanViet: "Nễ Hảo", example: { zh: "你好，很高兴认识你。", pinyin: "Nǐ hǎo, hěn gāoxìng rènshi nǐ.", vi: "Xin chào, rất vui được gặp bạn." } },
  { front: "谢谢", back: "Cảm ơn", pinyin: "xiè xie", hanViet: "Tạ Tạ", example: { zh: "谢谢你的帮助。", pinyin: "Xièxie nǐ de bāngzhù.", vi: "Cảm ơn bạn đã giúp đỡ." } },
  { front: "再见", back: "Tạm biệt", pinyin: "zài jiàn", hanViet: "Tái Kiến", example: { zh: "再见，明天见！", pinyin: "Zàijiàn, míngtiān jiàn!", vi: "Tạm biệt, hẹn gặp lại ngày mai!" } },
  { front: "我", back: "Tôi / Tao", pinyin: "wǒ", hanViet: "Ngã", example: { zh: "我是学生。", pinyin: "Wǒ shì xuéshēng.", vi: "Tôi là học sinh." } },
  { front: "你", back: "Bạn / Mày", pinyin: "nǐ", hanViet: "Nễ", example: { zh: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì?" } },
  { front: "他", back: "Anh ấy / Ông ấy", pinyin: "tā", hanViet: "Tha", example: { zh: "他是老师。", pinyin: "Tā shì lǎoshī.", vi: "Anh ấy là giáo viên." } },
  { front: "她", back: "Cô ấy / Bà ấy", pinyin: "tā", hanViet: "Tha", example: { zh: "她很漂亮。", pinyin: "Tā hěn piàoliang.", vi: "Cô ấy rất đẹp." } },
  { front: "我们", back: "Chúng tôi / Chúng ta", pinyin: "wǒmen", hanViet: "Ngã Môn", example: { zh: "我们是朋友。", pinyin: "Wǒmen shì péngyǒu.", vi: "Chúng tôi là bạn bè." } },
  { front: "是", back: "Là / Thì", pinyin: "shì", hanViet: "Thị", example: { zh: "这是我的书。", pinyin: "Zhè shì wǒ de shū.", vi: "Đây là sách của tôi." } },
  { front: "不", back: "Không", pinyin: "bù", hanViet: "Bất", example: { zh: "我不喜欢喝茶。", pinyin: "Wǒ bù xǐhuān hē chá.", vi: "Tôi không thích uống trà." } },
  { front: "有", back: "Có", pinyin: "yǒu", hanViet: "Hữu", example: { zh: "我有一个弟弟。", pinyin: "Wǒ yǒu yī gè dìdi.", vi: "Tôi có một người em trai." } },
  { front: "这", back: "Này / Đây", pinyin: "zhè", hanViet: "Giá", example: { zh: "这个苹果很甜。", pinyin: "Zhège píngguǒ hěn tián.", vi: "Quả táo này rất ngọt." } },
  { front: "那", back: "Kia / Đó", pinyin: "nà", hanViet: "Na", example: { zh: "那是什么？", pinyin: "Nà shì shénme?", vi: "Cái đó là gì vậy?" } },
  { front: "人", back: "Người", pinyin: "rén", hanViet: "Nhân", example: { zh: "那个人是谁？", pinyin: "Nàge rén shì shuí?", vi: "Người đó là ai vậy?" } },
  { front: "好", back: "Tốt / Được", pinyin: "hǎo", hanViet: "Hảo", example: { zh: "今天天气很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", vi: "Hôm nay thời tiết rất tốt." } },
  { front: "大", back: "To / Lớn", pinyin: "dà", hanViet: "Đại", example: { zh: "他家很大。", pinyin: "Tā jiā hěn dà.", vi: "Nhà anh ấy rất to." } },
  { front: "小", back: "Nhỏ / Bé", pinyin: "xiǎo", hanViet: "Tiểu", example: { zh: "这只猫很小。", pinyin: "Zhè zhī māo hěn xiǎo.", vi: "Con mèo này rất nhỏ." } },
  { front: "去", back: "Đi / Đến", pinyin: "qù", hanViet: "Khứ", example: { zh: "我去学校上课。", pinyin: "Wǒ qù xuéxiào shàngkè.", vi: "Tôi đi học ở trường." } },
  { front: "来", back: "Đến / Lại", pinyin: "lái", hanViet: "Lai", example: { zh: "请你来我家。", pinyin: "Qǐng nǐ lái wǒ jiā.", vi: "Mời bạn đến nhà tôi." } },
  { front: "说", back: "Nói", pinyin: "shuō", hanViet: "Thuyết", example: { zh: "他说汉语说得很好。", pinyin: "Tā shuō Hànyǔ shuō de hěn hǎo.", vi: "Anh ấy nói tiếng Hán rất tốt." } },
  { front: "什么", back: "Gì / Cái gì", pinyin: "shénme", hanViet: "Thập Ma", example: { zh: "你在做什么？", pinyin: "Nǐ zài zuò shénme?", vi: "Bạn đang làm gì vậy?" } },
  { front: "今天", back: "Hôm nay", pinyin: "jīntiān", hanViet: "Kim Thiên", example: { zh: "今天是星期几？", pinyin: "Jīntiān shì xīngqī jǐ?", vi: "Hôm nay là thứ mấy?" } },
  { front: "明天", back: "Ngày mai", pinyin: "míngtiān", hanViet: "Minh Thiên", example: { zh: "明天我要去北京。", pinyin: "Míngtiān wǒ yào qù Běijīng.", vi: "Ngày mai tôi sẽ đi Bắc Kinh." } },
  { front: "朋友", back: "Bạn bè", pinyin: "péngyǒu", hanViet: "Bằng Hữu", example: { zh: "他是我最好的朋友。", pinyin: "Tā shì wǒ zuì hǎo de péngyǒu.", vi: "Anh ấy là người bạn tốt nhất của tôi." } },
  { front: "学生", back: "Học sinh / Sinh viên", pinyin: "xuéshēng", hanViet: "Học Sinh", example: { zh: "他是一名大学生。", pinyin: "Tā shì yī míng dàxuéshēng.", vi: "Anh ấy là một sinh viên đại học." } },
  { front: "老师", back: "Giáo viên / Thầy cô", pinyin: "lǎoshī", hanViet: "Lão Sư", example: { zh: "我们的老师很有经验。", pinyin: "Wǒmen de lǎoshī hěn yǒu jīngyàn.", vi: "Giáo viên của chúng tôi rất có kinh nghiệm." } },
  { front: "家", back: "Nhà / Gia đình", pinyin: "jiā", hanViet: "Gia", example: { zh: "我家有五口人。", pinyin: "Wǒ jiā yǒu wǔ kǒu rén.", vi: "Gia đình tôi có năm người." } },
  { front: "喜欢", back: "Thích / Yêu thích", pinyin: "xǐhuān", hanViet: "Hỉ Hoan", example: { zh: "我喜欢学习中文。", pinyin: "Wǒ xǐhuān xuéxí Zhōngwén.", vi: "Tôi thích học tiếng Trung." } },
  { front: "水", back: "Nước", pinyin: "shuǐ", hanViet: "Thủy", example: { zh: "我想喝一杯水。", pinyin: "Wǒ xiǎng hē yī bēi shuǐ.", vi: "Tôi muốn uống một ly nước." } },
  { front: "吃", back: "Ăn", pinyin: "chī", hanViet: "Thực", example: { zh: "你喜欢吃什么？", pinyin: "Nǐ xǐhuān chī shénme?", vi: "Bạn thích ăn gì?" } },
];

const HSK2: CardSeed[] = [
  { front: "工作", back: "Làm việc / Công việc", pinyin: "gōngzuò", hanViet: "Công Tác", example: { zh: "他的工作很忙。", pinyin: "Tā de gōngzuò hěn máng.", vi: "Công việc của anh ấy rất bận." } },
  { front: "学习", back: "Học tập", pinyin: "xuéxí", hanViet: "Học Tập", example: { zh: "他每天努力学习。", pinyin: "Tā měitiān nǔlì xuéxí.", vi: "Anh ấy chăm chỉ học tập mỗi ngày." } },
  { front: "时间", back: "Thời gian", pinyin: "shíjiān", hanViet: "Thời Gian", example: { zh: "我没有时间去看电影。", pinyin: "Wǒ méiyǒu shíjiān qù kàn diànyǐng.", vi: "Tôi không có thời gian đi xem phim." } },
  { front: "看", back: "Nhìn / Xem", pinyin: "kàn", hanViet: "Khán", example: { zh: "我在看一本书。", pinyin: "Wǒ zài kàn yī běn shū.", vi: "Tôi đang xem một quyển sách." } },
  { front: "听", back: "Nghe", pinyin: "tīng", hanViet: "Thính", example: { zh: "我喜欢听音乐。", pinyin: "Wǒ xǐhuān tīng yīnyuè.", vi: "Tôi thích nghe nhạc." } },
  { front: "电话", back: "Điện thoại", pinyin: "diànhuà", hanViet: "Điện Thoại", example: { zh: "请给我打电话。", pinyin: "Qǐng gěi wǒ dǎ diànhuà.", vi: "Xin hãy gọi điện cho tôi." } },
  { front: "手机", back: "Điện thoại di động", pinyin: "shǒujī", hanViet: "Thủ Cơ", example: { zh: "我的手机没电了。", pinyin: "Wǒ de shǒujī méi diàn le.", vi: "Điện thoại của tôi hết pin rồi." } },
  { front: "书", back: "Sách", pinyin: "shū", hanViet: "Thư", example: { zh: "这本书很有意思。", pinyin: "Zhè běn shū hěn yǒu yìsi.", vi: "Quyển sách này rất thú vị." } },
  { front: "钱", back: "Tiền", pinyin: "qián", hanViet: "Tiền", example: { zh: "这件衣服多少钱？", pinyin: "Zhè jiàn yīfú duōshao qián?", vi: "Cái áo này bao nhiêu tiền?" } },
  { front: "饭", back: "Cơm / Bữa ăn", pinyin: "fàn", hanViet: "Phạn", example: { zh: "吃饭了吗？", pinyin: "Chī fàn le ma?", vi: "Bạn ăn cơm chưa?" } },
  { front: "喝", back: "Uống", pinyin: "hē", hanViet: "Hát", example: { zh: "我喜欢喝绿茶。", pinyin: "Wǒ xǐhuān hē lǜchá.", vi: "Tôi thích uống trà xanh." } },
  { front: "买", back: "Mua", pinyin: "mǎi", hanViet: "Mãi", example: { zh: "我要去买一件衣服。", pinyin: "Wǒ yào qù mǎi yī jiàn yīfú.", vi: "Tôi muốn đi mua một chiếc áo." } },
  { front: "高兴", back: "Vui mừng / Vui vẻ", pinyin: "gāoxìng", hanViet: "Cao Hứng", example: { zh: "看到你很高兴！", pinyin: "Kàndào nǐ hěn gāoxìng!", vi: "Rất vui khi gặp bạn!" } },
  { front: "漂亮", back: "Đẹp / Xinh đẹp", pinyin: "piàoliang", hanViet: "Phiêu Lượng", example: { zh: "她穿的衣服很漂亮。", pinyin: "Tā chuān de yīfú hěn piàoliang.", vi: "Chiếc áo cô ấy mặc rất đẹp." } },
  { front: "医生", back: "Bác sĩ", pinyin: "yīshēng", hanViet: "Y Sinh", example: { zh: "我想成为一名医生。", pinyin: "Wǒ xiǎng chéngwéi yī míng yīshēng.", vi: "Tôi muốn trở thành một bác sĩ." } },
  { front: "电脑", back: "Máy tính", pinyin: "diànnǎo", hanViet: "Điện Não", example: { zh: "我用电脑写作业。", pinyin: "Wǒ yòng diànnǎo xiě zuòyè.", vi: "Tôi dùng máy tính để làm bài tập." } },
  { front: "天气", back: "Thời tiết", pinyin: "tiānqì", hanViet: "Thiên Khí", example: { zh: "今天天气怎么样？", pinyin: "Jīntiān tiānqì zěnme yàng?", vi: "Hôm nay thời tiết như thế nào?" } },
  { front: "快乐", back: "Hạnh phúc / Vui lòng", pinyin: "kuàilè", hanViet: "Khoái Lạc", example: { zh: "祝你生日快乐！", pinyin: "Zhù nǐ shēngrì kuàilè!", vi: "Chúc mừng sinh nhật bạn!" } },
  { front: "知道", back: "Biết", pinyin: "zhīdào", hanViet: "Tri Đạo", example: { zh: "你知道他在哪里吗？", pinyin: "Nǐ zhīdào tā zài nǎlǐ ma?", vi: "Bạn có biết anh ấy ở đâu không?" } },
  { front: "苹果", back: "Quả táo", pinyin: "píngguǒ", hanViet: "Bình Quả", example: { zh: "这个苹果很甜。", pinyin: "Zhège píngguǒ hěn tián.", vi: "Quả táo này rất ngọt." } },
  { front: "猫", back: "Con mèo", pinyin: "māo", hanViet: "Miêu", example: { zh: "我家有两只猫。", pinyin: "Wǒ jiā yǒu liǎng zhī māo.", vi: "Nhà tôi có hai con mèo." } },
  { front: "学校", back: "Trường học", pinyin: "xuéxiào", hanViet: "Học Hiệu", example: { zh: "我们学校很漂亮。", pinyin: "Wǒmen xuéxiào hěn piàoliang.", vi: "Trường học của chúng tôi rất đẹp." } },
  { front: "多", back: "Nhiều", pinyin: "duō", hanViet: "Đa", example: { zh: "这里有很多人。", pinyin: "Zhèlǐ yǒu hěn duō rén.", vi: "Ở đây có rất nhiều người." } },
  { front: "上", back: "Trên / Lên", pinyin: "shàng", hanViet: "Thượng", example: { zh: "书在桌子上。", pinyin: "Shū zài zhuōzi shàng.", vi: "Sách ở trên bàn." } },
  { front: "下", back: "Dưới / Xuống", pinyin: "xià", hanViet: "Hạ", example: { zh: "猫在桌子下面。", pinyin: "Māo zài zhuōzi xiàmiàn.", vi: "Con mèo ở dưới gầm bàn." } },
];

const HSK3: CardSeed[] = [
  { front: "努力", back: "Cố gắng / Nỗ lực", pinyin: "nǔlì", hanViet: "Nỗ Lực", example: { zh: "成功需要努力和坚持。", pinyin: "Chénggōng xūyào nǔlì hé jiānchí.", vi: "Thành công cần nỗ lực và kiên trì." } },
  { front: "练习", back: "Luyện tập", pinyin: "liànxí", hanViet: "Luyện Tập", example: { zh: "每天练习汉语写作很重要。", pinyin: "Měitiān liànxí Hànyǔ xiězuò hěn zhòngyào.", vi: "Luyện viết tiếng Hán mỗi ngày rất quan trọng." } },
  { front: "复习", back: "Ôn tập", pinyin: "fùxí", hanViet: "Phục Tập", example: { zh: "考试前一定要复习。", pinyin: "Kǎoshì qián yīdìng yào fùxí.", vi: "Trước khi thi nhất định phải ôn tập." } },
  { front: "帮助", back: "Giúp đỡ", pinyin: "bāngzhù", hanViet: "Bang Trợ", example: { zh: "谢谢你对我的帮助。", pinyin: "Xièxie nǐ duì wǒ de bāngzhù.", vi: "Cảm ơn bạn đã giúp đỡ tôi." } },
  { front: "重要", back: "Quan trọng", pinyin: "zhòngyào", hanViet: "Trọng Yếu", example: { zh: "健康是最重要的事情。", pinyin: "Jiànkāng shì zuì zhòngyào de shìqing.", vi: "Sức khỏe là điều quan trọng nhất." } },
  { front: "应该", back: "Nên / Phải", pinyin: "yīnggāi", hanViet: "Ứng Cai", example: { zh: "你应该多运动。", pinyin: "Nǐ yīnggāi duō yùndòng.", vi: "Bạn nên tập thể dục nhiều hơn." } },
  { front: "可以", back: "Có thể / Được", pinyin: "kěyǐ", hanViet: "Khả Dĩ", example: { zh: "我可以在这里坐吗？", pinyin: "Wǒ kěyǐ zài zhèlǐ zuò ma?", vi: "Tôi có thể ngồi ở đây không?" } },
  { front: "需要", back: "Cần / Cần thiết", pinyin: "xūyào", hanViet: "Nhu Yếu", example: { zh: "我们需要更多的时间。", pinyin: "Wǒmen xūyào gèng duō de shíjiān.", vi: "Chúng tôi cần thêm thời gian." } },
  { front: "希望", back: "Hi vọng / Mong muốn", pinyin: "xīwàng", hanViet: "Hi Vọng", example: { zh: "我希望明年去中国。", pinyin: "Wǒ xīwàng míngnián qù Zhōngguó.", vi: "Tôi hi vọng năm sau sẽ đến Trung Quốc." } },
  { front: "感觉", back: "Cảm giác / Cảm thấy", pinyin: "gǎnjué", hanViet: "Cảm Giác", example: { zh: "我感觉有点不舒服。", pinyin: "Wǒ gǎnjué yǒudiǎn bù shūfu.", vi: "Tôi cảm thấy hơi không khỏe." } },
  { front: "经验", back: "Kinh nghiệm", pinyin: "jīngyàn", hanViet: "Kinh Nghiệm", example: { zh: "他有丰富的工作经验。", pinyin: "Tā yǒu fēngfù de gōngzuò jīngyàn.", vi: "Anh ấy có kinh nghiệm làm việc phong phú." } },
  { front: "问题", back: "Vấn đề / Câu hỏi", pinyin: "wèntí", hanViet: "Vấn Đề", example: { zh: "这个问题很难解决。", pinyin: "Zhège wèntí hěn nán jiějué.", vi: "Vấn đề này rất khó giải quyết." } },
  { front: "方法", back: "Phương pháp / Cách", pinyin: "fāngfǎ", hanViet: "Phương Pháp", example: { zh: "你有什么好方法？", pinyin: "Nǐ yǒu shénme hǎo fāngfǎ?", vi: "Bạn có phương pháp gì hay không?" } },
  { front: "文化", back: "Văn hóa", pinyin: "wénhuà", hanViet: "Văn Hóa", example: { zh: "中国文化很有魅力。", pinyin: "Zhōngguó wénhuà hěn yǒu mèilì.", vi: "Văn hóa Trung Quốc rất hấp dẫn." } },
  { front: "历史", back: "Lịch sử", pinyin: "lìshǐ", hanViet: "Lịch Sử", example: { zh: "中国有五千年的历史。", pinyin: "Zhōngguó yǒu wǔqiān nián de lìshǐ.", vi: "Trung Quốc có lịch sử năm nghìn năm." } },
  { front: "社会", back: "Xã hội", pinyin: "shèhuì", hanViet: "Xã Hội", example: { zh: "现代社会变化很快。", pinyin: "Xiàndài shèhuì biànhuà hěn kuài.", vi: "Xã hội hiện đại thay đổi rất nhanh." } },
  { front: "发展", back: "Phát triển", pinyin: "fāzhǎn", hanViet: "Phát Triển", example: { zh: "经济发展很重要。", pinyin: "Jīngjì fāzhǎn hěn zhòngyào.", vi: "Phát triển kinh tế rất quan trọng." } },
  { front: "教育", back: "Giáo dục", pinyin: "jiàoyù", hanViet: "Giáo Dục", example: { zh: "教育是国家发展的基础。", pinyin: "Jiàoyù shì guójiā fāzhǎn de jīchǔ.", vi: "Giáo dục là nền tảng phát triển của đất nước." } },
  { front: "健康", back: "Sức khỏe / Khỏe mạnh", pinyin: "jiànkāng", hanViet: "Kiện Khang", example: { zh: "身体健康最重要。", pinyin: "Shēntǐ jiànkāng zuì zhòngyào.", vi: "Sức khỏe thể chất là quan trọng nhất." } },
  { front: "成功", back: "Thành công", pinyin: "chénggōng", hanViet: "Thành Công", example: { zh: "他的成功来自于努力。", pinyin: "Tā de chénggōng láizì yú nǔlì.", vi: "Thành công của anh ấy đến từ sự nỗ lực." } },
  { front: "失败", back: "Thất bại", pinyin: "shībài", hanViet: "Thất Bại", example: { zh: "失败是成功之母。", pinyin: "Shībài shì chénggōng zhī mǔ.", vi: "Thất bại là mẹ thành công." } },
  { front: "未来", back: "Tương lai", pinyin: "wèilái", hanViet: "Vị Lai", example: { zh: "我对未来充满希望。", pinyin: "Wǒ duì wèilái chōngmǎn xīwàng.", vi: "Tôi tràn đầy hi vọng về tương lai." } },
  { front: "科技", back: "Khoa học kỹ thuật", pinyin: "kējì", hanViet: "Khoa Kỹ", example: { zh: "科技改变了我们的生活。", pinyin: "Kējì gǎibiàn le wǒmen de shēnghuó.", vi: "Khoa học kỹ thuật đã thay đổi cuộc sống của chúng ta." } },
  { front: "机会", back: "Cơ hội", pinyin: "jīhuì", hanViet: "Cơ Hội", example: { zh: "这是一个很好的机会。", pinyin: "Zhè shì yī gè hěn hǎo de jīhuì.", vi: "Đây là một cơ hội rất tốt." } },
  { front: "关系", back: "Quan hệ / Mối quan hệ", pinyin: "guānxi", hanViet: "Quan Hệ", example: { zh: "他们之间的关系很好。", pinyin: "Tāmen zhī jiān de guānxi hěn hǎo.", vi: "Mối quan hệ giữa họ rất tốt." } },
  { front: "自由", back: "Tự do", pinyin: "zìyóu", hanViet: "Tự Do", example: { zh: "每个人都向往自由。", pinyin: "Měi gè rén dōu xiǎngwǎng zìyóu.", vi: "Mỗi người đều khao khát tự do." } },
];

// ─── TIẾNG ANH (en-US) ──────────────────────────────────────────────────────
// pinyin = IPA pronunciation  |  hanViet = part of speech

const EN_BASIC: CardSeed[] = [
  { front: "hello", back: "xin chào", pinyin: "/həˈloʊ/", hanViet: "thán từ", example: { zh: "Hello! How are you?", pinyin: "/həˈloʊ haʊ ɑːr juː/", vi: "Xin chào! Bạn có khỏe không?" } },
  { front: "thank you", back: "cảm ơn", pinyin: "/θæŋk juː/", hanViet: "cụm từ", example: { zh: "Thank you for your help.", pinyin: "/θæŋk juː fər jər hɛlp/", vi: "Cảm ơn bạn đã giúp đỡ." } },
  { front: "goodbye", back: "tạm biệt", pinyin: "/ˌɡʊdˈbaɪ/", hanViet: "thán từ", example: { zh: "Goodbye! See you tomorrow.", pinyin: "/ˌɡʊdˈbaɪ siː juː təˈmɒrəʊ/", vi: "Tạm biệt! Hẹn gặp lại ngày mai." } },
  { front: "friend", back: "bạn bè", pinyin: "/frɛnd/", hanViet: "danh từ", example: { zh: "She is my best friend.", pinyin: "/ʃiː ɪz maɪ bɛst frɛnd/", vi: "Cô ấy là người bạn thân nhất của tôi." } },
  { front: "family", back: "gia đình", pinyin: "/ˈfæmɪli/", hanViet: "danh từ", example: { zh: "My family has five members.", pinyin: "/maɪ ˈfæmɪli hæz faɪv ˈmɛmbərz/", vi: "Gia đình tôi có năm thành viên." } },
  { front: "school", back: "trường học", pinyin: "/skuːl/", hanViet: "danh từ", example: { zh: "I go to school every day.", pinyin: "/aɪ ɡoʊ tuː skuːl ˈɛvri deɪ/", vi: "Tôi đi học mỗi ngày." } },
  { front: "study", back: "học / nghiên cứu", pinyin: "/ˈstʌdi/", hanViet: "động từ", example: { zh: "I study English every evening.", pinyin: "/aɪ ˈstʌdi ˈɪŋɡlɪʃ ˈɛvri ˈiːvnɪŋ/", vi: "Tôi học tiếng Anh mỗi buổi tối." } },
  { front: "work", back: "làm việc / công việc", pinyin: "/wɜːrk/", hanViet: "động từ / danh từ", example: { zh: "She works in a hospital.", pinyin: "/ʃiː wɜːrks ɪn ə ˈhɒspɪtl/", vi: "Cô ấy làm việc ở bệnh viện." } },
  { front: "eat", back: "ăn", pinyin: "/iːt/", hanViet: "động từ", example: { zh: "What do you want to eat?", pinyin: "/wɒt duː juː wɒnt tuː iːt/", vi: "Bạn muốn ăn gì?" } },
  { front: "drink", back: "uống", pinyin: "/drɪŋk/", hanViet: "động từ", example: { zh: "I drink coffee every morning.", pinyin: "/aɪ drɪŋk ˈkɒfi ˈɛvri ˈmɔːrnɪŋ/", vi: "Tôi uống cà phê mỗi buổi sáng." } },
  { front: "happy", back: "vui / hạnh phúc", pinyin: "/ˈhæpi/", hanViet: "tính từ", example: { zh: "I'm happy to meet you.", pinyin: "/aɪm ˈhæpi tuː miːt juː/", vi: "Tôi rất vui được gặp bạn." } },
  { front: "beautiful", back: "đẹp", pinyin: "/ˈbjuːtɪfʊl/", hanViet: "tính từ", example: { zh: "What a beautiful day!", pinyin: "/wɒt ə ˈbjuːtɪfʊl deɪ/", vi: "Thật là một ngày đẹp trời!" } },
  { front: "big", back: "to / lớn", pinyin: "/bɪɡ/", hanViet: "tính từ", example: { zh: "This is a big city.", pinyin: "/ðɪs ɪz ə bɪɡ ˈsɪti/", vi: "Đây là một thành phố lớn." } },
  { front: "small", back: "nhỏ", pinyin: "/smɔːl/", hanViet: "tính từ", example: { zh: "She lives in a small house.", pinyin: "/ʃiː lɪvz ɪn ə smɔːl haʊs/", vi: "Cô ấy sống trong một ngôi nhà nhỏ." } },
  { front: "money", back: "tiền", pinyin: "/ˈmʌni/", hanViet: "danh từ", example: { zh: "How much money do you need?", pinyin: "/haʊ mʌtʃ ˈmʌni duː juː niːd/", vi: "Bạn cần bao nhiêu tiền?" } },
  { front: "time", back: "thời gian", pinyin: "/taɪm/", hanViet: "danh từ", example: { zh: "What time is it now?", pinyin: "/wɒt taɪm ɪz ɪt naʊ/", vi: "Bây giờ là mấy giờ?" } },
  { front: "today", back: "hôm nay", pinyin: "/təˈdeɪ/", hanViet: "trạng từ", example: { zh: "Today is Monday.", pinyin: "/təˈdeɪ ɪz ˈmʌndeɪ/", vi: "Hôm nay là thứ Hai." } },
  { front: "tomorrow", back: "ngày mai", pinyin: "/təˈmɒrəʊ/", hanViet: "trạng từ", example: { zh: "I have a meeting tomorrow.", pinyin: "/aɪ hæv ə ˈmiːtɪŋ təˈmɒrəʊ/", vi: "Tôi có một cuộc họp vào ngày mai." } },
  { front: "go", back: "đi", pinyin: "/ɡoʊ/", hanViet: "động từ", example: { zh: "Let's go to the park.", pinyin: "/lɛts ɡoʊ tuː ðə pɑːrk/", vi: "Hãy đi đến công viên nào." } },
  { front: "come", back: "đến / lại", pinyin: "/kʌm/", hanViet: "động từ", example: { zh: "Please come here.", pinyin: "/pliːz kʌm hɪər/", vi: "Xin hãy đến đây." } },
  { front: "like", back: "thích", pinyin: "/laɪk/", hanViet: "động từ", example: { zh: "I like reading books.", pinyin: "/aɪ laɪk ˈriːdɪŋ bʊks/", vi: "Tôi thích đọc sách." } },
  { front: "love", back: "yêu / yêu thích", pinyin: "/lʌv/", hanViet: "động từ / danh từ", example: { zh: "I love my family.", pinyin: "/aɪ lʌv maɪ ˈfæmɪli/", vi: "Tôi yêu gia đình của mình." } },
  { front: "know", back: "biết", pinyin: "/noʊ/", hanViet: "động từ", example: { zh: "Do you know the answer?", pinyin: "/duː juː noʊ ðə ˈɑːnsər/", vi: "Bạn có biết câu trả lời không?" } },
  { front: "help", back: "giúp / giúp đỡ", pinyin: "/hɛlp/", hanViet: "động từ / danh từ", example: { zh: "Can you help me, please?", pinyin: "/kæn juː hɛlp miː pliːz/", vi: "Bạn có thể giúp tôi không?" } },
  { front: "water", back: "nước", pinyin: "/ˈwɔːtər/", hanViet: "danh từ", example: { zh: "I need a glass of water.", pinyin: "/aɪ niːd ə ɡlɑːs əv ˈwɔːtər/", vi: "Tôi cần một ly nước." } },
];

const EN_INTERMEDIATE: CardSeed[] = [
  { front: "achieve", back: "đạt được / đạt thành", pinyin: "/əˈtʃiːv/", hanViet: "động từ", example: { zh: "She achieved her goal.", pinyin: "/ʃiː əˈtʃiːvd hər ɡoʊl/", vi: "Cô ấy đã đạt được mục tiêu của mình." } },
  { front: "opportunity", back: "cơ hội", pinyin: "/ˌɒpəˈtjuːnɪti/", hanViet: "danh từ", example: { zh: "This is a great opportunity.", pinyin: "/ðɪs ɪz ə ɡreɪt ˌɒpəˈtjuːnɪti/", vi: "Đây là một cơ hội tuyệt vời." } },
  { front: "experience", back: "kinh nghiệm / trải nghiệm", pinyin: "/ɪkˈspɪərɪəns/", hanViet: "danh từ", example: { zh: "He has a lot of experience.", pinyin: "/hiː hæz ə lɒt əv ɪkˈspɪərɪəns/", vi: "Anh ấy có rất nhiều kinh nghiệm." } },
  { front: "important", back: "quan trọng", pinyin: "/ɪmˈpɔːrtənt/", hanViet: "tính từ", example: { zh: "Health is very important.", pinyin: "/hɛlθ ɪz ˈvɛri ɪmˈpɔːrtənt/", vi: "Sức khỏe rất quan trọng." } },
  { front: "culture", back: "văn hóa", pinyin: "/ˈkʌltʃər/", hanViet: "danh từ", example: { zh: "Every country has a unique culture.", pinyin: "/ˈɛvri ˈkʌntri hæz ə juːˈniːk ˈkʌltʃər/", vi: "Mỗi quốc gia đều có văn hóa độc đáo." } },
  { front: "environment", back: "môi trường", pinyin: "/ɪnˈvaɪrənmənt/", hanViet: "danh từ", example: { zh: "We must protect the environment.", pinyin: "/wiː mʌst prəˈtɛkt ðə ɪnˈvaɪrənmənt/", vi: "Chúng ta phải bảo vệ môi trường." } },
  { front: "develop", back: "phát triển", pinyin: "/dɪˈvɛləp/", hanViet: "động từ", example: { zh: "The company is developing quickly.", pinyin: "/ðə ˈkʌmpəni ɪz dɪˈvɛləpɪŋ ˈkwɪkli/", vi: "Công ty đang phát triển nhanh chóng." } },
  { front: "technology", back: "công nghệ", pinyin: "/tɛkˈnɒlədʒi/", hanViet: "danh từ", example: { zh: "Technology changes our lives.", pinyin: "/tɛkˈnɒlədʒi ˈtʃeɪndʒɪz aʊər laɪvz/", vi: "Công nghệ thay đổi cuộc sống của chúng ta." } },
  { front: "education", back: "giáo dục", pinyin: "/ˌɛdʒʊˈkeɪʃən/", hanViet: "danh từ", example: { zh: "Education is the key to success.", pinyin: "/ˌɛdʒʊˈkeɪʃən ɪz ðə kiː tuː səkˈsɛs/", vi: "Giáo dục là chìa khóa dẫn đến thành công." } },
  { front: "success", back: "thành công", pinyin: "/səkˈsɛs/", hanViet: "danh từ", example: { zh: "Hard work leads to success.", pinyin: "/hɑːrd wɜːrk liːdz tuː səkˈsɛs/", vi: "Làm việc chăm chỉ dẫn đến thành công." } },
  { front: "challenge", back: "thách thức", pinyin: "/ˈtʃælɪndʒ/", hanViet: "danh từ", example: { zh: "Every challenge is a chance to grow.", pinyin: "/ˈɛvri ˈtʃælɪndʒ ɪz ə tʃɑːns tuː ɡroʊ/", vi: "Mỗi thách thức là cơ hội để trưởng thành." } },
  { front: "responsibility", back: "trách nhiệm", pinyin: "/rɪˌspɒnsɪˈbɪlɪti/", hanViet: "danh từ", example: { zh: "He takes his responsibilities seriously.", pinyin: "/hiː teɪks hɪz rɪˌspɒnsɪˈbɪlɪtiz ˈsɪərɪəsli/", vi: "Anh ấy coi trọng trách nhiệm của mình." } },
  { front: "communicate", back: "giao tiếp / truyền đạt", pinyin: "/kəˈmjuːnɪkeɪt/", hanViet: "động từ", example: { zh: "It's important to communicate clearly.", pinyin: "/ɪts ɪmˈpɔːrtənt tuː kəˈmjuːnɪkeɪt ˈklɪərli/", vi: "Việc giao tiếp rõ ràng rất quan trọng." } },
  { front: "improve", back: "cải thiện / nâng cao", pinyin: "/ɪmˈpruːv/", hanViet: "động từ", example: { zh: "I want to improve my English.", pinyin: "/aɪ wɒnt tuː ɪmˈpruːv maɪ ˈɪŋɡlɪʃ/", vi: "Tôi muốn cải thiện tiếng Anh của mình." } },
  { front: "consider", back: "xem xét / cân nhắc", pinyin: "/kənˈsɪdər/", hanViet: "động từ", example: { zh: "Please consider my proposal.", pinyin: "/pliːz kənˈsɪdər maɪ prəˈpoʊzl/", vi: "Xin hãy xem xét đề xuất của tôi." } },
  { front: "significant", back: "đáng kể / quan trọng", pinyin: "/sɪɡˈnɪfɪkənt/", hanViet: "tính từ", example: { zh: "There was a significant improvement.", pinyin: "/ðɛr wɒz ə sɪɡˈnɪfɪkənt ɪmˈpruːvmənt/", vi: "Đã có sự cải thiện đáng kể." } },
  { front: "relationship", back: "mối quan hệ", pinyin: "/rɪˈleɪʃənʃɪp/", hanViet: "danh từ", example: { zh: "They have a good relationship.", pinyin: "/ðeɪ hæv ə ɡʊd rɪˈleɪʃənʃɪp/", vi: "Họ có mối quan hệ tốt đẹp." } },
  { front: "suggest", back: "đề xuất / gợi ý", pinyin: "/səˈdʒɛst/", hanViet: "động từ", example: { zh: "I suggest we meet tomorrow.", pinyin: "/aɪ səˈdʒɛst wiː miːt təˈmɒrəʊ/", vi: "Tôi đề xuất chúng ta gặp nhau vào ngày mai." } },
  { front: "benefit", back: "lợi ích / có lợi", pinyin: "/ˈbɛnɪfɪt/", hanViet: "danh từ / động từ", example: { zh: "Exercise has many benefits.", pinyin: "/ˈɛksəsaɪz hæz ˈmɛni ˈbɛnɪfɪts/", vi: "Tập thể dục có nhiều lợi ích." } },
  { front: "global", back: "toàn cầu", pinyin: "/ˈɡloʊbəl/", hanViet: "tính từ", example: { zh: "Climate change is a global issue.", pinyin: "/ˈklaɪmɪt tʃeɪndʒ ɪz ə ˈɡloʊbəl ˈɪʃuː/", vi: "Biến đổi khí hậu là vấn đề toàn cầu." } },
  { front: "analyze", back: "phân tích", pinyin: "/ˈænəlaɪz/", hanViet: "động từ", example: { zh: "We need to analyze the data.", pinyin: "/wiː niːd tuː ˈænəlaɪz ðə ˈdeɪtə/", vi: "Chúng ta cần phân tích dữ liệu." } },
  { front: "impact", back: "tác động / ảnh hưởng", pinyin: "/ˈɪmpækt/", hanViet: "danh từ", example: { zh: "Social media has a huge impact.", pinyin: "/ˈsoʊʃəl ˈmiːdiə hæz ə hjuːdʒ ˈɪmpækt/", vi: "Mạng xã hội có tác động rất lớn." } },
  { front: "strategy", back: "chiến lược", pinyin: "/ˈstrætɪdʒi/", hanViet: "danh từ", example: { zh: "We need a better strategy.", pinyin: "/wiː niːd ə ˈbɛtər ˈstrætɪdʒi/", vi: "Chúng ta cần một chiến lược tốt hơn." } },
  { front: "sustainable", back: "bền vững", pinyin: "/səˈsteɪnəbəl/", hanViet: "tính từ", example: { zh: "Sustainable development is our goal.", pinyin: "/səˈsteɪnəbəl dɪˈvɛləpmənt ɪz aʊər ɡoʊl/", vi: "Phát triển bền vững là mục tiêu của chúng ta." } },
  { front: "diversity", back: "sự đa dạng", pinyin: "/daɪˈvɜːrsɪti/", hanViet: "danh từ", example: { zh: "We celebrate diversity in our team.", pinyin: "/wiː ˈsɛlɪbreɪt daɪˈvɜːrsɪti ɪn aʊər tiːm/", vi: "Chúng tôi trân trọng sự đa dạng trong nhóm." } },
];

// ─── TIẾNG NHẬT (ja-JP) ─────────────────────────────────────────────────────
// pinyin = romaji  |  hanViet = hiragana

const JP_N5: CardSeed[] = [
  { front: "こんにちは", back: "Xin chào (ban ngày)", pinyin: "Konnichiwa", hanViet: "こんにちは", example: { zh: "こんにちは、お元気ですか？", pinyin: "Konnichiwa, o-genki desu ka?", vi: "Xin chào, bạn có khỏe không?" } },
  { front: "ありがとう", back: "Cảm ơn", pinyin: "Arigatou", hanViet: "ありがとう", example: { zh: "ありがとうございます。", pinyin: "Arigatou gozaimasu.", vi: "Xin cảm ơn bạn rất nhiều." } },
  { front: "さようなら", back: "Tạm biệt", pinyin: "Sayounara", hanViet: "さようなら", example: { zh: "さようなら、また明日！", pinyin: "Sayounara, mata ashita!", vi: "Tạm biệt, hẹn gặp lại ngày mai!" } },
  { front: "私", back: "Tôi", pinyin: "Watashi", hanViet: "わたし", example: { zh: "私は学生です。", pinyin: "Watashi wa gakusei desu.", vi: "Tôi là học sinh." } },
  { front: "あなた", back: "Bạn / Anh / Chị", pinyin: "Anata", hanViet: "あなた", example: { zh: "あなたの名前は何ですか？", pinyin: "Anata no namae wa nan desu ka?", vi: "Tên bạn là gì?" } },
  { front: "友達", back: "Bạn bè", pinyin: "Tomodachi", hanViet: "ともだち", example: { zh: "彼は私の友達です。", pinyin: "Kare wa watashi no tomodachi desu.", vi: "Anh ấy là bạn của tôi." } },
  { front: "学校", back: "Trường học", pinyin: "Gakkou", hanViet: "がっこう", example: { zh: "毎日学校に行きます。", pinyin: "Mainichi gakkou ni ikimasu.", vi: "Tôi đi học mỗi ngày." } },
  { front: "先生", back: "Giáo viên / Thầy cô", pinyin: "Sensei", hanViet: "せんせい", example: { zh: "田中先生は優しいです。", pinyin: "Tanaka sensei wa yasashii desu.", vi: "Thầy Tanaka rất tốt bụng." } },
  { front: "食べる", back: "Ăn", pinyin: "Taberu", hanViet: "たべる", example: { zh: "何を食べたいですか？", pinyin: "Nani o tabetai desu ka?", vi: "Bạn muốn ăn gì?" } },
  { front: "飲む", back: "Uống", pinyin: "Nomu", hanViet: "のむ", example: { zh: "水を飲みます。", pinyin: "Mizu o nomimasu.", vi: "Tôi uống nước." } },
  { front: "見る", back: "Nhìn / Xem", pinyin: "Miru", hanViet: "みる", example: { zh: "映画を見ます。", pinyin: "Eiga o mimasu.", vi: "Tôi xem phim." } },
  { front: "行く", back: "Đi", pinyin: "Iku", hanViet: "いく", example: { zh: "学校に行きます。", pinyin: "Gakkou ni ikimasu.", vi: "Tôi đi đến trường." } },
  { front: "来る", back: "Đến", pinyin: "Kuru", hanViet: "くる", example: { zh: "友達が来ます。", pinyin: "Tomodachi ga kimasu.", vi: "Bạn tôi đến." } },
  { front: "好き", back: "Thích / Yêu thích", pinyin: "Suki", hanViet: "すき", example: { zh: "音楽が好きです。", pinyin: "Ongaku ga suki desu.", vi: "Tôi thích âm nhạc." } },
  { front: "水", back: "Nước", pinyin: "Mizu", hanViet: "みず", example: { zh: "水を一杯ください。", pinyin: "Mizu o ippai kudasai.", vi: "Cho tôi một ly nước." } },
  { front: "今日", back: "Hôm nay", pinyin: "Kyou", hanViet: "きょう", example: { zh: "今日は晴れています。", pinyin: "Kyou wa harete imasu.", vi: "Hôm nay trời nắng." } },
  { front: "明日", back: "Ngày mai", pinyin: "Ashita", hanViet: "あした", example: { zh: "明日また会いましょう。", pinyin: "Ashita mata aimashou.", vi: "Hãy gặp lại nhau vào ngày mai." } },
  { front: "大きい", back: "To / Lớn", pinyin: "Ookii", hanViet: "おおきい", example: { zh: "この部屋は大きいです。", pinyin: "Kono heya wa ookii desu.", vi: "Phòng này thật to." } },
  { front: "小さい", back: "Nhỏ / Bé", pinyin: "Chiisai", hanViet: "ちいさい", example: { zh: "この猫は小さいです。", pinyin: "Kono neko wa chiisai desu.", vi: "Con mèo này thật nhỏ." } },
  { front: "かわいい", back: "Dễ thương / Đáng yêu", pinyin: "Kawaii", hanViet: "かわいい", example: { zh: "この犬はかわいいです。", pinyin: "Kono inu wa kawaii desu.", vi: "Con chó này thật dễ thương." } },
  { front: "お金", back: "Tiền", pinyin: "Okane", hanViet: "おかね", example: { zh: "お金がありません。", pinyin: "Okane ga arimasen.", vi: "Tôi không có tiền." } },
  { front: "時間", back: "Thời gian", pinyin: "Jikan", hanViet: "じかん", example: { zh: "時間がありますか？", pinyin: "Jikan ga arimasu ka?", vi: "Bạn có thời gian không?" } },
  { front: "家族", back: "Gia đình", pinyin: "Kazoku", hanViet: "かぞく", example: { zh: "私の家族は五人です。", pinyin: "Watashi no kazoku wa gonin desu.", vi: "Gia đình tôi có năm người." } },
  { front: "日本語", back: "Tiếng Nhật", pinyin: "Nihongo", hanViet: "にほんご", example: { zh: "日本語を勉強しています。", pinyin: "Nihongo o benkyou shite imasu.", vi: "Tôi đang học tiếng Nhật." } },
  { front: "わかる", back: "Hiểu / Biết", pinyin: "Wakaru", hanViet: "わかる", example: { zh: "日本語がわかりますか？", pinyin: "Nihongo ga wakarimasu ka?", vi: "Bạn có hiểu tiếng Nhật không?" } },
];

const JP_N4: CardSeed[] = [
  { front: "勉強する", back: "Học tập", pinyin: "Benkyou suru", hanViet: "べんきょうする", example: { zh: "毎日日本語を勉強します。", pinyin: "Mainichi Nihongo o benkyou shimasu.", vi: "Tôi học tiếng Nhật mỗi ngày." } },
  { front: "仕事", back: "Công việc", pinyin: "Shigoto", hanViet: "しごと", example: { zh: "仕事は大変ですが、楽しいです。", pinyin: "Shigoto wa taihen desu ga, tanoshii desu.", vi: "Công việc vất vả nhưng thú vị." } },
  { front: "電話", back: "Điện thoại", pinyin: "Denwa", hanViet: "でんわ", example: { zh: "電話してください。", pinyin: "Denwa shite kudasai.", vi: "Hãy gọi điện cho tôi." } },
  { front: "病院", back: "Bệnh viện", pinyin: "Byouin", hanViet: "びょういん", example: { zh: "病院に行きました。", pinyin: "Byouin ni ikimashita.", vi: "Tôi đã đến bệnh viện." } },
  { front: "駅", back: "Nhà ga (tàu điện)", pinyin: "Eki", hanViet: "えき", example: { zh: "駅はどこですか？", pinyin: "Eki wa doko desu ka?", vi: "Nhà ga ở đâu vậy?" } },
  { front: "電車", back: "Tàu điện", pinyin: "Densha", hanViet: "でんしゃ", example: { zh: "電車で学校に行きます。", pinyin: "Densha de gakkou ni ikimasu.", vi: "Tôi đi học bằng tàu điện." } },
  { front: "天気", back: "Thời tiết", pinyin: "Tenki", hanViet: "てんき", example: { zh: "今日の天気はいいです。", pinyin: "Kyou no tenki wa ii desu.", vi: "Thời tiết hôm nay đẹp." } },
  { front: "旅行", back: "Du lịch", pinyin: "Ryokou", hanViet: "りょこう", example: { zh: "旅行が大好きです。", pinyin: "Ryokou ga daisuki desu.", vi: "Tôi rất thích du lịch." } },
  { front: "料理", back: "Nấu ăn / Món ăn", pinyin: "Ryouri", hanViet: "りょうり", example: { zh: "日本料理はおいしいです。", pinyin: "Nihon ryouri wa oishii desu.", vi: "Món ăn Nhật Bản rất ngon." } },
  { front: "音楽", back: "Âm nhạc", pinyin: "Ongaku", hanViet: "おんがく", example: { zh: "音楽を聴くのが好きです。", pinyin: "Ongaku o kiku no ga suki desu.", vi: "Tôi thích nghe âm nhạc." } },
  { front: "映画", back: "Phim / Điện ảnh", pinyin: "Eiga", hanViet: "えいが", example: { zh: "週末に映画を見ました。", pinyin: "Shuumatsu ni eiga o mimashita.", vi: "Tôi đã xem phim vào cuối tuần." } },
  { front: "買い物", back: "Mua sắm", pinyin: "Kaimono", hanViet: "かいもの", example: { zh: "買い物に行きたいです。", pinyin: "Kaimono ni ikitai desu.", vi: "Tôi muốn đi mua sắm." } },
  { front: "試験", back: "Kỳ thi / Bài kiểm tra", pinyin: "Shiken", hanViet: "しけん", example: { zh: "明日試験があります。", pinyin: "Ashita shiken ga arimasu.", vi: "Ngày mai có kỳ thi." } },
  { front: "練習", back: "Luyện tập", pinyin: "Renshuu", hanViet: "れんしゅう", example: { zh: "毎日練習することが大切です。", pinyin: "Mainichi renshuu suru koto ga taisetsu desu.", vi: "Luyện tập mỗi ngày rất quan trọng." } },
  { front: "説明", back: "Giải thích / Thuyết minh", pinyin: "Setsumei", hanViet: "せつめい", example: { zh: "もう一度説明してください。", pinyin: "Mou ichido setsumei shite kudasai.", vi: "Xin hãy giải thích lại một lần nữa." } },
  { front: "大切", back: "Quan trọng / Trân quý", pinyin: "Taisetsu", hanViet: "たいせつ", example: { zh: "友達は大切です。", pinyin: "Tomodachi wa taisetsu desu.", vi: "Bạn bè rất quan trọng." } },
  { front: "難しい", back: "Khó", pinyin: "Muzukashii", hanViet: "むずかしい", example: { zh: "日本語は難しいですが、面白いです。", pinyin: "Nihongo wa muzukashii desu ga, omoshiroi desu.", vi: "Tiếng Nhật khó nhưng thú vị." } },
  { front: "楽しい", back: "Vui / Thú vị", pinyin: "Tanoshii", hanViet: "たのしい", example: { zh: "日本語の勉強は楽しいです。", pinyin: "Nihongo no benkyou wa tanoshii desu.", vi: "Việc học tiếng Nhật rất thú vị." } },
  { front: "面白い", back: "Thú vị / Buồn cười", pinyin: "Omoshiroi", hanViet: "おもしろい", example: { zh: "この映画は面白いです。", pinyin: "Kono eiga wa omoshiroi desu.", vi: "Bộ phim này rất thú vị." } },
  { front: "優しい", back: "Tốt bụng / Dịu dàng", pinyin: "Yasashii", hanViet: "やさしい", example: { zh: "彼女はとても優しいです。", pinyin: "Kanojo wa totemo yasashii desu.", vi: "Cô ấy rất tốt bụng." } },
  { front: "忙しい", back: "Bận rộn", pinyin: "Isogashii", hanViet: "いそがしい", example: { zh: "最近とても忙しいです。", pinyin: "Saikin totemo isogashii desu.", vi: "Gần đây tôi rất bận rộn." } },
  { front: "文化", back: "Văn hóa", pinyin: "Bunka", hanViet: "ぶんか", example: { zh: "日本の文化はユニークです。", pinyin: "Nihon no bunka wa yuniiku desu.", vi: "Văn hóa Nhật Bản rất độc đáo." } },
  { front: "将来", back: "Tương lai", pinyin: "Shourai", hanViet: "しょうらい", example: { zh: "将来、医者になりたいです。", pinyin: "Shourai, isha ni naritai desu.", vi: "Trong tương lai, tôi muốn trở thành bác sĩ." } },
  { front: "経験", back: "Kinh nghiệm", pinyin: "Keiken", hanViet: "けいけん", example: { zh: "この経験はとても貴重です。", pinyin: "Kono keiken wa totemo kichou desu.", vi: "Kinh nghiệm này rất quý giá." } },
  { front: "気持ち", back: "Cảm xúc / Tâm trạng", pinyin: "Kimochi", hanViet: "きもち", example: { zh: "今日はいい気持ちです。", pinyin: "Kyou wa ii kimochi desu.", vi: "Hôm nay tôi cảm thấy tốt." } },
];

// ─── TIẾNG HÀN (ko-KR) ──────────────────────────────────────────────────────
// pinyin = romanization (RR)  |  hanViet = hanja (if applicable)

const KR_TOPIK1: CardSeed[] = [
  { front: "안녕하세요", back: "Xin chào (lịch sự)", pinyin: "Annyeonghaseyo", hanViet: "안녕하세요", example: { zh: "안녕하세요! 잘 지내셨어요?", pinyin: "Annyeonghaseyo! Jal jinaesyeosseoyo?", vi: "Xin chào! Bạn có khỏe không?" } },
  { front: "감사합니다", back: "Cảm ơn (lịch sự)", pinyin: "Gamsahamnida", hanViet: "感謝합니다", example: { zh: "도와주셔서 감사합니다.", pinyin: "Dowajusyeoseo gamsahamnida.", vi: "Cảm ơn bạn đã giúp đỡ." } },
  { front: "안녕히 가세요", back: "Tạm biệt (người ở lại nói)", pinyin: "Annyeonghi gaseyo", hanViet: "안녕히 가세요", example: { zh: "안녕히 가세요! 또 만나요.", pinyin: "Annyeonghi gaseyo! Tto mannayo.", vi: "Tạm biệt! Hẹn gặp lại nhé." } },
  { front: "나 / 저", back: "Tôi (thân mật / lịch sự)", pinyin: "Na / Jeo", hanViet: "我", example: { zh: "저는 학생이에요.", pinyin: "Jeoneun haksaengieyo.", vi: "Tôi là học sinh." } },
  { front: "친구", back: "Bạn bè", pinyin: "Chingu", hanViet: "親舊", example: { zh: "그는 제 친한 친구예요.", pinyin: "Geuneun je chinhan chinguye yo.", vi: "Anh ấy là bạn thân của tôi." } },
  { front: "학교", back: "Trường học", pinyin: "Hakgyo", hanViet: "學校", example: { zh: "매일 학교에 가요.", pinyin: "Maeil hakgyoe gayo.", vi: "Tôi đi học mỗi ngày." } },
  { front: "선생님", back: "Giáo viên / Thầy cô", pinyin: "Seonsaengnim", hanViet: "先生님", example: { zh: "선생님은 친절해요.", pinyin: "Seonsaengnimeun chinjeolhaeyo.", vi: "Thầy cô rất tốt bụng." } },
  { front: "먹다", back: "Ăn", pinyin: "Meokda", hanViet: "먹다", example: { zh: "뭘 먹고 싶어요?", pinyin: "Mwol meokgo sipeoyo?", vi: "Bạn muốn ăn gì?" } },
  { front: "마시다", back: "Uống", pinyin: "Masida", hanViet: "마시다", example: { zh: "물을 마십니다.", pinyin: "Mureul masipnida.", vi: "Tôi uống nước." } },
  { front: "좋아하다", back: "Thích / Yêu thích", pinyin: "Joahada", hanViet: "好하다", example: { zh: "음악을 좋아해요.", pinyin: "Eumageul joahaeyo.", vi: "Tôi thích âm nhạc." } },
  { front: "가다", back: "Đi", pinyin: "Gada", hanViet: "가다", example: { zh: "학교에 가요.", pinyin: "Hakgyoe gayo.", vi: "Tôi đi đến trường." } },
  { front: "오다", back: "Đến", pinyin: "Oda", hanViet: "오다", example: { zh: "친구가 와요.", pinyin: "Chinguga wayo.", vi: "Bạn tôi đến." } },
  { front: "물", back: "Nước", pinyin: "Mul", hanViet: "水", example: { zh: "물 한 잔 주세요.", pinyin: "Mul han jan juseyo.", vi: "Cho tôi một ly nước." } },
  { front: "오늘", back: "Hôm nay", pinyin: "Oneul", hanViet: "오늘", example: { zh: "오늘 날씨가 좋아요.", pinyin: "Oneul nalssiga joayo.", vi: "Hôm nay thời tiết đẹp." } },
  { front: "내일", back: "Ngày mai", pinyin: "Naeil", hanViet: "來日", example: { zh: "내일 또 만나요.", pinyin: "Naeil tto mannayo.", vi: "Hẹn gặp lại ngày mai." } },
  { front: "크다", back: "To / Lớn", pinyin: "Keuda", hanViet: "크다", example: { zh: "이 방은 커요.", pinyin: "I bangeun keoyo.", vi: "Căn phòng này rất to." } },
  { front: "작다", back: "Nhỏ / Bé", pinyin: "Jakda", hanViet: "작다", example: { zh: "이 고양이는 작아요.", pinyin: "I goyangi-neun jagayo.", vi: "Con mèo này rất nhỏ." } },
  { front: "돈", back: "Tiền", pinyin: "Don", hanViet: "錢", example: { zh: "돈이 없어요.", pinyin: "Doni eopseoyo.", vi: "Tôi không có tiền." } },
  { front: "시간", back: "Thời gian", pinyin: "Sigan", hanViet: "時間", example: { zh: "시간이 있어요?", pinyin: "Sigani isseoyo?", vi: "Bạn có thời gian không?" } },
  { front: "가족", back: "Gia đình", pinyin: "Gajok", hanViet: "家族", example: { zh: "우리 가족은 다섯 명이에요.", pinyin: "Uri gajogeun daseot myeongieyo.", vi: "Gia đình tôi có năm người." } },
  { front: "한국어", back: "Tiếng Hàn", pinyin: "Hangugeo", hanViet: "韓國語", example: { zh: "한국어를 공부하고 있어요.", pinyin: "Hangugeoreul gongbuhago isseoyo.", vi: "Tôi đang học tiếng Hàn." } },
  { front: "알다", back: "Biết / Hiểu", pinyin: "Alda", hanViet: "알다", example: { zh: "한국어를 알아요?", pinyin: "Hangugeoreul arayo?", vi: "Bạn có biết tiếng Hàn không?" } },
  { front: "예쁘다", back: "Đẹp / Xinh", pinyin: "Yeppeuda", hanViet: "예쁘다", example: { zh: "꽃이 예뻐요.", pinyin: "Kkochi yeppeoyo.", vi: "Bông hoa thật đẹp." } },
  { front: "행복하다", back: "Hạnh phúc", pinyin: "Haengbokhada", hanViet: "幸福하다", example: { zh: "오늘 너무 행복해요.", pinyin: "Oneul neomu haengbokhaeyo.", vi: "Hôm nay tôi rất hạnh phúc." } },
  { front: "공부하다", back: "Học tập", pinyin: "Gongbuhada", hanViet: "工夫하다", example: { zh: "매일 공부해요.", pinyin: "Maeil gongbuhaeyo.", vi: "Tôi học mỗi ngày." } },
];

// ─── SYSTEM DECK DEFINITIONS ─────────────────────────────────────────────────

type DeckDef = {
  name: string;
  description: string;
  language: string;
  isVip: boolean;
  cards: CardSeed[];
};

const SYSTEM_DECKS: DeckDef[] = [
  // 中文
  { name: "HSK 1 - Từ vựng cơ bản", description: "30 từ vựng thiết yếu cho người mới bắt đầu học tiếng Trung (HSK cấp 1)", language: "zh-CN", isVip: false, cards: HSK1 },
  { name: "HSK 2 - Từ vựng sơ cấp", description: "30 từ vựng thường dùng cho cấp sơ cấp (HSK cấp 2)", language: "zh-CN", isVip: false, cards: HSK2 },
  { name: "HSK 3 - Từ vựng trung cấp", description: "30 từ vựng nâng cao cho cấp trung cấp (HSK cấp 3)", language: "zh-CN", isVip: false, cards: HSK3 },
  { name: "HSK 4 - Từ vựng nâng cao", description: "Từ vựng nâng cao HSK cấp 4 — dành riêng cho thành viên VIP", language: "zh-CN", isVip: true, cards: [] },
  { name: "Thành ngữ tiếng Trung", description: "Các thành ngữ (chéngyǔ) phổ biến — dành riêng cho VIP", language: "zh-CN", isVip: true, cards: [] },
  // English
  { name: "English Basic - Từ vựng cơ bản", description: "25 từ vựng tiếng Anh thông dụng nhất cho người mới bắt đầu", language: "en-US", isVip: false, cards: EN_BASIC },
  { name: "English Intermediate - IELTS Vocabulary", description: "25 từ vựng tiếng Anh trình độ trung cấp, chuẩn bị cho IELTS/TOEIC", language: "en-US", isVip: false, cards: EN_INTERMEDIATE },
  { name: "English Advanced - Academic Vocabulary", description: "Từ vựng học thuật tiếng Anh nâng cao — dành riêng cho VIP", language: "en-US", isVip: true, cards: [] },
  // 日本語
  { name: "JLPT N5 - Từ vựng cơ bản", description: "25 từ vựng tiếng Nhật cơ bản nhất, tương đương JLPT N5", language: "ja-JP", isVip: false, cards: JP_N5 },
  { name: "JLPT N4 - Từ vựng sơ cấp", description: "25 từ vựng tiếng Nhật trình độ N4", language: "ja-JP", isVip: false, cards: JP_N4 },
  { name: "JLPT N3 - Từ vựng trung cấp", description: "Từ vựng tiếng Nhật trình độ N3 — dành riêng cho VIP", language: "ja-JP", isVip: true, cards: [] },
  // 한국어
  { name: "TOPIK I - Từ vựng cơ bản", description: "25 từ vựng tiếng Hàn cơ bản nhất, chuẩn bị cho TOPIK I", language: "ko-KR", isVip: false, cards: KR_TOPIK1 },
  { name: "TOPIK II - Từ vựng trung cấp", description: "Từ vựng tiếng Hàn trình độ trung cấp TOPIK II — dành cho VIP", language: "ko-KR", isVip: true, cards: [] },
];

async function main() {
  console.log("Seeding system flashcard decks...");

  for (const deck of SYSTEM_DECKS) {
    const existing = await prisma.flashcardDeck.findFirst({
      where: { name: deck.name, isSystem: true },
    });

    if (existing) {
      // Update language field if missing
      if (!existing.language || existing.language === "zh-CN" && deck.language !== "zh-CN") {
        await prisma.flashcardDeck.update({
          where: { id: existing.id },
          data: { language: deck.language },
        });
      }
      console.log(`  Skipping existing deck: ${deck.name}`);
      continue;
    }

    const created = await prisma.flashcardDeck.create({
      data: {
        name: deck.name,
        description: deck.description,
        language: deck.language,
        isSystem: true,
        isVip: deck.isVip,
        ownerId: null,
      },
    });

    if (deck.cards.length > 0) {
      await prisma.flashcard.createMany({
        data: deck.cards.map((c) => ({
          deckId: created.id,
          front: c.front,
          back: c.back,
          pinyin: c.pinyin,
          hanViet: c.hanViet,
          example: c.example,
        })),
      });
      console.log(`  Created deck "${deck.name}" (${deck.language}) with ${deck.cards.length} cards`);
    } else {
      console.log(`  Created deck "${deck.name}" (${deck.language}) — VIP placeholder`);
    }
  }

  // Update existing HSK decks to have language = zh-CN
  await prisma.flashcardDeck.updateMany({
    where: { isSystem: true, language: "zh-CN" },
    data: { language: "zh-CN" },
  });

  // ─── SEED EXAM DATA ───────────────────────────────────────────────────────
  console.log("Seeding exam data...");

  const existingExam = await prisma.exam.findFirst({ where: { title: "HSK 1 – Đề thi 1" } });
  if (!existingExam) {
    const exam = await prisma.exam.create({
      data: {
        title: "HSK 1 – Đề thi 1",
        description: "Đề thi thử HSK cấp 1 với 10 câu đọc hiểu mẫu. Phù hợp người mới bắt đầu học tiếng Trung.",
        examType: "HSK",
        level: "1",
        duration: 20,
        skills: ["READING"],
        isActive: true,
      },
    });

    const questions = [
      {
        section: "READING" as const,
        content: '"你好" có nghĩa là gì?',
        options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"],
        correctAnswer: "B",
        explanation: '"你好" (nǐ hǎo) là lời chào thông dụng trong tiếng Trung, tương đương "Xin chào" trong tiếng Việt.',
        order: 1,
      },
      {
        section: "READING" as const,
        content: 'Điền vào chỗ trống: 我___学生。(Tôi ___ học sinh.)',
        options: ["不", "是", "有", "去"],
        correctAnswer: "B",
        explanation: '"是" (shì) là động từ nối, tương đương "là" trong tiếng Việt. "我是学生" = "Tôi là học sinh".',
        order: 2,
      },
      {
        section: "READING" as const,
        content: '"明天" có nghĩa là gì?',
        options: ["Hôm nay", "Hôm qua", "Ngày mai", "Tuần sau"],
        correctAnswer: "C",
        explanation: '"明天" (míngtiān) = ngày mai. "今天" = hôm nay, "昨天" = hôm qua.',
        order: 3,
      },
      {
        section: "READING" as const,
        content: '"多少钱" có nghĩa là gì?',
        options: ["Bao nhiêu người", "Bao nhiêu tuổi", "Bao nhiêu tiền", "Bao nhiêu câu"],
        correctAnswer: "C",
        explanation: '"多少钱" (duōshǎo qián) = bao nhiêu tiền. Đây là câu hỏi giá cả thông dụng khi mua hàng.',
        order: 4,
      },
      {
        section: "READING" as const,
        content: 'Câu nào có nghĩa "Tôi thích ăn táo"?',
        options: ["我喜欢喝水", "我喜欢吃苹果", "我喜欢看书", "我喜欢学习"],
        correctAnswer: "B",
        explanation: '"吃" (chī) = ăn, "苹果" (píngguǒ) = táo. "我喜欢吃苹果" = Tôi thích ăn táo.',
        order: 5,
      },
      {
        section: "READING" as const,
        content: 'Từ trái nghĩa của "大" (to, lớn) là:',
        options: ["好", "多", "小", "来"],
        correctAnswer: "C",
        explanation: '"小" (xiǎo) = nhỏ, bé — trái nghĩa với "大" (dà) = to, lớn.',
        order: 6,
      },
      {
        section: "READING" as const,
        content: '"我有三个苹果" có nghĩa là:',
        options: ["Tôi muốn mua 3 quả táo", "Tôi ăn 3 quả táo", "Tôi có 3 quả táo", "Tôi thích 3 quả táo"],
        correctAnswer: "C",
        explanation: '"有" (yǒu) = có. "我有三个苹果" = Tôi có 3 quả táo.',
        order: 7,
      },
      {
        section: "READING" as const,
        content: 'Cách viết "Ngày mai" bằng tiếng Trung là:',
        options: ["今天", "昨天", "明天", "后天"],
        correctAnswer: "C",
        explanation: '"明天" (míngtiān) = ngày mai. "今天" = hôm nay, "昨天" = hôm qua, "后天" = ngày kia.',
        order: 8,
      },
      {
        section: "READING" as const,
        content: '"我们一起去学校" có nghĩa là:',
        options: ["Tôi đi học một mình", "Chúng tôi cùng nhau đi học", "Các bạn đi học", "Họ đến trường"],
        correctAnswer: "B",
        explanation: '"我们" = chúng tôi/ta, "一起" = cùng nhau, "去" = đi, "学校" = trường học.',
        order: 9,
      },
      {
        section: "READING" as const,
        content: 'Điền vào: 他是我的好___。(Anh ấy là ___ tốt của tôi.)',
        options: ["老师", "朋友", "学校", "家"],
        correctAnswer: "B",
        explanation: '"朋友" (péngyǒu) = bạn bè. "好朋友" = bạn tốt/thân.',
        order: 10,
      },
    ];

    await prisma.examQuestion.createMany({
      data: questions.map((q) => ({
        examId: exam.id,
        section: q.section,
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      })),
    });

    console.log(`  Created exam "${exam.title}" with ${questions.length} questions`);
  } else {
    console.log("  Skipping existing exam: HSK 1 – Đề thi 1");
  }

  // ─── SEED DAILY QUESTS ───────────────────────────────────────────────────
  console.log("Seeding daily quests...");

  const DAILY_QUESTS = [
    { code: "FLASHCARD_10", title: "Ôn 10 flashcard", description: "Ôn tập 10 thẻ ghi nhớ trong ngày", target: 10, expReward: 15, coinReward: 0, icon: "BookOpenCheck" },
    { code: "QUIZ_1", title: "Làm 1 bài quiz", description: "Hoàn thành ít nhất 1 bài kiểm tra mini", target: 1, expReward: 20, coinReward: 10, icon: "Trophy" },
    { code: "POST_1", title: "Đăng 1 bài cộng đồng", description: "Chia sẻ bài viết với cộng đồng EduVerse", target: 1, expReward: 10, coinReward: 0, icon: "FileText" },
    { code: "COMMENT_2", title: "Bình luận giúp 2 người", description: "Để lại 2 bình luận trong cộng đồng", target: 2, expReward: 10, coinReward: 0, icon: "MessageSquare" },
    { code: "ONLINE_15", title: "Học 15 phút", description: "Dành 15 phút học tập trên EduVerse", target: 15, expReward: 15, coinReward: 0, icon: "Clock" },
    { code: "LOGIN", title: "Đăng nhập hôm nay", description: "Mở EduVerse mỗi ngày để duy trì thói quen", target: 1, expReward: 5, coinReward: 0, icon: "Zap" },
  ];

  for (const q of DAILY_QUESTS) {
    await prisma.dailyQuest.upsert({
      where: { code: q.code },
      create: q,
      update: {},
    });
    console.log(`  Upserted quest: ${q.code}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
