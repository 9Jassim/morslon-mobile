import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import {
  BannerCarousel,
  CategoryStrip,
  FlashSaleSection,
  FullBanner,
  PosterGrid,
  ProductRail,
  PromotionsRow,
  type Slide,
} from '@/components/home-blocks';
import { HighlightsBar } from '@/components/highlights-bar';
import { PopupBanner } from '@/components/popup-banner';
import { PopupModal } from '@/components/popup-modal';
import { ThemedText } from '@/components/themed-text';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Spacing } from '@/constants/theme';
import { fetchHome } from '@/lib/catalog-api';
import { useI18n } from '@/lib/i18n';
import { BRAND } from '@/lib/theme-colors';
import type { HomeBanner, HomeSectionItem } from '@/lib/types';

const bannersToSlides = (banners: HomeBanner[]): Slide[] =>
  banners.map((b) => ({ id: b.id, image: b.image, link: b.link, titleEn: b.titleEn, subtitleEn: b.subtitleEn }));

const itemsToSlides = (items: HomeSectionItem[]): Slide[] =>
  items
    .filter((it) => it.image)
    .map((it, i) => ({ id: String(i), image: it.image as string, link: it.link, titleEn: it.titleEn }));

const bannerToSlide = (b: HomeBanner): Slide => ({
  id: b.id,
  image: b.image,
  link: b.link,
  titleEn: b.titleEn,
  subtitleEn: b.subtitleEn,
});

export default function HomeScreen() {
  const { t, pick } = useI18n();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['home'], queryFn: fetchHome });

  if (isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={BRAND.accent} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen centered style={styles.errorBox}>
        <ThemedText>{t('home.failed')}</ThemedText>
        <Button title={t('common.retry')} onPress={() => refetch()} />
      </Screen>
    );
  }

  const hero = data?.hero ?? [];
  const promo = data?.promo ?? [];
  const mid = data?.mid ?? [];
  const discover = data?.discover ?? [];
  const promoCollection = data?.promoCollection ?? [];
  const categories = data?.categories ?? [];
  const categorySections = data?.categorySections ?? [];
  const highlights = data?.highlights ?? [];
  const sections = data?.sections ?? [];
  const popups = data?.popups ?? [];
  const flashSale = data?.flashSale ?? null;
  const promotions = data?.promotions ?? [];

  const empty =
    hero.length === 0 && sections.length === 0 && categories.length === 0 &&
    categorySections.length === 0 && highlights.length === 0;

  return (
    <Screen noPadding>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HighlightsBar highlights={highlights} />
        <BannerCarousel slides={bannersToSlides(hero)} />
        <CategoryStrip categories={categories} />

        {/* Promotional collections */}
        {promo.length > 0 ? (
          <PosterGrid items={promo.map((b) => ({ image: b.image, link: b.link ?? undefined }))} />
        ) : null}

        {/* Flash sale */}
        {flashSale ? <FlashSaleSection flashSale={flashSale} /> : null}

        {/* Promotions (show-on-home) */}
        <PromotionsRow promotions={promotions} />

        {/* Custom home sections */}
        {sections.map((section) => {
          const title = section.showTitle ? pick(section.nameEn, section.nameAr) : undefined;
          if (section.type === 'PRODUCTS') {
            return <ProductRail key={section.id} title={title} products={section.products ?? []} />;
          }
          if (section.type === 'POSTER_GRID') {
            return <PosterGrid key={section.id} title={title} items={section.items ?? []} />;
          }
          return <BannerCarousel key={section.id} title={title} slides={itemsToSlides(section.items ?? [])} />;
        })}

        {/* Highlighted Products */}
        {promoCollection.length > 0 ? (
          <BannerCarousel title={t('home.highlighted')} slides={bannersToSlides(promoCollection)} />
        ) : null}

        {/* Category product rows, with mid banners interleaved every 2 */}
        {categorySections.map((cat, i) => (
          <Fragment key={cat.id}>
            <ProductRail title={pick(cat.nameEn, cat.nameAr)} products={cat.products} seeAllSlug={cat.slug} />
            {(i + 1) % 2 === 0 && mid[Math.floor(i / 2)] ? (
              <FullBanner banner={bannerToSlide(mid[Math.floor(i / 2)])} />
            ) : null}
          </Fragment>
        ))}

        {/* Discover more */}
        {discover.length > 0 ? (
          <PosterGrid title={t('home.discoverMore')} items={discover.map((b) => ({ image: b.image, link: b.link ?? undefined }))} />
        ) : null}

        {empty ? (
          <View style={styles.empty}>
            <ThemedText style={styles.eyebrow}>{t('home.discover')}</ThemedText>
            <ThemedText type="title">{t('home.empty')}</ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <PopupBanner banner={data?.popupBanner ?? null} />
      <PopupModal popups={popups} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorBox: { gap: Spacing.three },
  scroll: { paddingTop: Spacing.two, paddingBottom: TAB_BAR_CLEARANCE },
  empty: { padding: Spacing.four, gap: 2 },
  eyebrow: { fontFamily: AppFonts.bodyBold, fontSize: 11, letterSpacing: 2.5, color: BRAND.accent },
});
