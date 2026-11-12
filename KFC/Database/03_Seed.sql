/* =============================================================================
 * Khuhra Fruit Company - seed data
 *
 *     sqlcmd -S localhost\SQLEXPRESS -E -i Database_Seed.sql -f 65001
 *
 * This moves the 43 products that were hard-coded in the Angular app into the
 * database, with their Sindhi names, descriptions, seasons, photos and prices
 * exactly as they were. It was generated from the app's own data files rather
 * than retyped, so nothing was lost in translation.
 *
 * Safe to re-run: it only inserts rows whose Slug is not already present, so
 * your edited prices are never overwritten.
 * ========================================================================== */

USE KFC;
GO

SET NOCOUNT ON;
GO

/* ---------------------------------- Categories --------------------------- */

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'summer-fruit')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('fruit', 'summer-fruit', N'Summer Fruit', N'اونهاري جا ميوا', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'orchard-fruit')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('fruit', 'orchard-fruit', N'Orchard Fruit', N'باغ جا ميوا', 2);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'stone-fruit')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('fruit', 'stone-fruit', N'Stone Fruit', N'ڪڻي وارا ميوا', 3);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'citrus')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('fruit', 'citrus', N'Citrus', N'نارنگي قسم', 4);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'tropical-dates')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('fruit', 'tropical-dates', N'Tropical & Dates', N'گرم علائقي جا ميوا ۽ کجور', 5);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'everyday-staples')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('vegetable', 'everyday-staples', N'Everyday Staples', N'روزاني ضرورت', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'gourds-cucurbits')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('vegetable', 'gourds-cucurbits', N'Gourds', N'ڪدو قسم', 2);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'leafy-greens')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('vegetable', 'leafy-greens', N'Leafy Greens', N'پَنَ واريون ڀاڄيون', 3);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'pods-beans')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('vegetable', 'pods-beans', N'Pods & Beans', N'ڦريون', 4);
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = 'roots-others')
    INSERT INTO dbo.Categories (Kind, Slug, NameEn, NameSd, SortOrder) VALUES ('vegetable', 'roots-others', N'Roots & Others', N'پاڙ واريون ۽ ٻيون', 5);
GO

/* ----------------------------------- Products ---------------------------- */

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'mango')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'mango', N'Mangoes', N'انبو', N'Ambo', N'The headline summer fruit of the Sindh mandi, traded by the crate across the Sindhri, Sindhri Late and Chaunsa varieties.', N'اونهاري جو خاص ميوو، منڊي ۾ پيتين ۾ وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mangos_-_single_and_halved.jpg/960px-Mangos_-_single_and_halved.jpg', N'5,6,7,8', 180, 'kg', 1, 1
    FROM dbo.Categories c WHERE c.Slug = 'summer-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'watermelon')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'watermelon', N'Watermelon', N'هنداڻو', N'Tarbooz', N'Large summer melon sold by the piece and by the load, at its heaviest volume through the hot months.', N'اونهاري جو وڏو ميوو، داڻي ۽ لوڊ تي وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Watermelon_Bahar1.jpg/960px-Watermelon_Bahar1.jpg', N'4,5,6,7,8', 350, 'piece', 1, 2
    FROM dbo.Categories c WHERE c.Slug = 'summer-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'melon')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'melon', N'Melon', N'ڦوٽ', N'Kharbooza', N'Sweet netted summer melon, graded by size and sugar before it moves to retail.', N'مٺو اونهاري جو ميوو، ماپ موجب درجي بندي ٿيندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/a/ae/Meloen_vrucht_met_bloem.jpg', N'4,5,6,7', 120, 'kg', 1, 3
    FROM dbo.Categories c WHERE c.Slug = 'summer-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'falsa')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'falsa', N'Falsa', N'فالسو', N'Falsa', N'Small tart purple berry with a short, sharp season, moved quickly because it does not keep.', N'ننڍو کٽو ميوو، موسم ننڍي هوندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Phalsa03_Asit.jpg/960px-Phalsa03_Asit.jpg', N'5,6,7', 300, 'kg', 1, 4
    FROM dbo.Categories c WHERE c.Slug = 'summer-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'jamun')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'jamun', N'Jamun', N'جامڻ', N'Jaman', N'Deep purple monsoon fruit with a single stone, handled in shallow crates to avoid bruising.', N'ڳاڙهي واڱڻائي رنگ جو ميوو، احتياط سان کنيو ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ripe_jamun_fruits.jpg/960px-Ripe_jamun_fruits.jpg', N'6,7,8', 260, 'kg', 1, 5
    FROM dbo.Categories c WHERE c.Slug = 'summer-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'apple')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'apple', N'Apples', N'صوف', N'Saib', N'Firm orchard fruit traded in tray-packed cartons and graded by size and colour.', N'سخت ميوو، ڪارٽن ۾ درجي بندي سان وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/960px-Pink_lady_and_cross_section.jpg', N'8,9,10,11,12,1', 220, 'kg', 1, 6
    FROM dbo.Categories c WHERE c.Slug = 'orchard-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'pear')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'pear', N'Pears', N'ناشپاتي', N'Nashpati', N'Crisp autumn orchard fruit, packed in trays because it marks easily.', N'سرءُ جو ميوو، ٽري ۾ بند ٿيندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/c/cf/Pears.jpg', N'7,8,9,10', 240, 'kg', 1, 7
    FROM dbo.Categories c WHERE c.Slug = 'orchard-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'pomegranate')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'pomegranate', N'Pomegranates', N'ڏاڙهون', N'Anar', N'Hard-skinned autumn fruit graded by size and skin colour, sold by the carton.', N'سخت کَل وارو ميوو، ماپ ۽ رنگ موجب درجي بندي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Punica_granatum_fruit_Grenade.jpg/960px-Punica_granatum_fruit_Grenade.jpg', N'9,10,11,12', 360, 'kg', 1, 8
    FROM dbo.Categories c WHERE c.Slug = 'orchard-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'grapes')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'grapes', N'Grapes', N'انگور', N'Angoor', N'Bunched table fruit handled in shallow crates and sold on bunch condition.', N'ڇڳن ۾ ايندو ميوو، ننڍين پيتين ۾ رکيو ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Grapes%2C_Rostov-on-Don%2C_Russia.jpg/960px-Grapes%2C_Rostov-on-Don%2C_Russia.jpg', N'6,7,8,9', 320, 'kg', 1, 9
    FROM dbo.Categories c WHERE c.Slug = 'orchard-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'peach')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'peach', N'Peaches', N'آڙو', N'Aaroo', N'Soft summer stone fruit, tray-packed and moved fast because it ripens in transit.', N'نرم ميوو، جلدي پچي ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Autumn_Red_peaches.jpg/960px-Autumn_Red_peaches.jpg', N'5,6,7,8', 260, 'kg', 1, 10
    FROM dbo.Categories c WHERE c.Slug = 'stone-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'plum')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'plum', N'Plums', N'آلوبخارو', N'Aalu Bukhara', N'Small stone fruit with a short season, graded on colour and firmness.', N'ننڍو ڪڻي وارو ميوو، موسم ننڍي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Plums_African_Rose_-_whole%2C_halved_and_slice.jpg/960px-Plums_African_Rose_-_whole%2C_halved_and_slice.jpg', N'5,6,7', 300, 'kg', 1, 11
    FROM dbo.Categories c WHERE c.Slug = 'stone-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'apricot')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'apricot', N'Apricots', N'خوباني', N'Khubani', N'Delicate summer stone fruit with a very short shelf life, sold fresh and dried.', N'نازڪ ميوو، تازو ۽ سڪل ٻئي وڪامن ٿا.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apricot_and_cross_section.jpg/960px-Apricot_and_cross_section.jpg', N'6,7,8', 340, 'kg', 1, 12
    FROM dbo.Categories c WHERE c.Slug = 'stone-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'cherry')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'cherry', N'Cherries', N'چيري', N'Cherry', N'Short-season stone fruit handled in small boxes; a seasonal arrival only.', N'ٿوري موسم وارو ميوو، ننڍن دٻن ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Cherry_season_%2848216568227%29.jpg/960px-Cherry_season_%2848216568227%29.jpg', N'5,6,7', 900, 'kg', 1, 13
    FROM dbo.Categories c WHERE c.Slug = 'stone-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'orange')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'orange', N'Oranges', N'نارنگي', N'Kinnow', N'Winter citrus traded by the carton and counted in hundreds as well as by weight.', N'سياري جو ميوو، ڪارٽن ۾ وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/960px-Oranges_-_whole-halved-segment.jpg', N'12,1,2,3', 140, 'kg', 1, 14
    FROM dbo.Categories c WHERE c.Slug = 'citrus';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'sweet-lime')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'sweet-lime', N'Sweet Lime', N'موسمبي', N'Mosambi', N'Mild winter citrus, mostly moved for juicing.', N'سياري جو مٺو ميوو، گھڻو ڪري رس لاءِ.', N'https://upload.wikimedia.org/wikipedia/commons/d/d6/Citrus_limetta.jpeg', N'11,12,1,2,3', 120, 'kg', 1, 15
    FROM dbo.Categories c WHERE c.Slug = 'citrus';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'banana')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'banana', N'Bananas', N'ڪيلو', N'Kela', N'Year-round fruit traded by the dozen and by the hand, ripened in stages.', N'سڄو سال ملندو، درجن جي حساب سان.', N'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg', NULL, 150, 'dozen', 1, 16
    FROM dbo.Categories c WHERE c.Slug = 'tropical-dates';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'guava')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'guava', N'Guavas', N'ڳدرو', N'Amrood', N'Aromatic winter fruit, graded by size and sold in baskets and crates.', N'سياري جو خوشبودار ميوو، ٽوڪرين ۾ ايندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Guava_pink_fruit.jpg/960px-Guava_pink_fruit.jpg', N'8,9,10,11,12,1,2', 150, 'kg', 1, 0
    FROM dbo.Categories c WHERE c.Slug = 'tropical-dates';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'papaya')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'papaya', N'Papaya', N'پپيتو', N'Papita', N'Large soft tropical fruit available through most of the year, sold by weight.', N'نرم ميوو، گھڻو سال ملندو، وزن تي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Papaya_iftar_sell.JPG/960px-Papaya_iftar_sell.JPG', NULL, 130, 'kg', 1, 18
    FROM dbo.Categories c WHERE c.Slug = 'tropical-dates';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'chikoo')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'chikoo', N'Chikoo', N'چيڪو', N'Chikoo', N'Small brown-skinned sweet fruit, handled gently and sold ripe.', N'ننڍو مٺو ميوو، احتياط سان کنيو ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg/960px-%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg', N'2,3,4,5,6', 200, 'kg', 1, 19
    FROM dbo.Categories c WHERE c.Slug = 'tropical-dates';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'dates')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'dates', N'Dates / Khajoor', N'کجور', N'Khajoor', N'Traded fresh at harvest and dried thereafter; Sindh is a major date-growing region.', N'تازي ۽ سڪل ٻئي صورتن ۾، سنڌ جي خاص پيداوار.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/960px-Dates005.jpg', N'7,8,9', 450, 'small', 1, 20
    FROM dbo.Categories c WHERE c.Slug = 'tropical-dates';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'other-seasonal-fruit')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'fruit', 'other-seasonal-fruit', N'Other Seasonal Fruits', N'ٻيا موسمي ميوا', NULL, N'Whatever else is arriving in the mandi this week. Message us and we will tell you what is on the floor today.', N'هن هفتي منڊي ۾ ايندڙ ٻيا ميوا. اسان کان پڇو.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Gourock_greengrocers_ext.jpg/960px-Gourock_greengrocers_ext.jpg', NULL, NULL, 'none', 1, 99
    FROM dbo.Categories c WHERE c.Slug = 'summer-fruit';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'potato')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'potato', N'Potatoes', N'پٽاٽا', N'Aloo', N'Stored and traded all year in jute bags, graded by size and skin condition.', N'سڄو سال ملندا، ڳوڻين ۾ وڪامندا آهن.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Patates.jpg/960px-Patates.jpg', NULL, 60, 'kg', 1, 1
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'onion')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'onion', N'Onions', N'بصر', N'Piyaz', N'A core mandi staple sold in bags year round, with price moving sharply on arrivals.', N'منڊي جي بنيادي شيءِ، سڄو سال ڳوڻين ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mixed_onions.jpg/960px-Mixed_onions.jpg', NULL, 80, 'kg', 1, 2
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'tomato')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'tomato', N'Tomatoes', N'ٽماٽا', N'Tamatar', N'Traded year round in shallow crates; the most price-sensitive line on the floor.', N'سڄو سال ملندا، قيمت جلدي بدلجندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/960px-Tomato_je.jpg', NULL, 90, 'kg', 1, 3
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'green-chilli')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'green-chilli', N'Green Chillies', N'سائي مرچ', N'Hari Mirch', N'Sold in sacks year round; Sindh is a major chilli-growing province.', N'سڄو سال ڳوڻين ۾، سنڌ جي خاص پيداوار.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Madame_Jeanette_and_other_chillies.jpg/960px-Madame_Jeanette_and_other_chillies.jpg', NULL, 160, 'small', 1, 4
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'garlic')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'garlic', N'Garlic', N'ٿوم', N'Lehsan', N'Dry bulb line traded year round from stored stock, graded on bulb size.', N'سڄو سال ملندو، ڳنڍ جي ماپ موجب.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opened_garlic_bulb_with_garlic_clove.jpg/960px-Opened_garlic_bulb_with_garlic_clove.jpg', NULL, 400, 'small', 1, 5
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'ginger')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'ginger', N'Ginger', N'ادرڪ', N'Adrak', N'Rhizome line sold by weight all year, mostly from stored and imported stock.', N'سڄو سال وزن تي وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg/960px-Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg', NULL, 420, 'small', 1, 6
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'lemon')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'lemon', N'Lemon', N'ليمو', N'Limo', N'Small citrus traded with the vegetable lines, sold by weight year round.', N'ننڍو ميوو، ڀاڄين سان گڏ وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/P1030323.JPG/960px-P1030323.JPG', NULL, 180, 'small', 1, 7
    FROM dbo.Categories c WHERE c.Slug = 'everyday-staples';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'cucumber')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'cucumber', N'Cucumber', N'ڪڪڙي', N'Kheera', N'Summer salad line sold by weight, strongest through the hot months.', N'اونهاري جي ڀاڄي، وزن تي وڪامندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ARS_cucumber.jpg/960px-ARS_cucumber.jpg', N'3,4,5,6,7,8,9', 70, 'kg', 1, 8
    FROM dbo.Categories c WHERE c.Slug = 'gourds-cucurbits';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'bitter-gourd')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'bitter-gourd', N'Bitter Gourd', N'ڪريلو', N'Karela', N'Ridged summer gourd graded on size and colour, sold by weight.', N'اونهاري جي ڀاڄي، ماپ موجب درجي بندي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Bitter_gourd_at_Hyderabad_market.jpg/960px-Bitter_gourd_at_Hyderabad_market.jpg', N'4,5,6,7,8,9', 120, 'kg', 1, 9
    FROM dbo.Categories c WHERE c.Slug = 'gourds-cucurbits';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'ridge-gourd')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'ridge-gourd', N'Ridge Gourd', N'تورئي', N'Tori', N'Long ridged summer gourd, sold fresh and handled in open crates.', N'ڊگھي اونهاري جي ڀاڄي، کُليل پيتين ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Luffa_acutangula_Chinese_okra.jpg/960px-Luffa_acutangula_Chinese_okra.jpg', N'4,5,6,7,8,9', 90, 'kg', 1, 10
    FROM dbo.Categories c WHERE c.Slug = 'gourds-cucurbits';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'bottle-gourd')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'bottle-gourd', N'Bottle Gourd', N'ڪدو', N'Lauki', N'Large pale gourd sold by weight across most of the warm season.', N'وڏي ڀاڄي، گرم موسم ۾ وزن تي.', N'https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg', N'3,4,5,6,7,8,9,10', 70, 'kg', 1, 11
    FROM dbo.Categories c WHERE c.Slug = 'gourds-cucurbits';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'tinda')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'tinda', N'Tinda', N'ٽينڊو', N'Tinda', N'Small round summer gourd, sold by weight and graded small for the best price.', N'ننڍي گول ڀاڄي، ننڍي ماپ جي قيمت وڌيڪ.', N'https://upload.wikimedia.org/wikipedia/commons/8/80/Tinda.jpg', N'4,5,6,7,8', 110, 'kg', 1, 12
    FROM dbo.Categories c WHERE c.Slug = 'gourds-cucurbits';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'pumpkin')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'pumpkin', N'Pumpkin', N'حلوا ڪدو', N'Kaddu', N'Heavy keeping gourd sold whole and in cut pieces by weight.', N'ڳري ڀاڄي، سڄي ۽ ڪٽيل ٻئي طرح.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/FrenchMarketPumpkinsB.jpg/960px-FrenchMarketPumpkinsB.jpg', N'5,6,7,8,9,10', 60, 'kg', 1, 13
    FROM dbo.Categories c WHERE c.Slug = 'gourds-cucurbits';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'spinach')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'spinach', N'Spinach', N'پالڪ', N'Palak', N'Winter leafy line tied in bundles and moved the same day it arrives.', N'سياري جي ڀاڄي، ڳٺڙين ۾، جلدي وڪامندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Fresh_Spinach_leaves.jpg/960px-Fresh_Spinach_leaves.jpg', N'10,11,12,1,2,3', 50, 'kg', 1, 14
    FROM dbo.Categories c WHERE c.Slug = 'leafy-greens';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'cabbage')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'cabbage', N'Cabbage', N'بند گوبي', N'Band Gobi', N'Dense winter head sold by weight; keeps better than most greens.', N'سياري جي ڀاڄي، وزن تي، گھڻو وقت رهندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cabbage_and_cross_section_on_white.jpg/960px-Cabbage_and_cross_section_on_white.jpg', N'11,12,1,2,3', 60, 'kg', 1, 15
    FROM dbo.Categories c WHERE c.Slug = 'leafy-greens';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'cauliflower')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'cauliflower', N'Cauliflower', N'گل گوبي', N'Phool Gobi', N'Winter head graded on curd whiteness and tightness, sold by weight.', N'سياري جي ڀاڄي، اڇي رنگ تي درجي بندي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/960px-Chou-fleur_02.jpg', N'10,11,12,1,2,3', 90, 'kg', 1, 16
    FROM dbo.Categories c WHERE c.Slug = 'leafy-greens';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'okra')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'okra', N'Okra / Bhindi', N'ڀينڊي', N'Bhindi', N'Tender summer pod picked young; graded small and sold by weight.', N'اونهاري جي نرم ڦري، ننڍي چُني ويندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hong_Kong_Okra_Aug_25_2012.JPG/960px-Hong_Kong_Okra_Aug_25_2012.JPG', N'3,4,5,6,7,8,9', 140, 'kg', 1, 17
    FROM dbo.Categories c WHERE c.Slug = 'pods-beans';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'peas')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'peas', N'Peas', N'مٽر', N'Matar', N'Winter pod line sold in sacks, priced on pod fill and freshness.', N'سياري جي ڦري، ڳوڻين ۾ وڪامندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Doperwt_rijserwt_peulen_Pisum_sativum.jpg/960px-Doperwt_rijserwt_peulen_Pisum_sativum.jpg', N'11,12,1,2', 180, 'kg', 1, 18
    FROM dbo.Categories c WHERE c.Slug = 'pods-beans';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'beans')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'beans', N'Beans', N'ڦري', N'Phali', N'Green pod line of the cooler months, sold by weight and graded on snap.', N'ٿڌي موسم جي سائي ڦري، وزن تي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Heaps_of_beans.jpg/960px-Heaps_of_beans.jpg', N'10,11,12,1,2,3', 160, 'kg', 1, 19
    FROM dbo.Categories c WHERE c.Slug = 'pods-beans';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'carrot')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'carrot', N'Carrots', N'گاجر', N'Gajar', N'Winter root washed and bunched or bagged, sold by weight.', N'سياري جي پاڙ، ڌوپي ڳوڻين ۾ ايندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/960px-Vegetable-Carrot-Bundle-wStalks.jpg', N'11,12,1,2,3', 80, 'kg', 1, 20
    FROM dbo.Categories c WHERE c.Slug = 'roots-others';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'eggplant')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'eggplant', N'Eggplant / Baingan', N'واڱڻ', N'Baingan', N'Traded year round in round and long shapes, graded on skin gloss.', N'سڄو سال ملندي، گول ۽ ڊگھي ٻنهي شڪلين ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/960px-Solanum_melongena_24_08_2012_%281%29.JPG', NULL, 70, 'kg', 1, 21
    FROM dbo.Categories c WHERE c.Slug = 'roots-others';
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'other-seasonal-vegetables')
    INSERT INTO dbo.Products (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    SELECT c.Id, 'vegetable', 'other-seasonal-vegetables', N'Other Seasonal Vegetables', N'ٻيون موسمي ڀاڄيون', NULL, N'Coriander, mint, turnip, radish and whatever else the season brings. Message us for what is on the floor today.', N'ڌاڻا، پودينو، گوگڙو ۽ ٻيون موسمي ڀاڄيون. اسان کان پڇو.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Marketvegetables.jpg/960px-Marketvegetables.jpg', NULL, NULL, 'none', 1, 99
    FROM dbo.Categories c WHERE c.Slug = 'roots-others';
GO

PRINT 'Seed complete.';
SELECT 'categories' AS [table], COUNT(*) AS rows FROM dbo.Categories
UNION ALL SELECT 'products', COUNT(*) FROM dbo.Products;
GO