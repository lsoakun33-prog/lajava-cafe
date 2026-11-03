const fs = require('fs');
const path = require('path');
const db = require('./db');

function getFilename(item) {
  const id = item.id;
  if (id === 'item_snk_01') return 'egg_garden_salad.jpg';
  if (id === 'item_snk_02') return 'chicken_garden_salad.jpg';
  if (id === 'item_snk_03' || id === 'item_snk_04') return 'bubur_ubi.jpg';
  if (id === 'item_snk_05') return 'tahu_isi.jpg';
  if (id === 'item_snk_06') return 'mendoan.jpg';
  if (id === 'item_snk_07') return 'jamur_crispy.jpg';
  if (id === 'item_snk_08') return 'chicken_popcorn.jpg';
  if (id === 'item_snk_09') return 'potato_chips.jpg';
  if (id === 'item_snk_10') return 'french_fries.jpg';
  if (id === 'item_snk_11') return 'onion_rings.jpg';
  if (id === 'item_snk_12') return 'bakwan_jagung.jpg';

  if (id === 'item_rc_01') return 'nasi_brokoli_ca_sapi.jpg';
  if (id === 'item_rc_02') return 'nasi_brokoli_ca_ayam.jpg';
  if (id === 'item_rc_03') return 'nasi_cumi_padang_mentega.jpg';
  if (id === 'item_rc_04') return 'nasi_saus_mentega.jpg';
  if (id === 'item_rc_05') return 'nasi_brokoli_ca_bawang_putih.jpg';
  if (id === 'item_rc_06') return 'nasi_ayam_kecap.jpg';
  if (id === 'item_rc_07') return 'nasi_ayam_lada_hitam.jpg';
  if (id === 'item_rc_08') return 'nasi_sapi_lada_hitam.jpg';
  if (id === 'item_rc_09') return 'nasi_ayam_mentega.jpg';
  if (id === 'item_rc_10') return 'nasi_ayam_geprek.jpg';
  if (id === 'item_rc_11') return 'nasi_ayam_teriyaki.jpg';
  if (id === 'item_rc_12') return 'nasi_ayam_sechuan.jpg';
  if (id === 'item_rc_13') return 'nasi_ayam_kecap.jpg';
  if (id === 'item_rc_14') return 'nasi_ayam_sechuan.jpg';
  if (id === 'item_rc_15') return 'nasi_asam_manis.jpg';
  if (id === 'item_rc_16') return 'nasi_saus_tiram.jpg';
  if (id === 'item_rc_17') return 'nasi_rica_rica.jpg';
  if (id === 'item_rc_18') return 'nasi_saus_mentega.jpg';
  if (id === 'item_rc_19') return 'nasi_cumi_padang_mentega.jpg';
  if (id === 'item_rc_20') return 'nasi_rica_rica.jpg';
  if (id === 'item_rc_21') return 'nasi_saus_tiram.jpg';
  if (id === 'item_rc_22') return 'nasi_saus_tiram.jpg';
  if (id === 'item_rc_23') return 'nasi_asam_manis.jpg';
  if (id === 'item_rc_24') return 'nasi_rica_rica.jpg';
  if (id === 'item_ng_01') return 'nasi_goreng_mawut.jpg';
  if (id === 'item_ng_02') return 'nasi_goreng_hongkong.jpg';
  if (id === 'item_ng_03') return 'nasi_goreng_mentega.jpg';
  if (id === 'item_ng_04') return 'nasi_goreng_spesial.jpg';
  if (id === 'item_ng_05') return 'nasi_goreng_seafood.jpg';

  if (id === 'item_chn_01' || id === 'item_chn_02') return 'bihun_goreng.jpg';
  if (id === 'item_chn_03' || id === 'item_chn_04') return 'mie_goreng.jpg';
  if (id === 'item_chn_05' || id === 'item_chn_06') return 'kwetiaw_goreng.jpg';
  if (id === 'item_chn_07' || id === 'item_chn_08') return 'kwetiaw_siram.jpg';
  if (id === 'item_chn_09') return 'mie_bihun_godog.jpg';
  if (id === 'item_chn_10') return 'nasi_mapo_tahu.jpg';
  if (id === 'item_chn_11' || id === 'item_chn_12') return 'nasi_capcay.jpg';
  if (id === 'item_chn_13') return 'nasi_mun_tahu.jpg';
  if (id === 'item_idm_01') return 'indomie_kuah.jpg';
  if (id === 'item_idm_02') return 'indomie_goreng.jpg';
  if (id === 'item_idm_03') return 'indomie_kuah_susu.jpg';
  if (id === 'item_idm_04') return 'indomie_kuah_susu_keju.jpg';
  if (id === 'item_idm_05') return 'indomie_goreng.jpg';
  if (id === 'item_idm_06') return 'extra_telur.jpg';

  if (id === 'item_fam_01') return 'fam_brokoli_bawang_putih.jpg';
  if (id === 'item_fam_02') return 'fam_brokoli_sapi.jpg';
  if (id === 'item_fam_03') return 'fam_capcay_seafood.jpg';
  if (id === 'item_fam_04') return 'fam_capcay_ayam.jpg';
  if (id === 'item_fam_05') return 'fam_mie_goreng_seafood.jpg';
  if (id === 'item_fam_06') return 'fam_mie_goreng_ayam.jpg';
  if (id === 'item_fam_07') return 'fam_brokoli_ayam.jpg';
  if (id === 'item_fam_08') return 'fam_ayam_mentega.jpg';
  if (id === 'item_fam_09') return 'fam_sapi_lada_hitam.jpg';
  if (id === 'item_fam_10') return 'fam_ayam_lada_hitam.jpg';
  if (id === 'item_fam_11') return 'fam_ayam_nanking.jpg';
  if (id === 'item_fam_12') return 'fam_bistik_sapi.jpg';
  if (id === 'item_fam_13') return 'fam_udang_cumi_tepung.jpg';
  if (id === 'item_fam_14' || id === 'item_fam_15') return 'fam_asam_manis.jpg';
  if (id === 'item_fam_16') return 'fam_saus_padang.jpg';
  if (id === 'item_fam_17') return 'fam_rica_rica.jpg';
  if (id === 'item_fam_18' || id === 'item_fam_19') return 'fam_sapo_tahu.jpg';
  if (id === 'item_fam_20') return 'fam_fu_yung_hai.jpg';
  if (id === 'item_fam_21') return 'fam_ayam_teriyaki.jpg';
  if (id === 'item_fam_22') return 'fam_tauge_ca_ikan_asin.jpg';
  if (id === 'item_fam_23') return 'fam_soup_jagung.jpg';
  if (id === 'item_fam_24') return 'fam_mun_tahu.jpg';

  if (id === 'item_seas_01') return 'butterscotch_latte.jpg';
  if (id === 'item_seas_02') return 'mont_blanc.jpg';
  if (id === 'item_seas_03') return 'dirty_latte.jpg';
  if (id === 'item_sig_01') return 'amber_dripp.jpg';
  if (id === 'item_sig_02') return 'signature_citrus.jpg';
  if (id === 'item_sig_03') return 'tropic_noir.jpg';
  if (id === 'item_sig_04') return 'kyoto_cooler.jpg';
  if (id === 'item_sig_05') return 'honeyburn.jpg';
  if (id === 'item_sig_06') return 'tropical_summer.jpg';
  if (id === 'item_sig_07') return 'amber_dripp.jpg';
  if (id === 'item_sig_08') return 'island_kick.jpg';
  if (id === 'item_bar_01') return 'berry_cold_brew.jpg';
  if (id === 'item_bar_02') return 'salt_caramond.jpg';
  if (id === 'item_bar_03') return 'berry_cold_brew.jpg';
  if (id === 'item_bar_04') return 'fantasy_island.jpg';
  if (id === 'item_bar_05') return 'lemonade_on_the_rock.jpg';
  if (id === 'item_bar_06') return 'tropical_summer.jpg';

  if (id === 'item_cls_01' || id === 'item_cls_02' || id === 'item_cls_06') return 'espresso.jpg';
  if (id === 'item_cls_03') return 'latte_flatwhite.jpg';
  if (id === 'item_cls_04') return 'macchiato.jpg';
  if (id === 'item_cls_05') return 'piccolo.jpg';
  if (id === 'item_cls_07' || id === 'item_cls_08') return 'macchiato.jpg';
  if (id === 'item_cls_09' || id === 'item_cls_10') return 'americano.jpg';
  if (id === 'item_cls_11' || id === 'item_cls_12') return 'latte_flatwhite.jpg';
  if (id === 'item_mb_01') return 'v60.jpg';
  if (id === 'item_mb_02') return 'vietnam_dripp.jpg';
  if (id === 'item_mb_03' || id === 'item_mb_04') return 'kalita_wave.jpg';
  if (id.startsWith('item_sfy_')) return 'lajava_cup_duo.jpg';

  if (id === 'item_mb_001') return 'thai_tea.jpg';
  if (id === 'item_mb_002') return 'choco_charcoal.jpg';
  if (id === 'item_mb_003') return 'blonde_regal_blend.jpg';
  if (id === 'item_mb_004') return 'greentea_matcha.jpg';
  if (id === 'item_mb_005') return 'taro_milk.jpg';
  if (id === 'item_mb_006') return 'red_velvet.jpg';
  if (id === 'item_mb_007' || id === 'item_mb_008' || id === 'item_mb_009') return 'choco_charcoal.jpg';
  if (id === 'item_bld_01') return 'mango_cheesecake_blend.jpg';
  if (id === 'item_bld_02') return 'chocolate_blend.jpg';
  if (id === 'item_bld_03') return 'cookies_and_cream_blend.jpg';
  if (id === 'item_bld_04') return 'strawberry_cheesecake_blend.jpg';
  if (id === 'item_bld_05') return 'greentea_blend.jpg';
  if (id === 'item_bld_06') return 'blonde_regal_blend.jpg';

  if (id === 'item_mkt_01') return 'sunset_bliss.jpg';
  if (id === 'item_mkt_02') return 'lemonade.jpg';
  if (id === 'item_mkt_03') return 'lemon_squash.jpg';
  if (id === 'item_mkt_04') return 'strawberry_mint_mojito.jpg';
  if (id === 'item_mkt_05') return 'green_lantern.jpg';
  if (id === 'item_mkt_06') return 'leci_mint_mojito.jpg';
  if (id === 'item_mkt_07') return 'summer_breeze.jpg';
  if (id === 'item_tea_01') return 'lychee_tea.jpg';
  if (id === 'item_tea_02') return 'peach_strawberry_tea.jpg';
  if (id === 'item_tea_03') return 'magical_lemonade.jpg';
  if (id === 'item_tea_04' || id === 'item_tea_05' || id === 'item_tea_10') return 'lemon_tea.jpg';
  if (id === 'item_tea_06' || id === 'item_tea_07' || id === 'item_tea_08' || id === 'item_tea_09') return 'peach_strawberry_tea.jpg';
  if (id === 'item_tpot_01') return 'butterfly_pea_teapot.jpg';
  if (id.startsWith('item_tpot_')) return 'ceramic_teapot_tea.jpg';
  if (id === 'item_jce_01') return 'mango_juice.jpg';
  if (id === 'item_jce_02') return 'pineapple_juice.jpg';
  if (id === 'item_jce_03') return 'dragonfruit_juice.jpg';
  if (id === 'item_jce_04') return 'watermelon_juice.jpg';
  if (id === 'item_jce_05' || id === 'item_jce_09') return 'fresh_juices_all.jpg';
  if (id === 'item_jce_06' || id === 'item_jce_07') return 'lemonade.jpg';
  if (id === 'item_jce_08') return 'ceramic_teapot_tea.jpg';

  if (id === 'item_ic_01' || id === 'item_ic_03' || id === 'item_ic_04' || id === 'item_ic_05') return 'ice_cream_mix.jpg';
  if (id === 'item_ic_02' || id === 'item_ic_06') return 'classic_affogato.jpg';
  if (id === 'item_ber_01' || id === 'item_ber_04' || id === 'item_ber_09') return 'beer_bucket_heineken.jpg';
  if (id === 'item_ber_03') return 'beer_mugs_frosted.jpg';
  if (id.startsWith('item_ber_')) return 'beer_bottles_guinness.jpg';

  return 'bakwan_jagung.jpg';
}

const data = require('./lajava_menu_data');

data.items.forEach(it => {
  it.image = '/images/menu/' + getFilename(it);
});

fs.writeFileSync(
  path.join(__dirname, 'lajava_menu_data.js'),
  'module.exports = ' + JSON.stringify(data, null, 2) + ';\n',
  'utf8'
);
console.log('lajava_menu_data.js file updated.');

const updateStmt = db.prepare('UPDATE menu_items SET image = ? WHERE id = ?');
const tx = db.transaction(() => {
  for (const it of data.items) {
    updateStmt.run(it.image, it.id);
  }
});
tx();

const row = db.prepare("SELECT count(id) as count FROM menu_items WHERE image LIKE '/images/menu/%'").get();
console.log('Total items in DB with official menu photo:', row.count);
