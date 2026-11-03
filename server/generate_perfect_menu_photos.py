import pymupdf
import cv2
import numpy as np
import os
import shutil

pdf_path = r'C:\Users\WINDOWS 11\.gemini\antigravity\brain\d55b8db9-8dcb-48d6-9799-c76f0a799975\.user_uploaded\media_1793620312413_67ce1fc2.pdf'
out_dir = r'client\public\images\menu'
os.makedirs(out_dir, exist_ok=True)

doc = pymupdf.open(pdf_path)

def get_page_img(page_no, dpi=250):
    page = doc[page_no - 1]
    pix = page.get_pixmap(dpi=dpi)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, 3))
    return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

# Cache pages as needed
pages = {}
def get_p(p_no):
    if p_no not in pages:
        pages[p_no] = get_page_img(p_no)
    return pages[p_no]

def crop_and_save(page_no, box, filename, pad=0):
    img = get_p(page_no)
    H, W, _ = img.shape
    x1, y1, x2, y2 = box
    px1 = max(0, int(x1 * W) - pad)
    py1 = max(0, int(y1 * H) - pad)
    px2 = min(W, int(x2 * W) + pad)
    py2 = min(H, int(y2 * H) + pad)
    
    crop = img[py1:py2, px1:px2]
    # Resize to standard 4:3 high-res menu thumbnail (800x600) with high quality lanczos
    h, w, _ = crop.shape
    target_w, target_h = 800, 600
    
    # Crop to exact 4:3 aspect ratio first
    target_aspect = 4.0 / 3.0
    current_aspect = w / h
    if current_aspect > target_aspect:
        # Too wide, crop sides
        new_w = int(h * target_aspect)
        offset = (w - new_w) // 2
        crop = crop[:, offset:offset+new_w]
    else:
        # Too tall, crop top/bottom
        new_h = int(w / target_aspect)
        offset = (h - new_h) // 2
        crop = crop[offset:offset+new_h, :]
        
    resized = cv2.resize(crop, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    # Slight contrast & vibrancy touch
    lab = cv2.cvtColor(resized, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    enhanced = cv2.merge((cl, a, b))
    final = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    dst = os.path.join(out_dir, filename)
    cv2.imwrite(dst, final, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print(f'Processed {filename}')

print('Extracting perfectly framed, authentic photos from PDF...')

# 1. Salad & Bubur (Pages 1, 2)
crop_and_save(1, (0.17, 0.23, 0.73, 0.51), 'lajava_egg_garden_salad.jpg')
crop_and_save(1, (0.24, 0.53, 0.94, 0.85), 'lajava_chicken_garden_salad.jpg')
crop_and_save(2, (0.18, 0.41, 0.82, 0.72), 'lajava_bubur_ubi.jpg')

# 2. Snacks (Page 3)
crop_and_save(3, (0.30, 0.27, 0.58, 0.41), 'lajava_tahu_isi.jpg')
crop_and_save(3, (0.05, 0.37, 0.32, 0.54), 'lajava_mendoan.jpg')
crop_and_save(3, (0.61, 0.34, 0.87, 0.51), 'lajava_jamur_crispy.jpg')
crop_and_save(3, (0.30, 0.49, 0.58, 0.65), 'lajava_chicken_popcorn.jpg')
crop_and_save(3, (0.65, 0.51, 0.95, 0.68), 'lajava_potato_chips.jpg')
crop_and_save(3, (0.12, 0.67, 0.42, 0.86), 'lajava_french_fries.jpg')
crop_and_save(3, (0.47, 0.67, 0.77, 0.86), 'lajava_onion_rings.jpg')

# 3. Rice Selection (Pages 4, 5, 6, 7)
crop_and_save(4, (0.17, 0.39, 0.56, 0.61), 'lajava_nasi_brokoli_sapi.jpg')
crop_and_save(4, (0.52, 0.52, 0.93, 0.75), 'lajava_nasi_brokoli_ayam.jpg')
crop_and_save(4, (0.07, 0.63, 0.50, 0.86), 'lajava_nasi_cumi_padang.jpg')
crop_and_save(11, (0.23, 0.31, 0.56, 0.49), 'lajava_nasi_brokoli_garlic.jpg')

crop_and_save(5, (0.04, 0.33, 0.46, 0.53), 'lajava_nasi_ayam_kecap.jpg')
crop_and_save(5, (0.52, 0.38, 0.96, 0.58), 'lajava_nasi_ayam_lada_hitam.jpg')
crop_and_save(5, (0.12, 0.55, 0.63, 0.78), 'lajava_nasi_sapi_lada_hitam.jpg')

crop_and_save(6, (0.24, 0.19, 0.60, 0.38), 'lajava_nasi_ayam_mentega.jpg')
crop_and_save(6, (0.57, 0.31, 0.94, 0.50), 'lajava_nasi_ayam_geprek.jpg')
crop_and_save(6, (0.05, 0.37, 0.41, 0.56), 'lajava_nasi_ayam_teriyaki.jpg')
crop_and_save(6, (0.39, 0.48, 0.80, 0.71), 'lajava_nasi_ayam_sechuan.jpg')

crop_and_save(7, (0.17, 0.24, 0.54, 0.43), 'lajava_nasi_asam_manis.jpg')
crop_and_save(7, (0.53, 0.34, 0.92, 0.54), 'lajava_nasi_saus_mentega.jpg')
crop_and_save(7, (0.09, 0.45, 0.45, 0.64), 'lajava_nasi_rica_rica.jpg')
crop_and_save(7, (0.45, 0.56, 0.83, 0.78), 'lajava_nasi_saus_tiram.jpg')

# 4. Nasi Goreng (Page 8)
crop_and_save(8, (0.17, 0.34, 0.51, 0.49), 'lajava_nasgor_mawut.jpg')
crop_and_save(8, (0.54, 0.40, 0.91, 0.58), 'lajava_nasgor_hongkong.jpg')
crop_and_save(8, (0.10, 0.50, 0.50, 0.65), 'lajava_nasgor_mentega.jpg')
crop_and_save(8, (0.52, 0.60, 0.93, 0.81), 'lajava_nasgor_spesial.jpg')
crop_and_save(8, (0.05, 0.69, 0.49, 0.88), 'lajava_nasgor_seafood.jpg')

# 5. Chinese Food & Indomie (Pages 9, 10, 16)
crop_and_save(9, (0.24, 0.27, 0.55, 0.46), 'lajava_bihun_goreng.jpg')
crop_and_save(9, (0.52, 0.39, 0.84, 0.59), 'lajava_mie_goreng.jpg')
crop_and_save(9, (0.05, 0.42, 0.38, 0.63), 'lajava_kwetiaw_goreng.jpg')
crop_and_save(9, (0.35, 0.57, 0.65, 0.73), 'lajava_kwetiaw_siram.jpg')
crop_and_save(9, (0.62, 0.66, 0.93, 0.83), 'lajava_mie_godog.jpg')

crop_and_save(10, (0.07, 0.32, 0.49, 0.59), 'lajava_mapo_tahu.jpg')
crop_and_save(10, (0.53, 0.23, 0.93, 0.45), 'lajava_capcay_rice.jpg')
crop_and_save(10, (0.27, 0.54, 0.70, 0.81), 'lajava_mun_tahu.jpg')

crop_and_save(16, (0.13, 0.27, 0.45, 0.49), 'lajava_indomie_kuah.jpg')
crop_and_save(16, (0.51, 0.18, 0.84, 0.42), 'lajava_indomie_goreng.jpg')
crop_and_save(16, (0.13, 0.55, 0.50, 0.78), 'lajava_indomie_kuah_susu_keju.jpg')
crop_and_save(16, (0.52, 0.46, 0.89, 0.67), 'lajava_indomie_kuah_susu.jpg')
crop_and_save(16, (0.61, 0.21, 0.75, 0.31), 'lajava_extra_telur.jpg')

# 6. Family Style (Pages 11, 12, 13, 14, 15)
crop_and_save(11, (0.23, 0.31, 0.56, 0.49), 'lajava_fam_brokoli_putih.jpg')
crop_and_save(11, (0.53, 0.40, 0.85, 0.59), 'lajava_fam_brokoli_sapi.jpg')
crop_and_save(11, (0.08, 0.49, 0.42, 0.67), 'lajava_fam_capcay_seafood.jpg')
crop_and_save(11, (0.42, 0.60, 0.78, 0.79), 'lajava_fam_capcay_ayam.jpg')

crop_and_save(12, (0.35, 0.24, 0.63, 0.41), 'lajava_fam_mie_seafood.jpg')
crop_and_save(12, (0.65, 0.29, 0.93, 0.46), 'lajava_fam_mie_ayam.jpg')
crop_and_save(12, (0.12, 0.38, 0.41, 0.53), 'lajava_fam_brokoli_ayam.jpg')
crop_and_save(12, (0.42, 0.43, 0.75, 0.59), 'lajava_fam_ayam_mentega.jpg')
crop_and_save(12, (0.07, 0.53, 0.40, 0.72), 'lajava_fam_sapi_lada_hitam.jpg')
crop_and_save(12, (0.42, 0.59, 0.74, 0.77), 'lajava_fam_ayam_lada_hitam.jpg')

crop_and_save(13, (0.16, 0.33, 0.41, 0.45), 'lajava_fam_ayam_nanking.jpg')
crop_and_save(13, (0.47, 0.31, 0.76, 0.45), 'lajava_fam_bistik_sapi.jpg')
crop_and_save(13, (0.28, 0.45, 0.59, 0.56), 'lajava_fam_udang_cumi_tepung.jpg')
crop_and_save(13, (0.57, 0.52, 0.88, 0.63), 'lajava_fam_rica.jpg')
crop_and_save(13, (0.22, 0.58, 0.55, 0.70), 'lajava_fam_asam_manis.jpg')
crop_and_save(13, (0.56, 0.65, 0.91, 0.78), 'lajava_fam_saus_padang.jpg')
crop_and_save(13, (0.16, 0.74, 0.52, 0.87), 'lajava_fam_saus_tiram.jpg')

crop_and_save(14, (0.08, 0.30, 0.45, 0.53), 'lajava_fam_sapo_tahu.jpg')
crop_and_save(14, (0.47, 0.43, 0.88, 0.64), 'lajava_fam_fu_yung_hai.jpg')
crop_and_save(14, (0.10, 0.55, 0.41, 0.73), 'lajava_fam_ayam_teriyaki.jpg')

crop_and_save(15, (0.22, 0.18, 0.69, 0.43), 'lajava_fam_tauge_ikan_asin.jpg')
crop_and_save(15, (0.56, 0.44, 0.87, 0.64), 'lajava_fam_soup_jagung.jpg')
crop_and_save(15, (0.07, 0.49, 0.49, 0.73), 'lajava_fam_mun_tahu.jpg')

# 7. Signature & Seasonal Coffee (Pages 17, 18, 19)
crop_and_save(17, (0.52, 0.42, 0.68, 0.59), 'lajava_butterscotch_latte.jpg')
crop_and_save(17, (0.25, 0.54, 0.43, 0.71), 'lajava_mont_blanc.jpg')
crop_and_save(17, (0.56, 0.65, 0.71, 0.82), 'lajava_dirty_latte.jpg')

crop_and_save(18, (0.16, 0.65, 0.34, 0.82), 'lajava_amber_dripp.jpg')
crop_and_save(18, (0.64, 0.66, 0.81, 0.85), 'lajava_tropic_noir.jpg')
crop_and_save(18, (0.64, 0.50, 0.77, 0.66), 'lajava_kyoto_cooler.jpg')
crop_and_save(18, (0.44, 0.59, 0.58, 0.75), 'lajava_honeyburn.jpg')
crop_and_save(18, (0.27, 0.47, 0.41, 0.64), 'lajava_island_kick.jpg')

crop_and_save(19, (0.73, 0.44, 0.90, 0.63), 'lajava_berry_cold_brew.jpg')
crop_and_save(19, (0.59, 0.35, 0.73, 0.58), 'lajava_salt_caramond.jpg')
crop_and_save(19, (0.43, 0.25, 0.56, 0.53), 'lajava_fantasy_island.jpg')
crop_and_save(19, (0.24, 0.39, 0.41, 0.59), 'lajava_lemonade_rock.jpg')
crop_and_save(19, (0.06, 0.42, 0.24, 0.64), 'lajava_tropical_summer.jpg')

# 8. Classic Coffee & Manual Brew (Pages 20, 21, 22)
crop_and_save(20, (0.49, 0.26, 0.70, 0.44), 'lajava_espresso.jpg')
crop_and_save(20, (0.65, 0.51, 0.95, 0.69), 'lajava_macchiato.jpg')
crop_and_save(20, (0.33, 0.42, 0.65, 0.62), 'lajava_piccolo.jpg')
crop_and_save(20, (0.18, 0.19, 0.51, 0.36), 'lajava_americano.jpg')
crop_and_save(20, (0.04, 0.33, 0.33, 0.54), 'lajava_latte.jpg')

crop_and_save(21, (0.06, 0.32, 0.35, 0.73), 'lajava_v60.jpg')
crop_and_save(21, (0.33, 0.33, 0.59, 0.62), 'lajava_vietnam_dripp.jpg')
crop_and_save(21, (0.46, 0.34, 0.96, 0.77), 'lajava_kalita_wave.jpg')
crop_and_save(22, (0.44, 0.05, 0.94, 0.35), 'lajava_cup_duo.jpg')

# 9. Milk Based & Blended (Pages 23, 25)
crop_and_save(23, (0.65, 0.21, 0.80, 0.41), 'lajava_thai_tea.jpg')
crop_and_save(23, (0.51, 0.14, 0.64, 0.33), 'lajava_taro.jpg')
crop_and_save(23, (0.16, 0.15, 0.38, 0.32), 'lajava_red_velvet.jpg')
crop_and_save(23, (0.37, 0.06, 0.50, 0.26), 'lajava_matcha.jpg')
crop_and_save(23, (0.29, 0.25, 0.50, 0.44), 'lajava_chocolate.jpg')

crop_and_save(25, (0.10, 0.36, 0.25, 0.57), 'lajava_mango_cheesecake.jpg')
crop_and_save(25, (0.23, 0.40, 0.38, 0.62), 'lajava_chocolate_blend.jpg')
crop_and_save(25, (0.41, 0.32, 0.55, 0.52), 'lajava_cookies_cream.jpg')
crop_and_save(25, (0.61, 0.36, 0.76, 0.57), 'lajava_strawberry_cheesecake.jpg')
crop_and_save(25, (0.76, 0.40, 0.91, 0.62), 'lajava_greentea_blend.jpg')
crop_and_save(25, (0.43, 0.55, 0.65, 0.77), 'lajava_blonde_regal.jpg')

# 10. The Freshest, Tea Series & Juices (Pages 24, 26, 27, 28)
crop_and_save(24, (0.09, 0.25, 0.25, 0.47), 'lajava_sunset_bliss.jpg')
crop_and_save(24, (0.29, 0.24, 0.46, 0.46), 'lajava_lemonade.jpg')
crop_and_save(24, (0.52, 0.35, 0.71, 0.59), 'lajava_lemon_squash.jpg')
crop_and_save(24, (0.71, 0.34, 0.87, 0.57), 'lajava_strawberry_mojito.jpg')
crop_and_save(24, (0.11, 0.50, 0.28, 0.78), 'lajava_green_lantern.jpg')
crop_and_save(24, (0.34, 0.48, 0.49, 0.75), 'lajava_leci_mojito.jpg')
crop_and_save(24, (0.59, 0.63, 0.80, 0.85), 'lajava_summer_breeze.jpg')

crop_and_save(26, (0.46, 0.22, 0.63, 0.47), 'lajava_lychee_tea.jpg')
crop_and_save(26, (0.68, 0.35, 0.87, 0.61), 'lajava_peach_strawberry_tea.jpg')
crop_and_save(26, (0.10, 0.36, 0.35, 0.58), 'lajava_magical_lemonade.jpg')
crop_and_save(26, (0.35, 0.46, 0.61, 0.69), 'lajava_lemon_tea.jpg')

crop_and_save(27, (0.10, 0.06, 0.45, 0.63), 'lajava_butterfly_pea_tea.jpg')
crop_and_save(27, (0.37, 0.30, 0.93, 0.77), 'lajava_ceramic_teapot.jpg')

crop_and_save(28, (0.15, 0.31, 0.36, 0.63), 'lajava_mango_juice.jpg')
crop_and_save(28, (0.40, 0.22, 0.60, 0.48), 'lajava_pineapple_juice.jpg')
crop_and_save(28, (0.65, 0.30, 0.87, 0.61), 'lajava_dragonfruit_juice.jpg')
crop_and_save(28, (0.40, 0.44, 0.64, 0.77), 'lajava_watermelon_juice.jpg')

# 11. Ice Cream & Beer (Pages 29, 30)
crop_and_save(29, (0.58, 0.28, 0.93, 0.68), 'lajava_ice_cream_mix.jpg')
crop_and_save(29, (0.06, 0.08, 0.56, 0.79), 'lajava_classic_affogato.jpg')

crop_and_save(30, (0.18, 0.36, 0.65, 0.65), 'lajava_beer_bucket.jpg')
crop_and_save(30, (0.38, 0.34, 0.90, 0.77), 'lajava_beer_bottles.jpg')
crop_and_save(30, (0.06, 0.54, 0.32, 0.72), 'lajava_beer_frosted_mugs.jpg')

print('All authentic, beautiful, centered photos successfully generated at standard 800x600 resolution!')
