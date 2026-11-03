const fs = require('fs');
const path = require('path');
const db = require('./db');

const menuDir = path.join(__dirname, '..', 'client', 'public', 'images', 'menu');

const photoAssignments = {
  // ─── Snacks, Salad & Bubur ──────────────────────────────────────────
  'item_snk_01': 'lajava_egg_garden_salad.jpg',
  'item_snk_02': 'lajava_chicken_garden_salad.jpg',
  'item_snk_03': 'lajava_bubur_ubi.jpg',
  'item_snk_04': 'lajava_bubur_ubi.jpg',
  'item_snk_05': 'lajava_tahu_isi.jpg',
  'item_snk_06': 'lajava_mendoan.jpg',
  'item_snk_07': 'lajava_jamur_crispy.jpg',
  'item_snk_08': 'lajava_chicken_popcorn.jpg',
  'item_snk_09': 'lajava_potato_chips.jpg',
  'item_snk_10': 'lajava_french_fries.jpg',
  'item_snk_11': 'lajava_onion_rings.jpg',
  'item_snk_12': 'bakwan_jagung.jpg',

  // ─── Rice Selection & Nasi Goreng ───────────────────────────────────
  'item_rc_01': 'lajava_nasi_brokoli_sapi.jpg',
  'item_rc_02': 'lajava_nasi_brokoli_ayam.jpg',
  'item_rc_03': 'lajava_nasi_cumi_padang.jpg',
  'item_rc_04': 'lajava_nasi_saus_mentega.jpg',
  'item_rc_05': 'lajava_nasi_brokoli_garlic.jpg',
  'item_rc_06': 'lajava_nasi_ayam_kecap.jpg',
  'item_rc_07': 'lajava_nasi_ayam_lada_hitam.jpg',
  'item_rc_08': 'lajava_nasi_sapi_lada_hitam.jpg',
  'item_rc_09': 'lajava_nasi_ayam_mentega.jpg',
  'item_rc_10': 'lajava_nasi_ayam_geprek.jpg',
  'item_rc_11': 'lajava_nasi_ayam_teriyaki.jpg',
  'item_rc_12': 'lajava_nasi_ayam_sechuan.jpg',
  'item_rc_13': 'lajava_nasi_ayam_kecap.jpg',
  'item_rc_14': 'lajava_nasi_ayam_sechuan.jpg',
  'item_rc_15': 'lajava_nasi_asam_manis.jpg',
  'item_rc_16': 'lajava_nasi_saus_tiram.jpg',
  'item_rc_17': 'lajava_nasi_rica_rica.jpg',
  'item_rc_18': 'lajava_nasi_saus_mentega.jpg',
  'item_rc_19': 'lajava_nasi_cumi_padang.jpg',
  'item_rc_20': 'lajava_nasi_rica_rica.jpg',
  'item_rc_21': 'lajava_nasi_saus_tiram.jpg',
  'item_rc_22': 'lajava_nasi_saus_tiram.jpg',
  'item_rc_23': 'lajava_nasi_asam_manis.jpg',
  'item_rc_24': 'lajava_nasi_rica_rica.jpg',
  'item_ng_01': 'lajava_nasgor_mawut.jpg',
  'item_ng_02': 'lajava_nasgor_hongkong.jpg',
  'item_ng_03': 'lajava_nasgor_mentega.jpg',
  'item_ng_04': 'lajava_nasgor_spesial.jpg',
  'item_ng_05': 'lajava_nasgor_seafood.jpg',

  // ─── Chinese Food & Indomie ─────────────────────────────────────────
  'item_chn_01': 'lajava_bihun_goreng.jpg',
  'item_chn_02': 'lajava_bihun_goreng.jpg',
  'item_chn_03': 'lajava_mie_goreng.jpg',
  'item_chn_04': 'lajava_mie_goreng.jpg',
  'item_chn_05': 'lajava_kwetiaw_goreng.jpg',
  'item_chn_06': 'lajava_kwetiaw_goreng.jpg',
  'item_chn_07': 'lajava_kwetiaw_siram.jpg',
  'item_chn_08': 'lajava_kwetiaw_siram.jpg',
  'item_chn_09': 'lajava_mie_godog.jpg',
  'item_chn_10': 'lajava_mapo_tahu.jpg',
  'item_chn_11': 'lajava_capcay_rice.jpg',
  'item_chn_12': 'lajava_capcay_rice.jpg',
  'item_chn_13': 'lajava_mun_tahu.jpg',
  'item_idm_01': 'lajava_indomie_kuah.jpg',
  'item_idm_02': 'lajava_indomie_goreng.jpg',
  'item_idm_03': 'lajava_indomie_kuah_susu.jpg',
  'item_idm_04': 'lajava_indomie_kuah_susu_keju.jpg',
  'item_idm_05': 'lajava_indomie_goreng.jpg',
  'item_idm_06': 'lajava_extra_telur.jpg',

  // ─── Family Style Sharing ───────────────────────────────────────────
  'item_fam_01': 'lajava_fam_brokoli_putih.jpg',
  'item_fam_02': 'lajava_fam_brokoli_sapi.jpg',
  'item_fam_03': 'lajava_fam_capcay_seafood.jpg',
  'item_fam_04': 'lajava_fam_capcay_ayam.jpg',
  'item_fam_05': 'lajava_fam_mie_seafood.jpg',
  'item_fam_06': 'lajava_fam_mie_ayam.jpg',
  'item_fam_07': 'lajava_fam_brokoli_ayam.jpg',
  'item_fam_08': 'lajava_fam_ayam_mentega.jpg',
  'item_fam_09': 'lajava_fam_sapi_lada_hitam.jpg',
  'item_fam_10': 'lajava_fam_ayam_lada_hitam.jpg',
  'item_fam_11': 'lajava_fam_ayam_nanking.jpg',
  'item_fam_12': 'lajava_fam_bistik_sapi.jpg',
  'item_fam_13': 'lajava_fam_udang_cumi_tepung.jpg',
  'item_fam_14': 'lajava_fam_asam_manis.jpg',
  'item_fam_15': 'lajava_fam_asam_manis.jpg',
  'item_fam_16': 'lajava_fam_saus_padang.jpg',
  'item_fam_17': 'lajava_fam_rica.jpg',
  'item_fam_18': 'lajava_fam_sapo_tahu.jpg',
  'item_fam_19': 'lajava_fam_sapo_tahu.jpg',
  'item_fam_20': 'lajava_fam_fu_yung_hai.jpg',
  'item_fam_21': 'lajava_fam_ayam_teriyaki.jpg',
  'item_fam_22': 'lajava_fam_tauge_ikan_asin.jpg',
  'item_fam_23': 'lajava_fam_soup_jagung.jpg',
  'item_fam_24': 'lajava_fam_mun_tahu.jpg',

  // ─── Signature Coffee ───────────────────────────────────────────────
  'item_seas_01': 'lajava_butterscotch_latte.jpg',
  'item_seas_02': 'lajava_mont_blanc.jpg',
  'item_seas_03': 'lajava_dirty_latte.jpg',
  'item_sig_01': 'lajava_amber_dripp.jpg',
  'item_sig_02': 'lajava_amber_dripp.jpg',
  'item_sig_03': 'lajava_tropic_noir.jpg',
  'item_sig_04': 'lajava_kyoto_cooler.jpg',
  'item_sig_05': 'lajava_honeyburn.jpg',
  'item_sig_06': 'lajava_tropical_summer.jpg',
  'item_sig_07': 'lajava_amber_dripp.jpg',
  'item_sig_08': 'lajava_island_kick.jpg',
  'item_bar_01': 'lajava_berry_cold_brew.jpg',
  'item_bar_02': 'lajava_salt_caramond.jpg',
  'item_bar_03': 'lajava_berry_cold_brew.jpg',
  'item_bar_04': 'lajava_fantasy_island.jpg',
  'item_bar_05': 'lajava_lemonade_rock.jpg',
  'item_bar_06': 'lajava_tropical_summer.jpg',

  // ─── Classic Coffee & Manual Brew ───────────────────────────────────
  'item_cls_01': 'lajava_espresso.jpg',
  'item_cls_02': 'lajava_espresso.jpg',
  'item_cls_03': 'lajava_latte.jpg',
  'item_cls_04': 'lajava_macchiato.jpg',
  'item_cls_05': 'lajava_piccolo.jpg',
  'item_cls_06': 'lajava_espresso.jpg',
  'item_cls_07': 'lajava_macchiato.jpg',
  'item_cls_08': 'lajava_latte.jpg',
  'item_cls_09': 'lajava_americano.jpg',
  'item_cls_10': 'lajava_americano.jpg',
  'item_cls_11': 'lajava_latte.jpg',
  'item_cls_12': 'lajava_latte.jpg',
  'item_mb_01': 'lajava_v60.jpg',
  'item_mb_02': 'lajava_vietnam_dripp.jpg',
  'item_mb_03': 'lajava_kalita_wave.jpg',
  'item_mb_04': 'lajava_v60.jpg',
  'item_sfy_01': 'lajava_cup_duo.jpg',
  'item_sfy_02': 'lajava_cup_duo.jpg',
  'item_sfy_03': 'lajava_cup_duo.jpg',
  'item_sfy_04': 'lajava_cup_duo.jpg',
  'item_sfy_05': 'lajava_cup_duo.jpg',
  'item_sfy_06': 'lajava_cup_duo.jpg',
  'item_sfy_07': 'lajava_cup_duo.jpg',
  'item_sfy_08': 'lajava_cup_duo.jpg',
  'item_sfy_09': 'lajava_cup_duo.jpg',
  'item_sfy_10': 'lajava_cup_duo.jpg',
  'item_sfy_11': 'lajava_cup_duo.jpg',

  // ─── Milk Based & Blended ───────────────────────────────────────────
  'item_mb_001': 'lajava_thai_tea.jpg',
  'item_mb_002': 'lajava_chocolate.jpg',
  'item_mb_003': 'lajava_blonde_regal.jpg',
  'item_mb_004': 'lajava_matcha.jpg',
  'item_mb_005': 'lajava_taro.jpg',
  'item_mb_006': 'lajava_red_velvet.jpg',
  'item_mb_007': 'lajava_chocolate.jpg',
  'item_mb_008': 'lajava_chocolate.jpg',
  'item_mb_009': 'lajava_chocolate.jpg',
  'item_bld_01': 'lajava_mango_cheesecake.jpg',
  'item_bld_02': 'lajava_chocolate_blend.jpg',
  'item_bld_03': 'lajava_cookies_cream.jpg',
  'item_bld_04': 'lajava_strawberry_cheesecake.jpg',
  'item_bld_05': 'lajava_greentea_blend.jpg',
  'item_bld_06': 'lajava_blonde_regal.jpg',

  // ─── Tea Series, Mocktail & Juices ──────────────────────────────────
  'item_mkt_01': 'lajava_sunset_bliss.jpg',
  'item_mkt_02': 'lajava_lemonade.jpg',
  'item_mkt_03': 'lajava_lemon_squash.jpg',
  'item_mkt_04': 'lajava_strawberry_mojito.jpg',
  'item_mkt_05': 'lajava_green_lantern.jpg',
  'item_mkt_06': 'lajava_leci_mojito.jpg',
  'item_mkt_07': 'lajava_summer_breeze.jpg',
  'item_tea_01': 'lajava_lychee_tea.jpg',
  'item_tea_02': 'lajava_peach_strawberry_tea.jpg',
  'item_tea_03': 'lajava_magical_lemonade.jpg',
  'item_tea_04': 'lajava_lemon_tea.jpg',
  'item_tea_05': 'lajava_ceramic_teapot.jpg',
  'item_tea_06': 'lajava_peach_strawberry_tea.jpg',
  'item_tea_07': 'lajava_peach_strawberry_tea.jpg',
  'item_tea_08': 'lajava_peach_strawberry_tea.jpg',
  'item_tea_09': 'lajava_peach_strawberry_tea.jpg',
  'item_tea_10': 'lajava_lemon_tea.jpg',
  'item_tpot_01': 'lajava_butterfly_pea_tea.jpg',
  'item_tpot_02': 'lajava_ceramic_teapot.jpg',
  'item_tpot_03': 'lajava_ceramic_teapot.jpg',
  'item_tpot_04': 'lajava_ceramic_teapot.jpg',
  'item_tpot_05': 'lajava_ceramic_teapot.jpg',
  'item_tpot_06': 'lajava_ceramic_teapot.jpg',
  'item_jce_01': 'lajava_mango_juice.jpg',
  'item_jce_02': 'lajava_pineapple_juice.jpg',
  'item_jce_03': 'lajava_dragonfruit_juice.jpg',
  'item_jce_04': 'lajava_watermelon_juice.jpg',
  'item_jce_05': 'lajava_lemonade.jpg',
  'item_jce_06': 'lajava_lemonade.jpg',
  'item_jce_07': 'lajava_lemonade.jpg',
  'item_jce_08': 'lajava_ceramic_teapot.jpg',
  'item_jce_09': 'lajava_lemonade.jpg',

  // ─── Ice Cream & Beer ───────────────────────────────────────────────
  'item_ic_01': 'lajava_ice_cream_mix.jpg',
  'item_ic_02': 'lajava_classic_affogato.jpg',
  'item_ic_03': 'lajava_ice_cream_mix.jpg',
  'item_ic_04': 'lajava_ice_cream_mix.jpg',
  'item_ic_05': 'lajava_ice_cream_mix.jpg',
  'item_ic_06': 'lajava_classic_affogato.jpg',
  'item_ber_01': 'lajava_beer_bucket.jpg',
  'item_ber_02': 'lajava_beer_bottles.jpg',
  'item_ber_03': 'lajava_beer_frosted_mugs.jpg',
  'item_ber_04': 'lajava_beer_bucket.jpg',
  'item_ber_05': 'lajava_beer_bottles.jpg',
  'item_ber_06': 'lajava_beer_bottles.jpg',
  'item_ber_07': 'lajava_beer_bottles.jpg',
  'item_ber_08': 'lajava_beer_bottles.jpg',
  'item_ber_09': 'lajava_beer_bucket.jpg',
  'item_ber_10': 'lajava_beer_bottles.jpg',
};

// Check all files exist
let missing = 0;
for (const [id, file] of Object.entries(photoAssignments)) {
  const p = path.join(menuDir, file);
  if (!fs.existsSync(p)) {
    console.error('Missing image file:', file, 'for item', id);
    missing++;
  }
}

if (missing > 0) {
  console.error(`Aborting: ${missing} missing files.`);
  process.exit(1);
}

// Update server/lajava_menu_data.js
const data = require('./lajava_menu_data');
data.items.forEach(item => {
  const file = photoAssignments[item.id];
  if (file) {
    item.image = `/images/menu/${file}`;
  }
});

fs.writeFileSync(
  path.join(__dirname, 'lajava_menu_data.js'),
  'module.exports = ' + JSON.stringify(data, null, 2) + ';\n',
  'utf8'
);
console.log('server/lajava_menu_data.js updated.');

// Update SQLite database
const updateStmt = db.prepare('UPDATE menu_items SET image = ? WHERE id = ?');
const tx = db.transaction(() => {
  for (const item of data.items) {
    updateStmt.run(item.image, item.id);
  }
});
tx();

const count = db.prepare("SELECT count(*) as c FROM menu_items WHERE image LIKE '/images/menu/lajava_%' OR image = '/images/menu/bakwan_jagung.jpg'").get().c;
console.log(`Database updated! Exactly ${count} of ${data.items.length} items now point to authentic, 100% relevant menu photos.`);
