import os
import json
import sqlite3
import urllib.request
import urllib.parse
import time
import cv2
import numpy as np

PUBLIC_DIR = 'client/public/images/menu'
DIST_DIR = 'client/dist/images/menu'
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DIST_DIR, exist_ok=True)

# Curated queries for dishes & drinks
# Maps item name (exact or substring) to [slug, is_drink, [query_fallbacks]]
MAPPING = {
    # Special AI generated preserved images
    'Bakwan Jagung': ('bakwan_jagung.jpg', False, []),
    'Butterscotch Latte': ('gen_butterscotch_latte.jpg', True, []),
    'Nasi Cumi Saus Padang': ('gen_nasi_cumi_saus_padang.jpg', False, []),
    
    # Signature Coffee
    'Mont Blanc': ('hd_mont_blanc.jpg', True, ['iced coffee whipped cream glass', 'mont blanc dessert coffee', 'iced latte cream']),
    'Dirty Latte': ('hd_dirty_latte.jpg', True, ['dirty coffee espresso milk glass', 'dirty latte layers', 'iced latte glass']),
    'Amber Dripp': ('hd_amber_dripp.jpg', True, ['cold drip coffee glass carafe', 'drip coffee glass ice', 'pourover coffee carafe']),
    'Midnight Citrus': ('hd_midnight_citrus.jpg', True, ['espresso tonic orange slice glass', 'coffee tonic slice', 'espresso citrus']),
    'Tropic Noir': ('hd_tropic_noir.jpg', True, ['coconut iced coffee glass', 'espresso coconut drink', 'iced black coffee']),
    'Kyoto Cooler': ('hd_kyoto_cooler.jpg', True, ['cold brew tonic lime glass', 'cold brew mocktail ice', 'cold brew glass']),
    'Honeyburn': ('hd_honeyburn.jpg', True, ['honey iced latte coffee glass', 'caramel macchiato iced glass', 'iced latte']),
    'Sweet Shock': ('hd_sweet_shock.jpg', True, ['iced mocha chocolate coffee glass', 'layered iced coffee drink', 'iced latte']),
    'Bright Black': ('hd_bright_black.jpg', True, ['sparkling long black coffee tonic', 'iced americano soda glass', 'iced americano']),
    'Island Kick': ('hd_island_kick.jpg', True, ['iced coffee milk glass cafe', 'iced latte wooden table', 'iced coffee']),
    'Berry Cold Brew': ('hd_berry_cold_brew.jpg', True, ['berry cold brew iced glass', 'berry iced tea coffee', 'iced red tea']),
    'Salt Caramond': ('hd_salt_caramond.jpg', True, ['salted caramel iced latte glass', 'iced caramel latte glass', 'iced latte']),
    'Pink Berries': ('hd_pink_berries.jpg', True, ['strawberry mocktail pink drink glass', 'pink latte drink cafe', 'strawberry drink']),
    'Fantasy Island': ('hd_fantasy_island.jpg', True, ['blue ocean mocktail curacao glass', 'blue lagoon mocktail glass', 'blue mocktail']),
    'Lemonade On The Rock': ('hd_lemonade_on_rock.jpg', True, ['sparkling lemonade glass mint ice', 'iced lemonade rock lemon slice', 'lemonade glass']),
    'Tropical Summer': ('hd_tropical_summer.jpg', True, ['passion fruit mocktail iced glass', 'tropical fruit drink cafe glass', 'tropical mocktail']),

    # Classic Coffee
    'Espresso': ('hd_espresso.jpg', True, ['espresso shot crema cup ceramic', 'caffe espresso cup', 'single espresso']),
    'Double Espresso': ('hd_double_espresso.jpg', True, ['double espresso doppio crema porcelain', 'doppio espresso cup', 'espresso cup']),
    'Flatwhite': ('hd_flatwhite.jpg', True, ['flat white latte art ceramic cup', 'flat white coffee cup', 'latte art ceramic']),
    'Macchiato': ('hd_macchiato.jpg', True, ['espresso macchiato foam glass cup', 'caffe macchiato porcelain', 'macchiato cup']),
    'Piccolo': ('hd_piccolo.jpg', True, ['piccolo latte glass cup cafe', 'piccolo coffee cup', 'cortado glass']),
    'Split (Espresso + Cappuccino)': ('hd_split_barista.jpg', True, ['espresso cappuccino barista split', 'coffee cups ceramic duo', 'latte art espresso']),
    'Cappuccino (Regular)': ('hd_cappuccino_reg.jpg', True, ['cappuccino cup latte art cocoa', 'cappuccino porcelain cup', 'cappuccino foam']),
    'Cappuccino (Large)': ('hd_cappuccino_large.jpg', True, ['cappuccino large mug latte art', 'cappuccino cup saucer', 'cappuccino']),
    'Americano (Regular)': ('hd_americano_hot.jpg', True, ['hot americano cup black coffee', 'caffe americano cup', 'black coffee ceramic']),
    'Americano (Large)': ('hd_americano_iced.jpg', True, ['iced americano glass black coffee ice', 'iced long black glass', 'iced black coffee']),
    'Latte (Regular)': ('hd_latte_hot.jpg', True, ['cafe latte art tulip ceramic cup', 'caffe latte ceramic cup', 'latte art cup']),
    'Latte (Large)': ('hd_latte_iced.jpg', True, ['iced caffe latte glass layers', 'iced latte glass ice cubes', 'iced latte']),
    'V60': ('hd_v60.jpg', True, ['v60 pourover coffee dripper carafe', 'v60 drip coffee server', 'pourover coffee']),
    'Vietnam Dripp': ('hd_vietnam_drip.jpg', True, ['vietnamese drip coffee phin condensed milk', 'ca phe sua da glass', 'vietnam drip coffee']),
    'Kalita Wave': ('hd_kalita_wave.jpg', True, ['kalita wave pourover coffee dripper', 'kalita drip carafe', 'pourover coffee']),
    'V60 Japanese Iced': ('hd_v60_japanese.jpg', True, ['japanese iced drip coffee ice cubes', 'iced pourover coffee carafe', 'iced drip coffee']),
    'La Java Kopi': ('hd_kopi_tubruk.jpg', True, ['kopi tubruk hitam cangkir indonesia', 'kopi hitam tradisional cangkir', 'kopi tubruk']),
    'La Java Kopi Susu': ('hd_kopi_susu_aren.jpg', True, ['es kopi susu gula aren gelas', 'es kopi susu kekinian', 'es kopi susu']),
    'Palm Sugar Latte': ('hd_palm_sugar_latte.jpg', True, ['palm sugar iced latte brown sugar glass', 'gula aren latte glass', 'brown sugar latte']),
    'Coconut Coffee': ('hd_coconut_coffee.jpg', True, ['coconut coffee iced vietnam glass', 'coconut latte glass ice', 'coconut milk coffee']),
    'Java Creamy Latte': ('hd_creamy_latte.jpg', True, ['creamy iced latte glass cafe', 'iced vanilla latte glass', 'iced latte']),
    'Kopi Rum': ('hd_kopi_rum.jpg', True, ['iced coffee glass cafe wooden table', 'cold brew iced glass cocktail', 'iced latte']),
    'Cold Brew Black': ('hd_cold_brew_black.jpg', True, ['cold brew coffee glass bottle dark', 'nitro cold brew glass', 'cold brew bottle']),
    'Cold Brew Milk': ('hd_cold_brew_milk.jpg', True, ['cold brew latte milk glass ice', 'iced white cold brew glass', 'cold brew milk']),
    'Kopi Rum Oreo / Regal': ('hd_kopi_regal.jpg', True, ['regal biscuit iced latte coffee glass', 'biscuit coffee shake cafe', 'iced latte']),
    'Mocha Latte': ('hd_mocha_latte.jpg', True, ['caffe mocha glass chocolate drizzle', 'iced cafe mocha whipped cream', 'mocha latte']),
    'Seasalt / Hazelnut Latte': ('hd_seasalt_hazelnut.jpg', True, ['hazelnut iced latte glass cafe', 'sea salt caramel latte glass', 'iced latte']),

    # Milk Based & Blended
    'Thai Tea': ('hd_thai_tea.jpg', True, ['thai tea iced glass milk orange', 'cha yen thai tea glass', 'thai tea']),
    'Rum Oreo': ('hd_rum_oreo.jpg', True, ['cookies and cream oreo milkshake glass', 'oreo milkshake whipped cream', 'oreo shake']),
    'Rum Regal': ('hd_rum_regal.jpg', True, ['regal biscuit milkshake glass cafe', 'vanilla biscuit shake glass', 'biscuit milkshake']),
    'Greentea Matcha': ('hd_greentea_matcha.jpg', True, ['iced matcha latte glass layers green', 'matcha latte iced glass', 'matcha latte']),
    'Taro Milk': ('hd_taro_milk.jpg', True, ['iced taro milk purple glass cafe', 'taro bubble tea drink purple', 'taro milk']),
    'Red Velvet': ('hd_red_velvet.jpg', True, ['red velvet iced latte cafe glass red', 'red velvet drink glass', 'red velvet latte']),
    'Chocolate Milk': ('hd_chocolate_milk.jpg', True, ['iced chocolate milk glass rich cold', 'chocolate milkshake glass', 'iced chocolate']),
    'Seasalt Choco': ('hd_seasalt_choco.jpg', True, ['iced chocolate cream sea salt glass', 'sea salt dark chocolate drink', 'iced chocolate']),
    'Hazelnut Choco': ('hd_hazelnut_choco.jpg', True, ['hazelnut chocolate drink iced glass', 'iced mocha hazelnut glass', 'iced chocolate']),
    'Mango Cheesecake Blend': ('hd_mango_cheesecake.jpg', True, ['mango smoothie frappe whipped cream glass', 'mango cheesecake drink frappe', 'mango smoothie']),
    'Chocolate Blend': ('hd_chocolate_blend.jpg', True, ['chocolate frappe whipped cream glass cafe', 'iced chocolate blended frappe', 'chocolate frappe']),
    'Cookies and Cream Blend': ('hd_cookies_blend.jpg', True, ['cookies and cream frappe whipped cream oreo', 'oreo frappe glass cafe', 'oreo frappe']),
    'Strawberry Cheesecake Blend': ('hd_strawberry_cheesecake.jpg', True, ['strawberry smoothie frappe whipped cream', 'strawberry shake glass cafe', 'strawberry smoothie']),
    'Greentea Blend': ('hd_greentea_blend.jpg', True, ['matcha green tea frappe whipped cream glass', 'green tea blended frappe', 'matcha frappe']),
    'Blonde Regal Blend': ('hd_blonde_regal.jpg', True, ['vanilla blended frappe biscuit whipped cream', 'caramel frappe whipped cream glass', 'vanilla frappe']),

    # Tea, Refresher & Juice
    'Sunset Bliss': ('hd_sunset_bliss.jpg', True, ['sunset mocktail grenadine orange layers', 'tequila sunrise mocktail glass', 'sunset mocktail']),
    'Lemonade': ('hd_lemonade.jpg', True, ['sparkling fresh lemonade glass mint lemon', 'homemade lemonade ice glass', 'lemonade glass']),
    'Lemon Squash': ('hd_lemon_squash.jpg', True, ['lemon squash soda drink glass ice', 'lemon squash es cafe', 'lemon squash']),
    'Strawberry Mint Mojito': ('hd_strawberry_mojito.jpg', True, ['strawberry virgin mojito mint glass red', 'strawberry mojito mocktail ice', 'strawberry mojito']),
    'Green Lantern': ('hd_green_lantern.jpg', True, ['kiwi lime mocktail green drink mint', 'green mocktail mint glass', 'green mocktail']),
    'Leci Mint Mojito': ('hd_leci_mojito.jpg', True, ['lychee mojito virgin mint glass lychee', 'lychee mocktail ice mint', 'lychee mojito']),
    'Summer Breeze': ('hd_summer_breeze.jpg', True, ['blue lagoon mocktail blue curacao glass', 'blue summer mocktail ice', 'blue mocktail']),
    'Lychee Tea': ('hd_lychee_tea.jpg', True, ['es teh leci lychee tea glass whole', 'iced lychee tea glass cafe', 'lychee tea']),
    'Peach Strawberry Tea': ('hd_peach_strawberry_tea.jpg', True, ['peach strawberry iced tea glass fruit', 'peach iced tea glass', 'peach tea']),
    'Magical Lemonade Tea': ('hd_magical_lemonade.jpg', True, ['butterfly pea flower lemonade blue purple', 'bunga telang lemonade glass', 'butterfly pea lemonade']),
    'Lemon Tea': ('hd_lemon_tea.jpg', True, ['es lemon tea iced glass lemon slice', 'iced lemon tea glass', 'lemon tea']),
    'Lemongrass Tea': ('hd_lemongrass_tea.jpg', True, ['teh serai lemongrass tea cup hot', 'lemongrass ginger tea cup', 'lemongrass tea']),
    'Passion Fruit Tea': ('hd_passion_fruit_tea.jpg', True, ['passion fruit iced tea glass seeds', 'passionfruit tea glass', 'passion fruit tea']),
    'Lychee Strawberry Tea': ('hd_lychee_strawberry_tea.jpg', True, ['strawberry lychee fruit tea iced glass', 'fruit tea iced glass', 'fruit tea']),
    'Peach Tea': ('hd_peach_tea.jpg', True, ['iced peach tea glass slice mint', 'peach tea fresh glass', 'peach tea']),
    'Mango Tea': ('hd_mango_tea.jpg', True, ['mango iced tea glass mint fruit', 'mango fruit tea glass', 'mango tea']),
    'Original Tea (Es / Hangat)': ('hd_original_tea.jpg', True, ['es teh manis gelas indonesia warung', 'es teh nusantara gelas', 'es teh manis']),
    'Butterfly Pea Tea (Teapot Refill)': ('hd_butterfly_pea_pot.jpg', True, ['butterfly pea blue tea glass teapot', 'bunga telang tea teapot glass', 'blue tea teapot']),
    'Chamomile Tea (Teapot Refill)': ('hd_chamomile_pot.jpg', True, ['chamomile tea teapot glass cup flowers', 'chamomile flowers tea pot', 'chamomile tea']),
    'Ginger Tea (Teapot Refill)': ('hd_ginger_pot.jpg', True, ['wedang jahe ginger tea cup hot', 'teh jahe hangat cangkir', 'wedang jahe']),
    'Peppermint Tea (Teapot Refill)': ('hd_peppermint_pot.jpg', True, ['peppermint fresh mint tea teapot glass', 'mint tea glass teapot', 'mint tea']),
    'Oolong Tea (Teapot Refill)': ('hd_oolong_pot.jpg', True, ['oolong tea traditional teapot cup ceramic', 'chinese oolong tea pot', 'oolong tea']),
    'Jasmine Greentea (Teapot Refill)': ('hd_jasmine_green_pot.jpg', True, ['jasmine green tea glass teapot clear', 'jasmine tea cup teapot', 'jasmine tea']),
    'Mango Juice': ('hd_mango_juice.jpg', True, ['jus mangga segar gelas kental', 'fresh mango juice glass thick', 'jus mangga']),
    'Pineapple Juice': ('hd_pineapple_juice.jpg', True, ['jus nanas fresh pineapple juice glass', 'pineapple juice glass ice', 'jus nanas']),
    'Dragonfruit Juice': ('hd_dragonfruit_juice.jpg', True, ['jus buah naga merah gelas kental', 'red dragon fruit juice glass', 'jus buah naga']),
    'Watermelon Juice': ('hd_watermelon_juice.jpg', True, ['jus semangka watermelon juice glass red', 'fresh watermelon juice glass', 'jus semangka']),
    'Mineral Water 600ml': ('hd_mineral_water.jpg', True, ['bottle mineral water glass table cafe', 'mineral water bottle clean', 'mineral water']),
    'Lime Water': ('hd_lime_water.jpg', True, ['infused lime water glass mint ice', 'lime water ice glass', 'lime water']),
    'Lemon Water': ('hd_lemon_water.jpg', True, ['infused lemon water glass cucumber mint', 'lemon water glass ice', 'lemon water']),
    'Air Hangat': ('hd_air_hangat.jpg', True, ['glass cup hot water steam clean', 'hot water cup glass', 'hot water']),
    'Air Es': ('hd_air_es.jpg', True, ['glass of ice water condensation ice', 'ice water glass clean', 'ice water']),

    # Rice Selection & Nasi Goreng
    'Nasi Brokoli Ca Sapi': ('hd_nasi_brokoli_sapi.jpg', False, ['beef and broccoli stir fry plate rice', 'beef broccoli stir fry', 'beef broccoli']),
    'Nasi Brokoli Ca Ayam': ('hd_nasi_brokoli_ayam.jpg', False, ['chicken broccoli stir fry rice plate', 'chicken and broccoli stir fry', 'chicken broccoli']),
    'Nasi Cumi Saus Mentega': ('hd_nasi_cumi_mentega.jpg', False, ['cumi saus mentega butter squid plate', 'squid butter sauce plate', 'cumi mentega']),
    'Nasi Brokoli Ca Bawang Putih': ('hd_nasi_brokoli_garlic.jpg', False, ['garlic broccoli stir fry plate green', 'tumis brokoli bawang putih piring', 'garlic broccoli']),
    'Nasi Ayam Kecap': ('hd_nasi_ayam_kecap.jpg', False, ['ayam kecap pedas manis piring nasi', 'indonesian ayam kecap piring', 'ayam kecap']),
    'Nasi Ayam Lada Hitam': ('hd_nasi_ayam_lada_hitam.jpg', False, ['ayam lada hitam black pepper chicken rice', 'black pepper chicken plate', 'ayam lada hitam']),
    'Nasi Sapi Lada Hitam': ('hd_nasi_sapi_lada_hitam.jpg', False, ['sapi lada hitam black pepper beef rice', 'black pepper beef plate', 'sapi lada hitam']),
    'Nasi Ayam Mentega': ('hd_nasi_ayam_mentega.jpg', False, ['ayam goreng mentega butter chicken indonesian', 'ayam saus mentega piring', 'ayam mentega']),
    'Nasi Ayam Geprek': ('hd_nasi_ayam_geprek.jpg', False, ['ayam geprek sambal bawang pedas cobek', 'ayam geprek indonesia nasi', 'ayam geprek']),
    'Nasi Ayam Teriyaki': ('hd_nasi_ayam_teriyaki.jpg', False, ['chicken teriyaki rice bowl sesame seeds', 'chicken teriyaki donburi plate', 'chicken teriyaki']),
    'Nasi Ayam Sechuan': ('hd_nasi_ayam_sechuan.jpg', False, ['szechuan chicken spicy dried peppers plate', 'kung pao chicken plate', 'szechuan chicken']),
    'Nasi Sapi Kecap': ('hd_nasi_sapi_kecap.jpg', False, ['semur daging sapi kecap piring', 'daging sapi kecap empuk', 'semur daging']),
    'Nasi Sapi Sechuan': ('hd_nasi_sapi_sechuan.jpg', False, ['szechuan spicy beef stir fry plate', 'sichuan beef stir fry plate', 'szechuan beef']),
    'Nasi Ayam Asam Manis': ('hd_nasi_ayam_asam_manis.jpg', False, ['ayam koloke asam manis sweet sour chicken', 'sweet and sour chicken plate', 'koloke ayam']),
    'Nasi Ayam Saus Tiram': ('hd_nasi_ayam_saus_tiram.jpg', False, ['ayam saus tiram oyster sauce chicken rice', 'chicken oyster sauce plate', 'ayam saus tiram']),
    'Nasi Ayam Rica-Rica': ('hd_nasi_ayam_rica.jpg', False, ['ayam rica rica manado pedas merah', 'ayam rica rica piring', 'ayam rica rica']),
    'Nasi Udang Saus Mentega': ('hd_nasi_udang_mentega.jpg', False, ['udang saus mentega butter garlic prawns plate', 'butter prawns plate', 'udang saus mentega']),
    'Nasi Udang Saus Padang': ('hd_nasi_udang_padang.jpg', False, ['udang saus padang spicy chili sauce prawns', 'udang saus padang piring', 'udang saus padang']),
    'Nasi Sapi Rica-Rica': ('hd_nasi_sapi_rica.jpg', False, ['daging sapi rica rica pedas merah', 'beef rica rica plate', 'daging rica rica']),
    'Nasi Sapi Saus Tiram': ('hd_nasi_sapi_saus_tiram.jpg', False, ['sapi saus tiram beef oyster sauce plate', 'beef in oyster sauce plate', 'sapi saus tiram']),
    'Nasi Cumi Saus Tiram': ('hd_nasi_cumi_saus_tiram.jpg', False, ['cumi saus tiram squid oyster sauce plate', 'squid in oyster sauce plate', 'cumi saus tiram']),
    'Nasi Cumi Asam Manis': ('hd_nasi_cumi_asam_manis.jpg', False, ['cumi asam manis sweet sour squid plate', 'sweet and sour squid calamari plate', 'cumi asam manis']),
    'Nasi Cumi Rica-Rica': ('hd_nasi_cumi_rica.jpg', False, ['cumi rica rica pedas manado piring', 'squid rica rica plate', 'cumi rica rica']),
    'Nasi Goreng Mawut': ('hd_nasgor_mawut.jpg', False, ['nasi goreng magelangan mawut mi', 'nasi goreng magelangan piring', 'nasi goreng']),
    'Nasi Goreng Hongkong': ('hd_nasgor_hongkong.jpg', False, ['nasi goreng hongkong yang chow fried rice', 'yangzhou fried rice plate', 'nasi goreng hongkong']),
    'Nasi Goreng Mentega': ('hd_nasgor_mentega.jpg', False, ['nasi goreng mentega butter fried rice', 'butter fried rice plate', 'nasi goreng']),
    'Nasi Goreng Spesial': ('hd_nasgor_spesial.jpg', False, ['nasi goreng spesial telur mata sapi kerupuk', 'indonesian nasi goreng sate telur', 'nasi goreng kampung']),
    'Nasi Goreng Seafood': ('hd_nasgor_seafood.jpg', False, ['nasi goreng seafood udang cumi piring', 'seafood fried rice plate', 'nasi goreng seafood']),

    # Chinese Food & Indomie
    'Bihun Goreng Ayam': ('hd_bihun_goreng_ayam.jpg', False, ['bihun goreng ayam sayur telur', 'bihun goreng piring', 'bihun goreng']),
    'Bihun Goreng Seafood': ('hd_bihun_goreng_seafood.jpg', False, ['bihun goreng seafood udang cumi', 'seafood bihun goreng plate', 'bihun goreng']),
    'Mie Goreng Ayam': ('hd_mie_goreng_ayam.jpg', False, ['mi goreng ayam bakmi goreng telur', 'mie goreng indonesia piring', 'mie goreng']),
    'Mie Goreng Seafood': ('hd_mie_goreng_seafood.jpg', False, ['mie goreng seafood udang cumi telur', 'seafood fried noodles plate', 'mie goreng']),
    'Kwetiaw Goreng Ayam': ('hd_kwetiaw_goreng_ayam.jpg', False, ['kwetiau goreng ayam telur toge', 'char kway teow chicken plate', 'kwetiau goreng']),
    'Kwetiaw Goreng Seafood': ('hd_kwetiaw_goreng_seafood.jpg', False, ['kwetiau goreng seafood udang cumi', 'char kway teow seafood plate', 'kwetiau goreng']),
    'Kwetiaw Siram Ayam': ('hd_kwetiaw_siram_ayam.jpg', False, ['kwetiau siram ayam kuah kental telur', 'wat tan hor chicken plate', 'kwetiau siram']),
    'Kwetiaw Siram Seafood': ('hd_kwetiaw_siram_seafood.jpg', False, ['kwetiau siram seafood kuah telur udang', 'wat tan hor seafood plate', 'kwetiau siram']),
    'Mie / Bihun Godog': ('hd_mie_godog.jpg', False, ['bakmi godog jawa kuah telur sayur', 'mie godog kuah jawa', 'bakmi godog']),
    'Nasi Mapo Tahu': ('hd_mapo_tahu.jpg', False, ['mapo doufu mapo tofu silken spicy szechuan', 'mapo tofu rice plate', 'mapo tofu']),
    'Nasi Capcay Ayam': ('hd_capcay_ayam.jpg', False, ['cap cai sayur ayam nasi piring', 'capcay kuah sayur ayam', 'cap cai']),
    'Nasi Capcay Seafood': ('hd_capcay_seafood.jpg', False, ['capcay seafood udang cumi sayur', 'cap cai seafood piring', 'cap cai']),
    'Nasi Mun Tahu': ('hd_mun_tahu.jpg', False, ['mun tahu braised tofu minced chicken', 'mun tahu chinese indonesian', 'mun tahu']),
    'Indomie Kuah (Level 1/2/3)': ('hd_indomie_kuah.jpg', False, ['indomie kuah telur rebus cabai rawit mangkok', 'indomie kuah rebus telur', 'indomie kuah']),
    'Indomie Goreng (Level 1/2/3)': ('hd_indomie_goreng.jpg', False, ['indomie goreng telur mata sapi bawang goreng', 'mie instan goreng telur', 'indomie goreng']),
    'Indomie Kuah Susu (Level 1/2/3)': ('hd_indomie_susu.jpg', False, ['indomie kuah susu creamy noodle bowl', 'ramen kuah susu telur', 'indomie kuah']),
    'Indomie Kuah Susu Keju (Level 1/2/3)': ('hd_indomie_keju.jpg', False, ['indomie keju kuah susu cheddar melted', 'cheesy ramen noodles bowl', 'indomie keju']),
    'Indomie Jumbo Goreng/Kuah (Level 1/2/3)': ('hd_indomie_jumbo.jpg', False, ['indomie goreng jumbo double egg piring', 'indomie porsi jumbo', 'indomie goreng']),
    'Extra Telur (Topping)': ('hd_extra_telur.jpg', False, ['telur mata sapi sunny side up fried egg', 'fried egg sunny side plate', 'telur mata sapi']),

    # Family Style (Sharing)
    'Brokoli Bawang Putih (Sharing)': ('hd_fam_brokoli_garlic.jpg', False, ['tumis brokoli bawang putih piring besar', 'sauteed garlic broccoli platter', 'tumis brokoli']),
    'Brokoli Sapi (Sharing)': ('hd_fam_brokoli_sapi.jpg', False, ['tumis brokoli daging sapi saus tiram piring', 'beef broccoli stir fry platter', 'brokoli sapi']),
    'Capcay Seafood (Sharing)': ('hd_fam_capcay_seafood.jpg', False, ['cap cai seafood piring besar udang', 'capcay kuah kental seafood platter', 'cap cai']),
    'Capcay Ayam (Sharing)': ('hd_fam_capcay_ayam.jpg', False, ['cap cai ayam bakso sayur piring besar', 'capcay ayam piring sharing', 'cap cai']),
    'Mie Goreng Seafood (Sharing)': ('hd_fam_mie_seafood.jpg', False, ['mie goreng seafood piring besar sharing', 'bakmi goreng seafood piring besar', 'mie goreng']),
    'Mie Goreng Ayam (Sharing)': ('hd_fam_mie_ayam.jpg', False, ['mie goreng ayam piring besar sharing', 'bakmi goreng ayam telur piring', 'mie goreng']),
    'Brokoli Ayam (Sharing)': ('hd_fam_brokoli_ayam.jpg', False, ['tumis brokoli ayam jamur piring besar', 'chicken and broccoli platter sharing', 'brokoli ayam']),
    'Ayam Mentega (Sharing)': ('hd_fam_ayam_mentega.jpg', False, ['ayam saus mentega bawang bombay piring', 'chinese indonesian butter chicken platter', 'ayam mentega']),
    'Sapi Lada Hitam (Sharing)': ('hd_fam_sapi_lada_hitam.jpg', False, ['sapi lada hitam paprika bawang bombay piring', 'beef black pepper platter sizzling', 'sapi lada hitam']),
    'Ayam Lada Hitam (Sharing)': ('hd_fam_ayam_lada_hitam.jpg', False, ['ayam lada hitam paprika piring besar', 'black pepper chicken platter sharing', 'ayam lada hitam']),
    'Ayam Nanking (Sharing)': ('hd_fam_ayam_nanking.jpg', False, ['ayam nanking bistik ayam chinese piring', 'ayam nanking saus asam manis', 'ayam goreng']),
    'Bistik Sapi (Sharing)': ('hd_fam_bistik_sapi.jpg', False, ['bistik daging sapi selat solo jawa piring', 'bistik sapi jawa kentang kuah', 'bistik sapi']),
    'Udang/Cumi Goreng Tepung (Sharing)': ('hd_fam_udang_cumi_tepung.jpg', False, ['udang goreng tepung crispy calamari rings', 'fried calamari rings plate sharing', 'udang goreng tepung']),
    'Ayam Asam Manis / Rica / Tiram (Sharing)': ('hd_fam_ayam_asam_manis.jpg', False, ['ayam koloke asam manis nanas paprika piring', 'sweet and sour chicken platter sharing', 'koloke']),
    'Udang/Cumi Asam Manis / Rica / Tiram (Sharing)': ('hd_fam_udang_asam_manis.jpg', False, ['udang asam manis saus merah piring besar', 'sweet sour shrimp seafood platter', 'udang asam manis']),
    'Udang/Cumi Saus Padang / Mentega (Sharing)': ('hd_fam_seafood_padang.jpg', False, ['udang cumi saus padang seafood tumpah', 'seafood saus padang piring besar', 'saus padang']),
    'Sapi Rica-Rica / Saus Tiram (Sharing)': ('hd_fam_sapi_rica.jpg', False, ['daging sapi rica rica pedas piring besar', 'beef rica rica platter sharing', 'sapi rica rica']),
    'Sapo Tahu Ayam (Sharing)': ('hd_fam_sapo_ayam.jpg', False, ['sapo tahu jepang ayam claypot mangkok', 'sapo tahu ayam sayuran claypot', 'sapo tahu']),
    'Sapo Tahu Seafood (Sharing)': ('hd_fam_sapo_seafood.jpg', False, ['sapo tahu seafood claypot udang cumi', 'sapo tahu seafood claypot bowl', 'sapo tahu']),
    'Fu Yung Hai (Sharing)': ('hd_fam_fu_yung_hai.jpg', False, ['fuyunghai telur saus asam manis kacang polong', 'egg foo young sweet sour sauce plate', 'fuyunghai']),
    'Ayam Teriyaki (Sharing)': ('hd_fam_ayam_teriyaki.jpg', False, ['ayam teriyaki saus wijen piring sharing', 'chicken teriyaki platter sharing', 'ayam teriyaki']),
    'Tauge Ca Ikan Asin (Sharing)': ('hd_fam_tauge_ikan_asin.jpg', False, ['tumis tauge ikan asin jambal roti piring', 'stir fried bean sprouts salted fish plate', 'tumis tauge']),
    'Soup Jagung (Sharing)': ('hd_fam_soup_jagung.jpg', False, ['sup jagung manis telur kepiting mangkok besar', 'sweet corn egg drop soup bowl', 'sup jagung']),
    'Mun Tahu (Sharing)': ('hd_fam_mun_tahu.jpg', False, ['mun tahu ayam jamur kuah kental mangkok', 'braised silken tofu mun tahu sharing', 'mun tahu']),

    # Snacks, Salad & Bubur
    'Egg Garden Salad': ('hd_egg_garden_salad.jpg', False, ['egg garden salad bowl fresh dressing', 'garden salad boiled egg plate', 'garden salad']),
    'Chicken Garden Salad': ('hd_chicken_garden_salad.jpg', False, ['grilled chicken garden salad bowl fresh', 'chicken salad bowl dressing', 'chicken salad']),
    'Bubur Ubi La Java (Reguler)': ('hd_bubur_ubi_reg.jpg', False, ['bubur candil ubi santan mangkok manis', 'bubur ubi jalar santan mangkok', 'bubur candil']),
    'Bubur Ubi La Java (Large)': ('hd_bubur_ubi_large.jpg', False, ['bubur sumsum candil ubi mangkok besar', 'bubur biji salak ubi kelapa', 'bubur sumsum']),
    'Tahu Isi': ('hd_tahu_isi.jpg', False, ['tahu isi goreng cabai rawit hijau piring', 'tahu susur isi sayur goreng', 'tahu isi']),
    'Mendoan': ('hd_mendoan.jpg', False, ['tempe mendoan sambal kecap piring', 'tempe mendoan fried tempeh', 'tempe mendoan']),
    'Jamur Crispy': ('hd_jamur_crispy.jpg', False, ['jamur enoki crispy goreng tepung piring', 'crispy fried oyster mushrooms plate', 'jamur crispy']),
    'Chicken Popcorn': ('hd_chicken_popcorn.jpg', False, ['crispy chicken popcorn basket bowl sauce', 'popcorn chicken bites plate', 'chicken popcorn']),
    'Potato Chips': ('hd_potato_chips.jpg', False, ['crispy potato chips bowl gourmet wooden', 'artisanal potato chips bowl', 'potato chips']),
    'French Fries': ('hd_french_fries.jpg', False, ['french fries basket ketchup sauce plate', 'golden crispy french fries bowl', 'french fries']),
    'Onion Rings': ('hd_onion_rings.jpg', False, ['golden crispy onion rings stack dipping sauce', 'onion rings plate crispy', 'onion rings']),

    # Ice Cream & Beer
    'Ice Cream Mix (Vanilla & Chocolate)': ('hd_icecream_mix.jpg', False, ['vanilla and chocolate ice cream scoops bowl', 'ice cream scoops dual bowl', 'ice cream bowl']),
    'Classic Affogato': ('hd_affogato_classic.jpg', True, ['affogato espresso vanilla ice cream glass', 'caffe affogato glass dessert', 'affogato']),
    'Ice Cream Vanilla': ('hd_icecream_vanilla.jpg', False, ['vanilla ice cream scoop waffle bowl ceramic', 'creamy vanilla ice cream bowl', 'vanilla ice cream']),
    'Choco Coco Ice Cream': ('hd_icecream_chocococo.jpg', False, ['chocolate ice cream coconut flakes scoop bowl', 'chocolate gelato bowl dessert', 'chocolate ice cream']),
    'Ice Cream Chocolate': ('hd_icecream_chocolate.jpg', False, ['rich dark chocolate ice cream scoop bowl', 'chocolate ice cream scoop cup', 'chocolate ice cream']),
    'Mocha Affogato': ('hd_affogato_mocha.jpg', True, ['affogato chocolate sauce espresso ice cream', 'mocha affogato dessert glass', 'affogato']),
    'Bintang Radler': ('hd_beer_bintang_radler.jpg', True, ['bintang radler lemon beer bottle glass cold', 'bintang radler bottle', 'bir bintang']),
    'Bintang Small': ('hd_beer_bintang_small.jpg', True, ['bir bintang pilsener bottle glass cold foam', 'bintang beer bottle indonesia', 'bir bintang']),
    'Bintang Arak Madu': ('hd_beer_arak_madu.jpg', True, ['cocktail honey lemon beer glass ice', 'arak madu cocktail glass', 'beer cocktail']),
    'Heineken Small': ('hd_beer_heineken_small.jpg', True, ['heineken green bottle glass foam cold bar', 'heineken beer bottle glass', 'heineken bottle']),
    'Prost Small': ('hd_beer_prost_small.jpg', True, ['prost beer bottle glass cold lager', 'prost pilsener bottle cold', 'beer bottle']),
    'Guinness Small': ('hd_beer_guinness_small.jpg', True, ['guinness draught stout glass creamy head dark', 'guinness stout bottle pint', 'guinness beer']),
    'Bintang Large': ('hd_beer_bintang_large.jpg', True, ['bir bintang large bottle cold ice bucket', 'bintang beer indonesia bottle cold', 'bir bintang']),
    'Prost Large': ('hd_beer_prost_large.jpg', True, ['prost beer large bottle iced cold', 'cold beer bottle lager bar', 'beer bottle']),
    'Heineken Large': ('hd_beer_heineken_large.jpg', True, ['heineken large bottle cold glass foam', 'heineken cold bottle glass', 'heineken bottle']),
    'Guinness Large': ('hd_beer_guinness_large.jpg', True, ['guinness stout pint dark beer foam head', 'pint of guinness dark beer', 'guinness stout']),
}

USER_AGENT = 'LaJavaCafeMenuBot/1.0 (https://lajavacafe.com; culinary-curator@lajavacafe.com)'

def download_and_crop(img_url, out_path, is_drink=False):
    req = urllib.request.Request(img_url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=12) as resp:
        arr = np.asarray(bytearray(resp.read()), dtype=np.uint8)
    
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None or img.size == 0:
        return False
        
    h, w = img.shape[:2]
    target_ratio = 4.0 / 3.0
    current_ratio = w / h

    if current_ratio > target_ratio:
        # Image is wider than 4:3 -> crop width
        new_w = int(h * target_ratio)
        offset_x = (w - new_w) // 2
        cropped = img[:, offset_x:offset_x+new_w]
    else:
        # Image is taller than 4:3 -> crop height
        new_h = int(w / target_ratio)
        if is_drink:
            # Top-weighted crop for tall glasses & bottles (15% from top)
            offset_y = int((h - new_h) * 0.15)
            offset_y = max(0, min(offset_y, h - new_h))
        else:
            # Center crop for dishes / plates
            offset_y = (h - new_h) // 2
        cropped = img[offset_y:offset_y+new_h, :]

    # Lanczos4 high-fidelity resize to 800x600
    resized = cv2.resize(cropped, (800, 600), interpolation=cv2.INTER_LANCZOS4)

    # Subtle culinary enhancement: CLAHE in LAB space for warm bistro contrast
    lab = cv2.cvtColor(resized, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    enhanced = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)

    # Mild unsharp mask for crisp food details
    gaussian = cv2.GaussianBlur(enhanced, (0, 0), 1.5)
    sharpened = cv2.addWeighted(enhanced, 1.15, gaussian, -0.15, 0)

    # Save to public and dist
    cv2.imwrite(out_path, sharpened, [int(cv2.IMWRITE_JPEG_QUALITY), 93])
    dist_path = os.path.join(DIST_DIR, os.path.basename(out_path))
    cv2.imwrite(dist_path, sharpened, [int(cv2.IMWRITE_JPEG_QUALITY), 93])
    return True

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            d = json.loads(r.read().decode('utf-8'))
            pages = d.get('query', {}).get('pages', {})
            for p in pages.values():
                info = p.get('imageinfo', [{}])[0]
                mime = info.get('mime', '')
                thumb = info.get('thumburl') or info.get('url')
                if 'image' in mime and 'svg' not in mime and thumb:
                    return thumb
    except Exception as e:
        pass
    return None

def main():
    print("=== STARTING CULINARY WEB HD CURATION ===")
    with open('server/menu_items_dump.json', 'r', encoding='utf-16') as f:
        categories_data = json.load(f)

    # Load db connection
    conn = sqlite3.connect('server/database.sqlite')
    cursor = conn.cursor()

    total_updated = 0
    total_skipped = 0
    total_fallback = 0

    results_mapping = {}

    for cat_id, items in categories_data.items():
        print(f"\nProcessing category: {cat_id} ({len(items)} items)...")
        for item in items:
            name = item['name']
            item_id = item['id']
            curr_img = item['currentImg']

            # Find config in MAPPING
            cfg = MAPPING.get(name)
            if not cfg:
                # Check for prefix or substring
                for k, v in MAPPING.items():
                    if k.lower() in name.lower() or name.lower() in k.lower():
                        cfg = v
                        break

            if not cfg:
                # No mapping rule, keep existing authentic PDF image
                print(f"  [-] {name} -> Preserving existing: {curr_img}")
                results_mapping[item_id] = curr_img
                continue

            slug, is_drink, queries = cfg

            # Special cases: already generated
            if slug in ['bakwan_jagung.jpg', 'gen_butterscotch_latte.jpg', 'gen_nasi_cumi_saus_padang.jpg']:
                target_url = f"/images/menu/{slug}"
                cursor.execute("UPDATE menu_items SET image = ? WHERE id = ?", (target_url, item_id))
                results_mapping[item_id] = target_url
                print(f"  [AI] {name} -> Studio AI Photo: {target_url}")
                total_updated += 1
                continue

            out_path = os.path.join(PUBLIC_DIR, slug)
            target_url = f"/images/menu/{slug}"

            # Check if file already exists with good size
            if os.path.exists(out_path) and os.path.getsize(out_path) > 30000:
                # Already downloaded and validated
                cursor.execute("UPDATE menu_items SET image = ? WHERE id = ?", (target_url, item_id))
                results_mapping[item_id] = target_url
                print(f"  [EXISTS] {name} -> Cached: {target_url}")
                total_skipped += 1
                continue

            # Attempt to search & download
            success = False
            for q in queries:
                time.sleep(0.4)
                img_url = search_wikimedia(q)
                if img_url:
                    try:
                        ok = download_and_crop(img_url, out_path, is_drink)
                        if ok:
                            print(f"  [OK] {name} -> Downloaded & Enhanced: {slug} (query: '{q}')")
                            success = True
                            break
                    except Exception as ex:
                        print(f"    [FAIL] Download error on query '{q}': {ex}")

            if success:
                cursor.execute("UPDATE menu_items SET image = ? WHERE id = ?", (target_url, item_id))
                results_mapping[item_id] = target_url
                total_updated += 1
            else:
                # Fallback to existing authentic image
                print(f"  [FALLBACK] {name} -> Kept existing authentic image: {curr_img}")
                results_mapping[item_id] = curr_img
                total_fallback += 1

    conn.commit()
    conn.close()

    # Save mapping to file
    with open('server/curated_image_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(results_mapping, f, indent=2)

    # Sync server/lajava_menu_data.js
    try:
        import subprocess
        sync_js = """
        const fs = require('fs');
        const mapping = require('./curated_image_mapping.json');
        let code = fs.readFileSync('lajava_menu_data.js', 'utf8');
        for (const [id, img] of Object.entries(mapping)) {
            const re = new RegExp("id:\\\\s*['\\\"]" + id + "['\\\"][\\\\s\\\\S]*?image:\\\\s*['\\\"][^'\\\"]+['\\\"]");
            code = code.replace(re, match => match.replace(/image:\\s*['"][^'"]+['"]/, "image: '" + img + "'"));
        }
        fs.writeFileSync('lajava_menu_data.js', code, 'utf8');
        console.log('Synchronized server/lajava_menu_data.js successfully!');
        """
        subprocess.run(['node', '-e', sync_js], cwd='server', check=True)
    except Exception as e:
        print(f"Sync error: {e}")

    print("\n=== CULINARY CURATION SUMMARY ===")
    print(f"Total updated: {total_updated}")
    print(f"Total cached: {total_skipped}")
    print(f"Total fallbacks preserved: {total_fallback}")

if __name__ == '__main__':
    main()
