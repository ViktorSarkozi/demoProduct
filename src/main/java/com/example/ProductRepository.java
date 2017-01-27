package com.example;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
public interface ProductRepository extends PagingAndSortingRepository<Product, Long> {
}
