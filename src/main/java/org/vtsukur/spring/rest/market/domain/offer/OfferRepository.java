package org.vtsukur.spring.rest.market.domain.offer;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author volodymyr.tsukur
 */
public interface OfferRepository extends PagingAndSortingRepository<Offer, Long> {
}