package com.example;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@PreAuthorize("hasRole('ROLE_MANAGER')")
public interface ProductRepository extends PagingAndSortingRepository<Product, Long> {

    @Override
    @PreAuthorize("#product?.manager == null or #product?.manager?.name == authentication?.name")
    Product save(@Param("product") Product employee);

    @Override
    @PreAuthorize("@productRepository.findOne(#id)?.manager?.name == authentication?.name")
    void delete(@Param("id") Long id);

    @Override
    @PreAuthorize("#product?.manager?.name == authentication?.name")
    void delete(@Param("product") Product product);
}
