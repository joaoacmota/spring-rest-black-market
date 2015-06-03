package org.vtsukur.spring.rest.market.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.vtsukur.spring.rest.market.domain.core.ad.Ad;
import org.vtsukur.spring.rest.market.domain.core.ad.AdRepository;
import org.vtsukur.spring.rest.market.domain.core.ad.Location;
import org.vtsukur.spring.rest.market.domain.core.user.User;
import org.vtsukur.spring.rest.market.domain.core.user.UserRepository;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.Random;

/**
 * @author volodymyr.tsukur
 */
@Component
public class RandomGeneratedDataLoader {

    private static final Integer[] MOBILE_OPERATOR_CODES = new Integer[] {
            39,
            50,
            63,
            66,
            67,
            68,
            93,
            95,
            96,
            97,
            98,
            99
    };

    private static final String[] KYIV_DISTRICTS = new String[] {
            "Голосеево",
            "Дарница",
            "Деснянский",
            "Днепровский",
            "Оболонь",
            "Печерск",
            "Подол",
            "Святошино",
            "Соломенский",
            "Шевченковский"
    };

    private static final String[] COMMENTS = new String[] {
            "",
            "целиком",
            "можно частями",
            "малыш, я подъеду"
    };
    public static final int PUBLISHING_TIME_MAX_DIFF = 4;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdRepository adRepository;

    public void load() {
        int amount = 100;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime publishedAt = now.minusMinutes(PUBLISHING_TIME_MAX_DIFF * amount);

        for (int i = 0; i < amount; ++i) {
            User user = nextUser();
            userRepository.save(user);

            Ad ad = nextAd(user, publishedAt);
            adRepository.save(ad);

            publishedAt = ad.getPublishedAt();
        }
    }

    private static User nextUser() {
        User user = new User();
        user.setPhoneNumber(nextPhoneNumber());
        return user;
    }

    private static Ad nextAd(User user, LocalDateTime publishedAt) {
        Ad ad = new Ad();

        Ad.Type type = nextType();
        ad.setType(type);
        Ad.Currency currency = nextCurrency();
        ad.setCurrency(currency);

        ad.setAmount(nextAmount());
        ad.setRate(nextRate(currency, type));
        ad.setUser(user);

        ad.setLocation(new Location("Киев", nextDistrict()));
        ad.setComment(nextComments());
        ad.setStatus(Ad.Status.PUBLISHED);
        ad.setPublishedAt(nextPublishingTime(publishedAt));

        return ad;
    }

    private static String nextPhoneNumber() {
        return String.format("0%d%07d", nextMobileOperatorCode(), nextInt(10000000));
    }

    private static int nextMobileOperatorCode() {
        return nextRandomFromArray(MOBILE_OPERATOR_CODES);
    }

    private static Ad.Type nextType() {
        return nextRandomFromArray(Ad.Type.values());
    }

    private static BigInteger nextAmount() {
        return BigInteger.valueOf(nextInt(100) * 100 + 100);
    }

    private static Ad.Currency nextCurrency() {
        return nextRandomFromArray(Ad.Currency.values());
    }

    private static BigDecimal nextRate(Ad.Currency currency, Ad.Type type) {
        return currency.avgStatsRate(type);
    }

    private static String nextDistrict() {
        return nextRandomFromArray(KYIV_DISTRICTS);
    }

    private static String nextComments() {
        return nextRandomFromArray(COMMENTS);
    }

    private static LocalDateTime nextPublishingTime(LocalDateTime previous) {
        return previous.plusMinutes(nextInt(PUBLISHING_TIME_MAX_DIFF - 1) + 1);
    }

    private static <T> T nextRandomFromArray(T[] array) {
        return array[nextInt(array.length)];
    }

    private static int nextInt(int bound) {
        return new Random().nextInt(bound);
    }

}
