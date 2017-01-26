package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@Component
public class DatabaseLoader implements CommandLineRunner{

    private final ProductRepository repository;

    @Autowired
    public DatabaseLoader(ProductRepository repository){
        this.repository=repository;
    }

    @Override
    public void run(String... strings) throws Exception {
        this.repository.save(new Product("BBLeather",95));
        this.repository.save(new Product("BBSSteel",100));
        this.repository.save(new Product("Black",140));
        this.repository.save(new Product("Maverick",160));
        this.repository.save(new Product("Onyx",140));
        this.repository.save(new Product("WhiteSilver",100));
    }
}
