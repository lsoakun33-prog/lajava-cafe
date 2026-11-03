const fs = require('fs');
const path = require('path');
const db = require('./db');

const menuDir = path.join(__dirname, '..', 'client', 'public', 'images', 'menu');
if (!fs.existsSync(menuDir)) {
  fs.mkdirSync(menuDir, { recursive: true });
}

// Curated high-resolution gourmet web photography map (Unsplash CDN photo IDs)
const photoMap = {
  // ─── 1. Snacks, Salad & Bubur ──────────────────────────────────────────
  'item_snk_01': { file: 'web_egg_garden_salad.jpg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
  'item_snk_02': { file: 'web_chicken_garden_salad.jpg', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' },
  'item_snk_03': { file: 'web_bubur_ubi_reguler.jpg', url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b' },
  'item_snk_04': { file: 'web_bubur_ubi_large.jpg', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab' },
  'item_snk_05': { file: 'web_tahu_isi.jpg', url: 'https://images.unsplash.com/photo-1562967914-608f82629710' },
  'item_snk_06': { file: 'web_mendoan.jpg', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec' },
  'item_snk_07': { file: 'web_jamur_crispy.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  'item_snk_08': { file: 'web_chicken_popcorn.jpg', url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92' },
  'item_snk_09': { file: 'web_potato_chips.jpg', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b' },
  'item_snk_10': { file: 'web_french_fries.jpg', url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5' },
  'item_snk_11': { file: 'web_onion_rings.jpg', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
  'item_snk_12': { file: 'bakwan_jagung.jpg' }, // Local custom studio generated photo!

  // ─── 2. Rice Selection & Nasi Goreng ───────────────────────────────────
  'item_rc_01': { file: 'web_nasi_brokoli_ca_sapi.jpg', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
  'item_rc_02': { file: 'web_nasi_brokoli_ca_ayam.jpg', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d' },
  'item_rc_03': { file: 'web_nasi_cumi_saus_padang.jpg', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
  'item_rc_04': { file: 'web_nasi_cumi_saus_mentega.jpg', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb' },
  'item_rc_05': { file: 'web_nasi_brokoli_bawang_putih.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  'item_rc_06': { file: 'web_nasi_ayam_kecap.jpg', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b' },
  'item_rc_07': { file: 'web_nasi_ayam_lada_hitam.jpg', url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e' },
  'item_rc_08': { file: 'web_nasi_sapi_lada_hitam.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  'item_rc_09': { file: 'web_nasi_ayam_mentega.jpg', url: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659' },
  'item_rc_10': { file: 'web_nasi_ayam_geprek.jpg', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec' },
  'item_rc_11': { file: 'web_nasi_ayam_teriyaki.jpg', url: 'https://images.unsplash.com/photo-1555126634-323283e090fa' },
  'item_rc_12': { file: 'web_nasi_ayam_sechuan.jpg', url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec' },
  'item_rc_13': { file: 'web_nasi_sapi_kecap.jpg', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb' },
  'item_rc_14': { file: 'web_nasi_sapi_sechuan.jpg', url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6' },
  'item_rc_15': { file: 'web_nasi_ayam_asam_manis.jpg', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd' },
  'item_rc_16': { file: 'web_nasi_ayam_saus_tiram.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  'item_rc_17': { file: 'web_nasi_ayam_rica_rica.jpg', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec' },
  'item_rc_18': { file: 'web_nasi_udang_saus_mentega.jpg', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
  'item_rc_19': { file: 'web_nasi_udang_saus_padang.jpg', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
  'item_rc_20': { file: 'web_nasi_sapi_rica_rica.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  'item_rc_21': { file: 'web_nasi_sapi_saus_tiram.jpg', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb' },
  'item_rc_22': { file: 'web_nasi_cumi_saus_tiram.jpg', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
  'item_rc_23': { file: 'web_nasi_cumi_asam_manis.jpg', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd' },
  'item_rc_24': { file: 'web_nasi_cumi_rica_rica.jpg', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec' },
  'item_ng_01': { file: 'web_nasi_goreng_mawut.jpg', url: 'https://images.unsplash.com/photo-1542095496-1ee6599fe563' },
  'item_ng_02': { file: 'web_nasi_goreng_hongkong.jpg', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19' },
  'item_ng_03': { file: 'web_nasi_goreng_mentega.jpg', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b' },
  'item_ng_04': { file: 'web_nasi_goreng_spesial.jpg', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },
  'item_ng_05': { file: 'web_nasi_goreng_seafood.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },

  // ─── 3. Chinese Food & Indomie ─────────────────────────────────────────
  'item_chn_01': { file: 'web_bihun_goreng_ayam.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_chn_02': { file: 'web_bihun_goreng_seafood.jpg', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b' },
  'item_chn_03': { file: 'web_mie_goreng_ayam.jpg', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246' },
  'item_chn_04': { file: 'web_mie_goreng_seafood.jpg', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce' },
  'item_chn_05': { file: 'web_kwetiaw_goreng_ayam.jpg', url: 'https://images.unsplash.com/photo-1552611052-33e04de081de' },
  'item_chn_06': { file: 'web_kwetiaw_goreng_seafood.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_chn_07': { file: 'web_kwetiaw_siram_ayam.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_chn_08': { file: 'web_kwetiaw_siram_seafood.jpg', url: 'https://images.unsplash.com/photo-1552611052-33e04de081de' },
  'item_chn_09': { file: 'web_mie_bihun_godog.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_chn_10': { file: 'web_nasi_mapo_tahu.jpg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
  'item_chn_11': { file: 'web_nasi_capcay_ayam.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  'item_chn_12': { file: 'web_nasi_capcay_seafood.jpg', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
  'item_chn_13': { file: 'web_nasi_mun_tahu.jpg', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab' },
  'item_idm_01': { file: 'web_indomie_kuah.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_idm_02': { file: 'web_indomie_goreng.jpg', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246' },
  'item_idm_03': { file: 'web_indomie_kuah_susu.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_idm_04': { file: 'web_indomie_kuah_susu_keju.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
  'item_idm_05': { file: 'web_indomie_jumbo.jpg', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246' },
  'item_idm_06': { file: 'web_extra_telur.jpg', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8' },

  // ─── 4. Family Style Sharing ───────────────────────────────────────────
  'item_fam_01': { file: 'web_fam_brokoli_bawang_putih.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  'item_fam_02': { file: 'web_fam_brokoli_sapi.jpg', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
  'item_fam_03': { file: 'web_fam_capcay_seafood.jpg', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
  'item_fam_04': { file: 'web_fam_capcay_ayam.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  'item_fam_05': { file: 'web_fam_mie_goreng_seafood.jpg', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce' },
  'item_fam_06': { file: 'web_fam_mie_goreng_ayam.jpg', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246' },
  'item_fam_07': { file: 'web_fam_brokoli_ayam.jpg', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d' },
  'item_fam_08': { file: 'web_fam_ayam_mentega.jpg', url: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659' },
  'item_fam_09': { file: 'web_fam_sapi_lada_hitam.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  'item_fam_10': { file: 'web_fam_ayam_lada_hitam.jpg', url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e' },
  'item_fam_11': { file: 'web_fam_ayam_nanking.jpg', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd' },
  'item_fam_12': { file: 'web_fam_bistik_sapi.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  'item_fam_13': { file: 'web_fam_udang_cumi_tepung.jpg', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
  'item_fam_14': { file: 'web_fam_ayam_asam_manis.jpg', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd' },
  'item_fam_15': { file: 'web_fam_udang_asam_manis.jpg', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
  'item_fam_16': { file: 'web_fam_udang_saus_padang.jpg', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641' },
  'item_fam_17': { file: 'web_fam_sapi_rica_rica.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  'item_fam_18': { file: 'web_fam_sapo_tahu_ayam.jpg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
  'item_fam_19': { file: 'web_fam_sapo_tahu_seafood.jpg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
  'item_fam_20': { file: 'web_fam_fu_yung_hai.jpg', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8' },
  'item_fam_21': { file: 'web_fam_ayam_teriyaki.jpg', url: 'https://images.unsplash.com/photo-1555126634-323283e090fa' },
  'item_fam_22': { file: 'web_fam_tauge_ca_ikan_asin.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  'item_fam_23': { file: 'web_fam_soup_jagung.jpg', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab' },
  'item_fam_24': { file: 'web_fam_mun_tahu.jpg', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab' },

  // ─── 5. Signature & Seasonal Coffee ────────────────────────────────────
  'item_seas_01': { file: 'web_butterscotch_latte.jpg', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772' },
  'item_seas_02': { file: 'web_mont_blanc.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_seas_03': { file: 'web_dirty_latte.jpg', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61' },
  'item_sig_01': { file: 'web_amber_dripp.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd' },
  'item_sig_02': { file: 'web_midnight_citrus.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sig_03': { file: 'web_tropic_noir.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sig_04': { file: 'web_kyoto_cooler.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sig_05': { file: 'web_honeyburn.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd' },
  'item_sig_06': { file: 'web_sweet_shock.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_sig_07': { file: 'web_bright_black.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sig_08': { file: 'web_island_kick.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_bar_01': { file: 'web_berry_cold_brew.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_bar_02': { file: 'web_salt_caramond.jpg', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772' },
  'item_bar_03': { file: 'web_pink_berries.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_bar_04': { file: 'web_fantasy_island.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_bar_05': { file: 'web_lemonade_on_the_rock.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_bar_06': { file: 'web_tropical_summer.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },

  // ─── 6. Classic & Manual Brew ──────────────────────────────────────────
  'item_cls_01': { file: 'web_espresso.jpg', url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a' },
  'item_cls_02': { file: 'web_double_espresso.jpg', url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a' },
  'item_cls_03': { file: 'web_flatwhite.jpg', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61' },
  'item_cls_04': { file: 'web_macchiato.jpg', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61' },
  'item_cls_05': { file: 'web_piccolo.jpg', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61' },
  'item_cls_06': { file: 'web_split.jpg', url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a' },
  'item_cls_07': { file: 'web_cappuccino_reg.jpg', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d' },
  'item_cls_08': { file: 'web_cappuccino_lrg.jpg', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d' },
  'item_cls_09': { file: 'web_americano_reg.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd' },
  'item_cls_10': { file: 'web_americano_lrg.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_cls_11': { file: 'web_latte_reg.jpg', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772' },
  'item_cls_12': { file: 'web_latte_lrg.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_mb_01': { file: 'web_v60.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd' },
  'item_mb_02': { file: 'web_vietnam_dripp.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd' },
  'item_mb_03': { file: 'web_kalita_wave.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd' },
  'item_mb_04': { file: 'web_v60_japanese.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_01': { file: 'web_lajava_kopi.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_02': { file: 'web_lajava_kopi_susu.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_03': { file: 'web_palm_sugar_latte.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_04': { file: 'web_coconut_coffee.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_05': { file: 'web_java_creamy_latte.jpg', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772' },
  'item_sfy_06': { file: 'web_kopi_rum.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_07': { file: 'web_cold_brew_black.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_08': { file: 'web_cold_brew_milk.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_sfy_09': { file: 'web_kopi_rum_oreo.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },
  'item_sfy_10': { file: 'web_mocha_latte.jpg', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d' },
  'item_sfy_11': { file: 'web_seasalt_hazelnut_latte.jpg', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772' },

  // ─── 7. Milk Based & Blended ───────────────────────────────────────────
  'item_mb_001': { file: 'web_thai_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_mb_002': { file: 'web_rum_oreo.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },
  'item_mb_003': { file: 'web_rum_regal.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },
  'item_mb_004': { file: 'web_matcha.jpg', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a' },
  'item_mb_005': { file: 'web_taro_milk.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },
  'item_mb_006': { file: 'web_red_velvet.jpg', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772' },
  'item_mb_007': { file: 'web_chocolate_milk.jpg', url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed' },
  'item_mb_008': { file: 'web_seasalt_choco.jpg', url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed' },
  'item_mb_009': { file: 'web_hazelnut_choco.jpg', url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed' },
  'item_bld_01': { file: 'web_mango_cheesecake_blend.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888' },
  'item_bld_02': { file: 'web_chocolate_blend.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },
  'item_bld_03': { file: 'web_cookies_and_cream_blend.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },
  'item_bld_04': { file: 'web_strawberry_cheesecake_blend.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888' },
  'item_bld_05': { file: 'web_greentea_blend.jpg', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a' },
  'item_bld_06': { file: 'web_blonde_regal_blend.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699' },

  // ─── 8. Tea, Mocktail & Juice ──────────────────────────────────────────
  'item_mkt_01': { file: 'web_sunset_bliss.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_mkt_02': { file: 'web_lemonade.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_mkt_03': { file: 'web_lemon_squash.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_mkt_04': { file: 'web_strawberry_mint_mojito.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_mkt_05': { file: 'web_green_lantern.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_mkt_06': { file: 'web_leci_mint_mojito.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_mkt_07': { file: 'web_summer_breeze.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_tea_01': { file: 'web_lychee_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_02': { file: 'web_peach_strawberry_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_03': { file: 'web_magical_lemonade_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_04': { file: 'web_lemon_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_05': { file: 'web_lemongrass_tea.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_tea_06': { file: 'web_passion_fruit_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_07': { file: 'web_lychee_strawberry_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_08': { file: 'web_peach_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_09': { file: 'web_mango_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tea_10': { file: 'web_original_tea.jpg', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc' },
  'item_tpot_01': { file: 'web_butterfly_pea_teapot.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_tpot_02': { file: 'web_chamomile_teapot.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_tpot_03': { file: 'web_ginger_teapot.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_tpot_04': { file: 'web_peppermint_teapot.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_tpot_05': { file: 'web_oolong_teapot.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_tpot_06': { file: 'web_jasmine_greentea_teapot.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_jce_01': { file: 'web_mango_juice.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888' },
  'item_jce_02': { file: 'web_pineapple_juice.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888' },
  'item_jce_03': { file: 'web_dragonfruit_juice.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888' },
  'item_jce_04': { file: 'web_watermelon_juice.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888' },
  'item_jce_05': { file: 'web_mineral_water.jpg', url: 'https://images.unsplash.com/photo-1560023907-5f339617ea30' },
  'item_jce_06': { file: 'web_lime_water.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_jce_07': { file: 'web_lemon_water.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
  'item_jce_08': { file: 'web_air_hangat.jpg', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
  'item_jce_09': { file: 'web_air_es.jpg', url: 'https://images.unsplash.com/photo-1560023907-5f339617ea30' },

  // ─── 9. Ice Cream & Beer ───────────────────────────────────────────────
  'item_ic_01': { file: 'web_ice_cream_mix.jpg', url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371' },
  'item_ic_02': { file: 'web_classic_affogato.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_ic_03': { file: 'web_ice_cream_vanilla.jpg', url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371' },
  'item_ic_04': { file: 'web_choco_coco.jpg', url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371' },
  'item_ic_05': { file: 'web_ice_cream_chocolate.jpg', url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371' },
  'item_ic_06': { file: 'web_mocha_affogato.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
  'item_ber_01': { file: 'web_bintang_radler.jpg', url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13' },
  'item_ber_02': { file: 'web_bintang_small.jpg', url: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7' },
  'item_ber_03': { file: 'web_bintang_arak_madu.jpg', url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e' },
  'item_ber_04': { file: 'web_heineken_small.jpg', url: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7' },
  'item_ber_05': { file: 'web_prost_small.jpg', url: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7' },
  'item_ber_06': { file: 'web_guinness_small.jpg', url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e' },
  'item_ber_07': { file: 'web_bintang_large.jpg', url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13' },
  'item_ber_08': { file: 'web_prost_large.jpg', url: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7' },
  'item_ber_09': { file: 'web_heineken_large.jpg', url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13' },
  'item_ber_10': { file: 'web_guinness_large.jpg', url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e' },
};

async function downloadImagesAndSync() {
  console.log('Starting download of curated web food photography...');

  // 1. Download unique remote photos
  const uniqueUrls = new Map();
  for (const [itemId, info] of Object.entries(photoMap)) {
    if (info.url && !uniqueUrls.has(info.file)) {
      uniqueUrls.set(info.file, `${info.url}?w=800&auto=format&fit=crop&q=85`);
    }
  }

  console.log(`Found ${uniqueUrls.size} unique food & drink photo assets to download.`);
  let successCount = 0;

  for (const [filename, cdnUrl] of uniqueUrls.entries()) {
    const targetPath = path.join(menuDir, filename);
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000) {
      successCount++;
      continue;
    }

    try {
      const resp = await fetch(cdnUrl, { signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const buffer = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(targetPath, buffer);
        successCount++;
      } else {
        console.warn(`Failed ${filename}: HTTP ${resp.status}`);
      }
    } catch (err) {
      console.warn(`Error downloading ${filename}: ${err.message}`);
    }
  }

  console.log(`Downloaded/verified ${successCount} high-res food photo files.`);

  // 2. Update server/lajava_menu_data.js
  const data = require('./lajava_menu_data');
  data.items.forEach((item) => {
    const mapping = photoMap[item.id];
    if (mapping) {
      item.image = `/images/menu/${mapping.file}`;
    }
  });

  fs.writeFileSync(
    path.join(__dirname, 'lajava_menu_data.js'),
    'module.exports = ' + JSON.stringify(data, null, 2) + ';\n',
    'utf8'
  );
  console.log('Updated server/lajava_menu_data.js with new high-definition photos.');

  // 3. Update SQLite Database
  const updateStmt = db.prepare('UPDATE menu_items SET image = ? WHERE id = ?');
  const tx = db.transaction(() => {
    for (const item of data.items) {
      updateStmt.run(item.image, item.id);
    }
  });
  tx();

  const total = db.prepare('SELECT count(*) as c FROM menu_items').get().c;
  console.log(`Successfully synced ${total} menu items in SQLite database.`);
}

downloadImagesAndSync().catch(console.error);
